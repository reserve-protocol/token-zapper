"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Searcher = exports.findPrecursorTokenSet = void 0;
const BasketTokenSourcingRules_1 = require("./BasketTokenSourcingRules");
const TokenAmounts_1 = require("../entities/TokenAmounts");
const BFS_1 = require("../exchange-graph/BFS");
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
    const specialRules = universe.precursorTokenSourcingSpecialCases.get(rToken);
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
            return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.fromActionWithDependencies(acts.mint, branches);
        }
        return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.noAction([qty]);
    };
    for (const qty of unitBasket) {
        const application = await recourseOn(qty);
        basketTokenApplications.push(application);
    }
    return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.fromBranches(basketTokenApplications);
};
exports.findPrecursorTokenSet = findPrecursorTokenSet;
class Searcher {
    universe;
    constructor(universe) {
        this.universe = universe;
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
    async findSingleInputToBasketGivenBasketUnit(inputQuantity, rToken, basketUnit, slippage) {
        // console.log(basketUnit.join(", "))
        /**
         * PHASE 1: Compute precursor set
         */
        const precursorTokens = await (0, exports.findPrecursorTokenSet)(this.universe, inputQuantity, rToken, basketUnit, this);
        // console.log(precursorTokens.describe().join("\n"))
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
        const precursorTokenBasket = precursorTokens.precursorToTradeFor;
        // console.log(precursorTokenBasket.join(", "))
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
            ? precursorTokensPrices.reduce((l, r) => l.add(r))
            : precursorTokenBasket
                .map((p) => p.into(inputQuantity.token))
                .reduce((l, r) => l.add(r));
        const inputPrTrade = everyTokenPriced
            ? precursorTokenBasket.map(({ token }, i) => ({
                input: inputQuantity.mul(precursorTokensPrices[i].div(quoteSum).into(inputQuantity.token)),
                output: token,
            }))
            : precursorTokenBasket.map((qty) => ({
                output: qty.token,
                input: inputQuantity.mul(qty.into(inputQuantity.token).div(quoteSum)),
            }));
        const inputQuantityToTokenSet = [];
        const tradingBalances = new TokenAmounts_1.TokenAmounts();
        tradingBalances.add(inputQuantity);
        // Trade inputs for precursor set.
        for (const { input, output } of inputPrTrade) {
            if (
            // Skip trade if user input is part of precursor set
            input.token === output) {
                continue;
            }
            // console.log(input + " -> " + output)
            // Swaps are sorted by output amount in descending order
            const swaps = await this.findSingleInputTokenSwap(input, output, this.universe.config.addresses.executorAddress, slippage);
            const trade = swaps[0];
            if (trade == null) {
                throw new Error(`Could not find way to swap into precursor token ${input} -> ${output}`);
            }
            if (!tradingBalances.hasBalance(trade.inputs)) {
                throw new Error('Failed to find token zap');
            }
            await trade.exchange(tradingBalances);
            inputQuantityToTokenSet.push(trade);
        }
        /**
         * PHASE 3: Mint basket token set from precursor set
         */
        const recourseOn = async (balances, parent, tradeAction) => {
            let subBranchBalances = parent.multiplyFractions(tradeAction.inputAsFractionOfCurrentBalance, false);
            const exchanges = [];
            if (tradeAction.action) {
                const actionInput = subBranchBalances.toTokenQuantities();
                const mintExec = await new Swap_1.SwapPlan(this.universe, [
                    tradeAction.action,
                ]).quote(actionInput, this.universe.config.addresses.executorAddress);
                exchanges.push(mintExec);
                inputQuantityToTokenSet.push(mintExec);
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
        let tradingBalancesUsedForMinting = tradingBalances.clone();
        for (const action of precursorTokens.postTradeActions) {
            const tokensForBranch = tradingBalancesUsedForMinting.clone();
            await recourseOn(tradingBalances, tokensForBranch, action);
            if (action.updateBalances) {
                tradingBalancesUsedForMinting = tradingBalances.clone();
            }
        }
        return new Swap_1.SwapPaths(this.universe, [inputQuantity], inputQuantityToTokenSet, tradingBalances.toTokenQuantities(), inputQuantityToTokenSet.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    async recursivelyUnwrapQty(qty) {
        const potentiallyUnwrappable = [qty];
        const tokenAmounts = new TokenAmounts_1.TokenAmounts();
        const swapPlans = [];
        while (potentiallyUnwrappable.length !== 0) {
            const qty = potentiallyUnwrappable.pop();
            const mintBurnActions = this.universe.wrappedTokens.get(qty.token);
            if (mintBurnActions == null) {
                tokenAmounts.add(qty);
                continue;
            }
            const output = await mintBurnActions.burn.quote([qty]);
            const plan = new Swap_1.SwapPlan(this.universe, [mintBurnActions.burn]);
            swapPlans.push(await plan.quote([qty], this.universe.config.addresses.executorAddress));
            for (const underylingQty of output) {
                potentiallyUnwrappable.push(underylingQty);
            }
        }
        const output = tokenAmounts.toTokenQuantities();
        const outputQuotes = await Promise.all(output.map(async (qty) => (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero));
        return new Swap_1.SwapPaths(this.universe, [qty], swapPlans, output, outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    async findRTokenIntoSingleTokenZap(rTokenQuantity, output, signerAddress, slippage = 0.0) {
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
        const redeemRTokenForUnderlying = await this.recursivelyUnwrapQty(rTokenQuantity);
        // Trade each underlying for output
        const tokenAmounts = new TokenAmounts_1.TokenAmounts();
        tokenAmounts.addQtys(redeemRTokenForUnderlying.outputs);
        const underlyingToOutputTrade = await Promise.all(redeemRTokenForUnderlying.outputs
            .filter((qty) => qty.token !== outputToken)
            .map(async (qty) => {
            const potentialSwaps = await this.findSingleInputTokenSwap(qty, outputToken, signerAddress, slippage);
            const trade = potentialSwaps[0];
            await trade.exchange(tokenAmounts);
            return trade;
        }));
        const totalOutput = tokenAmounts.get(outputToken);
        const outputValue = (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero;
        const outputSwap = new Swap_1.SwapPaths(this.universe, [rTokenQuantity], [
            ...redeemRTokenForUnderlying.swapPaths.map((i) => {
                if (i.outputs.length === 1 && i.outputs[0].token === outputToken) {
                    return new Swap_1.SwapPath(i.inputs, i.steps, i.outputs, i.outputValue, signerAddress);
                }
                return i;
            }),
            ...underlyingToOutputTrade,
        ], tokenAmounts.toTokenQuantities(), outputValue, signerAddress);
        return new SearcherResult_1.SearcherResult(this.universe, rTokenQuantity, outputSwap, signerAddress, outputToken);
    }
    findSingleInputToRTokenZap(userInput, rToken, signerAddress, slippage = 0.0) {
        return this.findSingleInputToRTokenZap_(userInput, rToken, signerAddress, slippage);
        // return retryLoop(
        //   () =>
        //     this.findSingleInputToRTokenZap_(
        //       userInput,
        //       rToken,
        //       signerAddress,
        //       slippage
        //     ),
        //   {
        //     maxRetries: 3,
        //     retryDelay: 500,
        //     async onRetry() {
        //       return 'RETURN'
        //     },
        //   }
        // )
    }
    async findSingleInputToRTokenZap_(userInput, rToken, signerAddress, slippage = 0.0) {
        const inputIsNative = userInput.token === this.universe.nativeToken;
        let inputTokenQuantity = userInput;
        if (inputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS);
        }
        const rTokenActions = this.universe.wrappedTokens.get(rToken);
        if (rTokenActions == null) {
            throw new Error('RToken has no mint/burn actions');
        }
        const mintAction = rTokenActions.mint;
        const tradingBalances = new TokenAmounts_1.TokenAmounts();
        tradingBalances.add(inputTokenQuantity);
        const inputQuantityToBasketTokens = await this.findSingleInputToBasketGivenBasketUnit(inputTokenQuantity, rToken, mintAction.basket.unitBasket, slippage);
        await inputQuantityToBasketTokens.exchange(tradingBalances);
        const rTokenMint = await new Swap_1.SwapPlan(this.universe, [
            rTokenActions.mint,
        ]).quote(mintAction.input.map((token) => tradingBalances.get(token)), signerAddress);
        await rTokenMint.exchange(tradingBalances);
        const output = tradingBalances.toTokenQuantities();
        const searcherResult = new SearcherResult_1.SearcherResult(this.universe, userInput, new Swap_1.SwapPaths(this.universe, [inputTokenQuantity], [...inputQuantityToBasketTokens.swapPaths, rTokenMint], output, rTokenMint.outputValue, signerAddress), signerAddress, rToken);
        return searcherResult;
    }
    async externalQuoters(input, output, destination, slippage) {
        const allowAggregatorSearch = this.universe.wrappedTokens.get(output)?.allowAggregatorSearcher ?? true;
        if (!allowAggregatorSearch || this.universe.lpTokens.has(output)) {
            return [];
        }
        const executorAddress = this.universe.config.addresses.executorAddress;
        const out = await Promise.all(this.universe.dexAggregators.map(async (router) => await router.swap(executorAddress, destination, input, output, slippage)));
        return out;
    }
    async internalQuoter(input, output, destination, slippage = 0.0, maxHops = 2) {
        const bfsResult = (0, BFS_1.bfs)(this.universe, this.universe.graph, input.token, output, maxHops);
        const swapPlans = bfsResult.steps
            .map((i) => i.convertToSingularPaths())
            .flat()
            .filter((plan) => {
            if (plan.steps.length > maxHops) {
                return false;
            }
            if (new Set(plan.steps.map((i) => i.constructor.name)).size !==
                plan.steps.length) {
                return false;
            }
            if (plan.inputs.length !== 1) {
                return false;
            }
            if (plan.steps.some((i) => i.input.length !== 1 || i.output.length !== 1)) {
                return false;
            }
            return true;
        });
        const allPlans = [];
        await Promise.all(swapPlans.map(async (plan) => {
            try {
                allPlans.push(await plan.quote([input], destination));
            }
            catch (e) {
                console.log(plan.toString());
                console.log(e);
            }
        }));
        allPlans.sort((l, r) => l.compare(r));
        return allPlans;
    }
    async findSingleInputTokenSwap(input, output, destination, slippage = 0.0, maxHops = 2) {
        const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output);
        if (tradeSpecialCase != null) {
            const out = await tradeSpecialCase(input, destination);
            if (out != null) {
                return [out];
            }
        }
        const quotes = [];
        try {
            quotes.push(...await this.internalQuoter(input, output, destination, slippage, maxHops));
        }
        catch (e) { }
        try {
            if (quotes.length === 0) {
                quotes.push(...await this.externalQuoters(input, output, destination, slippage));
            }
        }
        catch (e) { }
        quotes.sort((l, r) => -l.compare(r));
        return quotes;
    }
}
exports.Searcher = Searcher;
//# sourceMappingURL=Searcher.js.map