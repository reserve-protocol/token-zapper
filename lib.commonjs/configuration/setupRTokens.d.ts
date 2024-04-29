import { type Universe } from '../Universe';
import { Address } from '../base/Address';
export declare const loadRToken: (universe: Universe, rTokenAddress: Address) => Promise<void>;
export declare const loadRTokens: (universe: Universe) => Promise<void[]>;
