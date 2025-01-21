import * as dotenv from 'dotenv'
import fs from 'fs'

import { WebSocketProvider } from '@ethersproject/providers'
import { makeCustomRouterSimulator } from '../../src.ts/configuration/ZapSimulation'
import {
  Address,
  baseConfig,
  setupBaseZapper,
  TokenQuantity,
  Universe,
} from '../../src.ts/index'
import {
  createActionTestCase,
  makeIntegrationtestCase,
} from '../createActionTestCase'
import { createZapTestCase } from '../createZapTestCase'
import { DefaultMap } from '../../src.ts/base/DefaultMap'
import { getDefaultSearcherOptions } from '../../src.ts/configuration/ChainConfiguration'
import { getProvider } from './providerUtils'
import { ONE } from '../../src.ts/action/Action'
dotenv.config()

if (process.env.BASE_PROVIDER == null) {
  console.log('BASE_PROVIDER not set, skipping tests')
  process.exit(0)
}

const searcherOptions = {
  ...getDefaultSearcherOptions(),
  searcherMinRoutesToProduce: 1,
  maxSearchTimeMs: 60000,
  optimisationSteps: 15,
  minimiseDustPhase1Steps: 10,
  minimiseDustPhase2Steps: 10,
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

  '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452':
    '0x99cbc45ea5bb7ef3a5bc08fb1b7e56bb2442ef0d', // wsteth

  '0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4':
    '0x5400dbb270c956e8985184335a1c62aca6ce1333',
}

const t = baseConfig.addresses.commonTokens
const rTokens = baseConfig.addresses.rTokens

const getSymbol = new Map(
  Object.entries(baseConfig.addresses.commonTokens)
    .concat(Object.entries(baseConfig.addresses.rTokens))
    .map(([k, v]) => [v, k])
)

const makeTestCase = (input: number, inputToken: Address, output: Address) => {
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
  makeTestCase(10000, t.USDC, rTokens.bsd),
  // makeTestCase(100, t.WETH, rTokens.bsd),
  // makeTestCase(10000, t.USDC, rTokens.hyUSD),
  // makeTestCase(10000, t.USDbC, rTokens.hyUSD),
  // makeTestCase(10000, t.DAI, rTokens.hyUSD),
  // makeTestCase(5, t.WETH, rTokens.hyUSD),

  // makeMintTestCase(50, t.WETH, rTokens.BSDX),
]

const redeemCases = [
  makeTestCase(50, rTokens.bsd, t.WETH),
  // makeTestCase(50, rTokens.hyUSD, t.USDC),

  makeTestCase(100000, rTokens.hyUSD, t.WETH),
  makeTestCase(100000, rTokens.hyUSD, t.USDbC),
  makeTestCase(100000, rTokens.hyUSD, t.DAI),
  makeTestCase(100000, rTokens.hyUSD, t.USDC),

  // makeTestCase(10000, rTokens.BSDX, t.WETH),
]
const individualIntegrations = [
  makeIntegrationtestCase('Morpho eUSD', 100, t.eUSD, t.meUSD, 1),
  makeIntegrationtestCase(
    'wsAMM-eUSD/USDC',
    10000,
    t.USDC,
    t['wsAMM-eUSD/USDC'],
    2
  ),
]

const basket = (str: string) => {
  return str
    .replace(/(  +)/g, ' ')
    .replace(/, /g, ',')
    .split(',')
    .map((pair) => {
      const [num, tok] = pair.split(' ')
      return [Number(num), t[tok]] as [number, Address]
    })
}
const makeFolioTestCase = (
  input: number,
  inputToken: Address,
  basket: [number, Address][]
) => {
  return {
    name: `folio ${input} ${getSymbol.get(inputToken)} -> ${basket
      .map(([num, tok]) => `${num} ${getSymbol.get(tok)}`)
      .join(',')}`,
    input,
    inputToken,
    basket,
  }
}

