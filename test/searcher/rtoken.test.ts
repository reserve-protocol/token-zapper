import { Address } from '../../src/base/Address'
import { Universe } from '../../src/Universe'
import { Searcher } from '../../src/searcher'
import testConfig from '../../src/configuration/testEnvironment'
import { fixture, createV2Pool } from './univ2.test'
import { BurnRTokenAction, MintRTokenAction } from '../../src/action/RTokens'

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
    expect(result.output[0].formatWithSymbol()).toBe('9.99964 eUSD')
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

    expect(result.output[0].formatWithSymbol()).toBe('174.12152 eUSD')
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
    expect(result.output[0].formatWithSymbol()).toBe('22.234444 eUSD')
  })

  it('Old eUSD', async () => {
    const universe = await fixture()

    const saUSDT = universe.tokens.get(
      Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
    )!
    const cUSDT = universe.tokens.get(
      Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
    )!

    const saUSDC = universe.tokens.get(
      Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986')
    )!
    const cUSDC = universe.tokens.get(
      Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563')
    )!

    const oldEUSD = universe.createToken(
      Address.fromHexString('0x0000000000000000000000000000000000001337'),
      'oldEUSD',
      'oldEUSD',
      18
    )

    const quantities = [
      saUSDT.fromDecimal('0.450075'),
      cUSDT.fromDecimal('2248.681881'),
      saUSDC.fromDecimal('0.460914'),
      cUSDC.fromDecimal('2194.669300'),
    ]

    const basketHandler = {
      inputTokens: quantities.map((i) => i.token),
      mintQuantities: quantities,
      rToken: oldEUSD,
    } as any

    createV2Pool(
      universe,
      universe.commonTokens.ERC20ETH!.fromDecimal('50'),
      universe.commonTokens.USDC!.fromDecimal('1725')
    )
    universe.defineMintable(
      new MintRTokenAction(universe, basketHandler),
      new BurnRTokenAction(universe, basketHandler)
    )

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.ERC20ETH!.fromDecimal('0.1'),
      oldEUSD,
      Address.ZERO
    )
    console.log(result.describe().join("\n"))
  })
})
