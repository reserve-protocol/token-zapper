import { SwapPlan } from '../searcher/Swap';
import { DepositAction, WithdrawAction } from '../action/WrappedNative';
export const setupWrappedGasToken = async (universe, wrappedTokenName = "ERC20GAS") => {
    const k = universe.config.addresses.commonTokens[wrappedTokenName];
    const wrappedToken = await universe.getToken(k);
    const wrappedGasTokenActions = {
        burn: new DepositAction(universe, wrappedToken),
        mint: new WithdrawAction(universe, wrappedToken),
    };
    universe.addAction(wrappedGasTokenActions.burn);
    universe.addAction(wrappedGasTokenActions.mint);
    universe.tokenTradeSpecialCases.set(universe.nativeToken, async (input, dest) => {
        if (input.token === wrappedToken) {
            return await new SwapPlan(universe, [wrappedGasTokenActions.burn]).quote([input], dest);
        }
        return null;
    });
    universe.tokenTradeSpecialCases.set(wrappedToken, async (input, dest) => {
        if (input.token === universe.nativeToken) {
            return await new SwapPlan(universe, [wrappedGasTokenActions.mint]).quote([input], dest);
        }
        return null;
    });
};
//# sourceMappingURL=setupWrappedGasToken.js.map