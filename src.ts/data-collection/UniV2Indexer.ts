import { Indexer } from './Indexer'
import { Address } from '../base/Address'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'

dotenv.config()

const FACTORIES = [
  '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A',
  '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
]

class UniV2Indexer extends Indexer {
  factory: Address
  provider: ethers.providers.JsonRpcProvider
  constructor(chainId: string, provider: ethers.providers.JsonRpcProvider) {
    super(chainId)
    this.factory = Address.from(FACTORIES[0])
    this.provider = provider
  }

  async processBlocks(start: number, end: number): Promise<void> {
    console.log(`Processing blocks ${start} to ${end}`)
    // use ethers to filter events by block range
    const factoryInst = IUniswapV2Factory__factory.connect(
      this.factory.address,
      this.provider
    )
    const events = await factoryInst.queryFilter(
      factoryInst.filters.PairCreated(),
      start,
      end
    )
    console.log(`Found ${events.length} events`)
  }
}

// async function main() {
//   const indexer = new UniV2Indexer(
//     '8543',
//     new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER)
//   )
//   await indexer.run()
// }

// main().catch((error) => {
//   console.error(error)

//   process.exitCode = 1
// })

const QUERY_POOLS_FOR_TOKEN = async (token: string, skip: number) => {
  const query = `query GetPools($token: String, $skip: Int) {
    pairCreateds(
        skip: $skip,
        first: ${pageSize},
        where: {
            or: [
                {
                    token0: $token
                },
                {
                    token1: $token
                }
            ]
        }
    ) {
        id
        token0 {
            id
        }
        token1 {
            id
        }
        trackedReserveETH
    }
  }`
}

import fs from 'fs'
import { IUniswapV2Pair__factory } from '../contracts/factories/contracts/IUniswapV2Pair__factory'
import { IUniswapV2Factory__factory } from '../contracts'
// import { IERC20__factory } from './contracts'
require('dotenv').config()
const endpoint =
  'https://gateway.thegraph.com/api/0bb62a8cd5cce0c929c1a9e55909e374/subgraphs/id/2yZxeDvpLP3jpeDDxzrvtWUbHDifqB1ndRBc767pd49f'
const pageSize = 500
const query = `query Load($startIndex: String, $endIndex: String) {
  pairCreateds(first: ${pageSize}, where:{
    param3_gte: $startIndex,
    param3_lte: $endIndex
  }) {
    pair
    token0
    token1
  }
}`

