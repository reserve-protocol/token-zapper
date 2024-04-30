"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupERC4626 = void 0;
const ERC4626_1 = require("../action/ERC4626");
const Address_1 = require("../base/Address");
const IERC4626__factory_1 = require("../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory");
const setupERC4626 = async (universe, vaultAddr, protocol, slippage) => {
    const tokens = await Promise.all(vaultAddr.map(async (addr) => {
        const vaultInst = IERC4626__factory_1.IERC4626__factory.connect(addr, universe.provider);
        const asset = await vaultInst.callStatic.asset();
        const vaultToken = await universe.getToken(Address_1.Address.from(addr));
        const underlyingToken = await universe.getToken(Address_1.Address.from(asset));
        return {
            wrappedToken: vaultToken,
            underlying: underlyingToken,
        };
    }));
    for (const { wrappedToken, underlying } of tokens) {
        universe.defineMintable(new ((0, ERC4626_1.ERC4626DepositAction)(protocol))(universe, underlying, wrappedToken, slippage), new ((0, ERC4626_1.ERC4626WithdrawAction)(protocol))(universe, underlying, wrappedToken, slippage), false);
    }
};
exports.setupERC4626 = setupERC4626;
//# sourceMappingURL=setupERC4626.js.map