import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

import { WebSocketProvider } from '@ethersproject/providers'
import {
  convertAddressObject,
  makeCustomRouterSimulator,
} from '../../src.ts/configuration/ChainConfiguration'
import {
  Address,
  createEnso,
  createKyberswap,
  createParaswap,
  ethereumConfig,
  ethereumProtocolConfigs,
  setupEthereumZapper,
  Universe,
} from '../../src.ts/index'
import {
  createActionTestCase,
  makeIntegrationtestCase,
} from '../createActionTestCase'
import { createZapTestCase } from '../createZapTestCase'
dotenv.config()

if (process.env.MAINNET_PROVIDER == null) {
  console.log('MAINNET_PROVIDER not set, skipping tests')
  process.exit(0)
}
/** !!
 * To run the integration test suite you'll need to run the simulator locally.
 *
 * You can do this by cloning the revm-router-simulater [repo](https://github.com/jankjr/revm-router-simulator)
 */
if (process.env.SIMULATE_URL == null) {
  console.log('SIMULATE_URL not set, skipping simulation tests')
  process.exit(0)
}
const TEST_TIMEOUT = 60000
export const ethWhales = {
  // stETH
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84':
    '0x93c4b944d05dfe6df7645a86cd2206016c51564d',
  // USDe
  '0x4c9edd5852cd905f086c759e8383e09bff1e68b3':
    '0x88a1493366d48225fc3cefbdae9ebb23e323ade3',
  '0x320623b8e4ff03373931769a31fc52a4e78b5d70':
    '0x0774df07205a5e9261771b19afa62b6e757f7ef8', // rsr
  // wsteth
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0':
    '0x0b925ed163218f6662a35e0f0371ac234f9e9371',
  // reth
  '0xae78736cd615f374d3085123a210448e74fc6393':
    '0xcc9ee9483f662091a1de4795249e24ac0ac2630f',
  // sfrxeth
  '0xac3e018457b222d93114458476f3e3416abbe38f':
    '0x78bb3aec3d855431bd9289fd98da13f9ebb7ef15',
  // frxeth
  '0x5e8422345238f34275888049021821e8e08caa1f':
    '0x36cb65c1967a0fb0eee11569c51c2f2aa1ca6f6d',
  // weth
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2':
    '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
  // dai
  '0x6b175474e89094c44da98b954eedeac495271d0f':
    '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
  // wbtc
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599':
    '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
  // usdt
  '0xdac17f958d2ee523a2206206994597c13d831ec7':
    '0xf977814e90da44bfa03b6295a0616a897441acec',
  // usdc
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
    '0xd6153f5af5679a75cc85d8974463545181f48772',
  // mim
  '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3':
    '0x25431341a5800759268a6ac1d3cd91c029d7d9ca',
  // frax
  '0x853d955acef822db058eb8505911ed77f175b99e':
    '0x267fc49a3170950ee5d49ef84878695c29cca1e0',
  // eusd
  '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f':
    '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
  // eth+
  '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8':
    '0x7cc1bfAB73bE4E02BB53814d1059A98cF7e49644',
  // hyusd
  '0xacdf0dba4b9839b96221a8487e9ca660a48212be':
    '0x7cc1bfAB73bE4E02BB53814d1059A98cF7e49644',
  // usdc+
  '0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b':
    '0xf2b25362a03f6eacca8de8d5350a9f37944c1e59',
  // usd3
  '0x0d86883faf4ffd7aeb116390af37746f45b6f378':
    '0x7cc1bfab73be4e02bb53814d1059a98cf7e49644',
  // pyusd
  '0x6c3ea9036406852006290770bedfcaba0e23a0e8':
    '0xa5588f7cdf560811710a2d82d3c9c99769db1dcb',
  // rgusd
  '0x78da5799cf427fee11e9996982f4150ece7a99a7':
    '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
  // degeneth
  '0x005f893ecd7bf9667195642f7649da8163e23658':
    '0x5bdd1fa233843bfc034891be8a6769e58f1e1346',

  // pxeth
  '0x04c154b66cb340f3ae24111cc767e0184ed00cc6':
    '0x40e93a52f6af9fcd3b476aedadd7feabd9f7aba8',
}

