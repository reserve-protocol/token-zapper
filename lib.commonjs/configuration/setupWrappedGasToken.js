"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWrappedGasToken = void 0;
const Swap_1 = require("../searcher/Swap");
const WrappedNative_1 = require("../action/WrappedNative");
const setupWrappedGasToken = async (universe) => {
    const k = universe.config.addresses.commonTokens.ERC20GAS;
    const wrappedToken = await universe.getToken(k);
    const wrappedGasTokenActions = {
        burn: new WrappedNative_1.DepositAction(universe, wrappedToken),
        mint: new WrappedNative_1.WithdrawAction(universe, wrappedToken),
    };
    universe.addAction(wrappedGasTokenActions.burn);
    universe.addAction(wrappedGasTokenActions.mint);
    universe.tokenTradeSpecialCases.set(universe.nativeToken, async (input, dest) => {
        if (input.token === wrappedToken) {
            return await new Swap_1.SwapPlan(universe, [
                wrappedGasTokenActions.burn,
            ]).quote([input], dest);
        }
        return null;
    });
    universe.tokenTradeSpecialCases.set(wrappedToken, async (input, dest) => {
        if (input.token === universe.nativeToken) {
            return await new Swap_1.SwapPlan(universe, [
                wrappedGasTokenActions.mint,
            ]).quote([input], dest);
        }
        return null;
    });
};
exports.setupWrappedGasToken = setupWrappedGasToken;
//# sourceMappingURL=setupWrappedGasToken.js.map