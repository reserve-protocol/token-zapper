"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupERC4626s = exports.setupERC4626 = void 0;
const ERC4626_1 = require("../action/ERC4626");
const Address_1 = require("../base/Address");
const IERC4626__factory_1 = require("../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory");
class ERC4626Deployment {
    protocol;
    universe;
    shareToken;
    assetToken;
    slippage;
    mint;
    burn;
    constructor(protocol, universe, shareToken, assetToken, slippage = 10n) {
        this.protocol = protocol;
        this.universe = universe;
        this.shareToken = shareToken;
        this.assetToken = assetToken;
        this.slippage = slippage;
        this.mint = new ((0, ERC4626_1.ERC4626DepositAction)(protocol))(universe, assetToken, shareToken, slippage);
        this.burn = new ((0, ERC4626_1.ERC4626WithdrawAction)(protocol))(universe, assetToken, shareToken, slippage);
        universe.defineMintable(this.mint, this.burn, true);
    }
    static async load(universe, protocol, shareTokenAddress, slippage = 10n) {
        const vaultInst = IERC4626__factory_1.IERC4626__factory.connect(shareTokenAddress.address, universe.provider);
        const assetTokenAddress = await vaultInst.callStatic.asset();
        const shareToken = await universe.getToken(Address_1.Address.from(shareTokenAddress));
        const assetToken = await universe.getToken(Address_1.Address.from(assetTokenAddress));
        return new ERC4626Deployment(protocol, universe, shareToken, assetToken, slippage);
    }
    toString() {
        return `ERC4626[${this.protocol}](share=${this.shareToken}, asset=${this.assetToken})`;
    }
}
const setupERC4626 = async (universe, cfg) => {
    return await ERC4626Deployment.load(universe, cfg.protocol, Address_1.Address.from(cfg.vaultAddress), cfg.slippage);
};
exports.setupERC4626 = setupERC4626;
const setupERC4626s = async (universe, config) => {
    const deployments = await Promise.all(config.map((cfg) => (0, exports.setupERC4626)(universe, {
        protocol: cfg.protocol,
        vaultAddress: cfg.vaultAddress,
        slippage: cfg.slippage,
    })));
    return deployments;
};
exports.setupERC4626s = setupERC4626s;
//# sourceMappingURL=setupERC4626.js.map