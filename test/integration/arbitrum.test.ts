import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

import { WebSocketProvider } from '@ethersproject/providers'
import {
  Address,
  arbiConfig,
  ArbitrumUniverse,
  createEnso,
  createKyberswap,
  createParaswap,
  makeCustomRouterSimulator,
  setupArbitrumZapper,
  Universe,
} from '../../src.ts/index'
import { createZapTestCase } from '../createZapTestCase'
dotenv.config()

if (process.env.ARBITRUM_PROVIDER == null) {
  console.log('ARBITRUM_PROVIDER not set, skipping tests')
  process.exit(0)
}

/** !!
 * To run the integration test suite you'll need to run the simulator locally.
 *
 * You can do this by cloning the revm-router-simulater [repo](https://github.com/jankjr/revm-router-simulator)
 */
if (process.env.SIM_URL == null) {
  console.log('SIM_URL not set, skipping simulation tests')
  process.exit(0)
}

const arbiTokens = {
  usdc: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  dai: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  usdt: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  wbtc: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
  weth: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  usdm: '0x59d9356e565ab3a36dd77763fc0d87feaf85508c',
  knox: '0x0bbf664d46becc28593368c97236faa0fb397595',
  arb: '0x912ce59144191c1204e64559fe8253a0e49e6548',
}

export const arbiWhales = {
  // Main base toks
  [arbiTokens.usdc]: '0xb38e8c17e38363af6ebdcb3dae12e0243582891d',
  [arbiTokens.usdt]: '0xb38e8c17e38363af6ebdcb3dae12e0243582891d',
  [arbiTokens.dai]: '0x2d070ed1321871841245d8ee5b84bd2712644322',
  [arbiTokens.wbtc]: '0x47c031236e19d024b42f8ae6780e44a573170703',
  [arbiTokens.weth]: '0xc3e5607cd4ca0d5fe51e09b60ed97a0ae6f874dd',
  [arbiTokens.knox]: '0x86ea1191a219989d2da3a85c949a12a92f8ed3db',
  [arbiTokens.usdm]: '0x426c4966fc76bf782a663203c023578b744e4c5e',
  [arbiTokens.arb]: '0xf3fc178157fb3c87548baa86f9d24ba38e649b588',
}

const getProvider = (url: string) => {
  if (url.startsWith('ws')) {
    return new ethers.providers.WebSocketProvider(url)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

const t = arbiConfig.addresses.commonTokens
const rTokens = arbiConfig.addresses.rTokens

const getSymbol = new Map(
  Object.entries(arbiConfig.addresses.commonTokens)
    .concat(Object.entries(arbiConfig.addresses.rTokens))
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
const testUser = Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2')
const issueanceCases = [
  makeMintTestCase(1000, t.USDC, rTokens.KNOX),
  makeMintTestCase(1000, t.USDT, rTokens.KNOX),
  makeMintTestCase(1000, t.DAI, rTokens.KNOX),
  makeMintTestCase(5, t.WETH, rTokens.KNOX),
]

const redeemCases = [
  makeMintTestCase(1000, rTokens.KNOX, t.USDC),
  makeMintTestCase(1000, rTokens.KNOX, t.USDT),
  makeMintTestCase(1000, rTokens.KNOX, t.DAI),
  makeMintTestCase(1000, rTokens.KNOX, t.WETH),
]

let universe: ArbitrumUniverse
beforeAll(async () => {
  const provider = getProvider(process.env.ARBITRUM_PROVIDER!)

  universe = await Universe.createWithConfig(
    provider,
    { ...arbiConfig, searcherMaxRoutesToProduce: 1 },
    async (uni) => {
      uni.addTradeVenue(createKyberswap('Kyber', uni))
      uni.addTradeVenue(createParaswap('paraswap', uni))
      uni.addTradeVenue(createEnso('enso', uni, 1))

      await setupArbitrumZapper(uni)
    },
    {
      simulateZapFn: makeCustomRouterSimulator(
        process.env.SIM_URL!,
        arbiWhales
      ),
    }
  )

  await universe.initialized
  return universe
}, 5000)

describe('arbitrum zapper', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await universe.provider.getBlockNumber(),
      (await universe.provider.getGasPrice()).toBigInt()
    )
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
              amount: issueance.input,
            },
            issueance.output
          )
        },
        15 * 1000
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
              amount: redeem.input,
            },
            redeem.output
          )
        },
        15 * 1000
      )
    })
  }
})

describe('Edge cases', () => {
  it(
    'Mint an rToken with 0 supply',
    async () => {
      expect.assertions(1)
      await universe.initialized
      const input = universe.commonTokens.USDC.from(10.0)
      const output = await universe.defineRToken(
        Address.from('0x635f80eea9df5936772165740120e677878b55a6')
      )

      let result = 'failed'
      try {
        await universe.zap(input, output, testUser, {
          enableTradeZaps: false,
        })
        result = 'success'
      } catch (e) { }
      expect(result).toBe('success')
    },
    15 * 1000
  )
})

afterAll(() => {
  ; (universe.provider as WebSocketProvider).websocket.close()
})
