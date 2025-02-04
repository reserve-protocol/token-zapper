import * as dotenv from 'dotenv'
import fs from 'fs'

import { WebSocketProvider } from '@ethersproject/providers'
import {
  Address,
  baseConfig,
  BaseUniverse,
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
import {
  getDefaultSearcherOptions,
  SearcherOptions,
} from '../../src.ts/configuration/ChainConfiguration'
import { getProvider, getSimulator } from './providerUtils'
import { ONE } from '../../src.ts/action/Action'
import { bestPath } from '../../src.ts/exchange-graph/BFS'
import { DeployFolioConfigJson } from '../../src.ts/action/DeployFolioConfig'
dotenv.config()

if (process.env.BASE_PROVIDER == null) {
  console.log('BASE_PROVIDER not set, skipping tests')
  process.exit(0)
}

const searcherOptions: SearcherOptions = {
  ...getDefaultSearcherOptions(),

  cacheResolution: 8,
  maxPhase2TimeRefinementTime: 10000,
  optimisationSteps: 35,
  minimiseDustPhase1Steps: 35,
  minimiseDustPhase2Steps: 35,
  zapMaxDustProduced: 10,
  useNewZapperContract: true,
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

  '0xcc7ff230365bd730ee4b352cc2492cedac49383e':
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // hyusd
  '0xcb327b99ff831bf8223cced12b1338ff3aa322ff':
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // bsdeth
  '0xfe0d6d83033e313691e96909d2188c150b834285':
    '0x1ef46018244179810dec43291d693cb2bf7f40e5', // iusdc
  '0xc9a3e2b3064c1c0546d3d0edc0a748e9f93cf18d':
    '0x6f1d6b86d4ad705385e751e6e88b0fdfdbadf298', // vaya
  '0x8f0987ddb485219c767770e2080e5cc01ddc772a':
    '0x46271115F374E02b5afe357C8E8Dad474c8DE1cF', // BSDX
}

const simulateFn = getSimulator(
  process.env.SIMULATE_URL_BASE!,
  process.env.SIMULATE_TYPE === 'callmany' ? 'callmany' : 'simulator',
  baseWhales
)

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
  makeTestCase(10, t.WETH, rTokens.bsd),
  // makeTestCase(10000, t.USDC, rTokens.bsd),

  // makeTestCase(10000, t.USDC, rTokens.hyUSD),
  // makeTestCase(10000, t.USDbC, rTokens.hyUSD),

  // makeTestCase(5, t.WETH, rTokens.hyUSD),
  makeTestCase(10, t.WETH, rTokens.BSDX),
  // makeTestCase(10000, t.USDC, rTokens.BSDX),
]

const redeemCases = [
  makeTestCase(50, rTokens.bsd, t.WETH),
  makeTestCase(50, rTokens.hyUSD, t.USDC),

  makeTestCase(100000, rTokens.hyUSD, t.WETH),
  makeTestCase(100000, rTokens.hyUSD, t.USDC),

  makeTestCase(10000, rTokens.BSDX, t.WETH),
  makeTestCase(10000, rTokens.BSDX, t.USDC),
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
      return [parseFloat(num), t[tok]] as [number, Address]
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
    0.25,
    t.WETH,
    basket(
      '0.6067 Virtuals, 0.1258 aixCB, 0.1004 Freysa, 0.0383 GAME, 0.0329 Cookie, 0.0246 Rei, 0.0218 Toshi, 0.0199 VaderAI, 0.0295 Luna'
    )
  ),
]

