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
import { GAS_TOKEN_ADDRESS } from '../../src.ts/base/constants'
dotenv.config()

const searcherOptions: SearcherOptions = {
  ...getDefaultSearcherOptions(),
  cacheResolution: 4,
  maxOptimisationSteps: 500,
  maxOptimisationTime: 35000,
  minimiseDustPhase1Steps: 10,
  zapMaxDustProduced: 1,
  zapMaxValueLoss: 1,
  maxSimpleOptimserSteps: 100,
  rejectHighDust: false,
  rejectHighValueLoss: false,
  useNewZapperContract: true,
  phase1Optimser: 'nelder-mead',
  dynamicConfigURL:
    'https://raw.githubusercontent.com/reserve-protocol/token-zapper/refs/heads/main/src.ts/configuration/data/1/config.json',
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
const TEST_TIMEOUT = 120000
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

  // COMP
  '0x9e1028f5f1d5ede59748ffcee5532509976840e0':
    '0x123964802e6ababbe1bc9547d72ef1b69b00a6b1',
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

  // "sDAI"
  '0x83f20f44975d03b1b09e64809b757c47f942beea':
    '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
  // COMP
  '0xc00e94cb662c3520282e6f5717214004a7f26888':
    '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
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
  makeTestCase(1000, t.WETH, rTokens['ETH+']),
  makeTestCase(10000, t.USDC, rTokens.dgnETH),
  makeTestCase(100000, t.DAI, rTokens.eUSD),
  makeTestCase(1000000, t.USDT, rTokens.eUSD),
  makeTestCase(1000000, t.USDC, rTokens.USD3),
  makeTestCase(1000000, t.USDT, rTokens.USD3),
  makeTestCase(1000000, t.DAI, rTokens.USD3),
  makeTestCase(1, t.WETH, rTokens['ETH+']),
  makeTestCase(0.70133, t['stkcvxETH+ETH-f'], t.Re7WETH),

  makeTestCase(10, t.WETH, rTokens.hyUSD),
  makeTestCase(10000, t.USDC, rTokens.hyUSD),
  makeTestCase(10000, t.DAI, rTokens.hyUSD),
  makeTestCase(10000, t.USDT, rTokens.hyUSD),
  makeTestCase(10000, t.sDAI, rTokens.hyUSD),
  makeTestCase(31.234892, t.COMP, rTokens.hyUSD),

  makeTestCase(10, t.WETH, rTokens.eUSD),
  makeTestCase(10000, t.USDC, rTokens.eUSD),
  makeTestCase(1000, t.USDC, t.mvRWA),
  makeTestCase(10000, t.USDT, rTokens.eUSD),
  makeTestCase(10000, t.sDAI, rTokens.eUSD),
  makeTestCase(10000, t.COMP, rTokens.eUSD),

  makeTestCase(10, t.WETH, rTokens.USD3),
  makeTestCase(10000, t.USDC, rTokens.USD3),
  makeTestCase(10000, t.DAI, rTokens.USD3),
  makeTestCase(10000, t.USDT, rTokens.USD3),
  makeTestCase(10000, t.sDAI, rTokens.USD3),
  makeTestCase(10000, t.COMP, rTokens.USD3),

  makeTestCase(50, t.WETH, rTokens.dgnETH),
  makeTestCase(10000, t.USDC, rTokens.dgnETH),
  makeTestCase(10000, t.USDT, rTokens.dgnETH),

  makeTestCase(1, t.WETH, t.SMEL),
  makeTestCase(1000, t.USDC, t.BED),
  makeTestCase(1, t.WETH, t.BED),
  makeTestCase(1, t.WETH, t.mvDEFI),
  makeTestCase(1, t.WETH, t.mvRWA),
  makeTestCase(1, t.WETH, t.DFX),
  makeTestCase(1, t.WETH, t.DGI),

  makeTestCase(1000, t.USDC, t.SMEL),
  makeTestCase(1000, t.USDC, t.mvDEFI),
  makeTestCase(1000, t.USDC, t.mvRWA),
  makeTestCase(1000, t.USDC, t.DFX),
  makeTestCase(1000, t.USDC, t.DGI),
]

const folioTests2 = [
  {
    tokenIn: GAS_TOKEN_ADDRESS,
    amountIn: '55000000000000000',
    signer: testUser.address,
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

const redeemCases = [
  // makeTestCase(50000, rTokens.hyUSD, t.USDC),
  // makeTestCase(50000, rTokens.hyUSD, t.USDT),
  // makeTestCase(50000, rTokens.hyUSD, t.WETH),
  // makeTestCase(50000, rTokens.hyUSD, t.DAI),
  // makeTestCase(50000, rTokens.hyUSD, t.RSR),

  // makeTestCase(50000, rTokens.eUSD, t.USDC),
  // makeTestCase(50000, rTokens.eUSD, t.USDT),
  makeTestCase(50000, rTokens.eUSD, t.WETH),
  makeTestCase(50000, rTokens.eUSD, t.DAI),
  makeTestCase(50000, rTokens.eUSD, t.RSR),

  makeTestCase(50000, rTokens.USD3, t.USDC),
  makeTestCase(50000, rTokens.USD3, t.USDT),
  makeTestCase(50000, rTokens.USD3, t.WETH),
  makeTestCase(50000, rTokens.USD3, t.DAI),
  makeTestCase(50000, rTokens.USD3, t.RSR),

  makeTestCase(5, rTokens['ETH+'], t.WETH),
  makeTestCase(5, rTokens['ETH+'], t.USDC),
  makeTestCase(5, rTokens['ETH+'], t.USDT),
  makeTestCase(5, rTokens['ETH+'], t.DAI),
  makeTestCase(5, rTokens['ETH+'], t.RSR),

  makeTestCase(5, rTokens.dgnETH, t.WETH),
  makeTestCase(5, rTokens.dgnETH, t.USDC),
  makeTestCase(5, rTokens.dgnETH, t.USDT),
  makeTestCase(5, rTokens.dgnETH, t.DAI),
  makeTestCase(5, rTokens.dgnETH, t.RSR),

  makeTestCase(5, rTokens['ETH+'], t.WETH),
  // makeTestCase(5, rTokens['ETH+'], t.reth),
  // makeTestCase(5, rTokens['ETH+'], t.frxeth),
  makeTestCase(5, rTokens['ETH+'], t.USDC),

  makeTestCase(5, rTokens.dgnETH, t.WETH),
  makeTestCase(5, rTokens.dgnETH, t.USDC),
  makeTestCase(5, rTokens.dgnETH, t.USDT),

  makeTestCase(21221.74, rTokens.hyUSD, t.RSR),
  makeTestCase(10000, rTokens.eUSD, t.RSR),
  makeTestCase(10000, rTokens.USD3, t.RSR),
  makeTestCase(5, rTokens['ETH+'], t.RSR),
  makeTestCase(5, rTokens.dgnETH, t.RSR),
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

    console.log('Ethereum zapper setup complete')
    if (process.env.WRITE_DATA) {
      const tokens = [...universe.tokens.values()].map((i) => i.toJson())
      fs.writeFileSync(
        'src.ts/configuration/data/ethereum/tokens.json',
        JSON.stringify(tokens, null, 2)
      )
    }

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

  describe('folioconfigs', () => {
    for (const config of folioTests2) {
      describe(`config ${config.basicDetails.name}`, () => {
        it('produces the basket graph', async () => {
          await universe.initialized
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
