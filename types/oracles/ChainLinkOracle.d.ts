import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { Oracle } from './Oracle';
export declare class ChainLinkOracle extends Oracle {
    readonly universe: Universe;
    readonly chainlinkRegistry: Address;
    tokenToChainLinkInternalAddress: Map<Token, Address>;
    mapTokenTo(token: Token, address: Address): void;
    constructor(universe: Universe, chainlinkRegistry: Address);
}
//# sourceMappingURL=ChainLinkOracle.d.ts.map