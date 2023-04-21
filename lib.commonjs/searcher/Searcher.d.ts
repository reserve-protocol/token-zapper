import { Universe } from '../Universe';
import { type Action } from '../action/Action';
import { Address } from '../base/Address';
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token';
import { SearcherResult } from './SearcherResult';
import { SwapPath, SwapPaths } from './Swap';
interface PostTradeMint {
    basketTokenQuantity: TokenAmounts;
    action: Action;
    mints: PostTradeMint[];
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
export declare const findPrecursorTokenSet: (universe: Universe, unitBasket: TokenQuantity[]) => Promise<{
    totalPrecursorQuantities: TokenAmounts;
    postTradeTokenSplits: PostTradeMint[];
}>;
export declare class Searcher {
    private readonly universe;
    constructor(universe: Universe);
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
    private findSingleInputToBasketGivenBasketUnit;
    recursivelyUnwrapQty(qty: TokenQuantity): Promise<SwapPaths>;
    findRTokenIntoSingleTokenZap(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, slippage?: number): Promise<SwapPaths>;
    findSingleInputToRTokenZap(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage?: number): Promise<SearcherResult>;
    externalQuoters(input: TokenQuantity, output: Token, destination: Address, slippage: number): Promise<SwapPath[]>;
    internalQuoter(input: TokenQuantity, output: Token, destination: Address, slippage?: number, maxHops?: number): Promise<SwapPath[]>;
    findSingleInputTokenSwap(input: TokenQuantity, output: Token, destination: Address, slippage?: number, maxHops?: number): Promise<SwapPath[]>;
}
export {};
