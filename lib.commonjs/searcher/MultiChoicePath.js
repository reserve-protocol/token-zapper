"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiChoicePath = exports.chunkifyIterable = exports.createConcurrentStreamingEvaluator = exports.generateAllPermutations = exports.resolveTradeConflicts = void 0;
const Address_1 = require("../base/Address");
const DefaultMap_1 = require("../base/DefaultMap");
const setupUniswapRouter_1 = require("../configuration/setupUniswapRouter");
const Planner_1 = require("../tx-gen/Planner");
const Swap_1 = require("./Swap");
const resolveTradeConflicts = async (searcher, abortSignal, inTrades) => {
    try {
        const uniActions = inTrades.filter((i) => i.steps[0].action instanceof setupUniswapRouter_1.UniswapRouterAction);
        if (uniActions.length <= 1) {
            return inTrades;
        }
        const sameFirstPool = new DefaultMap_1.DefaultMap(() => []);
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
exports.resolveTradeConflicts = resolveTradeConflicts;
const generateAllPermutations = async function (searcher, arr, precursorTokens, signer) {
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
    let withoutComflicts = allCombos.filter((paths) => willPathsHaveAddressConflicts(searcher.debugLog, universe, paths, signer)
        .length === 0);
    if (withoutComflicts.length < 16) {
        withoutComflicts = allCombos;
        searcher.debugLog('Skipping conflict check - too few paths');
    }
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
exports.generateAllPermutations = generateAllPermutations;
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
const createConcurrentStreamingEvaluator = (searcher, toTxArgs) => {
    const startTime = Date.now();
    const emitDebugLog = searcher.debugLog;
    const abortController = new AbortController();
    const results = [];
    let pending = [];
    const waitTime = searcher.config.maxSearchTimeMs ?? 10000;
    searcher.debugLog(`Waiting for ${waitTime}ms`);
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
            const txPromise = result.toTransaction(toTxArgs);
            pending.push(txPromise);
            const tx = await txPromise;
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
                emitDebugLog((0, Planner_1.printPlan)(tx.planner, tx.universe).join('\n'));
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
            if (abortController.signal.aborted) {
                return;
            }
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
    const resultsReadyController = new AbortController();
    let finishing = false;
    abortController.signal.addEventListener('abort', async () => {
        if (finishing) {
            return;
        }
        finishing = true;
        searcher.debugLog('Search completed. Returning results');
        for (const p of pending) {
            try {
                await Promise.race([
                    p,
                    new Promise((resolve) => AbortSignal.timeout(1000).addEventListener('abort', resolve)),
                ]);
            }
            catch (e) { }
        }
        resultsReadyController.abort();
    });
    setTimeout(async () => {
        if (abortController.signal.aborted) {
            return;
        }
        searcher.debugLog('Aborting search: searcher.config.maxSearchTimeMs');
        abortController.abort();
    }, waitTime);
    return {
        abortController,
        finishedSearching: () => {
            if (abortController.signal.aborted) {
                return;
            }
            abortController.abort();
        },
        onResult,
        resultReadyPromise: new Promise((resolve) => {
            resultsReadyController.signal.addEventListener('abort', () => {
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
exports.createConcurrentStreamingEvaluator = createConcurrentStreamingEvaluator;
const noConflictAddrs = new Set([
    Address_1.Address.from('0x7E7d64D987cAb6EeD08A191C4C2459dAF2f8ED0B'),
    Address_1.Address.from('0x6675a323dEDb77822FCf39eAa9D682F6Abe72555'),
    Address_1.Address.from('0xDef1C0ded9bec7F1a1670819833240f027b25EfF'),
    Address_1.Address.from('0xCA99eAa38e8F37a168214a3A57c9a45a58563ED5'),
    Address_1.Address.from('0x89B78CfA322F6C5dE0aBcEecab66Aee45393cC5A'),
    Address_1.Address.from('0x111111125421cA6dc452d289314280a0f8842A65'),
    Address_1.Address.from('0x010224949cCa211Fb5dDfEDD28Dc8Bf9D2990368'),
    Address_1.Address.from('0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'),
    Address_1.Address.from('0x179dC3fb0F2230094894317f307241A52CdB38Aa'),
    Address_1.Address.from('0x99a58482BD75cbab83b27EC03CA68fF489b5788f'),
    Address_1.Address.from('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'),
    Address_1.Address.from('0x79c58f70905F734641735BC61e45c19dD9Ad60bC'),
    Address_1.Address.from('0x1aEbD5aC3F0d1baEa82E3e49BeAF4ec901f67205'),
    Address_1.Address.from('0x0000000000001fF3684f28c67538d4D072C22734'),
    Address_1.Address.from('0x45FaE8D0D2acE73544baab452f9020925AfCCC75'),
    Address_1.Address.from('0xb6911f80B1122f41C19B299a69dCa07100452bf9'),
    Address_1.Address.from('0xFB5e6d0c1DfeD2BA000fBC040Ab8DF3615AC329c'),
    Address_1.Address.from('0xba12222222228d8ba445958a75a0704d566bf2c8'),
    Address_1.Address.from('0x2f5e87c9312fa29aed5c179e456625d79015299c'),
    Address_1.Address.from('0xc6962004f452be9203591991d15f6b388e09e8d0'),
    Address_1.Address.from('0xae1ec28d6225dce2ff787dcb8ce11cf6d3ae064f'),
    Address_1.Address.from('0x70d95587d40a2caf56bd97485ab3eec10bee6336')
    // Address.from('0x7fCDC35463E3770c2fB992716Cd070B63540b947')
    // Address.from('0xcc065Eb6460272481216757293FFC54A061bA60e')
    // Address.from('0x389938CF14Be379217570D8e4619E51fBDafaa21')
    // Address.from('0x2e50e3e18c19C7d80B81888a961A13aEE49b962E')
]);
const willPathsHaveAddressConflicts = (emitDebugLog, universe, paths, signer) => {
    const addressesInUse = new Set();
    const conflicts = new Set();
    for (const path of paths) {
        for (const step of path.steps) {
            for (const addr of step.action.addressesInUse) {
                if (addr === signer ||
                    noConflictAddrs.has(addr) ||
                    universe.commonTokensInfo.addresses.has(addr)) {
                    continue;
                }
                if (addressesInUse.has(addr)) {
                    conflicts.add(addr);
                }
                addressesInUse.add(addr);
            }
        }
    }
    return [...conflicts];
};
const chunkifyIterable = function* (iterable, chunkSize, abort) {
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
exports.chunkifyIterable = chunkifyIterable;
class MultiChoicePath {
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
        return new Swap_1.SwapPaths(universe, this.path.inputs, this.paths, this.outputs, this.outputValue, this.destination);
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
exports.MultiChoicePath = MultiChoicePath;
//# sourceMappingURL=MultiChoicePath.js.map