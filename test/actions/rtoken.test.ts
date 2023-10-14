import { Address } from '../../src.ts/base/Address'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('actions/RToken', () => {
  it('Correctly mints and burns', async () => {
    const universe = await createForTest()
    const eUSD = universe.rTokens.eUSD
    const USDT = universe.commonTokens.USDT
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
      cUSDT.fromDecimal('11.24340940').scalarMul(100n),
    ]
    const eUSDQtyFromAbout100USDOfBasket = (await mint.quote(quantitiesIn))[0]

    expect(eUSDQtyFromAbout100USDOfBasket.formatWithSymbol()).toBe('99.999966666666666667 eUSD')

    const about100USDT = await burn.quote([eUSDQtyFromAbout100USDOfBasket])
    expect(about100USDT[0].formatWithSymbol()).toBe(
      "22.506292 saUSDT"
    )
    expect(about100USDT[1].formatWithSymbol()).toBe(
      "50.000382 USDT"
    )
    expect(about100USDT[2].formatWithSymbol()).toBe(
      "1124.34056514 cUSDT"
    )
  })
})
