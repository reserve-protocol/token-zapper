import { Address } from '../base/Address'
import { Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ethers } from 'ethers'
import curve from '@curvefi/api'
import { curve as curveInner } from '@curvefi/api/lib/curve'
import { formatUnits } from 'ethers/lib/utils'
import { LPToken } from './LPToken'
import { DefaultMap } from '../base'
import { IRoute } from '@curvefi/api/lib/interfaces'
type CurveType = typeof curve

type PoolTemplate = InstanceType<CurveType['PoolTemplate']>
const curveRouterAddress = '0xfA9a30350048B2BF66865ee20363067c66f67e58'
class CurvePool {
  [Symbol.toStringTag] = 'CurvePool'
  constructor(
    readonly address: Address,
    readonly tokens: Token[],
    readonly underlyingTokens: Token[],
    readonly meta: PoolTemplate,
    readonly templateName: string
  ) {}

  toString() {
    let out = `CurvePool(name=${this.meta.name},tokens=${this.tokens.join(
      ', '
    )}`
    if (this.underlyingTokens.length > 0) {
      out += `,underlying=${this.underlyingTokens.join(', ')}`
    }
    return out + ')'
  }
}

const predefiendRoutes: Record<string, IRoute> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f':
    [
      {
        poolId: 'fraxusdc',
        poolAddress: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
        inputCoinAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        outputCoinAddress: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
        i: 1,
        j: 0,
        swapType: 7,
        swapAddress: '0x0000000000000000000000000000000000000000',
      },
      {
        poolId: 'factory-v2-277',
        poolAddress: '0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f',
        inputCoinAddress: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
        outputCoinAddress: '0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f',
        i: 1,
        j: 0,
        swapType: 7,
        swapAddress: '0x0000000000000000000000000000000000000000',
      },
    ],
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.0x5a6a4d54456819380173272a5e8e9b9904bdf41b':
    [
      {
        poolId: '3pool',
        poolAddress: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
        inputCoinAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        outputCoinAddress: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        i: 1,
        j: 0,
        swapType: 8,
        swapAddress: '0x0000000000000000000000000000000000000000',
      },
      {
        poolId: 'mim',
        poolAddress: '0x5a6a4d54456819380173272a5e8e9b9904bdf41b',
        inputCoinAddress: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        outputCoinAddress: '0x5a6a4d54456819380173272a5e8e9b9904bdf41b',
        i: 1,
        j: 0,
        swapType: 7,
        swapAddress: '0x0000000000000000000000000000000000000000',
      },
    ],
}

const _getExchangeMultipleArgs = (
  route: IRoute
): {
  _route: string[]
  _swapParams: number[][]
  _factorySwapAddresses: string[]
} => {
  let _route = []
  if (route.length > 0) _route.push(route[0].inputCoinAddress)
  let _swapParams = []
  let _factorySwapAddresses = []
  for (const routeStep of route) {
    _route.push(routeStep.poolAddress, routeStep.outputCoinAddress)
    _swapParams.push([routeStep.i, routeStep.j, routeStep.swapType])
    _factorySwapAddresses.push(routeStep.swapAddress)
  }
  _route = _route.concat(
    Array(9 - _route.length).fill(ethers.constants.AddressZero)
  )
  _swapParams = _swapParams.concat(
    Array(4 - _swapParams.length).fill([0, 0, 0])
  )
  _factorySwapAddresses = _factorySwapAddresses.concat(
    Array(4 - _factorySwapAddresses.length).fill(ethers.constants.AddressZero)
  )

  return { _route, _swapParams, _factorySwapAddresses }
}

