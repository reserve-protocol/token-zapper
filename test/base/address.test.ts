import { parseHexStringIntoBuffer } from '../../src/base/utils'

describe('base', () => {
  describe('parseHexStringIntoBuffer', () => {
    it('OK formats', () => {
      expect(
        parseHexStringIntoBuffer('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toBeTruthy()
      expect(
        parseHexStringIntoBuffer('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toBeTruthy()
      expect(
        parseHexStringIntoBuffer('0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
      ).toBeTruthy()
      expect(
        parseHexStringIntoBuffer('0xA0B86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toBeTruthy()
    })

    it('Not-OK formats', () => {
      expect(() =>
        parseHexStringIntoBuffer('0xa0b86991c628b36c1d19d4a2e9eb0ce3606eb48')
      ).toThrow('Invalid encoding: 0xa0b86991c628b36c1d19d4a2e9eb0ce3606eb48')
      expect(() =>
        parseHexStringIntoBuffer('0xa0b86991c628b36c1d19d4a2e_9eb0ce3606eb48')
      ).toThrow('Invalid hex encoding')
      expect(() =>
        parseHexStringIntoBuffer('0.a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toThrow('Invalid hex encoding')
    })
  })
  describe('properties', () => {
    it('Equaility', () => {
      expect(
        parseHexStringIntoBuffer('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toEqual(
        parseHexStringIntoBuffer('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      )

      expect(
        parseHexStringIntoBuffer('0xA0B86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      ).toEqual(
        parseHexStringIntoBuffer('0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
      )
    })
  })
})
