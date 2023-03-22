import { Address } from '../../src.ts/base/Address'
import { Universe } from '../../src.ts/Universe'
import { Searcher } from '../../src.ts/searcher'
import testConfig from '../../src.ts/configuration/testEnvironment'

describe('searcher', () => {
  it('it can handle mints', async () => {
    const universe = await Universe.createForTest(testConfig)
    await testConfig.initialize(universe)

    const searcher = new Searcher(universe)
    const USDT = (await universe.getToken(
      Address.fromHexString('0xdac17f958d2ee523a2206206994597c13d831ec7')
    ))!
    const cUSDT = (await universe.getToken(
      Address.fromHexString('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    ))!

    const result = await searcher.findSingleInputTokenSwap(
      USDT.fromDecimal('10.0'),
      cUSDT,
      Address.ZERO
    )
    expect(result.length).toBe(1)
    const expectedPath = result[0]
    expect(expectedPath.outputs[0].formatWithSymbol()).toBe('44973.63762034 cUSDT')
  })

  it('it can handle burns', async () => {
    const universe = await Universe.createForTest(testConfig)
    await testConfig.initialize(universe)

    const searcher = new Searcher(universe)
    const USDT = (await universe.getToken(
      Address.fromHexString('0xdac17f958d2ee523a2206206994597c13d831ec7')
    ))!
    const cUSDT = (await universe.getToken(
      Address.fromHexString('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    ))!

    const result = await searcher.findSingleInputTokenSwap(
      cUSDT.fromDecimal('44973.63762'),
      USDT,
      Address.ZERO
    )

    expect(result.length).toBe(1)
    const expectedPath = result[0]
    expect(expectedPath.outputs[0].formatWithSymbol()).toBe('9.999999 USDT')
  })
})