export class CurveSwap extends Action {
  gasEstimate() {
    return BigInt(250000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    throw new Error('not implemented')
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const key = (
      this.input[0].address +
      '.' +
      this.output[0].address
    ).toLowerCase()
    if (key in predefiendRoutes) {
      const route = predefiendRoutes[key]
      const contract =
        curveInner.contracts[curveInner.constants.ALIASES.registry_exchange]
          .contract
      const { _route, _swapParams, _factorySwapAddresses } =
        _getExchangeMultipleArgs(route)
      const out: ethers.BigNumber = await contract.get_exchange_multiple_amount(
        _route,
        _swapParams,
        amountsIn.amount,
        _factorySwapAddresses,
        curveInner.constantOptions
      )
      return [this.output[0].from(out)]
    }

    try {
      const out = await curve.router.getBestRouteAndOutput(
        amountsIn.token.address.address,
        this.output[0].address.address,
        amountsIn.format()
      )
      return [this.output[0].from(out.output)]
    } catch (e) {
      return [this.output[0].zero]
    }
  }

  constructor(readonly pool: CurvePool, tokenIn: Token, tokenOut: Token) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(tokenIn, Address.from(curveRouterAddress))]
    )
  }

  toString(): string {
    return `Curve(${this.input[0].symbol}.${this.pool.meta.name}.${this.output[0].symbol})`
  }
}

