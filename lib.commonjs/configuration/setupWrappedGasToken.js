"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWrappedGasToken = void 0;
const Swap_1 = require("../searcher/Swap");
const WrappedNative_1 = require("../action/WrappedNative");
const setupWrappedGasToken = async (universe, wrappedTokenName = "ERC20GAS") => {
    const k = universe.config.addresses.commonTokens[wrappedTokenName];
    const wrappedToken = await universe.getToken(k);
    const wrappedGasTokenActions = universe.defineMintable(new WrappedNative_1.DepositAction(universe, wrappedToken), new WrappedNative_1.WithdrawAction(universe, wrappedToken));
    universe.tokenTradeSpecialCases.set(universe.nativeToken, async (input, dest) => {
        if (input.token === wrappedToken) {
            return await new Swap_1.SwapPlan(universe, [wrappedGasTokenActions.burn]).quote([input], dest);
        }
        return null;
    });
    universe.tokenTradeSpecialCases.set(wrappedToken, async (input, dest) => {
        if (input.token === universe.nativeToken) {
            return await new Swap_1.SwapPlan(universe, [wrappedGasTokenActions.mint]).quote([input], dest);
        }
        return null;
    });
};
exports.setupWrappedGasToken = setupWrappedGasToken;
//# sourceMappingURL=setupWrappedGasToken.js.map