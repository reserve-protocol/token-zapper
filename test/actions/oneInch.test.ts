import {createForTest} from '../../src.ts/configuration/testEnvironment'
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
        await oneInchAction.quote([oneInchAction.input[0].fromDecimal('0')])
      )[0].formatWithSymbol()
    ).toBe('175.741568 USDT')

    expect((await oneInchAction.encode()).payload.toString('hex')).toBe(
      '0502b1c5000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000000a718f070000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d034006da0fd433c1a5d7a4faa01111c044910a184553cfee7c08'
    )
  })
})
