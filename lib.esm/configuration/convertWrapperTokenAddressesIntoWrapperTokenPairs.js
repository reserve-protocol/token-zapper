import { Address } from '../base/Address';
export const convertWrapperTokenAddressesIntoWrapperTokenPairs = async (universe, markets, underlyingTokens) => {
    return await Promise.all(markets
        .map(Address.from)
        .map(async (address) => {
        const [underlying, wrappedToken] = await Promise.all([
            universe.getToken(Address.from(underlyingTokens[address.address])),
            universe.getToken(address),
        ]);
        return { underlying, wrappedToken };
    }));
};
//# sourceMappingURL=convertWrapperTokenAddressesIntoWrapperTokenPairs.js.map