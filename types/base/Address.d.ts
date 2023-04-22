/// <reference types="node" />
import { InterningCache } from './InterningCache';
/**
 * Address class for managing Ethereum addresses.
 * Helps to avoid issues with multiple string representations of the same Ethereum address.
 * Normalizes addresses and interns them using a cache with weakly referenced values.
 */
export declare class Address {
    readonly bytes: Buffer;
    /**
     * A static cache for storing unique instances of the Address class.
     */
    static interningCache: InterningCache<Address>;
    /**
     * A static constant representing the Ethereum zero address.
     */
    static ZERO: Address;
    /**
     * The normalized HEX representation of the Ethereum address.
     */
    readonly address: string;
    /**
     * Private constructor for Address class.
     * @param {Buffer} bytes - Buffer object representing the Ethereum address bytes.
     */
    private constructor();
    /**
     * Static factory method for creating Address instances.
     * @param {string | Buffer | Address} value - Input value to create an Address instance.
     * @returns {Address} Address instance.
     */
    static from(value: string | Buffer | Address): Address;
    /**
     * Static factory method for creating Address instances from a Buffer.
     * @param {Buffer} slice - Buffer object to create an Address instance.
     * @returns {Address} Address instance.
     */
    static fromBuffer(slice: Buffer): Address;
    /**
     * Static factory method for creating Address instances from a hex string.
     * @param {string} addr - Hex string to create an Address instance.
     * @returns {Address} Address instance.
     */
    static fromHexString(addr: string): Address;
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    toString(): string;
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    toShortString(): string;
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    valueOf(): string;
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "Address";
    gt(other: Address): number | false;
    /**
     * Returns true if this address is greater than or equal to the other address.
    */
    gte(other: Address): number | true;
}
//# sourceMappingURL=Address.d.ts.map