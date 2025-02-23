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
  dynamicConfigURL:
    'https://raw.githubusercontent.com/reserve-protocol/token-zapper/refs/heads/main/src.ts/configuration/data/8453/config.json',
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
    '0xcFC0805E42589d04a5ab4bCAff49f81d5210e065', // BSDX

  // '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0x44551ca46fa5592bb572e20043f7c3d54c85cad7':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0x47686106181b3cefe4eaf94c4c10b48ac750370b':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0xd600e748c17ca237fcb5967fa13d688aff17be78':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0x23418de10d422ad71c9d5713a2b8991a9c586443':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // '0xb8753941196692e322846cfee9c14c97ac81928a':
  //   '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
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
  // makeTestCase(1000, t.USDC, rTokens.bsd),
  // makeTestCase(1000, t.USDC, rTokens.hyUSD),
  // makeTestCase(1, t.WETH, rTokens.bsd),
  // makeTestCase(1, t.WETH, rTokens.hyUSD),

  // makeTestCase(5000, t.USDC, t.ABX),
  makeTestCase(1, t.WETH, t.BDTF),
  makeTestCase(2, t.ETH, t.BDTF),
  makeTestCase(1000, t.USDC, t.BDTF),
  makeTestCase(1000, t.USDC, t.BDTF),
  // makeTestCase(5000, t.USDC, t.VTF),
  // makeTestCase(2, t.WETH, t.VTF),

  // makeTestCase(5000, t.USDC, t.CLX),
  // makeTestCase(2, t.WETH, t.CLX),
  // makeTestCase(5000, t.USDC, t.MVDA25),
  // makeTestCase(2, t.WETH, t.MVDA25),

  // makeTestCase(5000, t.USDC, t.BGCI),
  // makeTestCase(2, t.WETH, t.BGCI),
  // makeTestCase(5000, t.USDC, t.MVTT10F),
  // makeTestCase(2, t.WETH, t.MVTT10F),
]

const redeemCases = [
  makeTestCase(10, t.VTF, t.ETH),
  makeTestCase(10, t.MVDA25, t.ETH),
  makeTestCase(10, t.MVTT10F, t.ETH),

  makeTestCase(10, t.VTF, t.USDC),
  makeTestCase(10, t.MVDA25, t.USDC),
  makeTestCase(10, t.MVTT10F, t.USDC),

  makeTestCase(10, t.VTF, t.WETH),
  makeTestCase(10, t.MVDA25, t.WETH),
  makeTestCase(10, t.MVTT10F, t.WETH),

  makeTestCase(50, rTokens.bsd, t.WETH),
  makeTestCase(50, rTokens.hyUSD, t.USDC),

  makeTestCase(10000, rTokens.hyUSD, t.WETH),
  makeTestCase(10000, rTokens.hyUSD, t.USDC),

  makeTestCase(1000, rTokens.BSDX, t.WETH),
  makeTestCase(1000, rTokens.BSDX, t.USDC),

  makeTestCase(75, t.VTF, t.WETH),
  makeTestCase(75, t.MVTT10F, t.WETH),
  makeTestCase(75, t.MVDA25, t.WETH),
  makeTestCase(75, t.BGCI, t.WETH),
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
  {
    tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    amountIn: '400000000000000',
    signer: '0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2',
    slippage: 0.005,
    stToken: '0x5D4F073399f4Bb0C7454c9879391B02ba41114fE',
    basicDetails: {
      name: 'xBGCI',
      symbol: 'xBGCI',
      assets: [
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        '0xcb327b99ff831bf8223cced12b1338ff3aa322ff',
        '0x9b8df6e244526ab5f6e6400d331db28c8fdddb55',
        '0xd403d1624daef243fbcbd4a80d8a6f36affe32b2',
        '0xd6a34b430c05ac78c24985f8abee2616bc1788cb',
        '0x378c326a472915d38b2d8d41e1345987835fab64',
        '0xb0505e5a99abd03d94a1169e638b78edfed26ea4',
        '0x0f813f4785b2360009f9ac9bf6121a85f109efc6',
        '0x3eb097375fc2fc361e4a472f5e7067238c547c52',
        '0x7be0cc2cadcd4a8f9901b4a66244dcdd9bd02e0f',
        '0xc3de830ea07524a0761646a6a4e4be0e114a3c83',
        '0x5ed25e305e08f58afd7995eac72563e6be65a617',
      ],
      amounts: [
        '363',
        '128503396256198',
        '872298527662110',
        '1078933992714268',
        '771551797857754',
        '60895317958621353',
        '5746970652198186',
        '1937869458507707',
        '77804930570647',
        '29696547156608',
        '1015090008322964',
        '2990254237543416',
      ],
    },
    additionalDetails: {
      tradeDelay: '43200',
      auctionLength: '1800',
      feeRecipients: [
        {
          recipient: '0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2',
          portion: '500000000000000000',
        },
        {
          recipient: '0x5D4F073399f4Bb0C7454c9879391B02ba41114fE',
          portion: '500000000000000000',
        },
      ],
      folioFee: '10000000000000000',
      mintingFee: '5000000000000000',
      mandate: '',
    },
    ownerGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: [],
    },
    tradingGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: [],
    },
    existingTradeProposers: [],
    tradeLaunchers: [],
    vibesOfficers: [],
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
  //       await universe.getToken('0x504a26cf29674bc77a9341e73f88ccecc864034c'),
  //       2,
  //       5
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
