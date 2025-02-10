import * as dotenv from 'dotenv'
import fs from 'fs'

import { WebSocketProvider } from '@ethersproject/providers'
import { ONE } from '../../src.ts/action/Action'
import { DeployFolioConfigJson } from '../../src.ts/action/DeployFolioConfig'
import { DefaultMap } from '../../src.ts/base/DefaultMap'
import {
  getDefaultSearcherOptions,
  SearcherOptions,
} from '../../src.ts/configuration/ChainConfiguration'
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
import { getProvider, getSimulator } from './providerUtils'
import { bestPath } from '../../src.ts/exchange-graph/BFS'
dotenv.config()

if (process.env.BASE_PROVIDER == null) {
  console.log('BASE_PROVIDER not set, skipping tests')
  process.exit(0)
}

const searcherOptions: SearcherOptions = {
  ...getDefaultSearcherOptions(),

  cacheResolution: 8,
  maxPhase2TimeRefinementTime: 1000,
  optimisationSteps: 30,
  minimiseDustPhase1Steps: 10,
  minimiseDustPhase2Steps: 10,
  zapMaxDustProduced: 8,
  zapMaxValueLoss: 5,
  rejectHighDust: false,
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

  '0x03980d2f9165324190e2295e0d5ceb80e2753b30':
    '0x7A37111575cd96EB6F4a744497A4b650d83A389e', // TAVE5
}

const simulateFn = getSimulator(
  process.env.SIMULATE_URL_BASE!,
  process.env.SIMULATE_TYPE === 'callmany' ? 'callmany' : 'simulator',
  baseWhales
)

const t = baseConfig.addresses.commonTokens
const rTokens = baseConfig.addresses.rTokens

const getSymbol = new Map(
  Object.entries(t)
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
  // makeTestCase(10, t.WETH, rTokens.bsd),
  // makeTestCase(10000, t.USDC, rTokens.bsd),
  // makeTestCase(10000, t.USDC, rTokens.hyUSD),
  // makeTestCase(10000, t.USDbC, rTokens.hyUSD),
  // makeTestCase(5, t.WETH, rTokens.hyUSD),
  // makeTestCase(10, t.WETH, rTokens.BSDX),
  // makeTestCase(1, t.ETH, t.TEST1),
  makeTestCase(1, t.WETH, t.RIBBIT),
  // makeTestCase(10000, t.USDC, rTokens.BSDX),
]

