import { Address } from '../base';
export declare class Refreshable {
    readonly address: Address;
    private readonly refreshAddress;
    private lastUpdate;
    constructor(address: Address, currentBlock: number, refreshAddress: () => Promise<void>);
    refresh(block: number): Promise<void>;
}
