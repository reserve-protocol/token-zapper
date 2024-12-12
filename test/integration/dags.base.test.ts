import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

import { WebSocketProvider } from '@ethersproject/providers'
import { makeCustomRouterSimulator } from '../../src.ts/configuration/ChainConfiguration'
import {
  Address,
  BaseUniverse,
  DagSearcher,
  baseConfig,
  setupBaseZapper,
  Universe,
} from '../../src.ts/index'
dotenv.config()

if (process.env.MAINNET_PROVIDER == null) {
  console.log('MAINNET_PROVIDER not set, skipping tests')
  process.exit(0)
}
/** !!
 * To run the integration test suite you'll need to run the simulator locally.
 *
 * You can do this by cloning the revm-router-simulater [repo](https://github.com/jankjr/revm-router-simulator)
 */
if (process.env.SIMULATE_URL == null) {
  console.log('SIMULATE_URL not set, skipping simulation tests')
  process.exit(0)
}
export const baseWhales = {
  // main base toks
  '0xab36452dbac151be02b16ca17d8919826072f64a':
    '0x796d2367af69deb3319b8e10712b8b65957371c3', // rsr
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':
    '0xf977814e90da44bfa03b6295a0616a897441acec', // usdc

  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22':
    '0x3bf93770f2d4a794c3d9ebefbaebae2a8f09a5e5', // cbeth

  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca':
    '0x0b25c51637c43decd6cc1c1e3da4518d54ddb528', // usdbc

  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb':
    '0x73b06d8d18de422e269645eace15400de7462417', // dai

  '0x4200000000000000000000000000000000000006':
    '0x0250f06fc76297fe28d0981f0566f1c0445b3cfe', // weth

  '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452':
    '0x99cbc45ea5bb7ef3a5bc08fb1b7e56bb2442ef0d', // wsteth

  '0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4':
    '0x5400dbb270c956e8985184335a1c62aca6ce1333',

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

const INPUT_MUL = process.env.INPUT_MULTIPLIER
  ? parseFloat(process.env.INPUT_MULTIPLIER)
  : 1.0
if (isNaN(INPUT_MUL)) {
  throw new Error('INPUT_MUL must be a number')
}

let initialized = false
export let universe: BaseUniverse
const provider = getProvider(process.env.BASE_PROVIDER!)

provider.on('debug', (log) => {
  if (
    !initialized ||
    log?.action !== 'request' ||
    log?.request?.method !== 'eth_call' ||
    log?.request?.params[0].to == null ||
    log?.request?.params[0].data == null
  ) {
    return
  }
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
        ...baseConfig,
        searcherMinRoutesToProduce: 1,
        maxSearchTimeMs: 60000,
      },
      async (uni) => {
        await setupBaseZapper(uni as any as BaseUniverse).catch((e) => {
          console.log(e)
          process.exit(1)
        })
      },
      {
        simulateZapFn: makeCustomRouterSimulator(
          process.env.SIMULATE_URL!,
          baseWhales
        ),
      }
    )) as any as BaseUniverse

    await universe.initialized

    await universe.updateBlockState(
      await provider.getBlockNumber(),
      (await provider.getGasPrice()).toBigInt()
    )
    initialized = true
    console.log(`Done initializing`)

    return universe
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}, 30000)

describe('dag builder', () => {
  beforeEach(async () => {
    await universe.updateBlockState(
      await provider.getBlockNumber(),
      // 1_000_000_000n * 120n
      (await provider.getGasPrice()).toBigInt()
    )
  })

  describe('Standard RToken redeems', () => {
    it('10 bsdETH => weth', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.bsd.from(10.0),
        universe.commonTokens.WETH
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)

    it('300 bsdETH => weth', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.bsd.from(300.0),
        universe.commonTokens.WETH
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)

    it('10.000 hyUSD => USDC', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.hyUSD.from(10_000.0),
        universe.commonTokens.USDC
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)

    it('1.000.000 hyUSD => USDC', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.hyUSD.from(1_000_000.0),
        universe.commonTokens.USDC
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)


    it('30 BSDX => ETH', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.BSDX.from(30.0),
        universe.commonTokens.WETH
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)

    it('10.000 BSDX => ETH', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.BSDX.from(10_000.0),
        universe.commonTokens.WETH
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)

    it('1.000.000 BSDX => ETH', async () => {
      const dag = await new DagSearcher(universe).buildZapOutDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        universe.rTokens.BSDX.from(1_000_000.0),
        universe.commonTokens.WETH
      )

      const res = await dag.dag.evaluate()
      console.log(
        `Result ${res.outputs.join(', ')} - output value: ${
          res.outputsValue
        } - dust value: ${res.dustValue}`
      )
      console.log(res.toDot())
    }, 60000)
  })

  describe('Standard RToken zaps', () => {
    it('0.1 WETH => BSDX', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.WETH.from(0.1)],
        universe.rTokens.BSDX
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)

    it('100 WETH => BSDX', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.WETH.from(100.0)],
        universe.rTokens.BSDX
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)

    it('10 WETH => bsdETH', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.WETH.from(10.0)],
        universe.rTokens.bsd
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)

    it('1000 WETH => bsdETH', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.WETH.from(1000.0)],
        universe.rTokens.bsd
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)

    it('10.000 USDC => hyUSD', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.USDC.from(10_000.0)],
        universe.rTokens.hyUSD
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)

    it('1.000.000 USDC => hyUSD', async () => {
      const dag = await new DagSearcher(universe).buildZapInDag(
        Address.from('0xF2d98377d80DADf725bFb97E91357F1d81384De2'),
        [universe.commonTokens.USDC.from(1_000_000.0)],
        universe.rTokens.hyUSD
      )
      console.log(dag.dag.toDot())
      console.log(
        `Result ${dag.outputs.join(', ')} - output value: ${
          dag.outputsValue
        } - dust value: ${dag.dustValue}`
      )
      console.log(dag.toDot())
    }, 60000)
  })
})

afterAll(() => {
  ;(provider as WebSocketProvider).websocket.close()
})
