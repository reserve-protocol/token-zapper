import { type Address } from '../base/Address';
export declare class Refreshable {
    readonly address: Address;
    private readonly refreshAddress;
    lastUpdate: number;
    constructor(address: Address, currentBlock: number, refreshAddress: () => Promise<void>);
    refresh(block: number): Promise<void>;
}
//# sourceMappingURL=Refreshable.d.ts.map