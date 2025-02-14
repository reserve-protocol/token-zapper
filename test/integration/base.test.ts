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
  {
    tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    amountIn: '1000000000000000000',
    signer: '0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2',
    slippage: 0.01,
    stToken: '0x5D4F073399f4Bb0C7454c9879391B02ba41114fE',
    basicDetails: {
      name: 'xxMVTop10',
      symbol: 'xxMVTop10',
      assets: [
        '0xfa1df3f6108db461fd89437f320fe50c125af5f0',
        '0x9b8df6e244526ab5f6e6400d331db28c8fdddb55',
        '0xcb327b99ff831bf8223cced12b1338ff3aa322ff',
        '0xc3de830ea07524a0761646a6a4e4be0e114a3c83',
        '0x63706e401c06ac8513145b7687a14804d17f814b',
        '0x7fdaa50d7399ac436943028eda6ed9a1bd89509f',
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        '0x51436f6bd047797de7d11e9d32685f029aed1069',
        '0xd01cb4171a985571deff48c9dc2f6e153a244d64',
        '0xe868c3d83ec287c01bcb533a33d197d9bfa79dad',
      ],
      amounts: [
        '847615',
        '1018190776675382',
        '51154568879164',
        '14090647316787894',
        '397526492047732',
        '131328426352689',
        '62',
        '8163640',
        '40974568640407633',
        '64410196558377986',
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
      guardians: ['0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2'],
    },
    tradingGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: ['0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2'],
    },
    existingTradeProposers: [],
    tradeLaunchers: ['0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2'],
    vibesOfficers: ['0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2'],
  },
]

