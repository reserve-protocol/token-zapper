import * as ethers from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { InterningCache } from './InterningCache';
import { parseHexStringIntoBuffer } from './utils';
/**
 * Address class for managing Ethereum addresses.
 * Helps to avoid issues with multiple string representations of the same Ethereum address.
 * Normalizes addresses and interns them using a cache with weakly referenced values.
 */
export class Address {
    bytes;
    /**
     * A static cache for storing unique instances of the Address class.
     */
    static interningCache = new InterningCache((addr) => addr.address);
    /**
     * A static constant representing the Ethereum zero address.
     */
    static ZERO = Address.fromHexString(ethers.constants.AddressZero);
    /**
     * The normalized HEX representation of the Ethereum address.
     */
    address;
    /**
     * Private constructor for Address class.
     * @param {Buffer} bytes - Buffer object representing the Ethereum address bytes.
     */
    constructor(bytes) {
        this.bytes = bytes;
        if (bytes.length !== 20) {
            throw new Error('Invalid address bytes');
        }
        this.address = ethers.utils.getAddress(`0x${bytes.toString('hex')}`);
    }
    /**
     * Static factory method for creating Address instances.
     * @param {string | Buffer | Address} value - Input value to create an Address instance.
     * @returns {Address} Address instance.
     */
    static from(value) {
        if (value instanceof Address) {
            return value;
        }
        else if (typeof value === 'string') {
            return Address.fromHexString(value);
        }
        else if (value instanceof Buffer) {
            return Address.fromBuffer(value);
        }
        else {
            throw new Error(value);
        }
    }
    /**
     * Static factory method for creating Address instances from a Buffer.
     * @param {Buffer} slice - Buffer object to create an Address instance.
     * @returns {Address} Address instance.
     */
    static fromBuffer(slice) {
        if (slice.length !== 20) {
            throw new Error('Address must be 20 bytes long got ' + slice.length.toString());
        }
        try {
            return Address.interningCache.get(new Address(slice));
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Static factory method for creating Address instances from a hex string.
     * @param {string} addr - Hex string to create an Address instance.
     * @returns {Address} Address instance.
     */
    static fromHexString(addr) {
        if (!isAddress(addr)) {
            throw new Error('Invalid input type ' + addr);
        }
        if (!(addr.length === 42 || addr.length === 40)) {
            throw new Error('Invalid hex string length ' + addr);
        }
        try {
            return Address.interningCache.get(new Address(parseHexStringIntoBuffer(addr)));
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    toString() {
        return this.address;
    }
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    toShortString() {
        return this.address.slice(0, 6) + '...' + this.address.slice(-4);
    }
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    valueOf() {
        return this.address;
    }
    /**
     * Returns the normalized address string.
     * @returns {string} Normalized address string.
     */
    [Symbol.toPrimitive]() {
        return this.address;
    }
    [Symbol.toStringTag] = 'Address';
    gt(other) {
        return this !== other && this.address.localeCompare(other.address);
    }
    /**
     * Returns true if this address is greater than or equal to the other address.
    */
    gte(other) {
        return this === other || this.address.localeCompare(other.address);
    }
}
//# sourceMappingURL=Address.js.map