const folioTests2 = [
  {
    tokenIn: '0x4200000000000000000000000000000000000006',
    amountIn: '10000000000000000',
    signer: '0xF2d98377d80DADf725bFb97E91357F1d81384De2',
    slippage: 100,
    stToken: '0x6f91c0eD0e5a761Df28b79c096119F64480221F3',
    basicDetails: {
      name: 'asdsad',
      symbol: 'sadsad',
      assets: [
        '0x06abb84958029468574b28b6e7792a770ccaa2f6',
        '0x8feef9f0ffa554e51220a3391e7bb7560526a72a',
        '0x352b850b733ab8bab50aed1dab5d22e3186ce984',
        '0x135fa55546758cf398da675a064f39d215ab1ff6',
        '0xd727e37dccd5720d1e3849606d3ab669cb68c368',
        '0x0b3ae50babe7ffa4e1a50569cee6bdefd4ccaee0',
        '0x8c23e759ca0822beeff603bacaceb16d84e9a1cf',
        '0x09579452bc3872727a5d105f342645792bb8a82b',
        '0x79dacb99a8698052a9898e81fdf883c29efb93cb',
        '0x8888888888f004100c0353d657be6300587a6ccd',
        '0x6948de89f535ed4a3b07122be0fe1ae65d527c03',
        '0x99fd6b95bef16079398426f94f9faca4d7570c61',
        '0xfad8cb754230dbfd249db0e8eccb5142dd675a0d',
        '0xf3708859c178709d5319ad5405bc81511b72b9e9',
        '0xb34457736aa191ff423f84f5d669f68b231e6c4e',
        '0x919e43a2cce006710090e64bde9e01b38fd7f32f',
        '0x39d24405ca717ef841e4a782da97284cf2dc7628',
        '0x92dc4ab92eb16e781559e612f349916988013d5a',
        '0xcd5d8cacd9222075a24f6e80ada93882202fe0f6',
        '0xd98832e8a59156acbee4744b9a94a9989a728f36',
      ],
      amounts: [
        '30875885540157860000',
        '30483329386260397000',
        '14185313663157686000',
        '105825451069238570000',
        '2343163952728260500000',
        '38703262995238450000',
        '1056898221441104200000',
        '86392314567',
        '1828472008442278000',
        '102646364518689390',
        '31272924108832964000',
        '273736424452633900000',
        '2644597636905765000',
        '422055777304598900000',
        '231381409022079450000',
        '16127648875166212000',
        '389446568152834000000',
        '2022176509704421000',
        '11493777128953242000',
        '303491377458842000',
      ],
    },
    additionalDetails: {
      tradeDelay: '86400',
      auctionLength: '1800',
      feeRecipients: [
        {
          recipient: '0x18846441bEE474529444C10F119e0B4a7C60aCbb',
          portion: 125000000000000100n,
        },
        {
          recipient: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
          portion: 874999999999999900n,
        },
      ],
      folioFee: '20000000000000000',
      mintingFee: '5000000000000000',
      mandate: 'qweqwe',
    },
    ownerGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
    },
    tradingGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
    },
    existingTradeProposers: [],
    tradeLaunchers: [],
    vibesOfficers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  },
]

const governedDeployConfig = (
  name: string,
  symbol: string,
  outputs: TokenQuantity[]
): DeployFolioConfigJson => ({
  type: 'governed' as const,
  stToken: '0x18846441bEE474529444C10F119e0B4a7C60aCbb',
  basicDetails: {
    assets: outputs.map((t) => t.token.address.address),
    amounts: outputs.map((t) => t.amount),
    name,
    symbol,
  },

  additionalDetails: {
    tradeDelay: 900n,
    auctionLength: 900n,
    feeRecipients: [
      {
        recipient: '0x18846441bEE474529444C10F119e0B4a7C60aCbb',
        portion: 125000000000000100n,
      },
      {
        recipient: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
        portion: 874999999999999900n,
      },
    ],
    folioFee: 0n,
    mandate: 'Foobar',
    mintingFee: 500000000000000n,
  },
  ownerGovParams: {
    votingDelay: 21n * 60n,
    votingPeriod: 20n * 60n,
    proposalThreshold: ONE / 100n,
    quorumPercent: 20n,
    timelockDelay: 20n * 60n,
    guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  },
  tradingGovParams: {
    votingDelay: 20n * 60n,
    votingPeriod: 20n * 60n,
    proposalThreshold: ONE / 100n,
    quorumPercent: 20n,
    timelockDelay: 20n * 60n,
    guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  },
  tradeLaunchers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  vibesOfficers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  existingTradeProposers: [],
})

