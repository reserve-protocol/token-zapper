import * as ethers from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { InterningCache } from './InterningCache'
import { parseHexStringIntoBuffer } from './utils'

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

export class Address {
  public static interningCache = new InterningCache<Address>(
    addr => addr.address
  )


  public static ZERO = Address.fromHexString(ethers.constants.AddressZero)

  // The HEX representation of the address
  public readonly address: string

  private constructor (
    readonly bytes: Buffer
  ) {
    if (bytes.length !== 20) {
      throw new Error('Invalid address bytes')
    }

    this.address = ethers.utils.getAddress(`0x${bytes.toString('hex')}`)
  }

  static from (value: string | Buffer | Address) {
    if (value instanceof Address) {
      return value
    } else if (typeof value === 'string') {
      return Address.fromHexString(value)
    } else if (value instanceof Buffer) {
      return Address.fromBuffer(value)
    } else {
      throw new Error(value)
    }
  }

  static fromBuffer (slice: Buffer): Address {
    if (slice.length !== 20) {
      throw new Error('Address must be 20 bytes long got ' + slice.length.toString())
    }
    try {
      return Address.interningCache.get(new Address(slice))
    } catch (e) {
      throw e
    }
  }

  static fromHexString (addr: string): Address {
    if (!isAddress(addr)) {
      throw new Error('Invalid input type ' + addr)
    }
    if (!(addr.length === 42 || addr.length === 40)) {
      throw new Error('Invalid hex string length ' + addr)
    }
    try {
      return Address.interningCache.get(new Address(parseHexStringIntoBuffer(addr)))
    } catch (e) {
      throw e
    }
  }

  toString () {
    return this.address
  }

  valueOf () {
    return this.address
  }

  [Symbol.toPrimitive] () {
    return this.address
  }

  readonly [Symbol.toStringTag] = 'Address'

  gt(other: Address) {
    return this !== other && this.address.localeCompare(other.address)
  }
  gte(other: Address) {
    return this === other || this.address.localeCompare(other.address)
  }
}
