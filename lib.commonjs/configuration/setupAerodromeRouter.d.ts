import { Universe } from '../Universe';
import { DexRouter } from '../aggregators/DexAggregator';
import { Token } from '../entities/Token';
export declare const setupAerodromeRouter: (universe: Universe) => Promise<{
    dex: DexRouter;
    addTradeAction: (inputToken: Token, outputToken: Token) => void;
}>;
