/// <reference types="node" />
import { type Address } from '../base/Address';
export declare class ContractCall {
    readonly payload: Buffer;
    readonly to: Address;
    readonly value: bigint;
    readonly gas: bigint;
    readonly comment?: string | undefined;
    constructor(payload: Buffer, to: Address, value: bigint, gas: bigint, comment?: string | undefined);
    encode(): {
        to: string;
        value: bigint;
        data: Buffer;
    };
}
