import { DefaultMap } from '../base/DefaultMap';
import { simulationUrls } from '../base/constants';
import { UniswapRouterAction } from '../configuration/setupUniswapRouter';
import { TokenAmounts } from '../entities/TokenAmounts';
import { bfs } from '../exchange-graph/BFS';
import { BasketTokenSourcingRuleApplication, } from './BasketTokenSourcingRules';
import { BurnRTokenSearcherResult, MintRTokenSearcherResult, TradeSearcherResult, } from './SearcherResult';
import { SwapPath, SwapPaths, SwapPlan } from './Swap';
const generateAllPermutations = function (arr) {
    function combos(list, n = 0, result = [], current = []) {
        if (n === list.length)
            result.push(current);
        else
            list[n].paths.forEach((item) => {
                combos(list, n + 1, result, [...current, item]);
            });
        return result;
    }
    return combos(arr);
};
const sortZaps = (txes, allQuotes) => {
    let failed = txes;
    failed = [];
    const notFailed = txes
        .filter((i) => {
        if (i.error != null || i.tx == null) {
            failed.push(i);
            return false;
        }
        return true;
    })
        .map((i) => {
        return {
            SearcherResult: i.searchResult,
            tx: i.tx,
        };
    });
    if (notFailed.length === 0) {
        console.log(`All ${allQuotes.length} potential zaps failed`);
        throw new Error(txes[0]?.error ?? 'Failed to find a valid tx');
    }
    notFailed.sort((l, r) => -l.tx.compare(r.tx));
    console.log(`${notFailed.length} / ${allQuotes.length} passed simulation:`);
    // console.log(
    //   notFailed.map((i, idx) => `   ${idx}. ${i.tx.stats}`).join('\n')
    // )
    return {
        failed,
        bestZapTx: notFailed[0],
        alternatives: notFailed.slice(1, notFailed.length),
    };
};
const createConcurrentStreamingSeacher = (searcher, toTxArgs) => {
    const abortController = new AbortController();
    const results = [];
    setTimeout(() => {
        if (results.length < searcher.minResults ||
            abortController.signal.aborted) {
            console.log(`Only found ${results.length} results, timeout extended`);
            return;
        }
        console.log('Aborting search, timeout reached');
        abortController.abort();
    }, searcher.config.routerDeadline);
    const allCandidates = [];
    const seen = new Set();
    const onResult = async (result) => {
        const id = result.describe().join(';');
        if (seen.has(id)) {
            return;
        }
        seen.add(id);
        allCandidates.push(result);
        try {
            const tx = await result.toTransaction(toTxArgs);
            if (tx.outputValueUSD.amount / 20n > tx.dustValueUSD.amount) {
                results.push({
                    tx,
                    searchResult: result,
                });
            }
            else {
                // console.log(
                //   `Dust value too high, skipping ${tx.outputValueUSD} -> ${tx.dustValueUSD}`
                // )
                // console.log(tx.searchResult.describe().join('\n'))
                // console.log(tx.describe().join('\n'))
            }
        }
        catch (e) {
            // console.log(e.stack)
        }
        if (abortController.signal.aborted) {
            return;
        }
        const resCount = results.length;
        const tooManyResults = resCount >= searcher.config.searcherMaxRoutesToProduce;
        if (tooManyResults) {
            console.log('Too many results, aborting');
            abortController.abort();
        }
    };
    return {
        abortController,
        onResult,
        getResults: () => {
            return sortZaps(results.map((i) => ({
                searchResult: i.searchResult,
                tx: i.tx,
            })), allCandidates);
        },
    };
};
const willPathsHaveAddressConflicts = (paths) => {
    const addressesInUse = new Set();
    for (const swaps of paths.swapPaths) {
        for (const step of swaps.steps) {
            if (!step.action.oneUsePrZap) {
                continue;
            }
            for (const addr of step.action.addressesInUse) {
                if (addressesInUse.has(addr)) {
                    addressesInUse.add(addr);
                    return [...addressesInUse];
                }
            }
        }
    }
    return [];
};
const chunkifyIterable = function* (iterable, chunkSize) {
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
        return this.path.steps[0].action.oneUsePrZap;
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
/**
 * Takes some base basket set representing a unit of output, and converts it into some
 * precursor set, in which the while basket can be derived via mints.
 *
 * It does this recursively to handle cases where tokens are minted from other tokens
 * or in the case that RTokens are part of the basket.
 *
 * Function produces two outputs, a token quantity set representing the sum of the basket as
 * fraction of the whole
 *
 * So (0.22 saUSDT, 1100 cUSDT, 0.5 USDT) becomes 1.0 USDT
 *
 * The second output is a tree which can be traversed to DF to produce a set of minting operations
 * producing the basket from the precursor set.
 */
export const findPrecursorTokenSet = async (universe, userInputQuantity, rToken, unitBasket, searcher) => {
    const specialRules = universe.precursorTokenSourcingSpecialCases;
    const basketTokenApplications = [];
    const recourseOn = async (qty) => {
        const tokenSourcingRule = specialRules.get(qty.token);
        if (tokenSourcingRule != null) {
            return await tokenSourcingRule(userInputQuantity.token, qty, searcher);
        }
        const acts = universe.wrappedTokens.get(qty.token);
        if (acts != null) {
            const baseTokens = await acts.burn.quote([qty]);
            const branches = await Promise.all(baseTokens.map(async (qty) => await recourseOn(qty)));
            return BasketTokenSourcingRuleApplication.fromActionWithDependencies(acts.mint, branches);
        }
        return BasketTokenSourcingRuleApplication.noAction([qty]);
    };
    for (const qty of unitBasket) {
        const application = await recourseOn(qty);
        basketTokenApplications.push(application);
    }
    return BasketTokenSourcingRuleApplication.fromBranches(basketTokenApplications);
};
export class Searcher {
    universe;
    defaultSearcherOpts;
    constructor(universe) {
        this.universe = universe;
        this.defaultSearcherOpts = {
            internalTradeSlippage: this.defaultInternalTradeSlippage,
            outputSlippage: 100n,
            maxIssueance: true,
            returnDust: true,
        };
    }
    /**
     * @note This helper will find some set of operations converting a 'inputQuantity' into
     * a token basket represented via 'basketUnit' param.
     *
     * It does this by first finding the smallest set of tokens that can be used to derive the whole basket.
     *
     * Then it trades the inputQuantity for the tokens in the 'precursor' set.
     *
     * Lastly it mints the basket set.
     *
     * @param inputQuantity the token quantity to convert into the token basket
     * @param basketUnit a token quantity set representing one unit of output
     **/
    async findSingleInputToBasketGivenBasketUnit(inputQuantity, rToken, basketUnit, internalTradeSlippage, onResult, abortSignal) {
        /**
         * PHASE 1: Compute precursor set
         */
        const precursorTokens = await findPrecursorTokenSet(this.universe, inputQuantity, rToken, basketUnit, this);
        // console.log(precursorTokens.describe().join('\n'))
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
        const precursorTokenBasket = precursorTokens.precursorToTradeFor;
        // console.log(precursorTokenBasket.join(', '))
        // Split input by how large each token in precursor set is worth.
        // Example: We're trading 0.1 ETH, and precursorTokenSet(rToken) = (0.5 usdc, 0.5 usdt)
        // say usdc is trading at 0.99 usd and usdt 1.01, then the trade will be split as follows
        // sum = 0.99 * 0.5 + 1.01 * 0.5 = 1
        // 0.1 * (0.99 * 0.5) / sum = 0.0495 ETH will be going into the USDC trade
        // 0.1 * (1.01 * 0.5) / sum = 0.0505 ETH will be going into the USDT trade
        // If we can't quote every precursor token, we assume the token set adds up to 1.0
        // and we split the input by the fraction of the trade basket.
        const precursorTokensPrices = await Promise.all(precursorTokenBasket.map(async (qty) => (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero));
        const everyTokenPriced = precursorTokensPrices.every((i) => i.amount > 0n);
        const quoteSum = everyTokenPriced
            ? precursorTokensPrices.reduce((l, r) => l.add(r), this.universe.usd.zero)
            : precursorTokenBasket
                .map((p) => p.into(inputQuantity.token))
                .reduce((l, r) => l.add(r));
        // console.log(`sum: ${quoteSum}, ${precursorTokensPrices.join(', ')}`)
        const inputPrTrade = everyTokenPriced
            ? precursorTokenBasket.map(({ token }, i) => ({
                input: inputQuantity.mul(precursorTokensPrices[i].div(quoteSum).into(inputQuantity.token)),
                output: token,
            }))
            : precursorTokenBasket.map((qty) => ({
                output: qty.token,
                input: inputQuantity.mul(qty.into(inputQuantity.token).div(quoteSum)),
            }));
        const total = inputPrTrade.reduce((l, r) => l.add(r.input), inputQuantity.token.zero);
        const leftOver = inputQuantity.sub(total);
        if (leftOver.amount > 0n) {
            inputPrTrade[0].input = inputPrTrade[0].input.add(leftOver);
        }
        const balancesBeforeTrading = new TokenAmounts();
        balancesBeforeTrading.add(inputQuantity);
        let multiTrades = [];
        try {
            await Promise.all(inputPrTrade.map(async ({ input, output }) => {
                if (
                // Skip trade if user input is part of precursor set
                input.token === output) {
                    return;
                }
                // Swaps are sorted by output amount in descending order
                const trade = await this.findSingleInputTokenSwap(input, output, this.universe.config.addresses.executorAddress, internalTradeSlippage, abortSignal, 2, false);
                if (trade == null) {
                    throw new Error(`Could not find way to swap into precursor token ${input} -> ${output}`);
                }
                if (!balancesBeforeTrading.hasBalance(trade.inputs)) {
                    throw new Error('Insufficient balance for trade');
                }
                multiTrades.push(trade);
            }));
        }
        catch (e) {
            // console.log('Failed to produce trades')
            // console.log(e)
            throw e;
        }
        const resolveTradeConflicts = async (inTrades) => {
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
                    const newFirstSwap = await uniDex.swap(abortSignal, this.universe.execAddress, this.universe.execAddress, inputs, outputToken, this.defaultInternalTradeSlippage);
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
                        const newNextTrade = await uniDex.swap(abortSignal, this.universe.execAddress, this.universe.execAddress, newInput, nextTrade.outputToken[0], this.defaultInternalTradeSlippage);
                        // console.log(newNextTrade.steps[0].action.toString())
                        newTrades.push(newNextTrade);
                    }));
                    const outputAtTheEnd = [...inTrades, ...newTrades];
                    return outputAtTheEnd;
                }
                return inTrades;
            }
            catch (e) {
                console.log(e);
                console.log(e.stack);
                throw e;
            }
        };
        const generateIssueancePlan = async (tradeInputToTokenSet) => {
            try {
                const precursorIntoUnitBasket = [];
                const tradingBalances = balancesBeforeTrading.clone();
                for (const trade of tradeInputToTokenSet) {
                    await trade.exchange(tradingBalances);
                }
                const postTradeBalances = tradingBalances.clone();
                /**
                 * PHASE 3: Mint basket token set from precursor set
                 */
                const recourseOn = async (balances, parent, tradeAction) => {
                    let subBranchBalances = parent.multiplyFractions(tradeAction.inputAsFractionOfCurrentBalance, false);
                    const exchanges = [];
                    if (tradeAction.action) {
                        const actionInput = subBranchBalances.toTokenQuantities();
                        const mintExec = await new SwapPlan(this.universe, [
                            tradeAction.action,
                        ]).quote(actionInput, this.universe.config.addresses.executorAddress);
                        exchanges.push(mintExec);
                        precursorIntoUnitBasket.push(mintExec);
                        subBranchBalances.exchange(actionInput, mintExec.outputs);
                        balances.exchange(actionInput, mintExec.outputs);
                    }
                    let subActionExchanges = [];
                    for (const subAction of tradeAction.postTradeActions ?? []) {
                        subActionExchanges.push(...(await recourseOn(balances, subBranchBalances, subAction)));
                        if (subAction.updateBalances) {
                            exchanges.push(...subActionExchanges);
                            for (const exchange of subActionExchanges) {
                                subBranchBalances.exchange(exchange.inputs, exchange.outputs);
                            }
                            subActionExchanges = [];
                        }
                    }
                    return [...exchanges, ...subActionExchanges];
                };
                let balancesAtStartOfMintingPhase = postTradeBalances.clone();
                for (const action of precursorTokens.postTradeActions) {
                    const tokensForBranch = balancesAtStartOfMintingPhase.clone();
                    await recourseOn(balancesAtStartOfMintingPhase.clone(), tokensForBranch, action);
                    if (action.updateBalances) {
                        balancesAtStartOfMintingPhase = tokensForBranch;
                    }
                }
                const outquantities = balancesAtStartOfMintingPhase.toTokenQuantities();
                const tradeValueOut = tradeInputToTokenSet.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero);
                const mintStepValueOut = precursorIntoUnitBasket.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero);
                const tradingOutputs = postTradeBalances.toTokenQuantities();
                return {
                    trading: new SwapPaths(this.universe, [inputQuantity], tradeInputToTokenSet, tradingOutputs, tradeValueOut, this.universe.config.addresses.executorAddress),
                    minting: new SwapPaths(this.universe, tradingOutputs, precursorIntoUnitBasket, tradingBalances.toTokenQuantities(), mintStepValueOut, this.universe.config.addresses.executorAddress),
                };
            }
            catch (e) {
                console.log('Failed to generate issueance plan');
                console.log(e.stack);
                throw e;
            }
        };
        const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices);
        if (tradesWithOptions.length === 0) {
            const normalTrades = multiTrades.map((i) => i.path);
            return await onResult(await generateIssueancePlan(await resolveTradeConflicts(normalTrades)));
        }
        const allOptions = generateAllPermutations(multiTrades);
        // console.log('Possible issueance zaps', allOptions.length)
        for (const candidates of chunkifyIterable(allOptions, this.maxConcurrency)) {
            await Promise.all(candidates.map(async (paths) => {
                let out;
                try {
                    if (abortSignal.aborted) {
                        return;
                    }
                    const pathWithResolvedTradeConflicts = await resolveTradeConflicts(paths);
                    if (abortSignal.aborted) {
                        return;
                    }
                    out = await generateIssueancePlan(pathWithResolvedTradeConflicts);
                    if (abortSignal.aborted) {
                        return;
                    }
                }
                catch (e) {
                    // console.log(e)
                    // console.log(e.stack)
                    return;
                }
                try {
                    if (abortSignal.aborted) {
                        return;
                    }
                    await onResult(out);
                }
                catch (e) {
                    // console.log(e)
                    // console.log(e.stack)
                }
            }));
            if (abortSignal.aborted) {
                break;
            }
        }
    }
    async unwrapOnce(qty) {
        const mintBurnActions = this.universe.wrappedTokens.get(qty.token);
        if (mintBurnActions == null) {
            throw new Error('Token has no mint/burn actions');
        }
        const plan = new SwapPlan(this.universe, [mintBurnActions.burn]);
        const swap = (await plan.quote([qty], this.universe.config.addresses.executorAddress)).steps[0];
        return swap;
    }
    async recursivelyUnwrapQty(qty) {
        const potentiallyUnwrappable = [qty];
        const tokenAmounts = new TokenAmounts();
        const swapPlans = [];
        while (potentiallyUnwrappable.length !== 0) {
            const qty = potentiallyUnwrappable.pop();
            const mintBurnActions = this.universe.wrappedTokens.get(qty.token);
            if (mintBurnActions == null) {
                tokenAmounts.add(qty);
                continue;
            }
            this.unwrapOnce(qty);
            const plan = new SwapPlan(this.universe, [mintBurnActions.burn]);
            const [output, firstStep] = await Promise.all([
                mintBurnActions.burn.quoteWithSlippage([qty]),
                plan.quote([qty], this.universe.config.addresses.executorAddress),
            ]);
            swapPlans.push(firstStep.steps[0]);
            for (const underlyingQty of output) {
                potentiallyUnwrappable.push(underlyingQty);
            }
        }
        const output = tokenAmounts.toTokenQuantities();
        const outputQuotes = await Promise.all(output.map(async (qty) => (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero));
        if (swapPlans.length === 0) {
            return null;
        }
        return new SwapPath([qty], swapPlans, output, outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    get hasExtendedSimulationSupport() {
        return simulationUrls[this.universe.config.chainId] != null;
    }
    checkIfSimulationSupported() {
        if (!this.hasExtendedSimulationSupport) {
            throw new Error(`Zapper does not support simulation on chain ${this.universe.config.chainId}, please use 'findSingleInputToRTokenZap' for partial support`);
        }
    }
    get maxConcurrency() {
        return this.config.searchConcurrency;
    }
    get minResults() {
        return this.config.searcherMinRoutesToProduce;
    }
    async findRTokenIntoSingleTokenZapTx(rTokenQuantity, output, signerAddress, opts) {
        const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts);
        await this.universe.initialized;
        this.checkIfSimulationSupported();
        const controller = createConcurrentStreamingSeacher(this, toTxArgs);
        const mainPromise = Promise.all([
            this.findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.onResult, controller.abortController.signal),
            this.findTokenZapViaTrade(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.abortController.signal)
                .then(async (results) => await Promise.all(results.map(controller.onResult)))
                .catch((e) => { }),
        ]);
        const resultsPromise = new Promise((resolve) => {
            controller.abortController.signal.addEventListener('abort', () => {
                resolve(null);
            });
        });
        await Promise.race([resultsPromise, mainPromise]);
        return controller.getResults();
    }
    async findRTokenIntoSingleTokenZap(rTokenQuantity, output, signerAddress, internalTradeSlippage) {
        await this.universe.initialized;
        if (output === this.universe.nativeToken) {
            output = this.universe.wrappedNativeToken;
        }
        const timeout = AbortSignal.timeout(this.config.routerDeadline);
        const [mintResults, tradeResults] = (await Promise.all([
            this.findRTokenIntoSingleTokenZapViaRedeem(rTokenQuantity, output, signerAddress, internalTradeSlippage, timeout),
            this.findTokenZapViaTrade(rTokenQuantity, output, signerAddress, internalTradeSlippage, timeout),
        ]));
        const results = await Promise.all(mintResults.concat(tradeResults).map(async (i) => {
            const [cost, netValue] = await Promise.all([
                i.swaps.cost(this.universe),
                i.swaps.netValue(this.universe),
            ]);
            return {
                quote: i,
                cost: cost,
                netValue: netValue,
            };
        }));
        results.sort((l, r) => -l.netValue.compare(r.netValue));
        return results[0].quote;
    }
    async findRTokenIntoSingleTokenZapViaRedeem(rTokenQuantity, output, signerAddress, slippage, abortSignal) {
        const out = [];
        await this.findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, slippage, async (burnZap) => {
            out.push(burnZap);
        }, abortSignal);
        return out;
    }
    async findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, slippage, onResult, abortSignal) {
        await this.universe.initialized;
        const outputIsNative = output === this.universe.nativeToken;
        let outputToken = output;
        if (outputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            outputToken = this.universe.commonTokens.ERC20GAS;
        }
        const rToken = rTokenQuantity.token;
        const rTokenActions = this.universe.wrappedTokens.get(rToken);
        if (rTokenActions == null) {
            throw new Error('RToken has no mint/burn actions');
        }
        const redeemStep = await this.unwrapOnce(rTokenQuantity);
        const redeem = new SwapPath([rTokenQuantity], [redeemStep], redeemStep.outputs, this.universe.usd.zero, this.universe.config.addresses.executorAddress);
        const tokenAmounts = new TokenAmounts();
        const redeemSwapPaths = [];
        for (const basketTokenQty of redeem.outputs) {
            const basketTokenToOutput = await this.recursivelyUnwrapQty(basketTokenQty);
            if (basketTokenToOutput == null) {
                tokenAmounts.addQtys([basketTokenQty]);
            }
            else {
                tokenAmounts.addQtys(basketTokenToOutput.outputs);
                redeemSwapPaths.push(basketTokenToOutput);
            }
        }
        // Trade each underlying for output
        const unwrapTokenQtys = tokenAmounts.toTokenQuantities();
        const multiTrades = await Promise.all(unwrapTokenQtys
            .filter((qty) => qty.token !== outputToken)
            .map(async (qty) => {
            const potentialSwaps = await this.findSingleInputTokenSwap(qty, outputToken, signerAddress, slippage, abortSignal, 2, true);
            if (potentialSwaps == null) {
                throw Error('Failed to find trade for: ' +
                    qty +
                    '(' +
                    qty.token +
                    ')' +
                    ' -> ' +
                    outputToken +
                    '(' +
                    output +
                    ')');
            }
            return potentialSwaps;
        }));
        const generateRedeemPlan = async (trades = []) => {
            const pretradeBalances = tokenAmounts.clone();
            await Promise.all(trades.map(async (trade) => {
                await trade.exchange(pretradeBalances);
            }));
            const totalOutput = pretradeBalances.get(outputToken);
            const outputValue = (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero;
            const outputSwap = new SwapPaths(this.universe, [rTokenQuantity], [redeem, ...redeemSwapPaths, ...trades], tokenAmounts.toTokenQuantities(), outputValue, signerAddress);
            return new BurnRTokenSearcherResult(this.universe, rTokenQuantity, {
                full: outputSwap,
                rtokenRedemption: redeem,
                tokenBasketUnwrap: redeemSwapPaths,
                tradesToOutput: trades,
            }, signerAddress, outputToken);
        };
        if (multiTrades.filter((i) => i.hasMultipleChoices).length === 0) {
            return await onResult(await generateRedeemPlan(multiTrades.map((i) => i.path)));
        }
        const allOptions = generateAllPermutations(multiTrades);
        // console.log('Possible redeem zaps', allOptions.length)
        for (const candidates of chunkifyIterable(allOptions, this.maxConcurrency)) {
            await Promise.all(candidates.map(async (paths) => {
                try {
                    await onResult(await generateRedeemPlan(paths));
                }
                catch (e) { }
            }));
            if (abortSignal.aborted) {
                break;
            }
        }
    }
    async findTokenZapViaIssueance(userInput, rToken, signerAddress, slippage, abortSignal) {
        await this.universe.initialized;
        const outputs = [];
        try {
            await this.findSingleInputToRTokenZap_(userInput, rToken, signerAddress, slippage, async (result) => {
                outputs.push(result);
            }, abortSignal);
        }
        catch (e) {
            console.log(e);
        }
        return outputs;
    }
    async findTokenZapViaTrade(userInput, rToken, signerAddress, slippage, abortSignal) {
        await this.universe.initialized;
        const inputIsNative = userInput.token === this.universe.nativeToken;
        let inputTokenQuantity = userInput;
        if (inputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                console.log('No wrapped native token. (Like WETH) has been defined.');
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS);
        }
        const [paths, inputValue] = await Promise.all([
            this.externalQuoters(inputTokenQuantity, rToken, this.universe.execAddress, false, slippage, abortSignal),
            this.universe.fairPrice(inputTokenQuantity).catch(() => null),
        ]);
        if (inputValue == null) {
            return [];
        }
        return paths
            .map((i) => i.path)
            .filter((path) => parseFloat(path.outputValue.div(inputValue).format()) > 0.98)
            .slice(0, 2)
            .map((path) => new TradeSearcherResult(this.universe, userInput, new SwapPaths(this.universe, [inputTokenQuantity], [path], path.outputs, path.outputValue, signerAddress), signerAddress, rToken));
    }
    async findSingleInputToRTokenZap(userInput, rToken, signerAddress, slippage) {
        await this.universe.initialized;
        const abortSignal = AbortSignal.timeout(this.config.routerDeadline);
        const [mintResults, tradeResults] = (await Promise.all([
            this.findTokenZapViaIssueance(userInput, rToken, signerAddress, slippage, abortSignal),
            this.findTokenZapViaTrade(userInput, rToken, signerAddress, slippage, abortSignal),
        ]));
        const results = await Promise.all([...mintResults, ...tradeResults].map(async (i) => {
            return {
                quote: i,
                cost: await i.swaps.cost(this.universe),
                netValue: await i.swaps.netValue(this.universe),
            };
        }));
        results.sort((l, r) => -l.netValue.compare(r.netValue));
        return results[0];
    }
    get config() {
        return this.universe.config;
    }
    get defaultInternalTradeSlippage() {
        return this.config.defaultInternalTradeSlippage;
    }
    async findSingleInputToRTokenZapTx(userInput, rToken, userAddress, opts) {
        const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts);
        const slippage = toTxArgs.internalTradeSlippage;
        await this.universe.initialized;
        this.checkIfSimulationSupported();
        const controller = createConcurrentStreamingSeacher(this, toTxArgs);
        await Promise.all([
            this.findSingleInputToRTokenZap_(userInput, rToken, userAddress, slippage, controller.onResult, controller.abortController.signal),
            this.findTokenZapViaTrade(userInput, rToken, userAddress, slippage, controller.abortController.signal).then(async (i) => {
                try {
                    await Promise.all(i.map(async (i) => await controller.onResult(i)));
                }
                catch (e) { }
            }),
        ]).catch(() => { });
        return controller.getResults();
    }
    async findSingleInputToRTokenZap_(userInput, rToken, signerAddress, slippage, onResult, abort) {
        const inputIsNative = userInput.token === this.universe.nativeToken;
        let inputTokenQuantity = userInput;
        if (inputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                console.log('No wrapped native token. (Like WETH) has been defined.');
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS);
        }
        const rTokenActions = this.universe.wrappedTokens.get(rToken);
        if (rTokenActions == null) {
            console.log('RToken has no mint/burn actions');
            throw new Error('RToken has no mint/burn actions');
        }
        const mintAction = rTokenActions.mint;
        const unitBasket = await mintAction.rTokenDeployment.unitBasket();
        await this.findSingleInputToBasketGivenBasketUnit(inputTokenQuantity, rToken, unitBasket, slippage, async (inputQuantityToBasketTokens) => {
            try {
                const tradingBalances = new TokenAmounts();
                tradingBalances.add(inputTokenQuantity);
                await inputQuantityToBasketTokens.trading.exchange(tradingBalances);
                await inputQuantityToBasketTokens.minting.exchange(tradingBalances);
                const rTokenMint = await new SwapPlan(this.universe, [
                    rTokenActions.mint,
                ]).quote(mintAction.inputToken.map((token) => tradingBalances.get(token)), signerAddress);
                await rTokenMint.exchange(tradingBalances);
                const outputReordered = [
                    tradingBalances.get(rToken),
                    ...tradingBalances
                        .toTokenQuantities()
                        .filter((i) => i.token !== rToken),
                ];
                const full = new SwapPaths(this.universe, [inputTokenQuantity], [
                    ...inputQuantityToBasketTokens.trading.swapPaths,
                    ...inputQuantityToBasketTokens.minting.swapPaths,
                    rTokenMint,
                ], outputReordered, rTokenMint.outputValue, signerAddress);
                const conflicts = willPathsHaveAddressConflicts(full);
                if (conflicts.length !== 0) {
                    // console.log(full.describe().join('\n'))
                    // console.log(
                    //   'Address conflicts detected in minting paths',
                    //   conflicts.join(', ')
                    // )
                    return;
                }
                const parts = {
                    trading: inputQuantityToBasketTokens.trading,
                    minting: inputQuantityToBasketTokens.minting,
                    rTokenMint,
                    full,
                };
                await onResult(new MintRTokenSearcherResult(this.universe, userInput, parts, signerAddress, rToken));
            }
            catch (e) {
                console.log(e);
                console.log(e.stack);
                throw e;
            }
        }, abort);
    }
    async externalQuoters(input, output, destination, dynamicInput, slippage, abort) {
        const out = [];
        await this.externalQuoters_(abort, input, output, destination, dynamicInput, slippage, async (path) => {
            out.push({
                venue: path[0],
                path: path[1],
            });
        }).catch((e) => {
            console.log(e);
        });
        return out;
    }
    async externalQuoters_(abort, input, output, destination, dynamicInput, slippage, onResult) {
        const allowAggregatorSearch = this.universe.wrappedTokens.get(output)?.allowAggregatorSearcher ?? true;
        if (!allowAggregatorSearch) {
            console.log('Skipping external quoters - ' + output.toString());
            return;
        }
        const executorAddress = this.universe.config.addresses.executorAddress;
        let aggregators = this.universe.dexAggregators.filter((router) => router.supportsSwap(input, output));
        if (dynamicInput) {
            aggregators = aggregators.filter((i) => i.dynamicInput);
        }
        if (aggregators.length === 0) {
            console.log('No aggregators');
            return;
        }
        await Promise.all(aggregators.map(async (router) => {
            try {
                const res = await router.swap(abort, executorAddress, destination, input, output, slippage);
                await onResult([router, res]);
                // console.log(`${router.name} ok: ${res.steps[0].action.toString()}`)
            }
            catch (e) {
                // console.log(`${router.name} failed for case: ${input} -> ${output}`)
                // console.log(e)
            }
        }));
    }
    async internalQuoter(input, output, destination, onResult, maxHops = 2) {
        const bfsResult = bfs(this.universe, this.universe.graph, input.token, output, maxHops);
        const swapPlans = bfsResult.steps
            .map((i) => i.convertToSingularPaths())
            .flat()
            .filter((plan) => {
            if (plan.steps.length > maxHops) {
                return false;
            }
            if (plan.inputs.length !== 1) {
                return false;
            }
            if (plan.steps.some((i) => i.inputToken.length !== 1 || i.outputToken.length !== 1)) {
                return false;
            }
            if (new Set(plan.steps.map((i) => i.address)).size !== plan.steps.length) {
                return false;
            }
            return true;
        });
        await Promise.all(swapPlans.map(async (plan) => {
            try {
                await onResult(await plan.quote([input], destination));
            }
            catch (e) {
                // console.log(e)
                // console.log(plan.toString())
                // console.log(e)
            }
        }));
    }
    async findSingleInputTokenSwap(input, output, destination, slippage, abort, maxHops = 2, dynamicInput = false) {
        const out = [];
        await this.findSingleInputTokenSwap_(input, output, destination, slippage, abort, maxHops, dynamicInput, async (path) => {
            out.push(path);
        });
        if (out.length === 0) {
            throw new Error(`findSingleInputTokenSwap: No swaps found for ${input.token} -> ${output}`);
        }
        return new MultiChoicePath(this.universe, out);
    }
    async findSingleInputTokenSwap_(input, output, destination, slippage, abort, maxHops = 2, dynamicInput = false, onResult) {
        const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output);
        if (tradeSpecialCase != null) {
            const out = await tradeSpecialCase(input, destination);
            if (out != null) {
                await onResult(out);
            }
        }
        await Promise.all([
            this.internalQuoter(input, output, destination, async (res) => {
                await onResult(res);
            }, maxHops).catch((e) => {
                console.log(e);
                return [];
            }),
            this.externalQuoters_(abort, input, output, destination, dynamicInput, slippage, async (path) => await onResult(path[1])),
        ]);
    }
}
//# sourceMappingURL=Searcher.js.map