const getProvider = (url: string) => {
  if (url.startsWith('ws')) {
    return new ethers.providers.WebSocketProvider(url)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

const t = {
  ...ethereumConfig.addresses.commonTokens,
  ...convertAddressObject(ethereumProtocolConfigs.compV3.comets),
  ...convertAddressObject(ethereumProtocolConfigs.convex.wrappers),
}
const rTokens = ethereumConfig.addresses.rTokens

export const getSymbol = new Map(
  Object.entries(t)
    .concat(Object.entries(ethereumConfig.addresses.rTokens))
    .map(([k, v]) => [v, k])
)
getSymbol.set(Address.from('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'), 'ETH')

const makeMintTestCase = (
  input: number,
  inputToken: Address,
  output: Address
) => {
  return {
    input,
    inputToken,
    output: output,
  }
}

const makeZapIntoYieldPositionTestCase = (
  input: number,
  inputToken: Address,
  rToken: Address,
  output: Address
) => {
  return {
    input,
    inputToken,
    rToken,
    output: output,
  }
}
export const testUser = Address.from(
  '0xF2d98377d80DADf725bFb97E91357F1d81384De2'
)
const issueanceCases = [
  makeMintTestCase(10000, t.USDC, rTokens.eUSD),
  makeMintTestCase(10000, t.DAI, rTokens.eUSD),
  makeMintTestCase(10000, t.USDT, rTokens.eUSD),

  makeMintTestCase(10000, t.USDC, rTokens.USD3),
  makeMintTestCase(10000, t.DAI, rTokens.USD3),

  makeMintTestCase(
    5,
    Address.from('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'),
    rTokens['ETH+']
  ),
  makeMintTestCase(5, t.WETH, rTokens['ETH+']),
  makeMintTestCase(5, t.steth, rTokens['ETH+']),
  makeMintTestCase(5, t.reth, rTokens['ETH+']),
  makeMintTestCase(5, t.frxeth, rTokens['ETH+']),
  makeMintTestCase(5, t.sfrxeth, rTokens['ETH+']),
  makeMintTestCase(10000, t.USDC, rTokens['ETH+']),

  makeMintTestCase(10000, t.USDC, rTokens.hyUSD),
  makeMintTestCase(10000, t.USDe, rTokens.hyUSD),
  makeMintTestCase(10000, t.DAI, rTokens.hyUSD),

  makeMintTestCase(5, t.WETH, rTokens.dgnETH),
  makeMintTestCase(5, t.pxETH, rTokens.dgnETH),
  makeMintTestCase(10000, t.USDC, rTokens.dgnETH),
  makeMintTestCase(10000, t.USDT, rTokens.dgnETH),
]

const redeemCases = [
  makeMintTestCase(10000, rTokens.eUSD, t.USDC),
  makeMintTestCase(10000, rTokens.eUSD, t.DAI),
  makeMintTestCase(10000, rTokens.eUSD, t.USDT),

  makeMintTestCase(10000, rTokens.USD3, t.USDC),
  makeMintTestCase(10000, rTokens.USD3, t.DAI),

  makeMintTestCase(5, rTokens['ETH+'], t.WETH),
  makeMintTestCase(5, rTokens['ETH+'], t.reth),
  makeMintTestCase(5, rTokens['ETH+'], t.frxeth),
  makeMintTestCase(5, rTokens['ETH+'], t.USDC),

  makeMintTestCase(10000, rTokens.hyUSD, t.USDC),
  makeMintTestCase(10000, rTokens.hyUSD, t.USDe),
  makeMintTestCase(10000, rTokens.hyUSD, t.DAI),

  makeMintTestCase(5, rTokens.dgnETH, t.WETH),
  makeMintTestCase(5, rTokens.dgnETH, t.USDC),
]

const individualIntegrations = [
  makeIntegrationtestCase('CompoundV2', 1000, t.USDC, t.cUSDC, 1),
  makeIntegrationtestCase('CompoundV2', 1000, t.USDT, t.cUSDT, 1),
  makeIntegrationtestCase('sDAI', 1000, t.DAI, t.sDAI, 1),

  makeIntegrationtestCase('CompoundV3', 1000, t.USDC, t.CUSDCV3, 2),
  makeIntegrationtestCase('CompoundV3', 1000, t.USDT, t.CUSDTV3, 2),
  makeIntegrationtestCase('Lido', 10, t.WETH, t.wsteth, 3),
  makeIntegrationtestCase('Lido', 10, t.WETH, t.steth, 2),
  makeIntegrationtestCase('Lido', 10, t.wsteth, t.steth, 1),

  makeIntegrationtestCase('Reth', 10, t.WETH, t.reth, 2),
  makeIntegrationtestCase('ETHx', 10, t.WETH, t.ETHx, 2),
]

const zapIntoYieldPositionCases = [
  makeZapIntoYieldPositionTestCase(5, t.WETH, rTokens.dgnETH, t.sdgnETH),
  makeZapIntoYieldPositionTestCase(5, t.WETH, rTokens['ETH+'], t['ETH+ETH-f']),
  makeZapIntoYieldPositionTestCase(
    10,
    t.WETH,
    rTokens['ETH+'],
    t['mooConvexETH+']
  ),
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['sdETH+ETH-f']
  ),
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['yvCurve-ETH+-f']
  ),
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['consETHETH-f']
  ),
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['stkcvxETH+ETH-f']
  ),
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['cvxETH+ETH-f']
  ),
]

