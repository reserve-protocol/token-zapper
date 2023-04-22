/**
 * Small helper to setup a mintable token with a rate provider
 * @param universe
 * @param factory
 * @param wrappedToken
 * @param initRateProvider
 */
export const setupMintableWithRate = async (universe, factory, wrappedToken, initRateProvider) => {
    const rate = {
        value: 0n,
    };
    const inst = factory.connect(wrappedToken.address.address, universe.provider);
    const { fetchRate, mint, burn } = await initRateProvider(rate, inst);
    const updateRate = async () => {
        rate.value = await fetchRate();
    };
    const wrapped = mint.output[0];
    universe.createRefreshableEntitity(wrapped.address, updateRate);
    universe.defineMintable(mint, burn);
};
//# sourceMappingURL=setupMintableWithRate.js.map