export const loadCurve = async (universe: Universe) => {
  const curvesEdges = new DefaultMap<Token, Map<Token, CurveSwap>>(
    () => new Map()
  )

  const fakeRouterTemplate: PoolTemplate = {
    address: curveRouterAddress,
    name: 'curve-router',
  } as any
  const router = new CurvePool(
    Address.from(fakeRouterTemplate.address),
    [],
    [],
    fakeRouterTemplate,
    'router'
  )
  const defineCurveEdge = (
    pool: CurvePool,
    tokenIn: Token,
    tokenOut: Token
  ) => {
    const edges = curvesEdges.get(tokenIn)
    if (edges.has(tokenOut)) {
      return edges.get(tokenOut)!
    }
    const swap = new CurveSwap(pool, tokenIn, tokenOut)
    edges.set(tokenOut, swap)
    universe.addAction(swap)

    return swap
  }

  const loadCurvePools = async (universe: Universe) => {
    const p = universe.provider as ethers.providers.JsonRpcProvider
    // const batcher = new ethers.providers.JsonRpcBatchProvider(p.connection.url)
    await curve.init('Web3', {
      externalProvider: {
        request: async (req: any) => {
          if (req.method === 'eth_chainId') {
            return '0x' + universe.chainId.toString(16)
          }
          if (req.method === 'eth_gasPrice') {
            return '0x' + universe.gasPrice.toString(16)
          }
          const resp = await p.send(req.method, req.params)
          return resp
        },
      },
    }) // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically

    await curve.cryptoFactory.fetchPools(true)
    await curve.factory.fetchPools(true)
    const poolNames = curve
      .getPoolList()
      .concat(curve.factory.getPoolList())
      .concat(curve.cryptoFactory.getPoolList())

    const poolsUnfiltered = poolNames.map((name) => {
      const pool = curve.getPool(name)
      return { name, pool }
    })

    const pools = poolsUnfiltered.filter(
      ({ pool }) =>
        pool.underlyingDecimals.every((i) => i !== 0) &&
        pool.wrappedDecimals.every((i) => i !== 0)
    )

    const tokenAddresses = [
      ...new Set(
        pools

          .map(({ pool }) =>
            pool.wrappedCoinAddresses
              .concat(pool.underlyingCoinAddresses)
              .map((a) => Address.from(a))
          )
          .flat()
      ),
    ]
    const badTokens = new Set<string>()
    await Promise.all(
      tokenAddresses.map(async (address) =>
        universe.getToken(address).catch((e) => {
          badTokens.add(address.address.toString())
        })
      )
    )
    const curvePools = await Promise.all(
      pools
        .filter(({ pool }) => {
          for (const addr of pool.wrappedCoinAddresses) {
            if (!universe.tokens.has(Address.from(addr))) {
              return false
            }
          }
          for (const addr of pool.underlyingCoinAddresses) {
            if (!universe.tokens.has(Address.from(addr))) {
              return false
            }
          }
          return true
        })
        .map(async ({ name, pool }) => {
          const tokens = pool.wrappedCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )
          const underlying = pool.underlyingCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )

          return new CurvePool(
            Address.from(pool.address),
            tokens,
            underlying,
            pool,
            name
          )
        })
    )
    return curvePools
  }

  const addLpToken = async (universe: Universe, pool: CurvePool) => {
    const tokensInPosition = pool.meta.wrappedCoinAddresses.map(
      (a) => universe.tokens.get(Address.from(a))!
    )
    const lpToken = await universe.getToken(Address.from(pool.meta.lpToken))

    if (universe.lpTokens.has(lpToken)) {
      return
    }

    const burn = async (qty: TokenQuantity) => {
      try {
        const out = await (pool.meta.isPlain
          ? pool.meta.withdrawExpected(formatUnits(qty.amount, 18))
          : pool.meta.withdrawWrappedExpected(formatUnits(qty.amount, 18)))
        return out.map((amount, i) => tokensInPosition[i].from(amount))
      } catch (e) {
        console.log(pool.meta)
        throw e
      }
    }

    const mint = async (poolTokens: TokenQuantity[]) => {
      const out = await pool.meta.depositWrappedExpected(
        poolTokens.map((q) => formatUnits(q.amount, 18))
      )
      return lpToken.from(out)
    }

    const lpTokenInstance = new LPToken(lpToken, tokensInPosition, burn, mint)
    universe.defineLPToken(lpTokenInstance)

    // const gaugeToken = await universe.getToken(Address.from(pool.meta.token))
    // universe.lpTokens.set(gaugeToken, lpTokenInstance)
  }

  const addCurvePoolEdges = async (universe: Universe, pools: CurvePool[]) => {
    for (const pool of pools) {
      let missingTok = false
      for (const token of pool.tokens) {
        if (!universe.tokens.has(token.address)) {
          missingTok = true
          break
        }
      }
      for (const token of pool.underlyingTokens) {
        if (!universe.tokens.has(token.address)) {
          missingTok = true
          break
        }
      }
      await addLpToken(universe, pool)
      if (missingTok) {
        continue
      }

      if (pool.templateName.startsWith('factory-')) {
        continue
      }
      for (let aTokenIdx = 0; aTokenIdx < pool.tokens.length; aTokenIdx++) {
        for (
          let bTokenIdx = aTokenIdx + 1;
          bTokenIdx < pool.tokens.length;
          bTokenIdx++
        ) {
          const aToken = pool.tokens[aTokenIdx]
          const bToken = pool.tokens[bTokenIdx]
          if (
            aToken === universe.nativeToken ||
            bToken === universe.nativeToken
          ) {
            continue
          }
          defineCurveEdge(pool, aToken, bToken)
          defineCurveEdge(pool, bToken, aToken)
        }
      }
      for (
        let aTokenIdx = 0;
        aTokenIdx < pool.underlyingTokens.length;
        aTokenIdx++
      ) {
        for (
          let bTokenIdx = aTokenIdx + 1;
          bTokenIdx < pool.underlyingTokens.length;
          bTokenIdx++
        ) {
          const aToken = pool.underlyingTokens[aTokenIdx]
          const bToken = pool.underlyingTokens[bTokenIdx]
          if (
            aToken === universe.nativeToken ||
            bToken === universe.nativeToken
          ) {
            continue
          }
          defineCurveEdge(pool, aToken, bToken)
          defineCurveEdge(pool, bToken, aToken)
        }
      }
    }
  }

  const pools = await loadCurvePools(universe)
  await addCurvePoolEdges(universe, pools)

  return {
    createLpToken: async (token: Token) => {
      const pool = pools.find((pool) => pool.address === token.address)
      if (!pool) {
        throw new Error('No curve pool found for token ' + token)
      }
      await addLpToken(universe, pool)
    },
    createRouterEdge: (tokenA: Token, tokenB: Token) => {
      return defineCurveEdge(router, tokenA, tokenB)
    },
  }
}
