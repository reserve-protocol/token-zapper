import { Buffer } from 'buffer';
/**
 * Heleprs for parsing hex strings into buffers
 * @param maybeHex the hex string to parse
 * @returns the parsed buffer
 * @throws if the hex string is invalid or empty
 * @example
 * parseHexStringIntoBuffer('0x1234') // returns Buffer.from([0x12, 0x34])
 * parseHexStringIntoBuffer('1234') // returns Buffer.from([0x12, 0x34])
 * parseHexStringIntoBuffer('0x') // returns Buffer.alloc(0)
 * parseHexStringIntoBuffer('') // returns Buffer.alloc(0)
 * parseHexStringIntoBuffer('0x123') // throws
 * parseHexStringIntoBuffer('0x123g') // throws
 */
export declare const parseHexStringIntoBuffer: (maybeHex: string) => Buffer;
