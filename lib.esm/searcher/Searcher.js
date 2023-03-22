import { bfs } from '../exchange-graph/BFS';
import { TokenAmounts } from '../entities/Token';
import { SearcherResult } from './SearcherResult';
import { SwapPath, SwapPaths, SwapPlan } from './Swap';
import { ApprovalsStore } from './ApprovalsStore';
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
export const findPrecursorTokenSet = async (universe, unitBasket) => {
    const totalPrecursorQuantities = new TokenAmounts();
    const postTradeTokenSplits = [];
    const totalOfEach = new TokenAmounts();
    const recourseOn = async (qty) => {
        totalOfEach.add(qty);
        const acts = universe.wrappedTokens.get(qty.token);
        if (acts != null) {
            const baseTokens = await acts.burn.quote([qty]);
            const resolvedDeps = await Promise.all(baseTokens.map(async (qty) => ({
                quantity: qty,
                dependencies: await recourseOn(qty),
            })));
            const precursorTokensNeeded = new TokenAmounts();
            const mints = [];
            for (const dependency of resolvedDeps) {
                for (const mintPrecursorAmount of dependency.dependencies.precursorTokensNeeded.toTokenQuantities()) {
                    precursorTokensNeeded.add(mintPrecursorAmount);
                }
                if (dependency.dependencies.mint != null) {
                    mints.push(dependency.dependencies.mint);
                }
            }
            const mint = {
                basketTokenQuantity: TokenAmounts.fromQuantities(baseTokens),
                action: acts.mint,
                mints,
            };
            return { precursorTokensNeeded: precursorTokensNeeded, mint };
        }
        return {
            precursorTokensNeeded: TokenAmounts.fromQuantities([qty]),
            mint: null,
        };
    };
    for (const qty of unitBasket) {
        const tree = await recourseOn(qty);
        totalPrecursorQuantities.addAll(tree.precursorTokensNeeded);
        if (tree.mint) {
            postTradeTokenSplits.push(tree.mint);
        }
    }
    const recourseOnMint = async (qty) => {
        qty.mints.forEach(recourseOnMint);
        qty.basketTokenQuantity = TokenAmounts.fromQuantities(qty.basketTokenQuantity
            .toTokenQuantities()
            .map((i) => i.div(totalOfEach.get(i.token))));
    };
    for (const mint of postTradeTokenSplits) {
        recourseOnMint(mint);
    }
    return {
        totalPrecursorQuantities,
        postTradeTokenSplits,
    };
};
export class Searcher {
    universe;
    approvals;
    constructor(universe) {
        this.universe = universe;
        this.approvals = new ApprovalsStore(universe.provider);
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
    async findSingleInputToBasketGivenBasketUnit(inputQuantity, basketUnit) {
        /**
         * PHASE 1: Compute precursor set
         */
        const precursorTokens = await findPrecursorTokenSet(this.universe, basketUnit);
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
        const precursorTokenbasket = precursorTokens.totalPrecursorQuantities.toTokenQuantities();
        const inputPrTrade = precursorTokenbasket.map((qty) => {
            return {
                token: qty.token,
                inputQuantity: inputQuantity.scalarDiv(BigInt(precursorTokenbasket.length)),
            };
        });
        const inputQuantityToTokenSet = [];
        const tradingBalances = new TokenAmounts();
        tradingBalances.add(inputQuantity);
        for (const { token, inputQuantity } of inputPrTrade) {
            if (
            // Skip trade if user input is part of precursor set
            inputQuantity.token === token) {
                continue;
            }
            const swaps = await this.findSingleInputTokenSwap(inputQuantity, token, this.universe.config.addresses.executorAddress);
            // TODO: evaluate different trades
            const trade = swaps[0];
            if (trade == null) {
                throw new Error('Could not find way to swap into precursor token');
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
        const mints = [];
        const recourseOn = async (mint) => {
            const children = await Promise.all((mint.mints ?? []).map((mint) => recourseOn(mint)));
            const mintInput = mint.basketTokenQuantity
                .toTokenQuantities()
                .map((qty) => tradingBalances.get(qty.token).mul(qty));
            const mintOutput = await new SwapPlan(this.universe, [mint.action]).quote(mintInput, this.universe.config.addresses.executorAddress);
            children.forEach((c) => c.inputs.forEach((qty) => tradingBalances.sub(qty)));
            mintOutput.outputs.forEach((qty) => tradingBalances.add(qty));
            inputQuantityToTokenSet.push(mintOutput);
            mints.push(mintOutput);
            return mintOutput;
        };
        const mintsToSubtract = [];
        for (const mint of precursorTokens.postTradeTokenSplits) {
            mintsToSubtract.push(await recourseOn(mint));
        }
        mintsToSubtract.forEach((c) => c.inputs.forEach((qty) => tradingBalances.sub(qty)));
        return new SwapPaths(this.universe, [inputQuantity], inputQuantityToTokenSet, tradingBalances.toTokenQuantities(), inputQuantityToTokenSet.reduce((l, r) => l.add(r.outputValue), this.universe.usd.zero), this.universe.config.addresses.executorAddress);
    }
    async findSingleInputToRTokenZap(userInput, rToken, signerAddress) {
        const inputIsNative = userInput.token === this.universe.nativeToken;
        let inputTokenQuantity = userInput;
        if (inputIsNative) {
            if (this.universe.commonTokens.ERC20GAS == null) {
                throw new Error('No wrapped native token. (Like WETH) has been defined. Cannot execute search');
            }
            inputTokenQuantity = userInput.convertTo(this.universe.commonTokens.ERC20GAS);
        }
        const rTokenActions = this.universe.wrappedTokens.get(rToken);
        if (rTokenActions == null) {
            throw new Error('Param rToken is not a known RToken');
        }
        const mintAction = rTokenActions.mint;
        const tradingBalances = new TokenAmounts();
        tradingBalances.add(inputTokenQuantity);
        const inputQuantityToBasketTokens = await this.findSingleInputToBasketGivenBasketUnit(inputTokenQuantity, mintAction.basket.unitBasket);
        await inputQuantityToBasketTokens.exchange(tradingBalances);
        const rTokenMint = await new SwapPlan(this.universe, [
            rTokenActions.mint,
        ]).quote(mintAction.input.map((token) => tradingBalances.get(token)), signerAddress);
        await rTokenMint.exchange(tradingBalances);
        const output = tradingBalances.toTokenQuantities();
        const searcherResult = new SearcherResult(this.universe, this.approvals, new SwapPaths(this.universe, [userInput], [
            new SwapPath(this.universe, inputQuantityToBasketTokens.inputs, inputQuantityToBasketTokens.swapPaths.map((i) => i.steps).flat(), inputQuantityToBasketTokens.outputs, inputQuantityToBasketTokens.outputValue, inputQuantityToBasketTokens.destination),
            rTokenMint,
        ], output, rTokenMint.outputValue, signerAddress), signerAddress);
        return searcherResult;
    }
    async externalQuoters(input, output, destination) {
        const executorAddress = this.universe.chainConfig.config.addresses.executorAddress;
        return await Promise.all(this.universe.dexAggregators.map(async (router) => await router.swap(executorAddress, destination, input, output, 0)));
    }
    async internalQuoter(input, output, destination) {
        const bfsResult = bfs(this.universe, this.universe.graph, input.token, output, 2);
        const swapPlans = bfsResult.steps
            .map((i) => i.convertToSingularPaths())
            .flat()
            .filter((plan) => plan.inputs.length === 1);
        const entitiesToUpdate = new Set();
        for (const plan of swapPlans) {
            for (const action of plan.steps) {
                entitiesToUpdate.add(action.address);
            }
        }
        this.universe.refresh(entitiesToUpdate);
        const allPlans = await Promise.all(swapPlans.map(async (plan) => {
            return await plan.quote([input], destination);
        }));
        allPlans.sort((l, r) => l.compare(r));
        return allPlans;
    }
    async findSingleInputTokenSwap(input, output, destination) {
        const quotes = (await Promise.all([
            this.internalQuoter(input, output, destination).then((results) => results.filter((result) => result.inputs.length === 1)),
            this.externalQuoters(input, output, destination),
        ])).flat();
        quotes.sort((l, r) => -l.compare(r));
        return quotes;
    }
}
//# sourceMappingURL=Searcher.js.map