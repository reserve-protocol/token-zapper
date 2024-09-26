"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Searcher = exports.findPrecursorTokenSet = void 0;
const constants_1 = require("../base/constants");
const TokenAmounts_1 = require("../entities/TokenAmounts");
const BFS_1 = require("../exchange-graph/BFS");
const BasketTokenSourcingRules_1 = require("./BasketTokenSourcingRules");
const MultiChoicePath_1 = require("./MultiChoicePath");
const SearcherResult_1 = require("./SearcherResult");
const Swap_1 = require("./Swap");
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
const findPrecursorTokenSet = async (universe, userInputQuantity, rToken, unitBasket, searcher) => {
    // console.log(`Findiing precursor set for ${rToken}: ${unitBasket.join(', ')}`)
    const specialRules = universe.precursorTokenSourcingSpecialCases;
    const basketTokenApplications = [];
    const inputTokenPrice = await searcher.fairPrice(userInputQuantity.token.one);
    const rTokenPrice = await searcher.fairPrice(rToken.one);
    if (inputTokenPrice == null || rTokenPrice == null) {
        searcher.debugLog('Failed to get fair price for input/output token');
        throw new Error('Failed to get fair price for input/output token');
    }
    const inputIsStableCoin = Math.abs(1 - inputTokenPrice.asNumber()) < 0.1;
    const rTokenIsStableCoin = Math.abs(1 - rTokenPrice.asNumber()) < 0.1;
    let inputToken = userInputQuantity.token;
    let initialTrade = null;
    if ((inputIsStableCoin && !rTokenIsStableCoin) ||
        (!inputIsStableCoin && rTokenIsStableCoin)) {
        const preferredToken = universe.preferredRTokenInputToken.get(rToken);
        if (preferredToken != null) {
            inputToken = preferredToken;
            initialTrade = {
                input: userInputQuantity,
                output: inputToken,
            };
        }
    }
    const recourseOn = async (qty) => {
        const tokenSourcingRule = specialRules.get(qty.token);
        if (tokenSourcingRule != null) {
            return await tokenSourcingRule(inputToken, qty, searcher, unitBasket);
        }
        const acts = universe.wrappedTokens.get(qty.token);
        if (acts != null) {
            const baseTokens = await acts.burn.quote([qty]);
            const branches = await Promise.all(baseTokens.map(async (qty) => await recourseOn(qty)));
            return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.fromActionWithDependencies(acts.mint, branches);
        }
        return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.noAction([qty]);
    };
    for (const qty of unitBasket) {
        const application = await recourseOn(qty);
        basketTokenApplications.push(application);
    }
    const out = BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.fromBranches(basketTokenApplications);
    return {
        rules: out,
        initialTrade,
    };
};
exports.findPrecursorTokenSet = findPrecursorTokenSet;
class Searcher {
    universe;
    defaultSearcherOpts;
    // private readonly rTokenUnitBasketCache: BlockCache<Token, BasketTokenSourcingRuleApplication>
    constructor(universe) {
        this.universe = universe;
        this.defaultSearcherOpts = {
            internalTradeSlippage: this.defaultInternalTradeSlippage,
            outputSlippage: 100n,
            maxIssueance: true,
            returnDust: true,
        };
        // rTokenUnitBasketCache = universe.createCache(
        //   (token) =>
        // )
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
        // const start = Date.now()
        // console.log('Finding precursors for', rToken.symbol)
        /**
         * PHASE 1: Compute precursor set
         */
        const { rules: precursorTokens, initialTrade } = await (0, exports.findPrecursorTokenSet)(this.universe, inputQuantity, rToken, basketUnit, this);
        this.debugLog(precursorTokens.precursorToTradeFor.join(', '));
        this.debugLog(precursorTokens.describe().join('\n'));
        const generateInputToPrecursorTradeMeasurement = this.perf.begin('generateInputToPrecursorTrade', rToken.symbol);
        const generateInputToPrecursorTradeMeasurementSetup = this.perf.begin('generateInputToPrecursorTradeSetup', rToken.symbol);
        let firstTrade = null;
        let tradeforPrecursorsInput = inputQuantity;
        if (initialTrade != null) {
            this.debugLog('Finding initial trade: ', `${initialTrade.input} -> ${initialTrade.output}`);
            firstTrade = (await this.findSingleInputTokenSwap(true, initialTrade.input, initialTrade.output, this.universe.execAddress, this.defaultInternalTradeSlippage, AbortSignal.timeout(this.config.routerDeadline), 1)).path;
            tradeforPrecursorsInput = firstTrade.outputs[0];
            this.debugLog('Finding initial trade: ', `${initialTrade.input} -> ${tradeforPrecursorsInput}`);
        }
        const balancesBeforeTrading = new TokenAmounts_1.TokenAmounts();
        this.debugLog('tradeforPrecursorsInput', tradeforPrecursorsInput.toString());
        balancesBeforeTrading.add(tradeforPrecursorsInput);
        this.debugLog('balancesBeforeTrading', balancesBeforeTrading.toString());
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
        const precursorTokenBasket = precursorTokens.precursorToTradeFor;
        // console.log(precursorTokens.describe().join('\n'))
        // console.log(precursorTokenBasket.join(', '))
        // Split input by how large each token in precursor set is worth.
        // Example: We're trading 0.1 ETH, and precursorTokenSet(rToken) = (0.5 usdc, 0.5 usdt)
        // say usdc is trading at 0.99 usd and usdt 1.01, then the trade will be split as follows
        // sum = 0.99 * 0.5 + 1.01 * 0.5 = 1
        // 0.1 * (0.99 * 0.5) / sum = 0.0495 ETH will be going into the USDC trade
        // 0.1 * (1.01 * 0.5) / sum = 0.0505 ETH will be going into the USDT trade
        // If we can't quote every precursor token, we assume the token set adds up to 1.0
        // and we split the input by the fraction of the trade basket.
        const precursorTokensPrices = await Promise.all(precursorTokenBasket.map(async (qty) => (await this.fairPrice(qty)) ?? this.universe.usd.zero));
        const everyTokenPriced = precursorTokensPrices.every((i) => i.amount > 0n);
        const quoteSum = everyTokenPriced
            ? precursorTokensPrices.reduce((l, r) => l.add(r), this.universe.usd.zero)
            : precursorTokenBasket
                .map((p) => p.into(tradeforPrecursorsInput.token))
                .reduce((l, r) => l.add(r));
        // console.log(`sum: ${quoteSum}, ${precursorTokensPrices.join(', ')}`)
        const inputPrTrade = everyTokenPriced
            ? precursorTokenBasket.map(({ token }, i) => ({
                input: tradeforPrecursorsInput.mul(precursorTokensPrices[i]
                    .div(quoteSum)
                    .into(tradeforPrecursorsInput.token)),
                output: token,
            }))
            : precursorTokenBasket.map((qty) => ({
                output: qty.token,
                input: tradeforPrecursorsInput.mul(qty.into(tradeforPrecursorsInput.token).div(quoteSum)),
            }));
        const total = inputPrTrade.reduce((l, r) => l.add(r.input), tradeforPrecursorsInput.token.zero);
        const leftOver = tradeforPrecursorsInput.sub(total);
        if (leftOver.amount > 0n) {
            inputPrTrade[0].input = inputPrTrade[0].input.add(leftOver);
        }
        let multiTrades = [];
        generateInputToPrecursorTradeMeasurementSetup();
        multiTrades = [];
        this.debugLog('Generating trades');
        await Promise.all(inputPrTrade.map(async ({ input, output }) => {
            if (
            // Skip trade if user input is part of precursor set
            input.token === output) {
                return;
            }
            for (let i = 1; i <= 3; i++) {
                try {
                    if (abortSignal.aborted) {
                        return;
                    }
                    const potentialSwaps = await this.findSingleInputTokenSwap(false, input, output, this.universe.config.addresses.executorAddress, internalTradeSlippage, abortSignal, i);
                    if (potentialSwaps == null ||
                        potentialSwaps.paths.length === 0 ||
                        !balancesBeforeTrading.hasBalance(potentialSwaps.inputs)) {
                        this.debugLog('skipping trade');
                        this.debugLog(JSON.stringify({
                            'potentialSwaps == null': potentialSwaps == null,
                            'potentialSwaps.paths.length === 0': potentialSwaps.paths.length === 0,
                            '!balancesBeforeTrading.hasBalance(potentialSwaps.inputs)': !balancesBeforeTrading.hasBalance(potentialSwaps.inputs),
                            'potentialSwaps.inputs': potentialSwaps.inputs.join(', '),
                            balancesBeforeTrading: balancesBeforeTrading.toString(),
                        }));
                        continue;
                    }
                    multiTrades.push(potentialSwaps);
                    return;
                }
                catch (e) {
                    console.log(e);
                }
            }
        }));
        this.debugLog('Generated trades');
        generateInputToPrecursorTradeMeasurement();
        const generateIssueancePlan = this.perf.wrapAsyncFunction('generateIssueancePlan', async (tradeInputToTokenSet) => {
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
                        try {
                            const mintExec = await new Swap_1.SwapPlan(this.universe, [
                                tradeAction.action,
                            ]).quote(actionInput, this.universe.config.addresses.executorAddress);
                            exchanges.push(mintExec);
                            precursorIntoUnitBasket.push(mintExec);
                            subBranchBalances.exchange(actionInput, mintExec.outputs);
                            balances.exchange(actionInput, mintExec.outputs);
                        }
                        catch (e) {
                            console.error(tradingBalances.toString());
                            console.error(tradeInputToTokenSet
                                .map((i) => i.describe().join('\n'))
                                .join(', '));
                            console.error(`Failed to generate issueance plan, available tokens were ${actionInput.join(', ')}`);
                            throw e;
                        }
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
                let tradingBalancesUsedForMinting = tradingBalances.clone();
                for (const action of precursorTokens.postTradeActions) {
                    const tokensForBranch = tradingBalancesUsedForMinting.clone();
                    await recourseOn(tradingBalances, tokensForBranch, action);
                    if (action.updateBalances) {
                        tradingBalancesUsedForMinting = tradingBalances.clone();
                    }
                }
                const tradeValueOut = tradeInputToTokenSet.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero);
                const mintStepValueOut = precursorIntoUnitBasket.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero);
                const tradingOutputs = postTradeBalances.toTokenQuantities();
                return {
                    inputQuantity: tradeforPrecursorsInput,
                    firstTrade: firstTrade,
                    trading: new Swap_1.SwapPaths(this.universe, [tradeforPrecursorsInput], tradeInputToTokenSet, tradingOutputs, tradeValueOut, this.universe.config.addresses.executorAddress),
                    minting: new Swap_1.SwapPaths(this.universe, tradingOutputs, precursorIntoUnitBasket, tradingBalances.toTokenQuantities(), mintStepValueOut, this.universe.config.addresses.executorAddress),
                };
            }
            catch (e) {
                console.log('Failed to generate issueance plan');
                console.log(e.stack);
                throw e;
            }
        }, rToken.symbol);
        if (precursorTokens.precursorToTradeFor.length == 1 &&
            precursorTokens.precursorToTradeFor[0].token === inputQuantity.token) {
            this.debugLog('No trades needed, using precursor token');
            return await onResult(await generateIssueancePlan(await (0, MultiChoicePath_1.resolveTradeConflicts)(this, abortSignal, [])));
        }
        if (multiTrades.length === 0) {
            this.debugLog('No trades found');
            return;
        }
        const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices);
        if (tradesWithOptions.length === 0) {
            const normalTrades = multiTrades.map((i) => i.path);
            return await onResult(await generateIssueancePlan(await (0, MultiChoicePath_1.resolveTradeConflicts)(this, abortSignal, normalTrades)));
        }
        const precursorSet = new Set(precursorTokens.precursorToTradeFor.map((i) => i.token));
        this.debugLog('precursorSet', [...precursorSet].join(', '));
        const allOptions = await this.perf.measurePromise('generateAllPermutations', (0, MultiChoicePath_1.generateAllPermutations)(this, multiTrades, precursorSet), rToken.symbol);
        const aborter = new AbortController();
        const candidateChunks = (0, MultiChoicePath_1.chunkifyIterable)(allOptions, this.maxConcurrency, abortSignal);
        const prRound = this.config.routerDeadline / 2;
        const endTime = Date.now() + prRound;
        for (const candidates of candidateChunks) {
            let resultsProduced = 0;
            if (abortSignal.aborted) {
                break;
            }
            const maxWaitTime = AbortSignal.timeout(prRound + 1000);
            const p = new Promise((resolve) => {
                abortSignal.addEventListener('abort', () => {
                    resolve(null);
                });
                aborter.signal.addEventListener('abort', () => {
                    resolve(null);
                });
                maxWaitTime.addEventListener('abort', () => {
                    if (resultsProduced != 0) {
                        resolve(null);
                    }
                });
            });
            await Promise.race([
                await Promise.all(candidates.map(async (paths) => {
                    let out;
                    try {
                        const pathWithResolvedTradeConflicts = await (0, MultiChoicePath_1.resolveTradeConflicts)(this, abortSignal, paths);
                        out = await generateIssueancePlan(pathWithResolvedTradeConflicts);
                        try {
                            await onResult(out);
                            resultsProduced += 1;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                    if (resultsProduced > this.minResults) {
                        if (Date.now() > endTime) {
                            aborter.abort();
                        }
                    }
                })),
                p,
            ]);
        }
    }
    async unwrapOnce(qty) {
        const mintBurnActions = this.universe.wrappedTokens.get(qty.token);
        if (mintBurnActions == null) {
            throw new Error('Token has no mint/burn actions');
        }
        const plan = new Swap_1.SwapPlan(this.universe, [mintBurnActions.burn]);
        const swap = (await plan.quote([qty], this.universe.config.addresses.executorAddress)).steps[0];
        return swap;
    }
    async recursivelyUnwrapQty(qty) {
        const potentiallyUnwrappable = [qty];
        const tokenAmounts = new TokenAmounts_1.TokenAmounts();
        const swapPlans = [];
        while (potentiallyUnwrappable.length !== 0) {
            const qty = potentiallyUnwrappable.pop();
            const mintBurnActions = this.universe.wrappedTokens.get(qty.token);
            if (mintBurnActions == null || mintBurnActions.burn.addToGraph == false) {
                tokenAmounts.add(qty);
                continue;
            }
            this.unwrapOnce(qty);
            const plan = new Swap_1.SwapPlan(this.universe, [mintBurnActions.burn]);
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
        const outputQuotes = await Promise.all(output.map(async (qty) => (await this.fairPrice(qty)) ?? this.universe.usd.zero));
        if (swapPlans.length === 0) {
            return null;
        }
        return new Swap_1.SwapPath([qty], swapPlans, output, outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    get hasExtendedSimulationSupport() {
        return constants_1.simulationUrls[this.universe.config.chainId] != null;
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
    async redeem(rTokenQuantity, output, signerAddress, opts) {
        const start = Date.now();
        const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts);
        await this.universe.initialized;
        this.checkIfSimulationSupported();
        const controller = (0, MultiChoicePath_1.createConcurrentStreamingEvaluator)(this, toTxArgs);
        await Promise.all([
            this.findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.onResult, controller.abortController.signal, start).catch((e) => {
                console.log(e);
            }),
            opts?.enableTradeZaps === false
                ? Promise.resolve()
                : this.findTokenZapViaTrade(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.onResult, controller.abortController.signal, start).catch(() => { }),
        ]);
        await controller.resultReadyPromise;
        return controller.getResults(start);
    }
    async findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, slippage, onResult, abortSignal, startTime) {
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
        const redeem = new Swap_1.SwapPath([rTokenQuantity], [redeemStep], redeemStep.outputs, this.universe.usd.zero, this.universe.config.addresses.executorAddress);
        const tokenAmounts = new TokenAmounts_1.TokenAmounts();
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
        const unwrapTokenQtys = tokenAmounts.toTokenQuantities();
        const trades = await Promise.all(unwrapTokenQtys
            .filter((qty) => qty.token !== outputToken)
            .map(async (qty) => {
            for (let i = 1; i <= 3; i++) {
                const potentialSwaps = await this.findSingleInputTokenSwap(true, qty, outputToken, this.universe.config.addresses.executorAddress, slippage, abortSignal, i).catch(() => null);
                if (potentialSwaps == null) {
                    continue;
                }
                return potentialSwaps;
            }
            throw Error('Failed to find trade for: ' + qty + ' -> ' + outputToken);
        }));
        const permutableTrades = trades.filter((i) => i.paths.length !== 0);
        const generatePermutation = async (underlyingToOutputTrades) => {
            const initialBalance = new TokenAmounts_1.TokenAmounts();
            initialBalance.add(rTokenQuantity);
            await redeem.exchange(initialBalance);
            const preRedeem = initialBalance.clone();
            if (redeemSwapPaths.length > 0) {
                const redeemPath = Swap_1.SwapPaths.fromPaths(this.universe, redeemSwapPaths);
                await redeemPath.exchange(preRedeem);
            }
            const pretradeBalances = preRedeem.clone();
            if (underlyingToOutputTrades.length > 0) {
                for (const trade of underlyingToOutputTrades) {
                    await trade.exchange(pretradeBalances);
                }
            }
            const postTradeBalances = pretradeBalances.clone();
            const totalOutput = postTradeBalances.get(outputToken);
            const outputValue = (await this.fairPrice(totalOutput)) ?? this.universe.usd.zero;
            const outputSwap = new Swap_1.SwapPaths(this.universe, [rTokenQuantity], [redeem, ...redeemSwapPaths, ...underlyingToOutputTrades], postTradeBalances.toTokenQuantities(), outputValue, signerAddress);
            const zap = new SearcherResult_1.RedeemZap(this, rTokenQuantity, {
                full: outputSwap,
                rtokenRedemption: redeem,
                tokenBasketUnwrap: redeemSwapPaths,
                tradesToOutput: underlyingToOutputTrades,
            }, signerAddress, totalOutput.token, startTime, abortSignal);
            // console.log(zap.describe().join('\n'))
            return await onResult(zap).catch((e) => {
                // console.log(e)
            });
        };
        if (permutableTrades.length === 0) {
            return await generatePermutation(permutableTrades.map((i) => i.path));
        }
        else {
            const allposibilities = await (0, MultiChoicePath_1.generateAllPermutations)(this, permutableTrades, new Set([outputToken]));
            for (const path of allposibilities) {
                if (abortSignal.aborted) {
                    break;
                }
                try {
                    const resolveTrades = await (0, MultiChoicePath_1.resolveTradeConflicts)(this, abortSignal, path);
                    await generatePermutation(resolveTrades);
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    async findTokenZapViaTrade(userInput, rToken, signerAddress, slippage, onResult, abortSignal, startTime = Date.now()) {
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
        const ownController = new AbortController();
        abortSignal.addEventListener('abort', () => {
            ownController.abort();
        });
        let results = 0;
        let tolerance = 0.98;
        const invalue = parseFloat((await this.fairPrice(inputTokenQuantity))?.toString() ?? '0');
        if (invalue > 50000) {
            tolerance = 0.997;
        }
        await this.findSingleInputTokenSwap_(inputTokenQuantity, rToken, signerAddress, slippage, ownController.signal, 3, false, async (path) => {
            if (results >= 2) {
                return;
            }
            try {
                await onResult(new SearcherResult_1.ZapViaATrade(this, userInput, path.intoSwapPaths(this.universe), signerAddress, rToken, startTime, abortSignal));
                results += 1;
                if (results >= 2) {
                    ownController.abort();
                }
            }
            catch (e) { }
        }, tolerance);
    }
    get perf() {
        return this.universe.perf;
    }
    get config() {
        return this.universe.config;
    }
    get defaultInternalTradeSlippage() {
        return this.config.defaultInternalTradeSlippage;
    }
    async zapIntoRTokenYieldPosition(userInput, rToken, yieldPosition, userAddress, opts) {
        return await this.zapIntoRToken(userInput, rToken, userAddress, {
            ...opts,
            enableTradeZaps: false,
            endPosition: yieldPosition,
        });
    }
    async zapIntoRToken(userInput, rToken, userAddress, opts) {
        const start = Date.now();
        const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts);
        const slippage = toTxArgs.internalTradeSlippage;
        await this.universe.initialized;
        this.checkIfSimulationSupported();
        const invalue = parseFloat((await this.fairPrice(userInput))?.toString() ?? '0');
        if (invalue > this.universe.config.largeZapThreshold &&
            toTxArgs.minSearchTime == null) {
            toTxArgs.minSearchTime = this.config.largeZapSearchTime;
            this.debugLog(`Large zap detected (invalue=${invalue} > threshold=${this.universe.config.largeZapThreshold}), searcher will not race to produce result, exploring for at least ${toTxArgs.minSearchTime}ms`);
        }
        const controller = (0, MultiChoicePath_1.createConcurrentStreamingEvaluator)(this, toTxArgs);
        const errors = [];
        const mintZap = this.findSingleInputToRTokenZap_(userInput, rToken, userAddress, slippage, controller.onResult, controller.abortController.signal, toTxArgs.endPosition, start).catch((e) => {
            errors.push(e);
        });
        const doTrades = opts?.enableTradeZaps !== false;
        const tradeZap = doTrades
            ? this.findTokenZapViaTrade(userInput, rToken, userAddress, slippage, controller.onResult, controller.abortController.signal, start).catch((e) => {
                errors.push(e);
            })
            : Promise.resolve();
        await Promise.all([mintZap, tradeZap]);
        await controller.resultReadyPromise;
        try {
            return controller.getResults(start);
        }
        catch (e) {
            for (const err of errors) {
                console.log(err);
            }
            throw e;
        }
    }
    async findSingleInputToRTokenZap_(userInput, rToken, signerAddress, slippage, onResult, abort, endPosition = rToken, startTime = Date.now()) {
        const inputIsNative = userInput.token === this.universe.nativeToken;
        let inputTokenQuantity = userInput;
        if (inputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                this.debugLog('No wrapped native token. (Like WETH) has been defined.');
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS);
        }
        const rTokenActions = this.universe.wrappedTokens.get(rToken);
        if (rTokenActions == null) {
            this.debugLog('RToken has no mint/burn actions');
            throw new Error('RToken has no mint/burn actions');
        }
        const mintAction = rTokenActions.mint;
        const unitBasket = await mintAction.rTokenDeployment
            .unitBasket()
            .catch((e) => {
            this.debugLog(e);
            throw e;
        });
        await this.findSingleInputToBasketGivenBasketUnit(inputTokenQuantity, rToken, unitBasket, slippage, async (inputQuantityToBasketTokens) => {
            const tradingBalances = new TokenAmounts_1.TokenAmounts();
            tradingBalances.add(inputTokenQuantity);
            if (inputQuantityToBasketTokens.firstTrade != null) {
                await inputQuantityToBasketTokens.firstTrade.exchange(tradingBalances);
            }
            await inputQuantityToBasketTokens.trading.exchange(tradingBalances);
            await inputQuantityToBasketTokens.minting.exchange(tradingBalances);
            const rTokenMint = await new Swap_1.SwapPlan(this.universe, [
                rTokenActions.mint,
            ]).quote(mintAction.inputToken.map((token) => tradingBalances.get(token)), endPosition !== rToken
                ? this.config.addresses.executorAddress
                : signerAddress);
            await rTokenMint.exchange(tradingBalances);
            if (endPosition !== rToken) {
                const lastSteps = await this.findSingleInputTokenSwap(true, tradingBalances.get(rToken), endPosition, signerAddress, slippage, abort, 1);
                for (const lastStep of lastSteps.paths) {
                    const lastMintBals = tradingBalances.clone();
                    await lastStep.exchange(lastMintBals);
                    const outputReordered = [
                        lastMintBals.get(endPosition),
                        ...lastMintBals
                            .toTokenQuantities()
                            .filter((i) => i.token !== endPosition),
                    ];
                    const updatedMinting = new Swap_1.SwapPaths(this.universe, inputQuantityToBasketTokens.trading.outputs, [...inputQuantityToBasketTokens.minting.swapPaths, rTokenMint], rTokenMint.outputs, rTokenMint.outputValue, this.universe.execAddress);
                    const full = new Swap_1.SwapPaths(this.universe, [inputTokenQuantity], [
                        ...(inputQuantityToBasketTokens.firstTrade
                            ? [inputQuantityToBasketTokens.firstTrade]
                            : []),
                        ...inputQuantityToBasketTokens.trading.swapPaths,
                        ...updatedMinting.swapPaths,
                        lastStep,
                    ], outputReordered, lastStep.outputValue, signerAddress);
                    const parts = {
                        setup: inputQuantityToBasketTokens.firstTrade,
                        trading: inputQuantityToBasketTokens.trading,
                        minting: updatedMinting,
                        outputMint: lastStep,
                        full,
                    };
                    try {
                        await onResult(new SearcherResult_1.MintZap(this, userInput, parts, signerAddress, endPosition, startTime, abort));
                    }
                    catch (e) { }
                }
                return;
            }
            const outputReordered = [
                tradingBalances.get(rToken),
                ...tradingBalances
                    .toTokenQuantities()
                    .filter((i) => i.token !== rToken),
            ];
            const full = new Swap_1.SwapPaths(this.universe, [inputTokenQuantity], [
                ...(inputQuantityToBasketTokens.firstTrade
                    ? [inputQuantityToBasketTokens.firstTrade]
                    : []),
                ...inputQuantityToBasketTokens.trading.swapPaths,
                ...inputQuantityToBasketTokens.minting.swapPaths,
                rTokenMint,
            ], outputReordered, rTokenMint.outputValue, signerAddress);
            const parts = {
                setup: inputQuantityToBasketTokens.firstTrade,
                trading: inputQuantityToBasketTokens.trading,
                minting: inputQuantityToBasketTokens.minting,
                outputMint: rTokenMint,
                full,
            };
            await onResult(new SearcherResult_1.MintZap(this, userInput, parts, signerAddress, rToken, startTime, abort));
        }, abort);
    }
    async externalQuoters_(input, output, onResult, opts) {
        await this.universe.swaps(input, output, onResult, opts);
    }
    async internalQuoter(input, output, destination, onResult, maxHops = 2) {
        const context = `${maxHops}:${input.token}->${output}`;
        const internalQuoterPerf = this.perf.begin('internalQuoter', context);
        const bfsResult = this.perf.measure('bfs', () => (0, BFS_1.bfs)(this.universe, this.universe.graph, input.token, output, maxHops), context);
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
            await onResult(await plan.quote([input], destination));
        }));
        internalQuoterPerf();
    }
    async findSingleInputTokenSwap(dynamicInput, input, output, destination, slippage, abort, maxHops) {
        const out = [];
        await this.findSingleInputTokenSwap_(input, output, destination, slippage, abort, maxHops, dynamicInput, async (path) => {
            out.push(path);
        }).catch((e) => {
            console.log(e);
        });
        if (out.length === 0) {
            throw new Error(`findSingleInputTokenSwap: No swaps found for ${input.token} -> ${output}`);
        }
        return new MultiChoicePath_1.MultiChoicePath(this.universe, out);
    }
    tokenPrices = new Map();
    async fairPrice(qty) {
        const out = await this.universe.fairPrice(qty);
        if (out != null) {
            const unitPrice = qty.amount === qty.token.scale ? out : out.div(qty.into(out.token));
            this.tokenPrices.set(qty.token, unitPrice);
        }
        return out;
    }
    async findSingleInputTokenSwap_(input, output, destination, slippage, abort, maxHops, dynamicInput, onResult, rejectRatio = 0.9) {
        const inputTokenSpecialCase = this.universe.tokenFromTradeSpecialCases.get(input.token);
        if (inputTokenSpecialCase != null) {
            const out = await inputTokenSpecialCase(input, output);
            if (out != null) {
                await onResult(out);
                return;
            }
        }
        const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output);
        if (tradeSpecialCase != null) {
            const out = await tradeSpecialCase(input, destination);
            if (out != null) {
                await onResult(out);
            }
        }
        const inValue = parseFloat((await this.fairPrice(input))?.format() ?? '0') ?? 0;
        let dropped = 0;
        let total = 0;
        const emitResult = async (path) => {
            total++;
            const outValue = parseFloat(path.outputValue.format());
            if (inValue != 0 && outValue != 0) {
                const ratio = outValue / inValue;
                if (ratio < rejectRatio) {
                    this.debugLog(path.toString());
                    this.debugLog(`Found trade: ${input} ${inValue} -> ${path.outputs.join(', ')} outValue: ${outValue}, price impact: ${ratio}! rejectRatio: ${rejectRatio}`);
                    // console.log('Rejecting', path.describe().join('\n'))
                    dropped += 1;
                    return;
                }
                if (abort.aborted) {
                    return;
                }
            }
            try {
                await onResult(path);
            }
            catch (e) { }
        };
        await Promise.all([
            this.internalQuoter(input, output, destination, emitResult, maxHops).catch((e) => {
                console.log(e);
            }),
            this.externalQuoters_(input, output, emitResult, {
                dynamicInput,
                abort,
                slippage,
            }).catch((e) => {
                console.log(e);
            }),
        ]);
    }
    debugLog(...args) {
        if (process.env.DEV) {
            console.log(...args);
        }
    }
}
exports.Searcher = Searcher;
//# sourceMappingURL=Searcher.js.map