"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStargate = void 0;
const Address_1 = require("../base/Address");
const Stargate_1 = require("../action/Stargate");
const contracts_1 = require("../contracts");
const setupStargate = async (universe, tokenAddres, router, wrappedToUnderlyingMapping) => {
    const startgateTokens = await Promise.all(tokenAddres.map(async (token) => {
        const vaultInst = contracts_1.IStargatePool__factory.connect(token, universe.provider);
        const [asset, poolId] = await Promise.all([
            vaultInst.callStatic.token(),
            vaultInst.callStatic.poolId()
        ]);
        const vaultToken = await universe.getToken(Address_1.Address.from(token));
        const underlyingToken = await universe.getToken(Address_1.Address.from(asset));
        return {
            wrappedToken: vaultToken,
            underlying: underlyingToken,
            poolId: poolId.toNumber()
        };
    }));
    const routerAddress = Address_1.Address.from(router);
    for (const { wrappedToken, underlying, poolId } of startgateTokens) {
        universe.defineMintable(new Stargate_1.StargateDepositAction(universe, underlying, wrappedToken, poolId, routerAddress), new Stargate_1.StargateWithdrawAction(universe, underlying, wrappedToken, poolId, routerAddress), false);
    }
};
exports.setupStargate = setupStargate;
//# sourceMappingURL=setupStargate.js.map