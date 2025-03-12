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
dotenv.config()

if (process.env.BASE_PROVIDER == null) {
  console.log('BASE_PROVIDER not set, skipping tests')
  process.exit(0)
}

const searcherOptions: SearcherOptions = {
  ...getDefaultSearcherOptions(),

  cacheResolution: 8,
  maxOptimisationSteps: 1600,
  maxOptimisationTime: 60000,
  minimiseDustPhase1Steps: 10,
  zapMaxDustProduced: 1,
  zapMaxValueLoss: 1,
  dynamicConfigURL:
    'https://raw.githubusercontent.com/reserve-protocol/token-zapper/refs/heads/main/src.ts/configuration/data/8453/config.json',
  rejectHighDust: false,
  rejectHighValueLoss: false,
  useNewZapperContract: true,
  phase1Optimser: 'nelder-mead',
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

  '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267':
    '0xE207FAb5839CA5bCc0d930761755cC7d82C1f19c',
  '0x44551ca46fa5592bb572e20043f7c3d54c85cad7':
    '0xFdCCD04DDCa9eCf052E8e9eF6BD09a9b323fBF49',
  '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9':
    '0xeD5210Bd97d855E8BEc2389439B8487eEcC3FC60',
  '0x47686106181b3cefe4eaf94c4c10b48ac750370b':
    '0x130C5bc30567987861620971C6B60C08D3784eF8',
  '0xd600e748c17ca237fcb5967fa13d688aff17be78':
    '0xF37631E6481e61011FbDccbCE714ab06A031FBa8',
  '0x23418de10d422ad71c9d5713a2b8991a9c586443':
    '0xD38d1AB8A150e6eE0AE70C86A8E9Fb0c83255b76',
  '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e':
    '0xd19c0dbbC5Ba2eC4faa0e3FFf892F0E95F23D9e0',
  '0xb8753941196692e322846cfee9c14c97ac81928a':
    '0x46271115F374E02b5afe357C8E8Dad474c8DE1cF',
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
  makeTestCase(0.02, t.WETH, t.CLUB),
  makeTestCase(0.1, t.WETH, t.ABX),
  makeTestCase(1, t.WETH, t.ABX),
  makeTestCase(2, t.WETH, t.ABX),
  makeTestCase(4, t.WETH, t.ABX),
  makeTestCase(8, t.WETH, t.ABX),
  makeTestCase(1000, t.USDC, rTokens.bsd),
  makeTestCase(1000, t.USDC, rTokens.hyUSD),
  makeTestCase(1, t.WETH, rTokens.bsd),
  makeTestCase(1, t.WETH, rTokens.hyUSD),
  makeTestCase(2, t.ETH, t.BDTF),
  makeTestCase(1000, t.USDC, t.BDTF),
  makeTestCase(5000, t.USDC, t.VTF),
  makeTestCase(2, t.WETH, t.VTF),
  makeTestCase(5000, t.USDC, t.CLX),
  makeTestCase(2, t.WETH, t.CLX),
  makeTestCase(5000, t.USDC, t.MVDA25),
  makeTestCase(2, t.WETH, t.MVDA25),
  makeTestCase(5000, t.USDC, t.MVTT10F),
  makeTestCase(2, t.WETH, t.MVTT10F),
  makeTestCase(5000, t.USDC, t.BGCI),
  makeTestCase(1, t.WETH, t.BGCI),
  makeTestCase(1, t.WETH, t.CLUB),
]

