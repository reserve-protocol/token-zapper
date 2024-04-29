import { MintRTokenAction, BurnRTokenAction } from '../action/RTokens';
import { Address } from '../base/Address';
import { IRToken__factory } from '../contracts';
import { IMain__factory } from '../contracts/factories/contracts/IMain__factory';
import { TokenBasket } from '../entities/TokenBasket';
export const loadRToken = async (universe, rTokenAddress) => {
    const rtokenMain = IRToken__factory.connect(rTokenAddress.address, universe.provider);
    const mainAddr = Address.from(await rtokenMain.main());
    const mainInst = IMain__factory.connect(mainAddr.address, universe.provider);
    const [basketHandlerAddress, assetRegistryAddress] = await Promise.all([
        mainInst.basketHandler(),
        mainInst.assetRegistry(),
    ]);
    const token = await universe.getToken(rTokenAddress);
    const rtoken = IRToken__factory.connect(rTokenAddress.address, universe.provider);
    const basketHandler = new TokenBasket(universe, Address.from(basketHandlerAddress), token, Address.from(assetRegistryAddress), await rtoken.version());
    universe.rTokens[token.symbol] = token;
    await basketHandler.update();
    universe.createRefreshableEntity(basketHandler.basketHandlerAddress, () => basketHandler.update());
    universe.defineMintable(new MintRTokenAction(universe, basketHandler), new BurnRTokenAction(universe, basketHandler), true);
};
export const loadRTokens = (universe) => Promise.all(Object.keys(universe.config.addresses.rTokens).map(async (key) => {
    const rTokenAddress = universe.config.addresses.rTokens[key];
    await loadRToken(universe, rTokenAddress);
}));
//# sourceMappingURL=setupRTokens.js.map