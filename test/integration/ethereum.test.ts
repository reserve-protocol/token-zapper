import * as dotenv from 'dotenv'
import fs from 'fs'

import { WebSocketProvider } from '@ethersproject/providers'
import {
  convertAddressObject,
  getDefaultSearcherOptions,
  SearcherOptions,
} from '../../src.ts/configuration/ChainConfiguration'
import { EthereumUniverse } from '../../src.ts/configuration/ethereum'
import {
  Address,
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
import { getProvider, getSimulator } from './providerUtils'
dotenv.config()

const searcherOptions: SearcherOptions = {
  ...getDefaultSearcherOptions(),
  useNewZapperContract: false,
  cacheResolution: 8,
  zapMaxDustProduced: 3,
  maxPhase2TimeRefinementTime: 10000,
  optimisationSteps: 35,
  minimiseDustPhase1Steps: 35,
  minimiseDustPhase2Steps: 35,
}

if (process.env.MAINNET_PROVIDER == null) {
  console.log('MAINNET_PROVIDER not set, skipping tests')
  process.exit(0)
}
/** !!
 * To run the integration test suite you'll need to run the simulator locally.
 *
 * You can do this by cloning the revm-router-simulater [repo](https://github.com/jankjr/revm-router-simulator)
 */
if (process.env.SIMULATE_URL_MAINNET == null) {
  console.log('SIMULATE_URL_MAINNET not set, skipping simulation tests')
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
    '0x28c6c06298d514db089934071355e5743bf21d60',
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
    '0xfbd42e965a2db2035636aeb41e1a54dbcc1cf1da',
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

  '0x78fc2c2ed1a4cdb5402365934ae5648adad094d0':
    '0xa6B1C84133479e41d8d085005476DD007A50Be66',
  '0xdbc0ce2321b76d3956412b36e9c0fa9b0fd176e7':
    '0x1d9dd2ed88fd1284b73af0b720fe50a383710f46',

  '0xe8a5677171c87fCB65b76957f2852515B404C7b1':
    '0x298bf7b80a6343214634aF16EB41Bb5B9fC6A1F1',
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

const makeTestCase = (input: number, inputToken: Address, output: Address) => {
  return {
    input,
    inputToken,
    output: output,
  }
}

const simulateFn = getSimulator(
  process.env.SIMULATE_URL_MAINNET!,
  process.env.SIMULATE_TYPE === 'callmany' ? 'callmany' : 'simulator',
  ethWhales
)

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
export const testUser = process.env.TEST_USER
  ? Address.from(process.env.TEST_USER)
  : Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2')

const issueanceCases = [
  makeTestCase(10000, t.USDC, rTokens.dgnETH),
  // makeTestCase(100000, t.DAI, rTokens.eUSD),
  // makeTestCase(1000000, t.USDT, rTokens.eUSD),
  // makeTestCase(1000000, t.USDC, rTokens.USD3),
  // makeTestCase(1000000, t.USDT, rTokens.USD3),
  // makeTestCase(1000000, t.DAI, rTokens.USD3),
  // makeTestCase(1, t.WETH, rTokens['ETH+']),
  // makeTestCase(0.70133, t['stkcvxETH+ETH-f'], t.Re7WETH),
  // makeTestCase(1000, t.WETH, rTokens['ETH+']),
  // makeTestCase(10, t.WETH, rTokens.hyUSD),
  // makeTestCase(10000, t.USDC, rTokens.hyUSD),
  // makeTestCase(10000, t.DAI, rTokens.hyUSD),
  // makeTestCase(10000, t.USDT, rTokens.hyUSD),
  // makeTestCase(50, t.WETH, rTokens.dgnETH),
  // makeTestCase(10000, t.USDC, rTokens.dgnETH),

  // makeTestCase(330, t.pxETH, t['stkcvxETH+ETH-f']),
]

const redeemCases = [
  makeTestCase(200000, rTokens.eUSD, t.USDC),
  makeTestCase(10000, rTokens.eUSD, t.USDC),
  makeTestCase(10000, rTokens.eUSD, t.DAI),
  makeTestCase(10000, rTokens.eUSD, t.WETH),
  makeTestCase(10000, rTokens.eUSD, t.USDT),

  makeTestCase(10000, rTokens.USD3, t.USDC),
  makeTestCase(10000, rTokens.USD3, t.WETH),
  makeTestCase(10000, rTokens.USD3, t.DAI),

  makeTestCase(10000, rTokens.hyUSD, t.USDC),
  makeTestCase(10000, rTokens.hyUSD, t.WETH),
  makeTestCase(10000, rTokens.hyUSD, t.DAI),

  makeTestCase(5, rTokens['ETH+'], t.WETH),
  // makeTestCase(5, rTokens['ETH+'], t.reth),
  // makeTestCase(5, rTokens['ETH+'], t.frxeth),
  makeTestCase(5, rTokens['ETH+'], t.USDC),

  makeTestCase(5, rTokens.dgnETH, t.WETH),
  makeTestCase(5, rTokens.dgnETH, t.USDC),
  makeTestCase(5, rTokens.dgnETH, t.USDT),
]

const individualIntegrations = [
  makeIntegrationtestCase('CompoundV2', 1000, t.USDC, t.cUSDC, 1),
  makeIntegrationtestCase('CompoundV2', 1000, t.USDT, t.cUSDT, 1),
  makeIntegrationtestCase('sDAI', 1000, t.DAI, t.sDAI, 1),

  makeIntegrationtestCase('CompoundV3', 1000, t.USDC, t.CUSDCV3, 2),
  makeIntegrationtestCase('CompoundV3', 1000, t.USDT, t.CUSDTV3, 2),
  // makeIntegrationtestCase('Lido', 10, t.WETH, t.wsteth, 3),
  makeIntegrationtestCase('Lido', 10, t.WETH, t.steth, 2),
  // makeIntegrationtestCase('Lido', 10, t.wsteth, t.steth, 1),

  makeIntegrationtestCase('Reth', 10, t.WETH, t.reth, 2),
  makeIntegrationtestCase('ETHx', 10, t.WETH, t.ETHx, 2),
  makeIntegrationtestCase('sUSDS', 1000, t.USDS, t.sUSDS, 1),
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
  makeZapIntoYieldPositionTestCase(
    5,
    t.WETH,
    rTokens['ETH+'],
    t['crvETH+ETH-f']
  ),
]

const INPUT_MUL = process.env.INPUT_MULTIPLIER
  ? parseFloat(process.env.INPUT_MULTIPLIER)
  : 1.0
if (isNaN(INPUT_MUL)) {
  throw new Error('INPUT_MUL must be a number')
}
let universe: EthereumUniverse
let requestCount = 0

const provider = getProvider(process.env.MAINNET_PROVIDER!)
provider.on('debug', (log) => {
  if (
    log?.action !== 'request' ||
    log?.request?.method !== 'eth_call' ||
    log?.request?.params[0].to == null ||
    log?.request?.params[0].data == null
  ) {
    return
  }
  requestCount += 1
  // console.log(
  //   log.request.params[0].to + ':' + log.request.params[0].data?.slice(0, 10)
  // )
})
beforeAll(async () => {
  global.console = require('console')
  try {
    universe = (await Universe.createWithConfig(
      provider,
      {
        ...ethereumConfig,
        ...searcherOptions,
      },
      async (uni) => {
        await setupEthereumZapper(uni as any)
      },
      {
        simulateZapFn: simulateFn,
      }
    )) as any

    await universe.initialized
    console.log('Ethereum zapper setup complete')
    const tokens = [...universe.tokens.values()].map((i) => i.toJson())
    fs.writeFileSync(
      'src.ts/configuration/data/ethereum/tokens.json',
      JSON.stringify(tokens, null, 2)
    )
    console.log(`requestCount init: ${requestCount}`)
    requestCount = 0
    return universe
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}, 60000)

describe('ethereum zapper', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await provider.getBlockNumber(),
      (await provider.getGasPrice()).toBigInt()
    )
  })

  // describe('path', () => {
  //   it('test', async () => {
  //     const input = universe.commonTokens.USDT.from(66666)

  //     const quote = await universe.dexLiquidtyPriceStore.getBestQuotePath(
  //       input,
  //       universe.commonTokens.USDC
  //     )

  //     for (const step of quote.steps) {
  //       console.log(`${step.input}`)
  //       for (let i = 0; i < step.splits.length; i++) {
  //         const action = step.actions[i]
  //         const split = step.splits[i]
  //         console.log(`  ${split} ${action.inputToken[0]} -> ${action}`)
  //       }
  //     }
  //     console.log(quote.output.toString())
  //   }, 60000)
  // })

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
          console.log(`requestCount: ${requestCount}`)
          requestCount = 0
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
          const output = universe.tokens.get(zapIntoYieldPosition.output)
          let result = 'failed'

          try {
            const zap = await universe.zap(input!, output!, testUser)
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

afterAll(async () => {
  if ('destroy' in provider) {
    await (provider as WebSocketProvider).destroy()
  }
})
