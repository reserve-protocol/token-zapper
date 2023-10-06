import { Address } from '../../src.ts/base/Address'
import { IBasket } from '../../src.ts/entities/TokenBasket'
import { Universe } from '../../src.ts/Universe'
import { Searcher } from '../../src.ts/searcher/Searcher'
import {createForTest} from '../../src.ts/configuration/testEnvironment'
import { fixture, createV2Pool } from './univ2.test'
import { BurnRTokenAction, MintRTokenAction } from '../../src.ts/action/RTokens'
import { Token, TokenQuantity } from '../../src.ts/entities/Token'
import { PriceOracle } from '../../src.ts/oracles/PriceOracle'

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

  const basketHandler: IBasket = {
    basketTokens: quantities.map((i) => i.token),
    unitBasket: quantities,
    rToken,
    basketNonce: 0,
  }

  universe.defineMintable(
    new MintRTokenAction(universe, basketHandler),
    new BurnRTokenAction(universe, basketHandler)
  )
  return rToken
}

describe('searcher/rtokenzaps', () => {
  it('It can do an ETH+ zap', async () => {
    const universe = await createForTest()

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.nativeToken.fromDecimal('1.0'),
      universe.rTokens['ETH+']!,
      Address.ZERO
    )
    expect(
      result.swaps.outputs
        .find((i) => i.token === universe.rTokens['ETH+']!)
        ?.formatWithSymbol()
    ).toBe('1.0 ETH+')
  })

  it('It can do an eUSD zap', async () => {
    const universe = await createForTest()

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
    ).toBe('9.999475 eUSD')
  })

  it('It can can trade then RToken', async () => {
    const universe = await fixture()
    const searcher = new Searcher(universe)
    const WETH = universe.commonTokens.WETH
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
    ).toBe('174.11864501 eUSD')
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
      CToken.fromDecimal('1000.0'),
      eUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === eUSD)?.formatWithSymbol()
    ).toBe('22.23407289 eUSD')
  })

  it('Old eUSD', async () => {
    const universe = await fixture()
    const oldEUSD = createRToken(universe, 'oldEUSD', [
      universe.tokens
        .get(Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'))!
        .fromDecimal('0.225037'),
      universe.tokens
        .get(Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'))!
        .fromDecimal('11.24340940'),
      universe.tokens
        .get(Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986'))!
        .fromDecimal('0.230457'),
      universe.tokens
        .get(Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563'))!
        .fromDecimal('10.9733465'),
    ])

    createV2Pool(
      universe,
      universe.commonTokens.WETH.fromDecimal('50'),
      universe.commonTokens.USDC!.fromDecimal('1725')
    )

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.WETH.fromDecimal('0.1'),
      oldEUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === oldEUSD)?.formatWithSymbol()
    ).toBe('171.89448207 oldEUSD')
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
    ).toBe('9.999475 eUSD^2')
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
    ).toBe('9.999387 eUSD^3')
  })

  it('Inputs differently priced', async () => {
    const universe = await fixture()
    const usdcPrice = universe.usd.fromDecimal('0.90')

    const oldEUSD = createRToken(universe, 'oldEUSD', [
      universe.tokens
        .get(Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'))!
        .fromDecimal('0.225037'),
      universe.tokens
        .get(Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'))!
        .fromDecimal('11.24340940'),
      universe.tokens
        .get(Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986'))!
        .fromDecimal('0.230457'),
      universe.tokens
        .get(Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563'))!
        .fromDecimal('10.9733465'),
    ])

    universe.oracles.length = 0
    const prices = new Map<Token, TokenQuantity>([
      [universe.commonTokens.USDC!, usdcPrice],
      [universe.commonTokens.USDT!, universe.usd.fromDecimal('1.0')],
      [universe.commonTokens.WETH, universe.usd.fromDecimal('1750')],
    ])
    universe.oracles.push(
      new PriceOracle('Test 2', async (token) => {
        return prices.get(token) ?? null
      }, () => universe.currentBlock)
    )

    createV2Pool(
      universe,
      universe.commonTokens.WETH.fromDecimal('50'),
      universe.commonTokens
        .USDC!.fromDecimal('1750')
        .div(usdcPrice.convertTo(universe.commonTokens.USDC!))
    )

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.WETH.fromDecimal('0.1'),
      oldEUSD,
      Address.ZERO
    )
    expect(
      result.swaps.outputs.find((i) => i.token === oldEUSD)?.formatWithSymbol()
    ).toBe('183.46299635 oldEUSD')
  })

  it('rToken = (0.25 USDC, 0.75 USDT) && 1 USDC = $0.95', async () => {
    const universe = await fixture()
    const usdcPrice = universe.usd.fromDecimal('0.95')
    const rToken = createRToken(universe, 'unevenUSD', [
      universe.commonTokens.USDC!.fromDecimal('0.25'),
      universe.commonTokens.USDT!.fromDecimal('0.75'),
    ])

    createV2Pool(
      universe,
      universe.commonTokens.WETH.fromDecimal('50'),
      universe.commonTokens
        .USDC!.fromDecimal('1750')
        .div(usdcPrice.convertTo(universe.commonTokens.USDC!))
    )
    universe.oracles.length = 0
    const prices = new Map<Token, TokenQuantity>([
      [universe.commonTokens.USDC!, usdcPrice],
      [universe.commonTokens.USDT!, universe.usd.fromDecimal('1.0')],
      [universe.commonTokens.WETH, universe.usd.fromDecimal('1750')],
    ])
    universe.oracles.push(
      new PriceOracle('Test 3', async (token) => {
        return prices.get(token) ?? null
      }, () => universe.currentBlock)
    )

    const searcher = new Searcher(universe)

    const result = await searcher.findSingleInputToRTokenZap(
      universe.commonTokens.WETH.fromDecimal('0.1'),
      rToken,
      Address.ZERO
    )

    expect((await universe.fairPrice(rToken.one))!.formatWithSymbol()).toBe(
      '0.9875 USD'
    )
    expect(
      result.swaps.outputs.find((i) => i.token === rToken)?.formatWithSymbol()
    ).toBe('176.416373 unevenUSD')
  })
})
