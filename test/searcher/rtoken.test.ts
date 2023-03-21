import { Address } from '../../src/base/Address'
import { Universe } from '../../src/Universe'
import { Searcher, findPrecursorTokenSet } from '../../src/searcher'
import testConfig from '../../src/configuration/testEnvironment'
import { fixture, createV2Pool } from './univ2.test'
import { BurnRTokenAction, MintRTokenAction } from '../../src/action/RTokens'
import { TokenQuantity } from '../../src/entities/Token'

const createRToken = (
  universe: Universe,
  name: string,
  qty: TokenQuantity[]
) => {
  const rToken = universe.createToken(
    Address.fromHexString('0x0000000000000000000000000000000000001337'),
    name,
    name,
    18
  )

  const quantities = qty

  const basketHandler = {
    inputTokens: quantities.map((i) => i.token),
    mintQuantities: quantities,
    rToken: rToken,
  } as any

  universe.defineMintable(
    new MintRTokenAction(universe, basketHandler),
    new BurnRTokenAction(universe, basketHandler)
  )
  return rToken
}

describe('searcher', () => {
  it('It can do an rToken zap', async () => {
    const universe = await Universe.createForTest(testConfig)
    await testConfig.initialize(universe)

    const searcher = new Searcher(universe)
    const USDT = (await universe.getToken(
      Address.fromHexString('0xdac17f958d2ee523a2206206994597c13d831ec7')
    ))!
    const eUSD = (await universe.getToken(
      Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    ))!
    const result = await searcher.findSingleInputToRTokenZap(
      USDT.fromDecimal('10.0'),
      eUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === eUSD)?.formatWithSymbol()
    ).toBe('9.99964 eUSD')
  })

  it('It can can trade then RToken', async () => {
    const universe = await fixture()
    const searcher = new Searcher(universe)
    const WETH = universe.commonTokens.ERC20ETH!
    const eUSD = (await universe.getToken(
      Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    ))!
    const result = await searcher.findSingleInputToRTokenZap(
      WETH.fromDecimal('0.1'),
      eUSD,
      Address.ZERO
    )

    expect(
      result.swaps.outputs.find((i) => i.token === eUSD)?.formatWithSymbol()
    ).toBe('174.12152007 eUSD')
  })

  it('It can can burn then RToken', async () => {
    const universe = await fixture()
    const searcher = new Searcher(universe)
    const CToken = (await universe.getToken(
      Address.fromHexString('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    ))!
    const eUSD = (await universe.getToken(
      Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    ))!
    const result = await searcher.findSingleInputToRTokenZap(
      CToken.fromDecimal('100000.0'),
      eUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === eUSD)?.formatWithSymbol()
    ).toBe('22.234444 eUSD')
  })

  it('Old eUSD', async () => {
    const universe = await fixture()
    const oldEUSD = createRToken(universe, 'oldEUSD', [
      universe.tokens
        .get(Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'))!
        .fromDecimal('0.225037'),
      universe.tokens
        .get(Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'))!
        .fromDecimal('1124.340940'),
      universe.tokens
        .get(Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986'))!
        .fromDecimal('0.230457'),
      universe.tokens
        .get(Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563'))!
        .fromDecimal('1097.33465'),
    ])

    createV2Pool(
      universe,
      universe.commonTokens.ERC20ETH!.fromDecimal('50'),
      universe.commonTokens.USDC!.fromDecimal('1725')
    )

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.ERC20ETH!.fromDecimal('0.1'),
      oldEUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === oldEUSD)?.formatWithSymbol()
    ).toBe('171.81120402 oldEUSD')
  })

  it('recursive RTokens', async () => {
    const universe = await fixture()
    const eUSD = (await universe.getToken(
      Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    ))!
    const quantities = [eUSD.fromDecimal('1.0')]
    const eUSDSquared = createRToken(universe, 'eUSD^2', quantities)
    const searcher = new Searcher(universe)
    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.USDT!.fromDecimal('10.0'),
      eUSDSquared,
      Address.ZERO
    )

    expect(
      result.swaps.outputs
        .find((i) => i.token === eUSDSquared)
        ?.formatWithSymbol()
    ).toBe('9.99964 eUSD^2')
  })

  it('recursive RTokens2', async () => {
    const universe = await fixture()
    const eUSD = (await universe.getToken(
      Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F')
    ))!
    const quantities = [
      eUSD.fromDecimal('0.5'),
      universe.commonTokens.USDT?.fromDecimal('0.5')!,
    ]
    const eUSDSquared = createRToken(universe, 'eUSD^3', quantities)
    const searcher = new Searcher(universe)
    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.USDT!.fromDecimal('10.0'),
      eUSDSquared,
      Address.ZERO
    )

    expect(
      result.swaps.outputs
        .find((i) => i.token === eUSDSquared)
        ?.formatWithSymbol()
    ).toBe('9.99976 eUSD^3')
  })
})
