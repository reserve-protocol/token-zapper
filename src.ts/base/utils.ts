import { Buffer } from 'buffer'

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
export const parseHexStringIntoBuffer = (maybeHex: string) => {
  if (maybeHex.length % 2 !== 0) {
    throw new Error('Invalid encoding: ' + maybeHex)
  }
  if (maybeHex === '' || maybeHex === '0x') {
    return Buffer.alloc(0)
  }
  let out: Buffer
  maybeHex = maybeHex.toLowerCase()

  if (maybeHex.startsWith('0x')) {
    if (!/^0x([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
      throw new Error('Invalid hex encoding')
    }
    out = Buffer.from(maybeHex.slice(2), 'hex')
  } else {
    if (!/^([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
      throw new Error('Invalid hex encoding')
    }
    out = Buffer.from(maybeHex, 'hex')
  }
  if (out.length === 0) {
    throw new Error('Invalid encoding: ' + maybeHex)
  }
  return out
}
