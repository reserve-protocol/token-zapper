import { isAddress, getAddress } from '@ethersproject/address'
import { AddressZero } from "@ethersproject/constants"

import { InterningCache } from './InterningCache'
import { parseHexStringIntoBuffer } from './utils'

/**
 * Address class for managing Ethereum addresses.
 * Helps to avoid issues with multiple string representations of the same Ethereum address.
 * Normalizes addresses and interns them using a cache with weakly referenced values.
 */
export class Address {
  /**
   * A static cache for storing unique instances of the Address class.
   */
  public static interningCache = new InterningCache<Address>(
    (addr) => addr.address
  )

  /**
   * A static constant representing the Ethereum zero address.
   */
  public static ZERO = Address.fromHexString(AddressZero)

  /**
   * The normalized HEX representation of the Ethereum address.
   */
  public readonly address: string
  public readonly integer: bigint

  /**
   * Private constructor for Address class.
   * @param {Buffer} bytes - Buffer object representing the Ethereum address bytes.
   */
  private constructor(readonly bytes: Buffer) {
    if (bytes.length !== 20) {
      throw new Error('Invalid address bytes')
    }

    this.address = getAddress(`0x${bytes.toString('hex')}`)
    this.integer = BigInt(this.address)
  }

  /**
   * Static factory method for creating Address instances.
   * @param {string | Buffer | Address} value - Input value to create an Address instance.
   * @returns {Address} Address instance.
   */
  static from(value: string | Buffer | Address): Address {
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

  /**
   * Static factory method for creating Address instances from a Buffer.
   * @param {Buffer} slice - Buffer object to create an Address instance.
   * @returns {Address} Address instance.
   */
  static fromBuffer(slice: Buffer): Address {
    if (slice.length !== 20) {
      throw new Error(
        'Address must be 20 bytes long got ' + slice.length.toString()
      )
    }
    try {
      return Address.interningCache.get(new Address(slice))
    } catch (e) {
      throw e
    }
  }

  /**
   * Static factory method for creating Address instances from a hex string.
   * @param {string} addr - Hex string to create an Address instance.
   * @returns {Address} Address instance.
   */
  static fromHexString(addr: string): Address {
    let fastPath = this.interningCache.getById(addr)?.deref()
    if (fastPath != null) {
      return fastPath
    }

    if (!isAddress(addr)) {
      throw new Error('Invalid input type ' + addr)
    }
    if (!(addr.length === 42 || addr.length === 40)) {
      throw new Error('Invalid hex string length ' + addr)
    }
    try {
      return Address.interningCache.get(
        new Address(parseHexStringIntoBuffer(addr))
      )
    } catch (e) {
      throw e
    }
  }

  /**
   * Returns the normalized address string.
   * @returns {string} Normalized address string.
   */
  toString(): string {
    return this.address
  }

  /**
   * Returns the normalized address string.
   * @returns {string} Normalized address string.
   */
  toShortString(): string {
    return this.address.slice(0, 6) + '...' + this.address.slice(-4)
  }

  /**
   * Returns the normalized address string.
   * @returns {string} Normalized address string.
   */
  valueOf(): string {
    return this.address
  }

  /**
   * Returns the normalized address string.
   * @returns {string} Normalized address string.
   */
  [Symbol.toPrimitive](): string {
    return this.address
  }

  readonly [Symbol.toStringTag] = 'Address'

  gt(other: Address) {
    return this !== other && this.integer > other.integer
  }

  /**
   * Returns true if this address is greater than or equal to the other address.
   */
  gte(other: Address) {
    return this === other || this.integer >= other.integer
  }
}
