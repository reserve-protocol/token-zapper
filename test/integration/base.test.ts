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

  cacheResolution: 4,
  maxOptimisationSteps: 1000,
  maxOptimisationTime: 120000,
  minimiseDustPhase1Steps: 10,
  zapMaxDustProduced: 10,
  zapMaxValueLoss: 3,
  dynamicConfigURL:
    'https://raw.githubusercontent.com/reserve-protocol/token-zapper/refs/heads/main/src.ts/configuration/data/8453/config.json',
  rejectHighDust: false,
  rejectHighValueLoss: false,
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
  makeTestCase(1000, t.USDC, rTokens.bsd),
  makeTestCase(1000, t.USDC, rTokens.hyUSD),
  makeTestCase(1, t.WETH, rTokens.bsd),
  makeTestCase(1, t.WETH, rTokens.hyUSD),
  // makeTestCase(2, t.WETH, t.ABX),
  // makeTestCase(5000, t.USDC, t.ABX),
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
  makeTestCase(1, t.WETH, t.CLUB),
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
    tokenIn: '0x4200000000000000000000000000000000000006',
    amountIn: '100000000000000000',
    signer: '0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99',
    slippage: 0.01,
    stToken: '0x38762C8a6Fe7ED7bBC87B717c504a75623575C57',
    basicDetails: {
      name: 'test50',
      symbol: 'test50',
      assets: [
        '0x4200000000000000000000000000000000000006',
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
        '0xa88594d404727625a9437c3f886c7643872296ae',
        '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a',
        '0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf',
        '0xb33ff54b9f7242ef1593d2c9bcd8f9df46c77935',
        '0x7ba6f01772924a82d9626c126347a28299e98c98',
        '0xdbfefd2e8460a6ee4955a68582f85708baea60a3',
        '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
        '0xdcefd8c8fcc492630b943abcab3429f12ea9fea2',
        '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
        '0x532f27101965dd16442e59d40670faf5ebb142e4',
        '0xb29749498954a3a821ec37bde86e386df3ce30b6',
        '0xcb327b99ff831bf8223cced12b1338ff3aa322ff',
        '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4',
        '0xb3b32f9f8827d4634fe7d973fa1034ec9fddb3b3',
        '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
        '0x800822d361335b4d5f352dac293ca4128b5b605f',
        '0x9eaf8c1e34f05a589eda6bafdf391cf6ad3cb239',
        '0x23da5f2d509cb43a59d43c108a43edf34510eff1',
        '0xc958e3db092ce36105c14217bbfa38b90a9c3e78',
        '0x70737489dfdf1a29b7584d40500d3561bd4fe196',
        '0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842',
        '0x768be13e1680b5ebe0024c42c896e3db59ec0149',
        '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376',
        '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b',
        '0xba0dda8762c24da9487f5fa026a9b64b695a07ea',
        '0x4b361e60cf256b926ba15f157d69cac9cd037426',
        '0xb1a03eda10342529bbf8eb700a06c60441fef25d',
        '0xf544251d25f3d243a36b07e7e7962a678f952691',
        '0x1bc0c42215582d5a085795f4badbac3ff36d1bcb',
        '0x844c03892863b0e3e00e805e41b34527044d5c72',
        '0x6b2504a03ca4d43d0d73776f6ad46dab2f2a4cfd',
        '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b',
        '0x50da645f148798f68ef2d7db7c1cb22a6819bb2c',
        '0x6921b130d297cc43754afba22e5eac0fbf8db75b',
        '0x18e692c03de43972fe81058f322fa542ae1a5e2c',
        '0x74ccbe53f77b08632ce0cb91d3a545bf6b8e0979',
        '0x24914cb6bd01e6a0cf2a9c0478e33c25926e6a0c',
        '0xe248c0bce837b8dfb21fdfa51fb31d22fbbb4380',
        '0xebff2db643cf955247339c8c6bcd8406308ca437',
        '0xf1a7000000950c7ad8aff13118bb7ab561a448ee',
        '0x333333c465a19c85f85c6cfbed7b16b0b26e3333',
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
        '0xa0c05e2eed05912d9eb76d466167628e8024a708',
        '0xe3086852a4b125803c815a158249ae468a3254ca',
        '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
        '0x85e90a5430af45776548adb82ee4cd9e33b08077',
      ],
      amounts: [
        '9704686393059',
        '20003',
        '24',
        '22783414158822197',
        '805783424179295160',
        '9133311769576',
        '6522304006058154',
        '1417071408240502706',
        '9704363197652',
        '9692146492726',
        '35108722241325843',
        '55598386',
        '8129082628778',
        '561669905583966012',
        '8756140703726',
        '9501764480738',
        '50540109515363312198',
        '3840551736734940658',
        '4801490942066082290',
        '675429980604192348',
        '3846756385124',
        '8927650820298',
        '32292897614738',
        '39804541233237671349',
        '11319518571153264',
        '336023602',
        '20056',
        '238996099813',
        '2871880690776977829',
        '632736457413955344',
        '527868674930723536',
        '192237609364448531',
        '361664912758429',
        '7896726609402237954782',
        '1669413031957315052',
        '87267249681999231825',
        '4200929',
        '66647322725561053858',
        '3394080480',
        '767739503456007943',
        '62281878061017093',
        '5193993461339572',
        '441919065712798154',
        '769585524981421631',
        '46058507665373109',
        '8880101202853',
        '25410321455825314985',
        '1967415165969448543',
        '19984',
        '615976976751735264770',
      ],
    },
    additionalDetails: {
      tradeDelay: '43200',
      auctionLength: '1800',
      feeRecipients: [
        {
          recipient: '0x38762C8a6Fe7ED7bBC87B717c504a75623575C57',
          portion: '1000000000000000000',
        },
      ],
      folioFee: '10000000000000000',
      mintingFee: '5000000000000000',
      mandate: 'testing 50 token basket',
    },
    ownerGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: ['0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99'],
    },
    tradingGovParams: {
      votingDelay: '172800',
      votingPeriod: '172800',
      proposalThreshold: '10000000000000000',
      quorumPercent: '10',
      timelockDelay: '172800',
      guardians: ['0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99'],
    },
    existingTradeProposers: [],
    tradeLaunchers: ['0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99'],
    vibesOfficers: ['0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99'],
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