const redeemCases = [
  // makeTestCase(50, rTokens.bsd, t.WETH),
  // makeTestCase(50, rTokens.hyUSD, t.USDC),

  // makeTestCase(100000, rTokens.hyUSD, t.WETH),
  // makeTestCase(100000, rTokens.hyUSD, t.USDC),

  // makeTestCase(10000, rTokens.BSDX, t.WETH),
  // makeTestCase(10000, rTokens.BSDX, t.USDC),

  makeTestCase(5, t.TAVE5, t.WETH),
]
const individualIntegrations = [
  makeIntegrationtestCase('Morpho eUSD', 100, t.eUSD, t.meUSD, 1),
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
  // {
  //   tokenIn: '0x4200000000000000000000000000000000000006',
  //   amountIn: '100000000000000000',
  //   signer: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  //   slippage: 0.001,
  //   stToken: '0xbB1E40196AB2C1e86b07Fc7F1dFDB1c39FC7078b',
  //   basicDetails: {
  //     name: 'abxtest',
  //     symbol: 'abxtest',
  //     assets: [
  //       '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
  //       '0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825',
  //       '0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00',
  //       '0xc0041ef357b183448b235a8ea73ce4e4ec8c265f',
  //       '0x39d5313c3750140e5042887413ba8aa6145a9bd2',
  //       '0x161e113b8e9bbaefb846f73f31624f6f9607bd44',
  //       '0x288f4eb27400fa220d14b864259ad1b7f77c1594',
  //       '0xba1cc6e3f1c5f937497e4e196196e7535e6a8e63',
  //       '0x57edc3f1fd42c0d48230e964b1c5184b9c89b2ed',
  //       '0x6b2504a03ca4d43d0d73776f6ad46dab2f2a4cfd',
  //       '0xe4a7b54c0a30da69c04dc54b89868c185ff382bc',
  //       '0xb22a793a81ff5b6ad37f40d5fe1e0ac4184d52f3',
  //       '0x504a26cf29674bc77a9341e73f88ccecc864034c',
  //       '0xab36452dbac151be02b16ca17d8919826072f64a',
  //       '0x548f93779fbc992010c07467cbaf329dd5f059b7',
  //       '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4',
  //       '0xb166e8b140d35d9d8226e40c09f757bac5a4d87d',
  //       '0x9a26f5433671751c3276a065f57e5a02d2817973',
  //       '0x6921b130d297cc43754afba22e5eac0fbf8db75b',
  //       '0x1b5ce2a593a840e3ad3549a34d7b3dec697c114d',
  //     ],
  //     amounts: [
  //       '34523843709348336',
  //       '160113590203567330',
  //       '2893255462158021500',
  //       '262424208719749400',
  //       '469117058559953',
  //       '1383282751294061000000',
  //       '1209480790941414600000',
  //       '14326635967694383000',
  //       '204813600298807100',
  //       '1679770946165017700',
  //       '18000576302850800000',
  //       '1026948040845010000000',
  //       '7014895280343396000',
  //       '5508862507941362500',
  //       '8463196481336716',
  //       '54445514359296624000',
  //       '3405384548142940000',
  //       '12006289192995768000',
  //       '94529667760944010000',
  //       '8172243638525577000',
  //     ],
  //   },
  //   additionalDetails: {
  //     tradeDelay: '86400',
  //     auctionLength: '1800',
  //     feeRecipients: [
  //       {
  //         recipient: '0x93A9De84D97f1bF26a4D4F99d783827F3783187B',
  //         portion: '500000000000000000',
  //       },
  //       {
  //         recipient: '0xbB1E40196AB2C1e86b07Fc7F1dFDB1c39FC7078b',
  //         portion: '500000000000000000',
  //       },
  //     ],
  //     folioFee: '20000000000000000',
  //     mintingFee: '3000000000000000',
  //     mandate: 'abxtest',
  //   },
  //   ownerGovParams: {
  //     votingDelay: '172800',
  //     votingPeriod: '259200',
  //     proposalThreshold: '10000000000000000',
  //     quorumPercent: '10',
  //     timelockDelay: '172800',
  //     guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  //   },
  //   tradingGovParams: {
  //     votingDelay: '43200',
  //     votingPeriod: '86400',
  //     proposalThreshold: '10000000000000000',
  //     quorumPercent: '10',
  //     timelockDelay: '43200',
  //     guardians: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  //   },
  //   existingTradeProposers: [],
  //   tradeLaunchers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  //   vibesOfficers: ['0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4'],
  // },
  {
    tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    amountIn: '5000000000000000',
    signer: '0x0Fc0F78fc939606db65F5BBF2F3715262C0b2F6E',
    slippage: 0.01,
    stToken: '0x3f8aAc972c0d217CE53d6598B376E870Ee0b9de8',
    basicDetails: {
      name: 'Start3sst',
      symbol: 'STAR',
      assets: [
        '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
        '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
        '0x8c9037d1ef5c6d1f6816278c7aaf5491d24cd527',
        '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe',
      ],
      amounts: [
        '105158443054272620000',
        '445616185675410600',
        '9919088646895040000',
        '18664473085064568000',
      ],
    },
    additionalDetails: {
      tradeDelay: '43200',
      auctionLength: '1800',
      feeRecipients: [
        {
          recipient: '0x0Fc0F78fc939606db65F5BBF2F3715262C0b2F6E',
          portion: '500000000000000000',
        },
        {
          recipient: '0x3f8aAc972c0d217CE53d6598B376E870Ee0b9de8',
          portion: '500000000000000000',
        },
      ],
      folioFee: '10000000000000000',
      mintingFee: '10000000000000000',
      mandate: 'This index will test some Base tokens',
    },
    ownerGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: [
        '0x73b5DE94d31394D210066b3fb5c368505469aBea',
        '0xaD221430fEebE18D99d6b814Cc4c7EEF5cb9Ea61',
        '0x1ab4ffdA0BBF9620DBaB96015a7b2D447730A86e',
      ],
    },
    tradingGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: [
        '0x73b5DE94d31394D210066b3fb5c368505469aBea',
        '0xaD221430fEebE18D99d6b814Cc4c7EEF5cb9Ea61',
        '0x1ab4ffdA0BBF9620DBaB96015a7b2D447730A86e',
      ],
    },
    existingTradeProposers: [],
    tradeLaunchers: [
      '0x73b5DE94d31394D210066b3fb5c368505469aBea',
      '0xaD221430fEebE18D99d6b814Cc4c7EEF5cb9Ea61',
      '0x1ab4ffdA0BBF9620DBaB96015a7b2D447730A86e',
    ],
    vibesOfficers: [
      '0x73b5DE94d31394D210066b3fb5c368505469aBea',
      '0xaD221430fEebE18D99d6b814Cc4c7EEF5cb9Ea61',
      '0x1ab4ffdA0BBF9620DBaB96015a7b2D447730A86e',
    ],
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

const zapIntoYieldPositionCases = [
  makeZapIntoYieldPositionTestCase(
    10000,
    t.USDC,
    rTokens.hyUSD,
    t['vAMM-hyUSD/eUSD']
  ),
  makeZapIntoYieldPositionTestCase(
    10000,
    t.USDC,
    rTokens.hyUSD,
    t['dyson-hyUSDeUSD']
  ),
]

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

//   if (initialized && log?.request?.method === 'eth_call') {
//     const req =
//       log.request.params[0].to + ':' + (log.request.params[0].data ?? '')
//     dupRequestCounter.get(req)
//     dupRequestCounter.set(req, dupRequestCounter.get(req) + 1)
//   }
// })
// provider.on('error', (e) => {
//   console.log(e)
// })
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

  // describe('pathfinding', () => {
  //   it('finds a path', async () => {
  //     const inputQty = universe.commonTokens.WETH.from(1)
  //     const out = await bestPath(
  //       universe,
  //       inputQty,
  //       universe.commonTokens.VaderAI,
  //       2
  //     )

  //     for (const [_, { path, legAmount }] of out.entries()) {
  //       console.log(
  //         `${inputQty} => ${path.join(' -> ')} => ${legAmount.join(', ')}`
  //       )
  //     }
  //   }, 60000)
  // })

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
        }, 240000)
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
      }, 240000)
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