const folioTests = [
  makeFolioTestCase(
    10,
    t.WETH,
    basket(
      '0.6067 Virtuals, 0.1258 aiXBT, 0.1004 Freysa, 0.0383 GAME, 0.0329 Cookie, 0.0246 Rei, 0.0218 Toshi, 0.0199 VaderAI, 0.0149 Luna, 0.0146 Henlo'
    )
  ),
]

const folioConfig = (
  name: string,
  symbol: string,
  outputs: TokenQuantity[]
) => ({
  stToken: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  basicDetails: {
    assets: outputs.map((t) => t.token.address.address),
    amounts: outputs.map((t) => t.amount),
    name,
    symbol,
    initialShares: ONE,
  },
  additionalDetails: {
    tradeDelay: 20n * 60n,
    auctionLength: 20n * 60n,
    feeRecipients: [],
    folioFee: 0n,
    mintingFee: 0n,
  },
  ownerGovParams: {
    votingDelay: 20n * 60n,
    votingPeriod: 20n * 60n,
    proposalThreshold: ONE / 100n,
    quorumPercent: (ONE / 100n) * 20n,
    timelockDelay: 20n * 60n,
    guardian: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  },
  tradingGovParams: {
    votingDelay: 20n * 60n,
    votingPeriod: 20n * 60n,
    proposalThreshold: ONE / 100n,
    quorumPercent: (ONE / 100n) * 20n,
    timelockDelay: 20n * 60n,
    guardian: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  },
  tradeLaunchers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  vibesOfficers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  existingTradeProposers: [],
})

const zapIntoYieldPositionCases: ReturnType<
  typeof makeZapIntoYieldPositionTestCase
>[] = []

let universe: Universe
const provider = getProvider(process.env.BASE_PROVIDER!)

let requestCount = 0
let initialized = false
const dupRequestCounter = new DefaultMap<string, number>(() => 0)

provider.on('debug', (log) => {
  if (log.action === 'response') {
  } else if (log?.action == 'request') {
    requestCount += 1
  }

  // if (initialized) {
  //   const req =
  //     log.request.params[0].to + ':' + (log.request.params[0].data ?? '')
  //   dupRequestCounter.get(req)
  //   dupRequestCounter.set(req, dupRequestCounter.get(req) + 1)
  // }
})
provider.on('error', (e) => {
  console.log(e)
})
const emitReqCount = (msg?: string, dups?: boolean) => {
  if (requestCount > 0) {
    console.log(`${msg} Request count: ${requestCount}`)
    requestCount = 0

    if (dups) {
      for (const [req, count] of dupRequestCounter.entries()) {
        if (count > 1) {
          console.log(`${req} count: ${count}`)
        }
      }
    }
  }
  dupRequestCounter.clear()
}
beforeAll(async () => {
  try {
    global.console = require('console')
    console.log(`Setting up`)
    universe = await Universe.createWithConfig(
      provider,
      {
        ...baseConfig,
        ...searcherOptions,
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

    emitReqCount('Initialized')
    initialized = true
    return universe
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}, 60000)

describe('base zapper', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await provider.getBlockNumber(),
      (await provider.getGasPrice()).toBigInt()
    )
  })

  describe('folio', () => {
    for (const testCase of folioTests) {
      describe(testCase.name, () => {
        it('produces the basket graph', async () => {
          expect.assertions(1)
          try {
            const token = await universe.getToken(testCase.inputToken)
            const targetBasket = await Promise.all(
              testCase.basket.map(async ([num, tok]) => {
                const t = await universe.getToken(tok)
                const tokenPrice = await t.price
                return tokenPrice.mul(t.from(num))
              })
            )
            const out = await universe.deployZap(
              token.from(testCase.input),
              testUser,
              folioConfig('AIBS', 'AI Basket', targetBasket)
            )
            console.log(out.toString())
            expect(true).toBe(true)
          } catch (e) {
            console.error(e)
            expect(true).toBe(false)

            throw e
          }
        }, 60000)
      })
    }
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
        emitReqCount(testCaseName, true)
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
        emitReqCount(testCaseName, true)
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
  if (universe.provider instanceof WebSocketProvider) {
    ;(universe.provider as WebSocketProvider).destroy()
  }
})
