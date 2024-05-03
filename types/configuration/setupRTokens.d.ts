import { type Universe } from '../Universe';
import { RTokenDeployment } from '../action/RTokens';
import { Address } from '../base/Address';
export declare const loadRToken: (universe: Universe, rTokenAddress: Address) => Promise<RTokenDeployment>;
export declare const loadRTokens: (universe: Universe) => Promise<void[]>;
//# sourceMappingURL=setupRTokens.d.ts.map