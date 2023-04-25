import { Address } from '../base/Address'
import { Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ethers } from 'ethers'
import curve from '@curvefi/api'
type CurveType = typeof curve

type PoolTemplate = InstanceType<CurveType['PoolTemplate']>

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
class CurveSwap extends Action {
  gasEstimate() {
    return BigInt(250000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    throw new Error('not implemented')
    // if (this.exchangeUnderlying) {
    //   curve.router.getBestRouteAndOutput
    //   await this.pool.meta.wallet.underlyingCoinBalances()
    //   const out = await this.pool.meta.swapExpected(
    //     this.tokenInIdx,
    //     this.tokenOutIdx,
    //     amountsIn.amount.toString()
    //   )
    //   throw new Error('not implemented')
    // } else {
    //   await this.pool.meta.wallet.wrappedCoinBalances()
    //   const out = await this.pool.meta.swapWrappedExpected(
    //     this.tokenInIdx,
    //     this.tokenOutIdx,
    //     amountsIn.amount.toString()
    //   )
    //   throw new Error('not implemented')
    // }
  }

  /**
   * @node V2Actions can quote in both directions!
   * @returns
   */
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    try {
      if (this.exchangeUnderlying) {
        await this.pool.meta.wallet.underlyingCoinBalances()
        const out = await this.pool.meta.swapExpected(
          this.tokenInIdx,
          this.tokenOutIdx,
          amountsIn.format()
        )
        return [this.output[0].from(out)]
      } else {
        await this.pool.meta.wallet.wrappedCoinBalances()
        const out = await this.pool.meta.swapWrappedExpected(
          this.tokenInIdx,
          this.tokenOutIdx,
          amountsIn.format()
        )
        return [this.output[0].from(out)]
      }
    } catch (e) {
      return [this.output[0].zero]
    }
  }

  constructor(
    readonly pool: CurvePool,
    readonly tokenInIdx: number,
    tokenIn: Token,
    readonly tokenOutIdx: number,
    tokenOut: Token,
    readonly exchangeUnderlying: boolean
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          !exchangeUnderlying
            ? pool.tokens[tokenInIdx]
            : pool.underlyingTokens[tokenInIdx],
          pool.address
        ),
      ]
    )
  }

  toString(): string {
    return `Crv(${this.input[0]}.${this.pool.meta.name}.${this.output[0]})`
  }
}
export const loadCurve = async (universe: Universe) => {
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
      return { name, pool: curve.getPool(name) }
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

  const addCurvePoolEdges = async (universe: Universe, pools: CurvePool[]) => {
    for (const pool of pools) {
      if (pool.templateName.startsWith('factory-')) {
        continue
      }

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
          const edgeI_J = new CurveSwap(
            pool,
            aTokenIdx,
            aToken,
            bTokenIdx,
            bToken,
            false
          )
          const edgeJ_I = new CurveSwap(
            pool,
            bTokenIdx,
            bToken,
            aTokenIdx,
            aToken,
            false
          )
          universe.addAction(edgeI_J)
          universe.addAction(edgeJ_I)
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
          const edgeI_J = new CurveSwap(
            pool,
            aTokenIdx,
            aToken,
            bTokenIdx,
            bToken,
            true
          )
          const edgeJ_I = new CurveSwap(
            pool,
            bTokenIdx,
            bToken,
            aTokenIdx,
            aToken,
            true
          )
          universe.addAction(edgeI_J)
          universe.addAction(edgeJ_I)
        }
      }
    }
  }

  const pools = await loadCurvePools(universe)
  await addCurvePoolEdges(universe, pools)
}
