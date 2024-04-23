import { Address } from '../../src.ts/base/Address'
import { V2Pool } from '../../src.ts/entities/dexes/V2LikePool'
import { createForTest } from '../../src.ts/configuration/testEnvironment'

describe('dexes/v2', () => {
  it('standard impl', async () => {
    const universe = await createForTest()
    const UniV2Factory = Address.from(
      '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
    )

    const USDT = universe.commonTokens.USDT
    const WETH = universe.commonTokens.WETH

    const pool = V2Pool.createStandardV2Pool(UniV2Factory, USDT, WETH, 3000n)

    const wethPrice = USDT.fromDecimal('1780')
    const wethInPool = WETH.fromDecimal('50')

    const usdtInPool = wethInPool.convertTo(USDT).mul(wethPrice)

    pool.updateReserves(wethInPool.amount, usdtInPool.amount)

    const swap01 = await pool.swapFn(WETH.fromDecimal('1'), {
      pool,
      input: WETH,
      output: USDT,
      direction: '0->1',
    })
    expect(swap01.formatWithSymbol()).toBe('1739.965095 USDT')

    const swap10 = await pool.swapFn(USDT.fromDecimal('1000'), {
      pool,
      input: USDT,
      output: WETH,
      direction: '1->0',
    })

    expect(swap10.formatWithSymbol()).toBe('0.553907352467304465 WETH')

    const buy01 = await pool.swapFn(USDT.fromDecimal('1000'), {
      pool,
      input: WETH,
      output: USDT,
      direction: '0->1',
    })
    expect(buy01.formatWithSymbol()).toBe('0.569891492659797575 WETH')

    const buy10 = await pool.swapFn(WETH.fromDecimal('1'), {
      pool,
      input: USDT,
      output: WETH,
      direction: '1->0',
    })
    expect(buy10.formatWithSymbol()).toBe('1821.791907 USDT')
  })
})
