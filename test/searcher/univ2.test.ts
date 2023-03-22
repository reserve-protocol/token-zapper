import { Address } from '../../src/base/Address'
import { Universe } from '../../src/Universe'
import { V2Pool } from '../../src/entities/dexes/V2LikePool'
import { Searcher } from '../../src/searcher'
import { UniV2Like } from '../../src/action/UniV2Like'
import testConfig from '../../src/configuration/testEnvironment'
import { Token, TokenQuantity } from '../../src/entities/Token'
const UniV2Factory = Address.from('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')

export const createV2Pool = (
  universe: Universe,
  quantity: TokenQuantity,
  price: TokenQuantity,
) => {
  const pool = V2Pool.createStandardV2Pool(UniV2Factory, quantity.token, price.token, 3000n)
  const quoteQty = quantity.convertTo(price.token).mul(price)
  const [r0, r1] = quantity.token === pool.token0 ? [quantity, quoteQty] : [quoteQty, quantity]
  pool.updateReserves(r0.amount, r1.amount)
  universe.addAction(new UniV2Like(universe, pool, '1->0'))
  universe.addAction(new UniV2Like(universe, pool, '0->1'))
  return pool
}

export const fixture = async () => {
  const universe = await Universe.createForTest(testConfig)
  await testConfig.initialize(universe)

  const WETH = universe.commonTokens.ERC20ETH!
  const USDT = universe.commonTokens.USDT!

  createV2Pool(
    universe,
    WETH.fromDecimal('50'),
    USDT.fromDecimal('1750'),
  )
  return universe
}
describe('v2 uniswap actions', () => {
  it('it can handle a basic swap', async () => {
    const universe = await fixture()

    const result = await new Searcher(universe).findSingleInputTokenSwap(
      universe.commonTokens.USDT!.fromDecimal('10.0'),
      universe.commonTokens.ERC20ETH!,
      Address.ZERO
    )
    expect(result[0].outputs[0].formatWithSymbol()).toBe(
      '0.005696493782365597 WETH'
    )
    expect(result[0].steps.length).toBe(1)
  })

  it('it can handle a mint + swap', async () => {
    const universe = await fixture()
    const cUSDT = (await universe.getToken(
      Address.fromHexString('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    ))!
    const qty = universe.commonTokens.ERC20ETH!.fromDecimal('0.01')

    const result = await new Searcher(universe).findSingleInputTokenSwap(
      qty,
      cUSDT!,
      Address.ZERO
    )
    expect(result[0].outputs[0].formatWithSymbol()).toBe('78452.10790957 cUSDT')
    expect(result[0].steps.length).toBe(2)
  })

  it('it can handle a burn + swap', async () => {
    const universe = await fixture()
    const cUSDT = (await universe.getToken(
      Address.fromHexString('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    ))!

    const result = await new Searcher(universe).findSingleInputTokenSwap(
      cUSDT!.fromDecimal('50000'),
      universe.commonTokens.ERC20ETH!,
      Address.ZERO
    )
    expect(result[0].outputs[0].formatWithSymbol()).toBe(
      '0.006333066959642829 WETH'
    )
    expect(result[0].steps.length).toBe(2)
  })
})
