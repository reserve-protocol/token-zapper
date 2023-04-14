import { Address } from '../../src.ts/base/Address'
import { Universe } from '../../src.ts/Universe'
import { Searcher } from '../../src.ts/searcher'
import testConfig from '../../src.ts/configuration/testEnvironment'

describe('searcher/steth', () => {
  it('It can correct handle wsteth', async () => {
    const universe = await Universe.createForTest(testConfig)
    await testConfig.initialize(universe)
    const ETH = universe.nativeToken
    const wstETH = await universe.getToken(
      Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0')
    )
    const searcher = new Searcher(universe)
    const path = await searcher.findSingleInputTokenSwap(
      ETH.from('10.0'),
      wstETH,
      Address.ZERO
    )
    expect(path[0].steps[0].output[0].formatWithSymbol()).toBe('10.0 stETH')
    expect(path[0].steps[1].output[0].formatWithSymbol()).toBe(
      '8.93700000024782301 wstETH'
    )
  })
})
