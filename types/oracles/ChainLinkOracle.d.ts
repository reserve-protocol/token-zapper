import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { PriceOracle } from './PriceOracle';
export declare class ChainLinkOracle extends PriceOracle {
    readonly universe: Universe<any>;
    readonly chainlinkRegistry: Address;
    private tokenToChainLinkInternalAddress;
    mapTokenTo(token: Token, address: Address): void;
    constructor(universe: Universe<any>, chainlinkRegistry: Address);
}
//# sourceMappingURL=ChainLinkOracle.d.ts.map