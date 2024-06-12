"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStargateWrapper = void 0;
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const StargateWrapper_1 = require("../action/StargateWrapper");
const setupStargateWrapper = async (universe, vaultAddr, wrappedToUnderlyingMapping) => {
    const tokens = await Promise.all(vaultAddr.map(async (addr) => {
        const vaultInst = contracts_1.IStargateRewardableWrapper__factory.connect(addr, universe.provider);
        const asset = await vaultInst.callStatic.underlying();
        const vaultToken = await universe.getToken(Address_1.Address.from(addr));
        const underlyingToken = await universe.getToken(Address_1.Address.from(asset));
        return {
            wrappedToken: vaultToken,
            underlying: underlyingToken,
        };
    }));
    for (const { wrappedToken, underlying } of tokens) {
        universe.defineMintable(new StargateWrapper_1.StargateWrapperDepositAction(universe, underlying, wrappedToken), new StargateWrapper_1.StargateWrapperWithdrawAction(universe, underlying, wrappedToken), false);
    }
};
exports.setupStargateWrapper = setupStargateWrapper;
//# sourceMappingURL=setupStargateWrapper.js.map