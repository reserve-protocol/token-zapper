import { Universe } from '../Universe';
import { ERC4626DepositAction, ERC4626WithdrawAction } from '../action/ERC4626';
import { Address } from '../base/Address';
import { Token } from '../entities/Token';
export declare class ERC4626Deployment {
    readonly protocol: string;
    readonly universe: Universe;
    readonly shareToken: Token;
    readonly assetToken: Token;
    readonly slippage: bigint;
    readonly mint: InstanceType<ReturnType<typeof ERC4626DepositAction>>;
    readonly burn: InstanceType<ReturnType<typeof ERC4626WithdrawAction>>;
    constructor(protocol: string, universe: Universe, shareToken: Token, assetToken: Token, slippage: bigint);
    static load(universe: Universe, protocol: string, shareTokenAddress: Address, slippage: bigint): Promise<ERC4626Deployment>;
    toString(): string;
}
export declare const setupERC4626: (universe: Universe, cfg: {
    protocol: string;
    vaultAddress: string;
    slippage: bigint;
}) => Promise<ERC4626Deployment>;
export declare const setupERC4626s: (universe: Universe, config: {
    protocol: string;
    vaultAddress: string;
    slippage: bigint;
}[]) => Promise<ERC4626Deployment[]>;
//# sourceMappingURL=setupERC4626.d.ts.map