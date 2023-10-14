import { Address } from '../../src.ts/base/Address'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('actions/CToken', () => {
  it('Correctly mints and burns', async () => {
    const universe = await createForTest()
    const USDT = universe.commonTokens.USDT
    const cUSDT = universe.tokens.get(
      Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    )!
    const { mint, burn } = universe.wrappedTokens.get(cUSDT)!

    const cUSDTFrom100USDT = (await mint.quote([USDT.fromDecimal('100')]))[0]

    expect(cUSDTFrom100USDT.formatWithSymbol()).toBe('4497.36226291 cUSDT')

    const about100USDT = (await burn.quote([cUSDTFrom100USDT]))[0]
    expect(about100USDT.formatWithSymbol()).toBe('99.999961 USDT')
  })
})