const pricingTests = [
  '0x2615a94df961278DcbC41Fb0a54fEc5f10a693aE',
  '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
  '0x12E96C2BFEA6E835CF8Dd38a5834fa61Cf723736',
  '0xa3A34A0D9A08CCDDB6Ed422Ac0A28a06731335aA',
  '0xd6a34b430C05ac78c24985f8abEE2616BC1788Cb',
  '0xd403D1624DAEF243FbcBd4A80d8A6F36afFe32b2',
  '0x239b9C1F24F3423062B0d364796e07Ee905E9FcE',
  '0x378c326A472915d38b2D8D41e1345987835FaB64',
  '0x0F813f4785b2360009F9aC9BF6121a85f109efc6',
  '0x7bE0Cc2cADCD4A8f9901B4a66244DcDd9Bd02e0F',
  '0xc3De830EA07524a0761646a6a4e4be0e114a3C83',
  '0x3EB097375fc2FC361e4a472f5E7067238c547c52',
  '0x5ed25E305E08F58AFD7995EaC72563E6BE65A617',
  '0x40318eE213227894b5316E5EC84f6a5caf3bBEDd',
  '0xf383074c4B993d1ccd196188d27D0dDf22AD463c',
  '0xD61BCF79b26787AE993f75B064d2e3b3cc738C5d',
  '0xAcbF16f82753F3d52A2C87e4eEDA220c9A7A3762',
  '0xE868C3d83EC287c01Bcb533A33d197d9BFa79DAD',
  '0x3a51f2a377EA8B55FAf3c671138A00503B031Af3',
  '0x6e934283DaE5D5D1831cbE8d557c44c9B83F30Ee',
  '0x4b92eA5A2602Fba275150db4201A6047056F6913',
  '0xDB18Fb11Db1b972A54bD89cE04bAd61855c07788',
  '0x0935b271CA903ADA3FFe1Ac1353fC4A49E7EE87b',
  '0x3d00283AF5AB11eE7f6Ec51573ab62b6Fb6Dfd8f',
  '0x8989377fd349ADFA99E6CE3Cb6c0D148DfC7F19e',
  '0x135Ff404bA56E167F58bc664156beAa0A0Fd95ac',
  '0x893ADcbdC7FcfA0eBb6d3803f01Df1eC199Bf7C5',
  '0x1B94330EEc66BA458a51b0b14f411910D5f678d0',
  '0xD7D5c59457d66FE800dBA22b35e9c6C379D64499',
  '0x30F16E3273AB6e4584B79B76fD944E577e49a5c8',
  '0x31d664ebd97A50d5a2Cd49B16f7714AB2516Ed25',
  '0x05f191a4Aac4b358AB99DB3A83A8F96216ecb274',
  '0x5A03841C2e2f5811f9E548cF98E88e878e55d99E',
  '0x508e751fdCf144910074Cc817a16757F608DB52A',
  '0x16275fD42439A6671b188bDc3949a5eC61932C48',
  '0x9AF46F95a0a8be5C2E0a0274A8b153C72d617E85',
  '0x83f31af747189c2FA9E5DeB253200c505eff6ed2',
  '0xc5cDEb649ED1A7895b935ACC8EB5Aa0D7a8492BE',
  '0xD6A746236F15E18053Dd3ae8c27341B44CB08E59',
  '0x3ECb91ac996E8c55fe1835969A4967F95a07Ca71',
  '0xe3AE3EE16a89973D67b678aaD2c3bE865Dcc6880',
  '0x2f2041c267795a85B0De04443E7B947A6234fEe8',
  '0x44951C66dFe920baED34457A2cFA65a0c7ff2025',
  '0x7fdAa50d7399ac436943028edA6ed9a1BD89509f',
  '0x972B86A73095f934A82860df664F3c55701F41b0',
  '0x51436F6bD047797DE7D11E9d32685f029aed1069',
  '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
  '0xc79e06860Aa9564f95E08fb7E5b61458d0C63898',
  '0xE5c436B0a34DF18F1dae98af344Ca5122E7d57c4',
  '0x9c0e042d65a2e1fF31aC83f404E5Cb79F452c337',
  '0xf653E8B6Fcbd2A63246c6B7722d1e9d819611241',
  '0xF0134C5eA11d1fc75fa1b25fAC00F8d82C38bD52',
  '0x224A0cB0C937018123B441b489a74EAF689Da78f',
  '0xD01CB4171A985571dEFF48c9dC2F6E153A244d64',
  '0xdf5913632251585a55970134Fad8A774628E9388',
  '0x71a67215a2025F501f386A49858A9ceD2FC0249d',
  '0xa260BA5fd9FF3FaE55Ac4930165A9C33519dE694',
  '0x806041B6473DA60abbe1b256d9A2749A151be6C6',
  '0x10f4799f0FeeEa0e74454e0B6669D3C0cf7B93bF',
  '0x4c5d8A75F3762c1561D96f177694f67378705E98',
  '0x90131D95a9a5b48b6a3eE0400807248bEcf4B7A4',
  '0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91',
  '0x0192C0fd46de641D3EC17c399032E400ce840205',
  '0x5B0A82456D018F21881D1D5460e37aeFD56d54b3',
  '0xB1db4CD8Af9db34F1A8241beafC76c0F77408e01',
  '0xdc1437D7390016af12fe501E4a65EC42d35469ce',
  '0x55B3E31739247d010eCe7ddC365eAe512b16fa7E',
  '0xa76a29923ccFb59E734e907688b659E48A55FD07',
  '0x6aD49F3bD3E15a7EE14A3b246824858E97910ed0',
  '0x0956CB4A1D8924680FEb671d2E4a122E2114313e',
  '0x532f27101965dd16442E59d40670FaF5eBB142E4',
  '0x13281ae464191bc592c6e5d65eeeaeee02660d84',
  '0x13e9f9096B97AFFdFcd40A21e2030B1A03f69736',
  '0xcb9eEC5748aAAfA41fBcbE0B58465eFed11CE176',
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

  describe('pricing', () => {
    for (const testCase of pricingTests) {
      describe(testCase, () => {
        it(`Can price ${testCase}`, async () => {
          expect.assertions(1)
          try {
            const token = await universe.getToken(testCase)
            const price = await token.price
            console.log(`${token}: ${price}`)
            expect(true).toBe(true)
          } catch (e) {
            console.error(`${testCase} failed`)
            throw e
          }
        }, 15000)
      })
    }
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
