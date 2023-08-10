import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
export declare const loadCompoundMarketsFromRPC: (comptrollerAddress: Address, universe: Universe<any>) => Promise<string[]>;
export declare function setupCompoundLike(universe: Universe, deployment: {
    cEth?: Token;
    comptroller: Address;
}, cTokens: {
    underlying: Token;
    wrappedToken: Token;
}[]): Promise<{
    underlying: Token;
    wrappedToken: Token;
}[]>;
//# sourceMappingURL=setupCompound.d.ts.map