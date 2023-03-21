import { Address } from '../../src/base/Address'
import { Universe } from '../../src/Universe'
import testConfig from '../../src/configuration/testEnvironment'

describe('actions/SAToken', () => {
  it('Correctly mints and burns', async () => {
    const universe = await Universe.createForTest(testConfig)

    await testConfig.initialize(universe)

    const USDT = universe.tokens.get(
      Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7')
    )!
    const saUSDT = universe.tokens.get(
      Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
    )!
    const { mint, burn } = universe.wrappedTokens.get(saUSDT)!

    const saUSDTFrom100USDT = (await mint.quote([USDT.fromDecimal('100')]))[0]

    expect(saUSDTFrom100USDT.formatWithSymbol()).toBe('90.015124913626133531 saUSDT')

    const about100USDT = (await burn.quote([saUSDTFrom100USDT]))[0]
    expect(about100USDT.formatWithSymbol()).toBe('100.0 USDT')
  })
})