const zapIntoYieldPositionCases: ReturnType<
  typeof makeZapIntoYieldPositionTestCase
>[] = []

let universe: BaseUniverse
const provider = getProvider(
  process.env.BASE_PROVIDER!,
  process.env.THROTTLE ? parseInt(process.env.THROTTLE, 10) : Infinity
)

let requestCount = 0
let initialized = false
const dupRequestCounter = new DefaultMap<string, number>(() => 0)

// provider.on('debug', (log) => {
//   if (log.action === 'response') {
//   } else if (log?.action == 'request') {
//     requestCount += 1
//   }

//   // if (initialized) {
//   //   const req =
//   //     log.request.params[0].to + ':' + (log.request.params[0].data ?? '')
//   //   dupRequestCounter.get(req)
//   //   dupRequestCounter.set(req, dupRequestCounter.get(req) + 1)
//   // }
// })
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
    const config = {
      ...baseConfig,
      ...searcherOptions,
    }
    global.console = require('console')
    universe = await Universe.createWithConfig(
      provider,
      config,
      async (uni) => {
        await setupBaseZapper(uni)
      },
      {
        simulateZapFn: simulateFn,
      }
    )

    await universe.initialized

    fs.writeFileSync(
      'src.ts/configuration/data/base/tokens.json',
      JSON.stringify(
        [...universe.tokens.values()]
          .sort((l, r) =>
            l.address === r.address ? 0 : r.address.gt(l.address) ? -1 : 1
          )
          .map((t) => t.toJson()),
        null,
        2
      )
    )

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
            const inputQty = token.from(testCase.input)

            const targetBasket = await Promise.all(
              testCase.basket.map(async ([num, tok]) => {
                const t = await universe.getToken(tok)
                const tokenPrice = (await t.price).asNumber()
                const out = (1 / tokenPrice) * num
                return t.from(out)
              })
            )
            const config = governedDeployConfig(
              'AIBS',
              'AI Basket',
              targetBasket
            )

            const out = await universe.deployZap(inputQty, testUser, config)
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

  describe('folioconfigs', () => {
    for (const config of folioTests2) {
      describe(`config ${config.basicDetails.name}`, () => {
        it('produces the basket graph', async () => {
          expect.assertions(1)
          try {
            const token = await universe.getToken(config.tokenIn)
            const inputQty = token.from(BigInt(config.amountIn))

            const out = await universe.deployZap(inputQty, testUser, {
              type: 'governed',
              stToken: config.stToken,
              basicDetails: config.basicDetails,
              additionalDetails: {
                auctionLength: config.additionalDetails.auctionLength,
                tradeDelay: config.additionalDetails.tradeDelay,
                feeRecipients: config.additionalDetails.feeRecipients,
                folioFee: config.additionalDetails.folioFee,
                mintingFee: config.additionalDetails.mintingFee,
                mandate: config.additionalDetails.mandate,
              },
              ownerGovParams: config.ownerGovParams,
              tradingGovParams: config.tradingGovParams,
              tradeLaunchers: config.tradeLaunchers,
              vibesOfficers: config.vibesOfficers,
              existingTradeProposers: config.existingTradeProposers,
            })
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
  //

  describe('folio-zaps', () => {
    for (const testCase of folioTests) {
      describe(testCase.name, () => {
        it('produces the basket graph', async () => {
          expect.assertions(1)
          try {
            const inputQty = universe.commonTokens.WETH.from(0.1)
            const folioToken = await universe.getToken(
              '0x9da3f8cb99361c8899485e4cac2031914ca92262'
            )
            const zap = await universe.zap(inputQty, folioToken, testUser)
            console.log(zap.toString())
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