const redeemCases = [
  makeTestCase(10, t.BDTF, t.ETH),
  makeTestCase(10, t.BDTF, t.ETH),
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
    tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amountIn: '55000000000000000',
    signer: '0x9788D64c39E2B104265c89CbbCa2a2350e62701d',
    slippage: 0.05,
    stToken: '0xd91919e938776BD094A72FBCB490C3603028f96D',
    basicDetails: {
      name: 'Neo Tokyo Gaming Revolution Index',
      symbol: 'GR',
      assets: [
        '0x85f138bfee4ef8e540890cfb48f620571d67eda3',
        '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',
        '0xd1d2eb1b1e90b638588728b4130137d262c87cae',
        '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce',
        '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55',
        '0xf944e35f95e819e752f3ccb5faf40957d311e8c5',
        '0x767fe9edc9e0df98e07454847909b5e959d7ca0e',
        '0x430ef9263e76dae63c84292c3409d61c598e9682',
        '0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a',
        '0x560363bda52bc6a44ca6c8c9b4a5fadbda32fa60',
        '0x786a6743efe9500011c92c7d8540608a62382b6f',
        '0xa0ef786bf476fe0810408caba05e536ac800ff86',
        '0xd13c7342e1ef687c5ad21b27c2b65d772cab5c8c',
        '0x549020a9cb845220d66d3e9c6d9f9ef61c981102',
      ],
      amounts: [
        '128169256605489',
        '4214211870946039',
        '12444774',
        '160887127714675116',
        '1695384119798547',
        '6206562069520381',
        '22455890153087',
        '226925689062516',
        '2220881770428017',
        '469813935562919',
        '7648052119186724',
        '366795958872312367',
        '58',
        '332574687381644807',
      ],
    },
    additionalDetails: {
      tradeDelay: '172800',
      auctionLength: '3600',
      feeRecipients: [
        {
          recipient: '0x0EBe3c360c30673d5224aCAaF899D30C26a0a8A1',
          portion: '200000000000000000',
        },
        {
          recipient: '0xd91919e938776BD094A72FBCB490C3603028f96D',
          portion: '800000000000000000',
        },
      ],
      folioFee: '20000000000000000',
      mintingFee: '5000000000000000',
      mandate:
        'The Neo Tokyo Gaming Revolution Index DTF ("GR") tracks Neo Tokyo Ecosystem partners & project founders who are dedicated & loyal Citizens of The Citadel. This commitment is represented by those founders / partners / projects whom are included in our Neo Tokyo Network graphic... in the future, requirements will involve a staked Neo Tokyo Citizen NFT. The GR is a benchmark designed to measure the performance of said members that are founders of the top Gaming & Metaverse projects & applications in all of Web 3. Index constituents also need to meet other criteria in order to be considered for inclusion in GR, such as weekly liquidity qualifications & minimum market capitalizations set by governance rules. Each constituent represents a holding no more than 20% of the Index & no less than 1% of the Index\'s overall value. Cryptocurrencies are considered for addition/removal to/from the Index on a rolling basis. We are the Gaming Revolution.... Grand Rising, Citizens.',
    },
    ownerGovParams: {
      votingDelay: '172800',
      votingPeriod: '345600',
      proposalThreshold: '100000000000000000',
      quorumPercent: '25',
      timelockDelay: '86400',
      guardians: ['0x9788D64c39E2B104265c89CbbCa2a2350e62701d'],
    },
    tradingGovParams: {
      votingDelay: '86400',
      votingPeriod: '86400',
      proposalThreshold: '100000000000000000',
      quorumPercent: '25',
      timelockDelay: '86400',
      guardians: ['0x9788D64c39E2B104265c89CbbCa2a2350e62701d'],
    },
    existingTradeProposers: [],
    tradeLaunchers: ['0x9788D64c39E2B104265c89CbbCa2a2350e62701d'],
    vibesOfficers: ['0x9788D64c39E2B104265c89CbbCa2a2350e62701d'],
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
}, 120000)

describe('base zapper', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await provider.getBlockNumber(),
      (await provider.getGasPrice()).toBigInt()
    )
  })

  describe('superOETH', () => {
    it('should mint superOETH from cbETH', async () => {
      const out = await universe.zap(
        universe.commonTokens.cbETH.from(1),
        universe.commonTokens.SuperOETH,
        testUser
      )
      console.log(out.toString())
    }, 20000)
    it('should mint superOETH from wstETH', async () => {
      const out = await universe.zap(
        universe.commonTokens.wstETH.from(1),
        universe.commonTokens.SuperOETH,
        testUser
      )
      console.log(out.toString())
    }, 20000)
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
              type: 'ungoverned',
              owner: config.signer,
              basicDetails: config.basicDetails,
              additionalDetails: {
                auctionLength: config.additionalDetails.auctionLength,
                tradeDelay: config.additionalDetails.tradeDelay,
                feeRecipients: config.additionalDetails.feeRecipients,
                folioFee: config.additionalDetails.folioFee,
                mintingFee: config.additionalDetails.mintingFee,
                mandate: config.additionalDetails.mandate,
              },
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
      }, 2400000)
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
