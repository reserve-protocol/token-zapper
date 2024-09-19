import { Token } from '../../../src.ts/entities/Token'
import { Address } from '../../../src.ts/base/Address'

describe('entities/Token', () => {
  describe('formatting', () => {
    const registry = new Map<Address, Token>()
    const usdc = Token.createToken(registry, Address.ZERO, 'USDC', 'USDC', 6)
    const wbtc = Token.createToken(
      registry,
      Address.from('0x0000000000000000000000000000000000000001'),
      'WBTC',
      'Wrapped bitcoin',
      8
    )
    const eth = Token.createToken(
      registry,
      Address.from('0x0000000000000000000000000000000000000002'),
      'ETH',
      'ETH',
      18
    )

    expect(usdc.toString()).toBe('USDC')
    expect(usdc.symbol).toBe('USDC')

    expect(usdc.fromDecimal('50.5').format().toString()).toBe('50.5')
    expect(usdc.fromDecimal('50.5').formatWithSymbol().toString()).toBe(
      '50.5 USDC'
    )

    expect(wbtc.fromDecimal('0.12312').format().toString()).toBe('0.12312')
    expect(wbtc.fromDecimal('1.00001').formatWithSymbol().toString()).toBe(
      '1.00001 WBTC'
    )

    expect(eth.fromDecimal('1').format().toString()).toBe('1.0')
    expect(eth.fromDecimal('0.123').formatWithSymbol().toString()).toBe(
      '0.123 ETH'
    )
  })
  describe('Token quantities', () => {
    it('Aritmetic', () => {
      const registry = new Map<Address, Token>()
      const usdc = Token.createToken(registry, Address.ZERO, 'USDC', 'USDC', 6)
      const wbtc = Token.createToken(
        registry,
        Address.from('0x0000000000000000000000000000000000000001'),
        'WBTC',
        'Wrapped bitcoin',
        8
      )
      const eth = Token.createToken(
        registry,
        Address.from('0x0000000000000000000000000000000000000002'),
        'ETH',
        'ETH',
        18
      )

      expect(
        usdc
          .fromDecimal('0.123')
          .add(usdc.fromDecimal('1.453'))
          .formatWithSymbol()
      ).toBe('1.576 USDC')

      expect(
        usdc.fromDecimal('2').mul(usdc.fromDecimal('0.5')).formatWithSymbol()
      ).toBe('1.0 USDC')

      expect(
        usdc.fromDecimal('0.5').mul(usdc.fromDecimal('2.0')).formatWithSymbol()
      ).toBe('1.0 USDC')

      expect(
        usdc.fromDecimal('2').div(usdc.fromDecimal('2.0')).formatWithSymbol()
      ).toBe('1.0 USDC')

      expect(
        usdc.fromDecimal('2').div(usdc.fromDecimal('0.5')).formatWithSymbol()
      ).toBe('4.0 USDC')

      // Working with multiple currencies

      const priceOfBTC = usdc.fromDecimal('28000')
      const priceOfETH = usdc.fromDecimal('1800')

      const btcQuantity = wbtc.fromDecimal('1.3215')

      expect(
        btcQuantity.convertTo(usdc).mul(priceOfBTC).formatWithSymbol()
      ).toBe('37002.0 USDC')
      expect(priceOfBTC.div(priceOfETH).convertTo(eth).formatWithSymbol()).toBe(
        '15.555555 ETH'
      )
    })
  })
})
