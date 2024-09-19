import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

import { WebSocketProvider } from '@ethersproject/providers'
import {
  Address,
  baseConfig,
  createEnso,
  createKyberswap,
  createParaswap,
  makeCustomRouterSimulator,
  setupBaseZapper,
  Universe,
} from '../../src.ts/index'
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
if (process.env.SIM_URL == null) {
  console.log('SIM_URL not set, skipping simulation tests')
  process.exit(0)
}

export const baseWhales = {
  // main base toks
  '0xab36452dbac151be02b16ca17d8919826072f64a':
    '0x796d2367af69deb3319b8e10712b8b65957371c3', // rsr
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':
    '0xcdac0d6c6c59727a65f871236188350531885c43', // usdc

  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22':
    '0xcf3d55c10db69f28fd1a75bd73f3d8a2d9c595ad', // cbeth

  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca':
    '0x0b25c51637c43decd6cc1c1e3da4518d54ddb528', // usdbc

  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb':
    '0x927860797d07b1c46fbbe7f6f73d45c7e1bfbb27', // dai

  '0x4200000000000000000000000000000000000006':
    '0xcdac0d6c6c59727a65f871236188350531885c43', // weth

  '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452':
    '0x99cbc45ea5bb7ef3a5bc08fb1b7e56bb2442ef0d', // wsteth

  // rtokens
  '0xcc7ff230365bd730ee4b352cc2492cedac49383e':
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // hyusd
  '0xcb327b99ff831bf8223cced12b1338ff3aa322ff':
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // bsdeth
  '0xfe0d6d83033e313691e96909d2188c150b834285':
    '0x1ef46018244179810dec43291d693cb2bf7f40e5', // iusdc
  '0xc9a3e2b3064c1c0546d3d0edc0a748e9f93cf18d':
    '0x6f1d6b86d4ad705385e751e6e88b0fdfdbadf298', // vaya
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
const testUser = Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2')
const issueanceCases = [
  makeMintTestCase(10000, t.USDC, rTokens.hyUSD),
  makeMintTestCase(10000, t.USDbC, rTokens.hyUSD),

  makeMintTestCase(5, t.WETH, rTokens.bsd),
  makeMintTestCase(5, t.wstETH, rTokens.bsd),
  makeMintTestCase(5, t.cbETH, rTokens.bsd),
]

const redeemCases = [
  makeMintTestCase(10000, rTokens.hyUSD, t.USDC),
  makeMintTestCase(10000, rTokens.hyUSD, t.USDbC),

  makeMintTestCase(5, rTokens.bsd, t.WETH),
  makeMintTestCase(5, rTokens.bsd, t.wstETH),
  makeMintTestCase(5, rTokens.bsd, t.cbETH),
]

let universe: Universe
beforeAll(async () => {
  const provider = getProvider(process.env.BASE_PROVIDER!)

  universe = await Universe.createWithConfig(
    provider,
    baseConfig,
    async (uni) => {
      uni.addTradeVenue(createKyberswap('Kyber', uni))
      uni.addTradeVenue(createParaswap('paraswap', uni))
      uni.addTradeVenue(createEnso('enso', uni, 1))

      await setupBaseZapper(uni)
    },
    {
      simulateZapFn: makeCustomRouterSimulator(
        process.env.SIM_URL!,
        baseWhales
      ),
    }
  )

  await universe.initialized
  return universe
}, 5000)

const log = console.log
describe('base zapper', () => {
  beforeAll(() => {
    console.log = () => {}
  })

  for (const issueance of issueanceCases) {
    const testCaseName = `using ${getSymbol.get(
      issueance.inputToken
    )!} issue ${getSymbol.get(issueance.output)!}`
    describe(testCaseName, () => {
      it(
        'produces an output',
        async () => {
          expect.assertions(1)
          await universe.initialized
          const input = universe.tokens
            .get(issueance.inputToken)
            ?.from(issueance.input)
          const output = universe.tokens.get(issueance.output)
          let result = 'failed'

          try {
            await universe.zap(input!, output!, testUser, {
              enableTradeZaps: false,
            })
            result = 'success'
          } catch (e) {
            log(`${testCaseName} = ${e.message}`)
          }
          expect(result).toBe('success')
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
          expect.assertions(1)
          await universe.initialized
          const input = universe.tokens
            .get(redeem.inputToken)
            ?.from(redeem.input)
          const output = universe.tokens.get(redeem.output)
          let result = 'failed'

          try {
            await universe.redeem(input!, output!, testUser)
            result = 'success'
          } catch (e) {
            log(`${testCaseName} = ${e.message}`)
          }
          expect(result).toBe('success')
        },
        15 * 1000
      )
    })
  }
})

afterAll(() => {
  console.log = log
  ;(universe.provider as WebSocketProvider).websocket.close()
})
