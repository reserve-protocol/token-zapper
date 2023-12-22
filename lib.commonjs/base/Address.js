"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const address_1 = require("@ethersproject/address");
const constants_1 = require("@ethersproject/constants");
const buffer_1 = require("buffer");
const InterningCache_1 = require("./InterningCache");
const utils_1 = require("./utils");
/**
 * Address class for managing Ethereum addresses.
 * Helps to avoid issues with multiple string representations of the same Ethereum address.
 * Normalizes addresses and interns them using a cache with weakly referenced values.
 */
class Address {
    bytes;
    /**
     * A static cache for storing unique instances of the Address class.
     */
    static interningCache = new InterningCache_1.InterningCache((addr) => addr.address);
    /**
     * A static constant representing the Ethereum zero address.
     */
    static ZERO = Address.fromHexString(constants_1.AddressZero);
    /**
     * The normalized HEX representation of the Ethereum address.
     */
    address;
    integer;
    /**
     * Private constructor for Address class.
     * @param {Buffer} bytes - Buffer object representing the Ethereum address bytes.
     */
    constructor(bytes) {
        this.bytes = bytes;
        if (bytes.length !== 20) {
            throw new Error('Invalid address bytes');
        }
        this.address = (0, address_1.getAddress)(`0x${bytes.toString('hex')}`);
        this.integer = BigInt(this.address);
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
        else if (value instanceof buffer_1.Buffer) {
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
        let fastPath = this.interningCache.getById(addr)?.deref();
        if (fastPath != null) {
            return fastPath;
        }
        if (!(0, address_1.isAddress)(addr)) {
            throw new Error('Invalid input type ' + addr);
        }
        if (!(addr.length === 42 || addr.length === 40)) {
            throw new Error('Invalid hex string length ' + addr);
        }
        try {
            return Address.interningCache.get(new Address((0, utils_1.parseHexStringIntoBuffer)(addr)));
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
        return this !== other && this.integer > other.integer;
    }
    /**
     * Returns true if this address is greater than or equal to the other address.
     */
    gte(other) {
        return this === other || this.integer >= other.integer;
    }
}
exports.Address = Address;
//# sourceMappingURL=Address.js.map