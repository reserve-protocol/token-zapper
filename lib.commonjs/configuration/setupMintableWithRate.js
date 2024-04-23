"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMintableWithRate = void 0;
/**
 * Small helper to setup a mintable token with a rate provider
 * @param universe
 * @param factory
 * @param wrappedToken
 * @param initRateProvider
 */
const setupMintableWithRate = async (universe, factory, wrappedToken, initRateProvider) => {
    const rate = {
        value: 0n,
    };
    const inst = factory.connect(wrappedToken.address.address, universe.provider);
    const { fetchRate, mint, burn } = await initRateProvider(rate, inst);
    const updateRate = async () => {
        rate.value = await fetchRate();
    };
    const wrapped = mint.outputToken[0];
    universe.createRefreshableEntity(wrapped.address, updateRate);
    universe.defineMintable(mint, burn);
};
exports.setupMintableWithRate = setupMintableWithRate;
//# sourceMappingURL=setupMintableWithRate.js.map