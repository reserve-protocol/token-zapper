import { Address } from '../base/Address'
import { Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ethers } from 'ethers'
import curve from '@curvefi/api'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { LPToken } from './LPToken'
import { DefaultMap } from '../base'
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
    await curve.init('JsonRpc', {
      url: p.connection.url,
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
      if (missingTok) {
        continue
      }

      await addLpToken(universe, pool)

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