const loadAllPairs = async () => {
  const allPairIds = new Set<string>()
  const allPairs: {
    pair: string
    token0: string
    token1: string
  }[] = []
  let i = 0
  while (true) {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: {
          startIndex: (i * pageSize).toString(),
          endIndex: ((i + 1) * pageSize).toString(),
        },
      }),
    })

    const data: {
      data: {
        pairCreateds: {
          pair: string
          token0: string
          token1: string
        }[]
      }
    } = await res.json()
    if (!Array.isArray(data?.data?.pairCreateds)) {
      console.log(`Error loading page ${i}, retrying...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      continue
    }
    allPairs.push(
      ...data.data.pairCreateds.filter((p) => !allPairIds.has(p.pair))
    )
    for (const id of data.data.pairCreateds.map((p) => p.pair)) {
      allPairIds.add(id)
    }
    fs.writeFileSync(
      'src.ts/configuration/data/8453/all-v2-pairs.json',
      JSON.stringify(allPairs, null, 2)
    )
    console.log(`Loaded ${allPairs.length} pairs`)
    if (data.data.pairCreateds.length < pageSize) {
      break
    }
    i++
  }
  console.log(`Done`)
}

loadAllPairs()

// const weth = '0x4200000000000000000000000000000000000006'
// const exportUniV2Pools = async () => {
//   const v2Pairs = JSON.parse(
//     fs.readFileSync('src.ts/configuration/data/8453/univ2.json', 'utf8')
//   ).map((i: any) => {
//     return {
//       id: i.id.toLowerCase(),
//       token0: {
//         id: i.token0.id.toLowerCase(),
//       },
//       token1: {
//         id: i.token1.id.toLowerCase(),
//       },
//     }
//   }) as {
//     id: string
//     token0: {
//       id: string
//     }
//     token1: {
//       id: string
//     }
//   }[]
//   const allPairs = JSON.parse(
//     fs.readFileSync('src.ts/configuration/data/8453/all-v2-pairs.json', 'utf8')
//   ).map((i: any) => {
//     return {
//       pair: i.pair.toLowerCase(),
//       token0: i.token0.toLowerCase(),
//       token1: i.token1.toLowerCase(),
//     }
//   }) as {
//     pair: string
//     token0: string
//     token1: string
//   }[]
//   const uiTokens: {
//     chainId: number
//     address: string
//     name: string
//     symbol: string
//     decimals: number
//   }[] = JSON.parse(
//     fs.readFileSync('src.ts/configuration/data/8453/ui-tokens.json', 'utf8')
//   )

//   const interestingTokens = new Set<string>(
//     uiTokens.map((t) => t.address.toLowerCase())
//   )

//   const loadedPairs = new Set<string>(v2Pairs.map((p) => p.id.toLowerCase()))

//   const specialTokens = new Set<string>([
//     weth,
//     '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
//     '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
//   ])

//   const interestingPairs = allPairs.filter((p) => {
//     if (!loadedPairs.has(p.pair)) {
//       return false
//     }
//     if (!(specialTokens.has(p.token0) || specialTokens.has(p.token1))) {
//       return false
//     }
//     if (interestingTokens.has(p.token0) || interestingTokens.has(p.token1)) {
//       return true
//     }
//     return false
//   })

//   const sourcableTokens = new Set<string>()
//   for (const p of interestingPairs) {
//     sourcableTokens.add(p.token0)
//     sourcableTokens.add(p.token1)
//   }
//   for (const p of v2Pairs) {
//     sourcableTokens.add(p.token0.id)
//     sourcableTokens.add(p.token1.id)
//   }
//   const unsourcedTokens = new Set<string>(
//     uiTokens
//       .filter((i) => !sourcableTokens.has(i.address))
//       .map((i) => i.address)
//   )
//   for (const p of allPairs) {
//     if (unsourcedTokens.has(p.token0) || unsourcedTokens.has(p.token1)) {
//       interestingPairs.push(p)
//     }
//   }

//   const poolList = [
//     ...v2Pairs.map((i) => ({
//       id: i.id.toLowerCase(),
//       token0: {
//         id: i.token0.id.toLowerCase(),
//       },
//       token1: {
//         id: i.token1.id.toLowerCase(),
//       },
//     })),
//     ...interestingPairs.map((i) => ({
//       id: i.pair,
//       token0: {
//         id: i.token0.toLowerCase(),
//       },
//       token1: {
//         id: i.token1.toLowerCase(),
//       },
//     })),
//   ]
//   sourcableTokens.clear()
//   unsourcedTokens.clear()
//   for (const p of poolList) {
//     sourcableTokens.add(p.token0.id)
//     sourcableTokens.add(p.token1.id)
//   }
//   for (const p of uiTokens) {
//     if (!sourcableTokens.has(p.address)) {
//       unsourcedTokens.add(p.address)
//     }
//   }
//   const unsourcableUITokens = uiTokens.filter((i) =>
//     unsourcedTokens.has(i.address)
//   )
//   fs.writeFileSync(
//     'src.ts/configuration/data/8453/ui-tokens-unsourced.json',
//     JSON.stringify(unsourcableUITokens, null, 2)
//   )

//   fs.writeFileSync(
//     'src.ts/configuration/data/8453/univ2.json',
//     JSON.stringify(poolList, null, 2)
//   )
// }
// // exportUniV2Pools()

// const erc20Interface = IERC20__factory.createInterface()

// const filterPoolsBasedOnBalance = async () => {
//   const provider = new ethers.providers.WebSocketProvider(
//     process.env.BASE_PROVIDER!
//   )
//   const pools = JSON.parse(
//     fs.readFileSync('src.ts/configuration/data/8453/univ2.json', 'utf8')
//   ) as {
//     id: string
//     token0: {
//       id: string
//     }
//     token1: {
//       id: string
//     }
//   }[]

//   console.log(`Pools before filtering: ${pools.length}`)
//   const minWETH = 1000000000000000000n
//   const seen = new Set<string>()
//   const poolsWithWethBalance = (
//     await Promise.all(
//       pools
//         .filter((i) => {
//           if (seen.has(i.id)) {
//             return false
//           }
//           seen.add(i.id)
//           return true
//         })
//         .map(async (p) => {
//           if (p.token0.id === weth || p.token1.id === weth) {
//             return {
//               balance: BigInt(
//                 await provider.call({
//                   to: weth,
//                   data: erc20Interface.encodeFunctionData('balanceOf', [p.id]),
//                 })
//               ),
//               pool: p,
//             }
//           }
//           return {
//             balance: null,
//             pool: p,
//           }
//         })
//     )
//   ).filter((p) => {
//     return p.balance == null || p.balance > minWETH
//   })
//   console.log(`Pools after filtering: ${poolsWithWethBalance.length}`)
//   fs.writeFileSync(
//     'src.ts/configuration/data/8453/univ2.json',
//     JSON.stringify(
//       poolsWithWethBalance.map((p) => p.pool),
//       null,
//       2
//     )
//   )
// }
// // filterPoolsBasedOnBalance()
