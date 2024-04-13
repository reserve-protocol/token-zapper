import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
export declare const setupChainLink: (universe: Universe, registryAddress: string, remapped?: [Token, Address][], derived?: [Token, {
    uoaToken: Token;
    derivedTokenUnit: Address;
}][]) => void;
