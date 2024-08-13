"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiChoicePath = exports.chunkifyIterable = exports.createConcurrentStreamingSeacher = exports.generateAllPermutations = exports.resolveTradeConflicts = void 0;
const Swap_1 = require("./Swap");
const DefaultMap_1 = require("../base/DefaultMap");
const setupUniswapRouter_1 = require("../configuration/setupUniswapRouter");
const Planner_1 = require("../tx-gen/Planner");
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
            // console.log(
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
                // console.log(
                //   `Finding new trade ${newInput} -> ${nextTrade.outputToken[0]}`
                // )
                const newNextTrade = await uniDex.swap(abortSignal, newInput, nextTrade.outputToken[0], searcher.defaultInternalTradeSlippage);
                // console.log(newNextTrade.steps[0].action.toString())
                newTrades.push(newNextTrade);
            }));
            const outputAtTheEnd = [...inTrades, ...newTrades];
            return outputAtTheEnd;
        }
        return inTrades;
    }
    catch (e) {
        // console.log(e)
        // console.log(e.stack)
        throw e;
    }
};
exports.resolveTradeConflicts = resolveTradeConflicts;
const generateAllPermutations = async function (universe, arr, precursorTokens) {
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
    const withoutComflicts = allCombos.filter((paths) => willPathsHaveAddressConflicts(paths).length === 0);
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
const sortZaps = (txes, allQuotes, startTime) => {
    let failed = txes;
    if (txes.length === 0) {
        console.log(`All ${txes.length}/${allQuotes.length} potential zaps failed`);
        throw new Error('No zaps found');
    }
    txes.sort((l, r) => -l.tx.compare(r.tx));
    console.log(`${txes.length} / ${allQuotes.length} passed simulation:`);
    for (const tx of txes) {
        console.log(tx.tx.stats.toString());
    }
    return {
        failed,
        bestZapTx: txes[0],
        alternatives: txes.slice(1, txes.length),
        timeTaken: Date.now() - startTime,
    };
};
const createConcurrentStreamingSeacher = (searcher, toTxArgs) => {
    const abortController = new AbortController();
    const results = [];
    setTimeout(() => {
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
            const tx = await searcher.perf.measurePromise('toTransaction', result.toTransaction(toTxArgs));
            const inVal = parseFloat(tx.inputValueUSD.format());
            const dustVal = parseFloat(tx.stats.dust.valueUSD.format());
            const outVal = parseFloat(tx.stats.valueUSD.format()); // Total out (output + dust), excluding gas fees
            const inToOutRatio = outVal / inVal;
            // Reject if the dust is too high
            if (inVal * maxAcceptableDustPercentable < dustVal) {
                console.log(tx.stats.toString());
                console.log(tx.stats.dust.toString());
                console.log((0, Planner_1.printPlan)(tx.planner, tx.universe).join('\n'));
                console.log('Large amount of dust');
                return;
            }
            // Reject if the zap looses too much value
            if (inToOutRatio < maxAcceptableValueLossForRejectingZap) {
                console.log(tx.stats.toString());
                console.log('Low in to out ratio');
                return;
            }
            results.push({
                tx,
                searchResult: result,
            });
            const resCount = results.length;
            if (resCount >= searcher.config.searcherMinRoutesToProduce) {
                abortController.abort();
            }
        }
        catch (e) {
            // console.log(e)
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
            return sortZaps(results.map((i) => ({
                searchResult: i.searchResult,
                tx: i.tx,
            })), allCandidates, startTime);
        },
    };
};
exports.createConcurrentStreamingSeacher = createConcurrentStreamingSeacher;
const willPathsHaveAddressConflicts = (paths) => {
    const addressesInUse = new Set();
    const conflicts = new Set();
    for (const path of paths) {
        for (const step of path.steps) {
            for (const addr of step.action.addressesInUse) {
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