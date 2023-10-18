"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRTokens = exports.loadRToken = void 0;
const RTokens_1 = require("../action/RTokens");
const Address_1 = require("../base/Address");
const IMain__factory_1 = require("../contracts/factories/contracts/IMain__factory");
const TokenBasket_1 = require("../entities/TokenBasket");
const loadRToken = async (universe, rTokenAddress, mainAddr) => {
    const mainInst = IMain__factory_1.IMain__factory.connect(mainAddr.address, universe.provider);
    const [basketHandlerAddress] = await Promise.all([
        mainInst.basketHandler(),
    ]);
    const token = await universe.getToken(rTokenAddress);
    const basketHandler = new TokenBasket_1.TokenBasket(universe, Address_1.Address.from(basketHandlerAddress), token);
    universe.rTokens[token.symbol] = token;
    await basketHandler.update();
    universe.createRefreshableEntity(basketHandler.address, () => basketHandler.update());
    universe.defineMintable(new RTokens_1.MintRTokenAction(universe, basketHandler), new RTokens_1.BurnRTokenAction(universe, basketHandler));
    // setTimeout(async () => {
    //   console.log(token + " token basket: ")
    //   console.log(basketHandler.unitBasket.toString())
    //   for(const tok of basketHandler.basketTokens) {
    //     const knownMint = universe.wrappedTokens.get(tok) != undefined
    //     console.log("  " + tok.address + (knownMint ? "[m]" : "[*]") + ": " + tok)
    //   }
    // }, 2000)
};
exports.loadRToken = loadRToken;
const loadRTokens = (universe) => Promise.all(Object.entries(universe.config.addresses.rTokenDeployments).map(async ([key, mainAddr]) => {
    const rTokenAddress = universe.config.addresses.rTokens[key];
    await (0, exports.loadRToken)(universe, rTokenAddress, mainAddr);
}));
exports.loadRTokens = loadRTokens;
//# sourceMappingURL=setupRTokens.js.map