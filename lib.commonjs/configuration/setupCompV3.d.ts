import { Universe } from '../Universe';
import { MintCometWrapperAction, BurnCometWrapperAction, MintCometAction, BurnCometAction } from '../action/CompoundV3';
import { Address } from '../base/Address';
import { ICusdcV3Wrapper } from '../contracts';
import { type Token } from '../entities/Token';
import { Contract } from '../tx-gen/Planner';
declare class CometAssetInfo {
    readonly offset: number;
    readonly asset: Token;
    readonly priceFeed: Address;
    readonly scale: bigint;
    readonly borrowCollateralFactor: bigint;
    readonly liquidateCollateralFactor: bigint;
    readonly liquidationFactor: bigint;
    readonly supplyCap: bigint;
    constructor(offset: number, asset: Token, priceFeed: Address, scale: bigint, borrowCollateralFactor: bigint, liquidateCollateralFactor: bigint, liquidationFactor: bigint, supplyCap: bigint);
    static load(universe: Universe, comet: Token, index: number): Promise<CometAssetInfo>;
    toString(): string;
}
export declare class CometWrapper {
    readonly cometWrapperInst: ICusdcV3Wrapper;
    readonly comet: Comet;
    readonly wrapperToken: Token;
    readonly mintAction: MintCometWrapperAction;
    readonly burnAction: BurnCometWrapperAction;
    readonly cometWrapperLibrary: Contract;
    get universe(): Universe<import("./ChainConfiguration").Config>;
    get cometToken(): Token;
    constructor(cometWrapperInst: ICusdcV3Wrapper, comet: Comet, wrapperToken: Token);
    toString(): string;
    static load(compound: CompoundV3Deployment, wrapperToken: Token): Promise<CometWrapper>;
}
export declare class Comet {
    readonly cometLibrary: Contract;
    readonly compound: CompoundV3Deployment;
    readonly comet: Token;
    readonly borrowToken: Token;
    readonly collateralTokens: CometAssetInfo[];
    get universe(): Universe<import("./ChainConfiguration").Config>;
    readonly mintAction: MintCometAction;
    readonly burnAction: BurnCometAction;
    constructor(cometLibrary: Contract, compound: CompoundV3Deployment, comet: Token, borrowToken: Token, collateralTokens: CometAssetInfo[]);
    static load(compound: CompoundV3Deployment, poolToken: Token): Promise<Comet>;
    toString(): string;
}
export declare class CompoundV3Deployment {
    readonly protocolName: string;
    readonly universe: Universe;
    readonly comets: Comet[];
    readonly cometWrappers: CometWrapper[];
    readonly cometByBaseToken: Map<Token, Comet>;
    readonly cometByPoolToken: Map<Token, Comet>;
    readonly cometWrapperByWrapperToken: Map<Token, CometWrapper>;
    readonly cometWrapperByCometToken: Map<Token, CometWrapper>;
    constructor(protocolName: string, universe: Universe);
    getComet(poolToken: Token): Promise<Comet>;
    getCometWrapper(wrapperToken: Token): Promise<CometWrapper>;
    static load(protocolName: string, universe: Universe, config: {
        comets: Token[];
        cTokenWrappers: Token[];
    }): Promise<CompoundV3Deployment>;
    toString(): string;
}
interface CompV3Config {
    comets: Record<string, string>;
    wrappers: string[];
}
export declare const setupCompoundV3: (protocolName: string, universe: Universe, config: CompV3Config) => Promise<CompoundV3Deployment>;
export {};
