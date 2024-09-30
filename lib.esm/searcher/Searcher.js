import { TokenAmounts } from '../entities/TokenAmounts';
import { bfs } from '../exchange-graph/BFS';
import { BasketTokenSourcingRuleApplication, } from './BasketTokenSourcingRules';
import { MultiChoicePath, chunkifyIterable, createConcurrentStreamingEvaluator, generateAllPermutations, resolveTradeConflicts, } from './MultiChoicePath';
import { MintZap, RedeemZap, ZapViaATrade } from './SearcherResult';
import { SwapPath, SwapPaths, SwapPlan } from './Swap';
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
    const computePrecursorSet = async (inputToken) => {
        // console.log(`Findiing precursor set for ${rToken}: ${unitBasket.join(', ')}`)
        const basketTokenApplications = [];
        const recourseOn = async (qty) => {
            const tokenSourcingRule = specialRules.get(qty.token);
            if (tokenSourcingRule != null) {
                return await tokenSourcingRule(inputToken, qty, searcher, unitBasket);
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
        const out = BasketTokenSourcingRuleApplication.fromBranches(basketTokenApplications);
        return out;
    };
    let precursorSet = await computePrecursorSet(userInputQuantity.token);
    const inputTokenPrice = await searcher.fairPrice(userInputQuantity.token.one);
    const rTokenPrice = await searcher.fairPrice(rToken.one);
    if (inputTokenPrice == null || rTokenPrice == null) {
        searcher.debugLog('Failed to get fair price for input/output token');
        throw new Error('Failed to get fair price for input/output token');
    }
    const inputIsStableCoin = Math.abs(1 - inputTokenPrice.asNumber()) < 0.1;
    const rTokenIsStableCoin = Math.abs(1 - rTokenPrice.asNumber()) < 0.1;
    const pegDiffers = (inputIsStableCoin && !rTokenIsStableCoin) ||
        (!inputIsStableCoin && rTokenIsStableCoin);
    const preferredTokenSet = universe.preferredRTokenInputToken.get(rToken);
    const preferredToken = universe.preferredToken.get(rToken);
    searcher.debugLog(`pegDiffers=${pegDiffers}, preferredToken=${preferredToken}`);
    if (precursorSet.precursorToTradeFor.length > 1 &&
        preferredToken != null &&
        (pegDiffers ||
            (universe.chainId !== 1 &&
                !preferredTokenSet.has(userInputQuantity.token))) &&
        !preferredTokenSet.has(userInputQuantity.token)) {
        precursorSet = await computePrecursorSet(preferredToken);
        return {
            rules: precursorSet,
            initialTrade: {
                input: userInputQuantity,
                output: preferredToken,
            },
        };
    }
    return {
        rules: precursorSet,
        initialTrade: null,
    };
};
export class Searcher {
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
    async findSingleInputToBasketGivenBasketUnit(inputQuantity, rToken, basketUnit, internalTradeSlippage, signerAddress, onResult, abortSignal) {
        // const start = Date.now()
        // console.log('Finding precursors for', rToken.symbol)
        /**
         * PHASE 1: Compute precursor set
         */
        const { rules: precursorTokens, initialTrade } = await findPrecursorTokenSet(this.universe, inputQuantity, rToken, basketUnit, this);
        this.debugLog(precursorTokens.precursorToTradeFor.join(', '));
        this.debugLog(precursorTokens.describe().join('\n'));
        let firstTrade = null;
        if (initialTrade != null) {
            this.debugLog('Finding initial trade: ', `${initialTrade.input} -> ${initialTrade.output}`);
            firstTrade = await this.findSingleInputTokenSwap(false, initialTrade.input, initialTrade.output, this.universe.execAddress, this.defaultInternalTradeSlippage, AbortSignal.timeout(this.config.routerDeadline), 1);
        }
        const tradeforPrecursorsInputs = firstTrade?.paths.map((i) => ({
            tradeForPrecursorsInput: i.outputs[0],
            trade: i,
        })) ?? [
            {
                tradeForPrecursorsInput: inputQuantity,
                trade: null,
            },
        ];
        await Promise.all(tradeforPrecursorsInputs.map(async (option) => {
            const { tradeForPrecursorsInput: tradeforPrecursorsInput, trade: firstTrade, } = option;
            await this.createZapMintOption(tradeforPrecursorsInput, firstTrade, rToken, internalTradeSlippage, signerAddress, onResult, abortSignal, precursorTokens).catch((e) => {
                console.log(e);
            });
        }));
    }
    async createZapMintOption(tradeforPrecursorsInput, firstTrade, rToken, internalTradeSlippage, signerAddress, onResult, abortSignal, precursorTokens) {
        const generateInputToPrecursorTradeMeasurement = this.perf.begin('generateInputToPrecursorTrade', rToken.symbol);
        const generateInputToPrecursorTradeMeasurementSetup = this.perf.begin('generateInputToPrecursorTradeSetup', rToken.symbol);
        const balancesBeforeTrading = new TokenAmounts();
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
        this.debugLog('Generating trades');
        await Promise.all(inputPrTrade.map(async ({ input, output }) => {
            if (
            // Skip trade if user input is part of precursor set
            input.token === output) {
                return;
            }
            this.debugLog(`Finding trade for: ${input} -> ${output}`);
            for (let i = 1; i <= 3; i++) {
                try {
                    if (abortSignal.aborted) {
                        return;
                    }
                    const potentialSwaps = await this.findSingleInputTokenSwap(true, input, output, this.universe.config.addresses.executorAddress, internalTradeSlippage, abortSignal, i);
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
                    this.debugLog(`${input} -> ${output}: ${potentialSwaps.paths.length} options`);
                    for (const path of potentialSwaps.paths) {
                        this.debugLog(`  ${path}`);
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
                            const mintExec = await new SwapPlan(this.universe, [
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
                    trading: new SwapPaths(this.universe, [tradeforPrecursorsInput], tradeInputToTokenSet, tradingOutputs, tradeValueOut, this.universe.config.addresses.executorAddress),
                    minting: new SwapPaths(this.universe, tradingOutputs, precursorIntoUnitBasket, tradingBalances.toTokenQuantities(), mintStepValueOut, this.universe.config.addresses.executorAddress),
                };
            }
            catch (e) {
                console.log('Failed to generate issueance plan');
                console.log(e.stack);
                throw e;
            }
        }, rToken.symbol);
        if (multiTrades.length === 0) {
            this.debugLog('No trades needed, using precursor token');
            return await onResult(await generateIssueancePlan([]));
        }
        const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices);
        if (tradesWithOptions.length === 0) {
            const normalTrades = multiTrades.map((i) => i.path);
            return await onResult(await generateIssueancePlan(await resolveTradeConflicts(this, abortSignal, normalTrades)));
        }
        const precursorSet = new Set(precursorTokens.precursorToTradeFor.map((i) => i.token));
        this.debugLog('precursorSet', [...precursorSet].join(', '));
        this.debugLog(`multiTrades=${multiTrades.map((i) => i.paths.length).join(', ')}`);
        const allOptions = await this.perf.measurePromise('generateAllPermutations', generateAllPermutations(this, multiTrades, precursorSet, signerAddress), rToken.symbol);
        this.debugLog(`allOptions=${allOptions.length}`);
        const candidateChunks = [
            ...chunkifyIterable(allOptions, this.maxConcurrency, abortSignal),
        ];
        for (const candidates of candidateChunks) {
            await Promise.race([
                await Promise.all(candidates.map(async (paths) => {
                    try {
                        const pathWithResolvedTradeConflicts = await resolveTradeConflicts(this, abortSignal, paths);
                        await onResult(await generateIssueancePlan(pathWithResolvedTradeConflicts));
                    }
                    catch (e) {
                        console.log(e);
                    }
                })),
                new Promise((resolve) => setTimeout(resolve, 100)),
            ]);
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
            if (mintBurnActions == null || mintBurnActions.burn.addToGraph == false) {
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
        const outputQuotes = await Promise.all(output.map(async (qty) => (await this.fairPrice(qty)) ?? this.universe.usd.zero));
        if (swapPlans.length === 0) {
            return null;
        }
        return new SwapPath([qty], swapPlans, output, outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    get maxConcurrency() {
        return this.config.searchConcurrency;
    }
    async redeem(rTokenQuantity, output, signerAddress, opts) {
        const start = Date.now();
        const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts);
        await this.universe.initialized;
        const controller = createConcurrentStreamingEvaluator(this, toTxArgs);
        const work = Promise.all([
            this.findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.onResult, controller.abortController.signal, start).catch((e) => {
                console.log(e);
            }),
            opts?.enableTradeZaps === false
                ? Promise.resolve()
                : this.findTokenZapViaTrade(rTokenQuantity, output, signerAddress, toTxArgs.internalTradeSlippage, controller.onResult, controller.abortController.signal, start).catch(() => { }),
        ]);
        void work.finally(() => {
            controller.finishedSearching();
        });
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
        const rTokenPrice = await this.fairPrice(rToken.one);
        if (rTokenPrice == null) {
            this.debugLog('Failed to quote rToken price');
            throw new Error('Failed to quote rToken price');
        }
        const outputPrice = await this.fairPrice(output.one);
        if (outputPrice == null) {
            this.debugLog('Failed to quote output price');
            throw new Error('Failed to quote output price');
        }
        const rTokenIsStable = Math.abs(1 - rTokenPrice.asNumber()) < 0.1;
        const outputIsStable = Math.abs(1 - outputPrice.asNumber()) < 0.1;
        const unwrapTokenQtys = tokenAmounts.toTokenQuantities();
        const preferredOutputs = this.universe.preferredRTokenInputToken.get(rToken);
        const preferredOutput = this.universe.preferredToken.get(rToken);
        const nonMainnetRule = this.universe.chainId !== 1 &&
            preferredOutput != null &&
            !unwrapTokenQtys.find((i) => outputToken === i.token);
        const inputAndOutputArePeggedDifferently = rTokenIsStable !== outputIsStable;
        this.debugLog(`unwrapTokenQtys=${unwrapTokenQtys.join(', ')}`);
        const tradeToPreferredOutputThenOutput = async (preferredOutput) => {
            this.debugLog('Trading for ' + preferredOutput + ' first, then into output');
            const preferredTokenQty = unwrapTokenQtys.find((i) => i.token === preferredOutput) ??
                preferredOutput.zero;
            const tradeForPreferredOut = (await Promise.all(unwrapTokenQtys.map(async (qty) => {
                if (qty.token === preferredOutput) {
                    return null;
                }
                for (let i = 1; i <= 3; i++) {
                    const potentialSwaps = await this.findSingleInputTokenSwap(true, qty, preferredOutput, this.universe.config.addresses.executorAddress, this.universe.config.defaultInternalTradeSlippage, AbortSignal.timeout(this.universe.config.routerDeadline), i).catch(() => null);
                    if (potentialSwaps != null) {
                        return potentialSwaps;
                    }
                }
                throw Error('Failed to find trade for: ' + qty + ' -> ' + preferredOutput);
            })))
                .filter((i) => i != null)
                .map((i) => i);
            const outSum = tradeForPreferredOut
                .reduce((l, r) => l.add(r.outputs[0].mul(r.outputs[0].token.from(0.999))), preferredOutput.zero)
                .add(preferredTokenQty);
            this.debugLog(`Last trade: ${outSum} -> ${output}`);
            for (let i = 1; i <= 3; i++) {
                const lastTrade = await this.findSingleInputTokenSwap(true, outSum, output, signerAddress, this.universe.config.defaultInternalTradeSlippage, AbortSignal.timeout(this.universe.config.routerDeadline), i).catch(() => null);
                if (lastTrade != null) {
                    return [...tradeForPreferredOut, lastTrade];
                }
            }
            throw new Error('Failed to find trade for: ' + outSum + ' -> ' + output);
        };
        const tradeDirectly = async () => await Promise.all(unwrapTokenQtys
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
        const tradeIndirectlyFirst = unwrapTokenQtys.length > 1 &&
            (inputAndOutputArePeggedDifferently || nonMainnetRule) &&
            preferredOutput != null &&
            !preferredOutputs.has(output);
        const trades = tradeIndirectlyFirst
            ? await tradeToPreferredOutputThenOutput(preferredOutput).catch(async () => await tradeDirectly())
            : await tradeDirectly().catch(async (e) => {
                if (preferredOutput) {
                    return await tradeToPreferredOutputThenOutput(preferredOutput);
                }
                throw e;
            });
        const permutableTrades = trades.filter((i) => i.paths.length !== 0);
        const generatePermutation = async (underlyingToOutputTrades) => {
            const initialBalance = new TokenAmounts();
            initialBalance.add(rTokenQuantity);
            await redeem.exchange(initialBalance);
            const preRedeem = initialBalance.clone();
            if (redeemSwapPaths.length > 0) {
                const redeemPath = SwapPaths.fromPaths(this.universe, redeemSwapPaths);
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
            const outputSwap = new SwapPaths(this.universe, [rTokenQuantity], [redeem, ...redeemSwapPaths, ...underlyingToOutputTrades], postTradeBalances.toTokenQuantities(), outputValue, signerAddress);
            const zap = new RedeemZap(this, rTokenQuantity, {
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
            const allposibilities = await generateAllPermutations(this, permutableTrades, new Set([outputToken]), signerAddress);
            for (const path of allposibilities) {
                if (abortSignal.aborted) {
                    break;
                }
                try {
                    const resolveTrades = await resolveTradeConflicts(this, abortSignal, path);
                    await generatePermutation(resolveTrades);
                }
                catch (e) { }
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
        await this.findSingleInputTokenSwap_(inputTokenQuantity, rToken, signerAddress, slippage, ownController.signal, 1, false, async (path) => {
            if (results >= 2) {
                return;
            }
            try {
                await onResult(new ZapViaATrade(this, userInput, path.intoSwapPaths(this.universe), signerAddress, rToken, startTime, abortSignal));
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
        const invalue = parseFloat((await this.fairPrice(userInput))?.toString() ?? '0');
        if (invalue > this.universe.config.largeZapThreshold &&
            toTxArgs.minSearchTime == null) {
            toTxArgs.minSearchTime = this.config.largeZapSearchTime;
            this.debugLog(`Large zap detected (invalue=${invalue} > threshold=${this.universe.config.largeZapThreshold}), searcher will not race to produce result, exploring for at least ${toTxArgs.minSearchTime}ms`);
        }
        const controller = createConcurrentStreamingEvaluator(this, toTxArgs);
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
        void Promise.all([mintZap, tradeZap]).finally(() => {
            controller.finishedSearching();
        });
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
        await this.findSingleInputToBasketGivenBasketUnit(inputTokenQuantity, rToken, unitBasket, slippage, signerAddress, async (inputQuantityToBasketTokens) => {
            const tradingBalances = new TokenAmounts();
            tradingBalances.add(inputTokenQuantity);
            if (inputQuantityToBasketTokens.firstTrade != null) {
                await inputQuantityToBasketTokens.firstTrade.exchange(tradingBalances);
            }
            await inputQuantityToBasketTokens.trading.exchange(tradingBalances);
            await inputQuantityToBasketTokens.minting.exchange(tradingBalances);
            const rTokenMint = await new SwapPlan(this.universe, [
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
                    const updatedMinting = new SwapPaths(this.universe, inputQuantityToBasketTokens.trading.outputs, [...inputQuantityToBasketTokens.minting.swapPaths, rTokenMint], rTokenMint.outputs, rTokenMint.outputValue, this.universe.execAddress);
                    const full = new SwapPaths(this.universe, [inputTokenQuantity], [
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
                        await onResult(new MintZap(this, userInput, parts, signerAddress, endPosition, startTime, abort));
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
            const full = new SwapPaths(this.universe, [inputTokenQuantity], [
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
            await onResult(new MintZap(this, userInput, parts, signerAddress, rToken, startTime, abort));
        }, abort);
    }
    async externalQuoters_(input, output, onResult, opts) {
        await this.universe.swaps(input, output, onResult, opts);
    }
    async internalQuoter(input, output, destination, onResult, maxHops = 2) {
        const context = `${maxHops}:${input.token}->${output}`;
        const internalQuoterPerf = this.perf.begin('internalQuoter', context);
        const bfsResult = this.perf.measure('bfs', () => bfs(this.universe, this.universe.graph, input.token, output, maxHops), context);
        const swapPlans = bfsResult.steps
            .map((i) => i.convertToSingularPaths())
            .flat()
            .filter((plan) => {
            if (plan == null || plan.steps.length === 0) {
                return false;
            }
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
        return new MultiChoicePath(this.universe, out);
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
//# sourceMappingURL=Searcher.js.map