import { type Universe } from '../Universe';
export declare const convertWrapperTokenAddressesIntoWrapperTokenPairs: (universe: Universe, markets: string[], underlyingTokens: {
    [address: string]: string;
}) => Promise<{
    underlying: import("..").Token;
    wrappedToken: import("..").Token;
}[]>;
//# sourceMappingURL=convertWrapperTokenAddressesIntoWrapperTokenPairs.d.ts.map