import { Universe } from '../Universe';
export interface JsonTokenEntry {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}
/**
 * Helper method for loading in tokens from a JSON file into the universe
 * It also initializes the rTokens and commonTokens fields based on the
 * addresses in the chain configuration.
 *
 * @param universe
 * @param tokens
 */
export declare const loadTokens: (universe: Universe, tokens: JsonTokenEntry[]) => Promise<void>;
//# sourceMappingURL=loadTokens.d.ts.map