import { Address } from '../../src.ts/base/Address'
import { Searcher } from '../../src.ts/searcher'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('searcher/steth', () => {
  it('It can correct handle wsteth', async () => {
    const universe = await createForTest()
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
    expect(path[0].steps[0].outputs[0].formatWithSymbol()).toBe('10.0 stETH')
    expect(path[0].steps[1].outputs[0].formatWithSymbol()).toBe(
      '8.93700000024782301 wstETH'
    )
  })
})
