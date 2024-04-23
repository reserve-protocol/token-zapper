import { createForTest } from '../../src.ts/configuration/testEnvironment'
import { OneInchAction } from '../../src.ts/action/OneInch'
import swap0_1ForUSDT from './data/oneInchSwap0.1ETHForUSDT.json'

describe('actions/OneInch', () => {
  it('Snapshot test of a 1inch swap of 0.1 WETH for USDT on block "16870476"', async () => {
    const universe = await createForTest()

    const oneInchAction = OneInchAction.createAction(
      universe,
      universe.commonTokens.WETH,
      universe.commonTokens.USDT,
      swap0_1ForUSDT as any,
      0
    )
    expect(
      (
        await oneInchAction.quote([
          oneInchAction.inputToken[0].fromDecimal('0'),
        ])
      )[0].formatWithSymbol()
    ).toBe('175.741568 USDT')
  })
})
