import { Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
import { UniswapRouterAction } from '../configuration/setupUniswapRouter';
import { printPlan } from '../tx-gen/Planner';
import { SwapPaths } from './Swap';
export const resolveTradeConflicts = async (searcher, abortSignal, inTrades) => {
    try {
        const uniActions = inTrades.filter((i) => i.steps[0].action instanceof UniswapRouterAction);
        if (uniActions.length <= 1) {
            return inTrades;
        }
        const sameFirstPool = new DefaultMap(() => []);
        for (const trade of uniActions) {
            const uniAction = trade.steps[0].action;
            const parsed = uniAction.currentQuote;
            sameFirstPool.get(parsed.swaps[0].pool.address).push(trade);
        }
        const newTrades = [];
        for (const [_, trades] of sameFirstPool.entries()) {
            if (trades.length === 1) {
                continue;
            }
            inTrades = inTrades.filter((i) => !trades.includes(i));
            // emitDebugLog(
            //   `Found two uni trades ${trades.length} ${swapDesc.join(
            //     ', '
            //   )} trading on the same pool as the firs step: ${pool}`
            // )
            const actions = trades.map((i) => i.steps[0].action);
            const { inputToken: [inputToken], currentQuote: { swaps: [{ tokenOut: outputToken }], }, } = actions[0];
            const inputs = actions
                .map((i) => i.inputQty)
                .reduce((l, r) => l.add(r), inputToken.zero);
            const uniDex = actions[0].dex;
            const newFirstSwap = await uniDex.swap(abortSignal, inputs, outputToken, searcher.defaultInternalTradeSlippage);
            newTrades.push(newFirstSwap);
            const combinedFirstTradeOutput = newFirstSwap.steps[0].action.outputQty.amount;
            let total = combinedFirstTradeOutput - combinedFirstTradeOutput / 10000n;
            const prTrade = total / BigInt(actions.length);
            await Promise.all(actions.map(async (nextTrade) => {
                const newInput = outputToken.from(total < prTrade ? total : prTrade);
                total -= prTrade;
                // emitDebugLog(
                //   `Finding new trade ${newInput} -> ${nextTrade.outputToken[0]}`
                // )
                const newNextTrade = await uniDex.swap(abortSignal, newInput, nextTrade.outputToken[0], searcher.defaultInternalTradeSlippage);
                // emitDebugLog(newNextTrade.steps[0].action.toString())
                newTrades.push(newNextTrade);
            }));
            const outputAtTheEnd = [...inTrades, ...newTrades];
            return outputAtTheEnd;
        }
        return inTrades;
    }
    catch (e) {
        // emitDebugLog(e)
        // emitDebugLog(e.stack)
        throw e;
    }
};
export const generateAllPermutations = async function (searcher, arr, precursorTokens) {
    const universe = searcher.universe;
    function combos(list, n = 0, result = [], current = []) {
        if (n === list.length)
            result.push(current);
        else
            list[n].paths.forEach((item) => {
                combos(list, n + 1, result, [...current, item]);
            });
        return result;
    }
    const allCombos = combos(arr);
    const withoutComflicts = allCombos.filter((paths) => willPathsHaveAddressConflicts(searcher.debugLog, universe, paths)
        .length === 0);
    const valuedTrades = await Promise.all(withoutComflicts.map(async (trades) => {
        const netOut = universe.usd.zero;
        for (const trade of trades) {
            if (precursorTokens.has(trade.outputs[0].token)) {
                netOut.add(await trade.netValue(universe));
            }
        }
        return {
            trades,
            netOut,
        };
    }));
    valuedTrades.sort((l, r) => -l.netOut.compare(r.netOut));
    return valuedTrades.map((i) => i.trades);
};
const sortZaps = (searcher, txes, allQuotes, startTime) => {
    const emitDebugLog = searcher.debugLog;
    let failed = txes;
    if (txes.length === 0) {
        emitDebugLog(`All ${txes.length}/${allQuotes.length} potential zaps failed`);
        throw new Error('No zaps found');
    }
    txes.sort((l, r) => -l.tx.compare(r.tx));
    emitDebugLog(`${txes.length} / ${allQuotes.length} passed simulation:`);
    for (const tx of txes) {
        emitDebugLog(tx.tx.stats.toString());
    }
    return {
        failed,
        bestZapTx: txes[0],
        alternatives: txes.slice(1, txes.length),
        timeTaken: Date.now() - startTime,
    };
};
export const createConcurrentStreamingEvaluator = (searcher, toTxArgs) => {
    const startTime = Date.now();
    const emitDebugLog = searcher.debugLog;
    const abortController = new AbortController();
    const results = [];
    setTimeout(() => {
        searcher.debugLog('Aborting search: searcher.config.maxSearchTimeMs');
        abortController.abort();
    }, searcher.config.maxSearchTimeMs ?? 10000);
    const allCandidates = [];
    const seen = new Set();
    const maxAcceptableValueLossForRejectingZap = 1 - searcher.config.zapMaxValueLoss / 100;
    const maxAcceptableDustPercentable = searcher.config.zapMaxDustProduced / 100;
    const onResult = async (result) => {
        const id = result.describe().join(';');
        if (seen.has(id)) {
            return;
        }
        seen.add(id);
        allCandidates.push(result);
        try {
            const tx = await result.toTransaction(toTxArgs);
            if (tx == null) {
                return;
            }
            const inVal = parseFloat(tx.inputValueUSD.format());
            const dustVal = parseFloat(tx.stats.dust.valueUSD.format());
            const outVal = parseFloat(tx.stats.valueUSD.format()); // Total out (output + dust), excluding gas fees
            const inToOutRatio = outVal / inVal;
            // Reject if the dust is too high
            if (inVal * maxAcceptableDustPercentable < dustVal) {
                emitDebugLog('Large amount of dust');
                emitDebugLog(tx.stats.toString());
                emitDebugLog(tx.stats.dust.toString());
                emitDebugLog('Planner:');
                emitDebugLog(printPlan(tx.planner, tx.universe).join('\n'));
                return;
            }
            // Reject if the zap looses too much value
            if (inToOutRatio < maxAcceptableValueLossForRejectingZap) {
                emitDebugLog(tx.stats.toString());
                emitDebugLog('Low in to out ratio');
                return;
            }
            results.push({
                tx,
                searchResult: result,
            });
            const resCount = results.length;
            if (toTxArgs.minSearchTime != null) {
                const elapsed = Date.now() - startTime;
                if (elapsed > toTxArgs.minSearchTime) {
                    emitDebugLog('Aborting search: elapsed > toTxArgs.minSearchTime');
                    abortController.abort();
                    return;
                }
            }
            else {
                if (resCount >= searcher.config.searcherMinRoutesToProduce) {
                    emitDebugLog('Aborting search: searcher.config.searcherMinRoutesToProduce');
                    abortController.abort();
                }
            }
        }
        catch (e) {
            // emitDebugLog(e)
        }
    };
    return {
        abortController,
        onResult,
        resultReadyPromise: new Promise((resolve) => {
            abortController.signal.addEventListener('abort', () => {
                resolve(null);
            });
        }),
        getResults: (startTime) => {
            return sortZaps(searcher, results.map((i) => ({
                searchResult: i.searchResult,
                tx: i.tx,
            })), allCandidates, startTime);
        },
    };
};
const noConflictAddrs = new Set([
    Address.from('0x7E7d64D987cAb6EeD08A191C4C2459dAF2f8ED0B'),
    Address.from('0x6675a323dEDb77822FCf39eAa9D682F6Abe72555'),
    Address.from('0xDef1C0ded9bec7F1a1670819833240f027b25EfF'),
    Address.from('0xCA99eAa38e8F37a168214a3A57c9a45a58563ED5'),
    Address.from('0x89B78CfA322F6C5dE0aBcEecab66Aee45393cC5A'),
    Address.from('0x111111125421cA6dc452d289314280a0f8842A65'),
    Address.from('0x010224949cCa211Fb5dDfEDD28Dc8Bf9D2990368'),
    Address.from('0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'),
    Address.from('0x179dC3fb0F2230094894317f307241A52CdB38Aa'),
    Address.from('0x99a58482BD75cbab83b27EC03CA68fF489b5788f'),
    Address.from('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'),
    Address.from('0x79c58f70905F734641735BC61e45c19dD9Ad60bC'),
    Address.from('0x1aEbD5aC3F0d1baEa82E3e49BeAF4ec901f67205'),
]);
const willPathsHaveAddressConflicts = (emitDebugLog, universe, paths) => {
    const addressesInUse = new Set();
    const conflicts = new Set();
    for (const path of paths) {
        for (const step of path.steps) {
            for (const addr of step.action.addressesInUse) {
                if (noConflictAddrs.has(addr) ||
                    universe.commonTokensInfo.addresses.has(addr)) {
                    continue;
                }
                if (addressesInUse.has(addr)) {
                    // emitDebugLog('Address conflict', addr.toString())
                    conflicts.add(addr);
                }
                addressesInUse.add(addr);
            }
        }
    }
    return [...conflicts];
};
export const chunkifyIterable = function* (iterable, chunkSize, abort) {
    let chunk = [];
    for (const item of iterable) {
        chunk.push(item);
        if (chunk.length >= chunkSize) {
            yield chunk;
            chunk = [];
        }
    }
    if (chunk.length !== 0) {
        yield chunk;
    }
};
export class MultiChoicePath {
    universe;
    paths;
    index = 0;
    constructor(universe, paths) {
        this.universe = universe;
        this.paths = paths;
        if (this.paths.length === 0) {
            throw new Error('No paths provided');
        }
    }
    get hasMultipleChoices() {
        return this.paths.length > 1;
    }
    get supportsDynamicInput() {
        return this.path.supportsDynamicInput;
    }
    intoSwapPaths(universe) {
        return new SwapPaths(universe, this.path.inputs, this.paths, this.outputs, this.outputValue, this.destination);
    }
    increment() {
        this.index = (this.index + 1) % this.paths.length;
    }
    type = 'MultipleSwaps';
    get proceedsOptions() {
        return this.path.proceedsOptions;
    }
    get interactionConvention() {
        return this.path.interactionConvention;
    }
    get address() {
        return this.path.address;
    }
    get addressInUse() {
        return this.path.steps[0].action.addressesInUse;
    }
    get oneUsePrZap() {
        return this.path.steps.some((i) => i.action.oneUsePrZap);
    }
    exchange(tokenAmounts) {
        return this.path.exchange(tokenAmounts);
    }
    compare(other) {
        return this.path.compare(other);
    }
    cost(universe) {
        return this.path.cost(universe);
    }
    netValue(universe) {
        return this.path.netValue(universe);
    }
    get gasUnits() {
        return this.path.gasUnits;
    }
    get path() {
        if (this.paths.length === 1) {
            return this.paths[0];
        }
        return this.paths[this.index];
    }
    get inputs() {
        return this.path.inputs;
    }
    get steps() {
        return this.path.steps;
    }
    get outputs() {
        return this.path.outputs;
    }
    get outputValue() {
        return this.path.outputValue;
    }
    get destination() {
        return this.path.destination;
    }
    toString() {
        return this.path.toString();
    }
    describe() {
        let out = ['MultiChoicePath{'];
        for (const path of this.paths) {
            out.push(path
                .describe()
                .map((i) => '  ' + i)
                .join('\n'), ',');
        }
        out.push('  current: ' + this.index + '\n');
        out.push('}');
        return out;
    }
}
//# sourceMappingURL=MultiChoicePath.js.map