import { Address } from '../../src.ts/base/Address'
import { Universe } from '../../src.ts/Universe'
import testConfig from '../../src.ts/configuration/testEnvironment'

describe('actions/RToken', () => {
  it('Correctly mints and burns', async () => {
    const universe = await Universe.createForTest(testConfig)

    await testConfig.initialize(universe)

    const eUSD = universe.tokens.get(
      Address.from('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    )!
    const USDT = universe.tokens.get(
      Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7')
    )!
    const saUSDT = universe.tokens.get(
      Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
    )!
    const cUSDT = universe.tokens.get(
      Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    )!

    const { mint, burn } = universe.wrappedTokens.get(eUSD)!

    const quantitiesIn = [
      saUSDT.fromDecimal('0.225063').scalarMul(100n),
      USDT.fromDecimal('0.500004').scalarMul(100n),
      cUSDT.fromDecimal('1124.340940').scalarMul(100n),
    ]
    const eUSDQtyFromAbout100USDOfBasket = (await mint.quote(quantitiesIn))[0]

    expect(eUSDQtyFromAbout100USDOfBasket.formatWithSymbol()).toBe('100.0 eUSD')

    const about100USDT = await burn.quote([eUSDQtyFromAbout100USDOfBasket])
    expect(about100USDT[0].formatWithSymbol()).toBe(
      quantitiesIn[0].formatWithSymbol()
    )
    expect(about100USDT[1].formatWithSymbol()).toBe(
      quantitiesIn[1].formatWithSymbol()
    )
    expect(about100USDT[2].formatWithSymbol()).toBe(
      quantitiesIn[2].formatWithSymbol()
    )
  })
})
