import { Address } from '../../src.ts/base/Address'
import { Searcher } from '../../src.ts/searcher'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('searcher/reth', () => {
  it('It can correct handle reth', async () => {
    const universe = await createForTest()
    const ETH = universe.nativeToken
    const WETH = universe.commonTokens.ERC20GAS!
    const RETH = await universe.getToken(
      Address.from('0xae78736Cd615f374D3085123A210448E74Fc6393')
    )

    const searcher = new Searcher(universe)

    const resultEthToRETH = await searcher.findSingleInputTokenSwap(
      ETH.from('10.0'),
      RETH,
      Address.ZERO
    )
    expect(resultEthToRETH.at(-1)!.outputs[0].formatWithSymbol()).toBe(
      '9.35567468447987126 rETH'
    )

    const resultWETHToRETH = await searcher.findSingleInputTokenSwap(
      WETH.from('10.0'),
      RETH,
      Address.ZERO
    )
    expect(resultWETHToRETH.at(-1)!.outputs[0].formatWithSymbol()).toBe(
      '9.35567468447987126 rETH'
    )

    const resultRETHToWETH = await searcher.findSingleInputTokenSwap(
      RETH.from('9.35567468447987126'),
      WETH,
      Address.ZERO
    )
    expect(resultRETHToWETH.at(-1)!.outputs[0].formatWithSymbol()).toBe(
      '9.999999999999999993 WETH'
    )
  })
})
