/// <reference types="node" />
import { InterningCache } from './InterningCache';
/**
 * Why Address over a hex encoded string?
 *
 * Hex encoded strings has multiple representation for same address, "0xabcd" "0xaBCD", same value by are not equal in ECMAscript
 * Hex encoded string require normalization when passed around, ingesting addresses you can get them in all sorts of formats:
 *   - checksummed: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
 *   - lowercase:   0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
 *   - without 0x:    a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
 *   - uppercased?: 0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48
 *
 * This is annoying to deal with, especially if you use them as keys in a Map
 *
 * So I propose the following:
 *   - All of the above should point to a unique instance of 'Address'
 *   - This is done via a static factory rather that a public constructor.
 *   - Interning is done by normalizing the address via check summing, in a map with WeakRef'ed values
 *
 */
export declare class Address {
    readonly bytes: Buffer;
    static interningCache: InterningCache<Address>;
    static ZERO: Address;
    readonly address: string;
    private constructor();
    static from(value: string | Buffer | Address): Address;
    static fromBuffer(slice: Buffer): Address;
    static fromHexString(addr: string): Address;
    toString(): string;
    valueOf(): string;
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "Address";
    gt(other: Address): number | false;
    gte(other: Address): number | true;
}
//# sourceMappingURL=Address.d.ts.map