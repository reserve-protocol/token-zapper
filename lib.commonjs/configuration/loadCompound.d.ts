import { Address } from '../base/Address';
import { Universe } from '../Universe';
import { Token } from '../entities';
export declare function setupCompoundLike(universe: Universe, underlying: {
    [address: string]: string;
}, deployment: {
    cEth?: Address;
    comptroller: Address;
}): Promise<{
    underlying: Token;
    cToken: Token;
}[]>;
