import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
export declare const setupChainlinkRegistry: (universe: Universe, registryAddress: string, remapped?: [Token, Address][], derived?: [Token, {
    uoaToken: Token;
    derivedTokenUnit: Address;
}][]) => void;
//# sourceMappingURL=setupChainLink.d.ts.map