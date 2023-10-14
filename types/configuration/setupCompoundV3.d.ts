import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
interface Market {
    baseToken: Token;
    receiptToken: Token;
    vaults: Token[];
}
export declare const setupSingleCompoundV3Market: (universe: Universe, market: Market) => Promise<void>;
export declare const setupCompoundV3: (universe: Universe, markets: Market[]) => Promise<void>;
export {};
//# sourceMappingURL=setupCompoundV3.d.ts.map