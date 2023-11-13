import { type Address } from '../base/Address';
import { type TokenQuantity } from '../entities/Token';
import { ContractCall } from '../base/ContractCall';
import { type SwapDirection } from '../entities/dexes/TwoTokenPoolTypes';
import { type V2Pool } from '../entities/dexes/V2LikePool';
import { UniBase } from '../entities/dexes/UniBase';
import { type Universe } from '../Universe';
export declare class UniV2Like extends UniBase {
    readonly universe: Universe;
    readonly pool: V2Pool;
    readonly direction: SwapDirection;
    gasEstimate(): bigint;
    encode(amountsIn: TokenQuantity[], destination: Address): Promise<ContractCall>;
    /**
     * @node V2Actions can quote in both directions!
     * @returns
     */
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: V2Pool, direction: SwapDirection);
    toString(): string;
}