const INPUT_MUL = process.env.INPUT_MULTIPLIER
  ? parseFloat(process.env.INPUT_MULTIPLIER)
  : 1.0
if (isNaN(INPUT_MUL)) {
  throw new Error('INPUT_MUL must be a number')
}
export let universe: Universe
const provider = getProvider(process.env.MAINNET_PROVIDER!)
beforeAll(async () => {
  universe = await Universe.createWithConfig(
    provider,
    {
      ...ethereumConfig,
      searcherMinRoutesToProduce: 1,
      maxSearchTimeMs: 60000,
    },
    async (uni) => {
      uni.addTradeVenue(createKyberswap('Kyber', uni))
      uni.addTradeVenue(createParaswap('paraswap', uni))
      uni.addTradeVenue(createEnso('enso', uni, 1))

      await setupEthereumZapper(uni)
    },
    {
      simulateZapFn: makeCustomRouterSimulator(
        process.env.SIMULATE_URL!,
        ethWhales
      ),
    }
  )

  await universe.initialized
  return universe
}, 30000)

describe('ethereum zapper', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await provider.getBlockNumber(),
      (await provider.getGasPrice()).toBigInt()
    )
  })

  describe('actions', () => {
    for (const testCase of individualIntegrations) {
      createActionTestCase(() => universe, getSymbol, testUser, testCase)
    }
  })

  for (const issueance of issueanceCases) {
    const testCaseName = `using ${getSymbol.get(
      issueance.inputToken
    )!} issue ${getSymbol.get(issueance.output)!}`
    describe(testCaseName, () => {
      it(
        'produces an output',
        async () => {
          await createZapTestCase(
            'Issueance',
            testUser,
            universe,
            testCaseName,
            {
              token: issueance.inputToken,
              amount: issueance.input * INPUT_MUL,
            },
            issueance.output
          )
        },
        TEST_TIMEOUT
      )
    })
  }

  for (const redeem of redeemCases) {
    const testCaseName = `redeem ${getSymbol.get(
      redeem.inputToken
    )!} for ${getSymbol.get(redeem.output)!}`
    describe(testCaseName, () => {
      it(
        'produces an output',
        async () => {
          await createZapTestCase(
            'Redeem',
            testUser,
            universe,
            testCaseName,
            {
              token: redeem.inputToken,
              amount: redeem.input * INPUT_MUL,
            },
            redeem.output
          )
        },
        TEST_TIMEOUT
      )
    })
  }

  for (const zapIntoYieldPosition of zapIntoYieldPositionCases) {
    const testCaseName = `zap ${getSymbol.get(
      zapIntoYieldPosition.inputToken
    )!} via ${getSymbol.get(zapIntoYieldPosition.rToken)!} into ${getSymbol.get(
      zapIntoYieldPosition.output
    )!} yield position`
    describe(testCaseName, () => {
      it(
        'produces an output',
        async () => {
          expect.assertions(1)
          await universe.initialized
          await universe.updateBlockState(
            await universe.provider.getBlockNumber(),
            (await universe.provider.getGasPrice()).toBigInt()
          )

          const input = universe.tokens
            .get(zapIntoYieldPosition.inputToken)
            ?.from(zapIntoYieldPosition.input * INPUT_MUL)
          const rToken = universe.tokens.get(zapIntoYieldPosition.rToken)
          const output = universe.tokens.get(zapIntoYieldPosition.output)
          let result = 'failed'

          try {
            const zap = await universe.searcher.zapIntoRTokenYieldPosition(
              input!,
              rToken!,
              output!,
              testUser
            )
            console.info(`Yield position zap: ${zap}`)
            result = 'success'
          } catch (e) {
            console.info(`${testCaseName} = ${e.message}`)
          }
          expect(result).toBe('success')
        },
        TEST_TIMEOUT
      )
    })
  }
})

afterAll(() => {
  ;(provider as WebSocketProvider).websocket.close()
})
