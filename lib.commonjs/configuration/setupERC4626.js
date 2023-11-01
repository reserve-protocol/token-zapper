"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupERC4626 = void 0;
const ERC4626_1 = require("../action/ERC4626");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const setupERC4626 = async (universe, vaultAddr, wrappedToUnderlyingMapping) => {
    const tokens = await Promise.all(vaultAddr.map(async (addr) => {
        const vaultInst = contracts_1.IERC4626__factory.connect(addr, universe.provider);
        const asset = await vaultInst.callStatic.asset();
        const vaultToken = await universe.getToken(Address_1.Address.from(addr));
        const underlyingToken = await universe.getToken(Address_1.Address.from(asset));
        return {
            wrappedToken: vaultToken,
            underlying: underlyingToken,
        };
    }));
    for (const { wrappedToken, underlying } of tokens) {
        universe.defineMintable(new ERC4626_1.ERC4626DepositAction(universe, underlying, wrappedToken), new ERC4626_1.ERC4626WithdrawAction(universe, underlying, wrappedToken), false);
    }
};
exports.setupERC4626 = setupERC4626;
//# sourceMappingURL=setupERC4626.js.map