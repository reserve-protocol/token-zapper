/// <reference types="node" />
import { type Address } from '../base/Address';
export declare class ContractCall {
    readonly payload: Buffer;
    readonly to: Address;
    readonly value: bigint;
    readonly comment?: string | undefined;
    constructor(payload: Buffer, to: Address, value: bigint, comment?: string | undefined);
    encode(): {
        to: string;
        value: bigint;
        data: Buffer;
    };
}
//# sourceMappingURL=ContractCall.d.ts.map