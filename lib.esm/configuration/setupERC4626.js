import { ERC4626DepositAction, ERC4626WithdrawAction } from '../action/ERC4626';
import { Address } from '../base/Address';
import { IERC4626__factory } from '../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory';
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
        this.mint = new (ERC4626DepositAction(protocol))(universe, assetToken, shareToken, slippage);
        this.burn = new (ERC4626WithdrawAction(protocol))(universe, assetToken, shareToken, slippage);
        universe.defineMintable(this.mint, this.burn, true);
    }
    static async load(universe, protocol, shareTokenAddress, slippage = 10n) {
        const vaultInst = IERC4626__factory.connect(shareTokenAddress.address, universe.provider);
        const assetTokenAddress = await vaultInst.callStatic.asset();
        const shareToken = await universe.getToken(Address.from(shareTokenAddress));
        const assetToken = await universe.getToken(Address.from(assetTokenAddress));
        return new ERC4626Deployment(protocol, universe, shareToken, assetToken, slippage);
    }
    toString() {
        return `ERC4626[${this.protocol}](share=${this.shareToken}, asset=${this.assetToken})`;
    }
}
export const setupERC4626 = async (universe, cfg) => {
    return await ERC4626Deployment.load(universe, cfg.protocol, Address.from(cfg.vaultAddress), cfg.slippage);
};
export const setupERC4626s = async (universe, config) => {
    const deployments = await Promise.all(config.map((cfg) => setupERC4626(universe, {
        protocol: cfg.protocol,
        vaultAddress: cfg.vaultAddress,
        slippage: cfg.slippage,
    })));
    return deployments;
};
//# sourceMappingURL=setupERC4626.js.map