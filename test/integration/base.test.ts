import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

import { WebSocketProvider } from '@ethersproject/providers'
import { makeCustomRouterSimulator } from '../../src.ts/configuration/ZapSimulation'
import {
  Address,
  baseConfig,
  setupBaseZapper,
  Universe,
} from '../../src.ts/index'
import {
  createActionTestCase,
  makeIntegrationtestCase,
} from '../createActionTestCase'
import { createZapTestCase } from '../createZapTestCase'
dotenv.config()

if (process.env.BASE_PROVIDER == null) {
  console.log('BASE_PROVIDER not set, skipping tests')
  process.exit(0)
}

/** !!
 * To run the integration test suite you'll need to run the simulator locally.
 *
 * You can do this by cloning the revm-router-simulater [repo](https://github.com/jankjr/revm-router-simulator)
 */
if (process.env.SIMULATE_URL_BASE == null) {
  console.log('SIMULATE_URL_BASE not set, skipping simulation tests')
  process.exit(0)
}

export const baseWhales = {
  '0xab36452dbac151be02b16ca17d8919826072f64a':
    '0x796d2367af69deb3319b8e10712b8b65957371c3', // rsr
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':
    '0x0b0a5886664376f59c351ba3f598c8a8b4d0a6f3', // usdc

  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22':
    '0x3bf93770f2d4a794c3d9ebefbaebae2a8f09a5e5', // cbeth

  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca':
    '0x0e635f8eeed4f7279d56692d552f034ece136019', // usdbc

  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb':
    '0x73b06d8d18de422e269645eace15400de7462417', // dai

  '0x4200000000000000000000000000000000000006':
    '0xd4a0e0b9149bcee3c920d2e00b5de09138fd8bb7', // weth

  '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452':
    '0x99cbc45ea5bb7ef3a5bc08fb1b7e56bb2442ef0d', // wsteth

  '0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4':
    '0x5400dbb270c956e8985184335a1c62aca6ce1333',

  // rtokens
  '0xcc7ff230365bd730ee4b352cc2492cedac49383e':
    '0xAbEaA41fd6a7464b1203b24486526b0461a5ceA4', // hyusd
  '0xcb327b99ff831bf8223cced12b1338ff3aa322ff':
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // bsdeth
  '0xfe0d6d83033e313691e96909d2188c150b834285':
    '0x1ef46018244179810dec43291d693cb2bf7f40e5', // iusdc
  '0xc9a3e2b3064c1c0546d3d0edc0a748e9f93cf18d':
    '0x6f1d6b86d4ad705385e751e6e88b0fdfdbadf298', // vaya

  '0x8f0987ddb485219c767770e2080e5cc01ddc772a':
    '0x46271115f374e02b5afe357c8e8dad474c8de1cf',
}

const getProvider = (url: string) => {
  if (url.startsWith('ws')) {
    return new ethers.providers.WebSocketProvider(url)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

const t = baseConfig.addresses.commonTokens
const rTokens = baseConfig.addresses.rTokens

const getSymbol = new Map(
  Object.entries(baseConfig.addresses.commonTokens)
    .concat(Object.entries(baseConfig.addresses.rTokens))
    .map(([k, v]) => [v, k])
)

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
const testUser = Address.from(
  process.env.TEST_USER ?? '0xF2d98377d80DADf725bFb97E91357F1d81384De2'
)
const issueanceCases = [
  makeMintTestCase(10000, t.USDC, rTokens.bsd),
  // makeMintTestCase(5, t.WETH, rTokens.bsd),
  // makeMintTestCase(50, t.WETH, rTokens.BSDX),
  // makeMintTestCase(5, t.USDC, rTokens.bsd),
  // makeMintTestCase(10000, t.USDC, rTokens.hyUSD),
  // makeMintTestCase(10000, t.USDbC, rTokens.hyUSD),
  // makeMintTestCase(10000, t.DAI, rTokens.hyUSD),
  // makeMintTestCase(5, t.WETH, rTokens.hyUSD),
  // makeMintTestCase(5, t.WETH, rTokens.bsd),
  // makeMintTestCase(5, t.wstETH, rTokens.bsd),
  // makeMintTestCase(5, t.cbETH, rTokens.bsd),
  // makeMintTestCase(10000, t.USDC, rTokens.bsd),
  // makeMintTestCase(10000, t.USDbC, rTokens.bsd),
]

const redeemCases = [
  // makeMintTestCase(10, rTokens.hyUSD, t.USDC),
  // makeMintTestCase(10, rTokens.hyUSD, t.WETH),
  // makeMintTestCase(5, rTokens.bsd, t.WETH),
  // makeMintTestCase(150, rTokens.bsd, t.USDC),
  // makeMintTestCase(150, rTokens.BSDX, t.WETH),
  makeMintTestCase(1000, rTokens.BSDX, t.WETH),
]
const individualIntegrations = [
  // makeIntegrationtestCase('Morpho eUSD', 100, t.eUSD, t.meUSD, 1),
  makeIntegrationtestCase(
    'wsAMM-eUSD/USDC',
    10000,
    t.USDC,
    t['wsAMM-eUSD/USDC'],
    2
  ),
]

const zapIntoYieldPositionCases: ReturnType<
  typeof makeZapIntoYieldPositionTestCase
>[] = []

let universe: Universe
const provider = getProvider(process.env.BASE_PROVIDER!)

beforeAll(async () => {
  global.console = require('console')
  console.log(`Setting up`)
  universe = await Universe.createWithConfig(
    provider,
    {
      ...baseConfig,
      searcherMinRoutesToProduce: 1,
      maxSearchTimeMs: 60000,
    },
    async (uni) => {
      await setupBaseZapper(uni)
    },
    {
      simulateZapFn: makeCustomRouterSimulator(
        process.env.SIMULATE_URL_BASE!,
        baseWhales
      ),
    }
  )
  console.log(`Setting up done`)

  await universe.initialized
  return universe
}, 60000)

describe('base zapper', () => {
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
      it('produces an output', async () => {
        await createZapTestCase(
          'Issueance',
          testUser,
          universe,
          testCaseName,
          {
            token: issueance.inputToken,
            amount: issueance.input,
          },
          issueance.output
        )
      }, 60000)
    })
  }

  for (const redeem of redeemCases) {
    const testCaseName = `redeem ${getSymbol.get(
      redeem.inputToken
    )!} for ${getSymbol.get(redeem.output)!}`
    describe(testCaseName, () => {
      it('produces an output', async () => {
        await createZapTestCase(
          'Redeem',
          testUser,
          universe,
          testCaseName,
          {
            token: redeem.inputToken,
            amount: redeem.input,
          },
          redeem.output
        )
      }, 60000)
    })
  }

  for (const zapIntoYieldPosition of zapIntoYieldPositionCases) {
    const testCaseName = `zap ${getSymbol.get(
      zapIntoYieldPosition.inputToken
    )!} via ${getSymbol.get(zapIntoYieldPosition.rToken)!} into ${getSymbol.get(
      zapIntoYieldPosition.output
    )!} yield position`
    describe(testCaseName, () => {
      it('produces an output', async () => {
        expect.assertions(1)
        await universe.initialized
        await universe.updateBlockState(
          await universe.provider.getBlockNumber(),
          (await universe.provider.getGasPrice()).toBigInt()
        )

        const input = universe.tokens
          .get(zapIntoYieldPosition.inputToken)
          ?.from(zapIntoYieldPosition.input)
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
      }, 60000)
    })
  }
})

afterAll(() => {
  ;(universe.provider as WebSocketProvider).websocket.close()
})
