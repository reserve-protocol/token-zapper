import { Address } from '../../src.ts/base/Address'
import { Universe } from '../../src.ts/Universe'
import testConfig from '../../src.ts/configuration/testEnvironment'

describe('actions/CToken', () => {
  it('Correctly mints and burns', async () => {
    const universe = await Universe.createForTest(testConfig)

    await testConfig.initialize(universe)

    const USDT = universe.tokens.get(
      Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7')
    )!
    const cUSDT = universe.tokens.get(
      Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    )!
    const { mint, burn } = universe.wrappedTokens.get(cUSDT)!

    const cUSDTFrom100USDT = (await mint.quote([USDT.fromDecimal('100')]))[0]

    expect(cUSDTFrom100USDT.formatWithSymbol()).toBe('4497.36376203 cUSDT')

    const about100USDT = (await burn.quote([cUSDTFrom100USDT]))[0]
    expect(about100USDT.formatWithSymbol()).toBe('99.999999 USDT')
  })
})
