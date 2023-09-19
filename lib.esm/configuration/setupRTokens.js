import { MintRTokenAction, BurnRTokenAction } from '../action/RTokens';
import { Address } from '../base/Address';
import { IMain__factory } from '../contracts/factories/IMain__factory';
import { TokenBasket } from '../entities/TokenBasket';
export const loadRToken = async (universe, rTokenAddress, mainAddr) => {
    const mainInst = IMain__factory.connect(mainAddr.address, universe.provider);
    const [basketHandlerAddress] = await Promise.all([
        mainInst.basketHandler(),
    ]);
    const token = await universe.getToken(rTokenAddress);
    const basketHandler = new TokenBasket(universe, Address.from(basketHandlerAddress), token);
    universe.rTokens[token.symbol] = token;
    await basketHandler.update();
    universe.createRefreshableEntity(basketHandler.address, () => basketHandler.update());
    universe.defineMintable(new MintRTokenAction(universe, basketHandler), new BurnRTokenAction(universe, basketHandler));
    // setTimeout(async () => {
    //   console.log(token + " token basket: ")
    //   console.log(basketHandler.unitBasket.toString())
    //   for(const tok of basketHandler.basketTokens) {
    //     const knownMint = universe.wrappedTokens.get(tok) != undefined
    //     console.log("  " + tok.address + (knownMint ? "[m]" : "[*]") + ": " + tok)
    //   }
    // }, 2000)
};
export const loadRTokens = (universe) => Promise.all(Object.entries(universe.config.addresses.rTokenDeployments).map(async ([key, mainAddr]) => {
    const rTokenAddress = universe.config.addresses.rTokens[key];
    await loadRToken(universe, rTokenAddress, mainAddr);
}));
//# sourceMappingURL=setupRTokens.js.map