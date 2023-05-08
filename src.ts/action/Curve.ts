import { Address } from '../base/Address'
import { Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ethers } from 'ethers'
import curve from '@curvefi/api'
import { curve as curveInner } from '@curvefi/api/lib/curve'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { LPToken } from './LPToken'
import { DefaultMap, parseHexStringIntoBuffer } from '../base'
import { IRoute } from '@curvefi/api/lib/interfaces'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
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
  private estimate?: bigint
  gasEstimate() {
    return BigInt(250000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    const output = await this._quote(amountsIn)
    const minOut = this.output[0].fromScale18BN(parseUnits(output.output, 18))
    const contract: ethers.Contract =
      curveInner.contracts[curveInner.constants.ALIASES.registry_exchange]
        .contract
    let value = 0n
    if (amountsIn.token.address.address === GAS_TOKEN_ADDRESS) {
      value = amountsIn.amount
    }
    const { _route, _swapParams, _factorySwapAddresses } =
      _getExchangeMultipleArgs(output.route)

    const data = contract.interface.encodeFunctionData('exchange_multiple', [
      _route,
      _swapParams,
      amountsIn.amount,
      minOut.amount,
      _factorySwapAddresses,
    ])
    const exchangeAddress = Address.from(
      curveInner.constants.ALIASES.registry_exchange
    )

    return new ContractCall(
      parseHexStringIntoBuffer(data),
      exchangeAddress,
      value,
      this.gasEstimate(),
      `Swap ${amountsIn} for at least ${minOut} on Curve}`
    )
  }

  private async _quote(amountsIn: TokenQuantity): Promise<{
    output: string
    route: IRoute
  }> {
    const key = (
      this.input[0].address +
      '.' +
      this.output[0].address
    ).toLowerCase()
    const contract =
      curveInner.contracts[curveInner.constants.ALIASES.registry_exchange]
        .contract
    if (key in this.predefiendRoutes) {
      const route = this.predefiendRoutes[key]

      const { _route, _swapParams, _factorySwapAddresses } =
        _getExchangeMultipleArgs(route)
      const [out, gasEstimate]: [ethers.BigNumber, ethers.BigNumber] =
        await Promise.all([
          contract.get_exchange_multiple_amount(
            _route,
            _swapParams,
            amountsIn.amount,
            _factorySwapAddresses,
            curveInner.constantOptions
          ),
          contract.estimateGas.get_exchange_multiple_amount(
            _route,
            _swapParams,
            amountsIn.amount,
            _factorySwapAddresses,
            curveInner.constantOptions
          ),
        ])
      this.estimate = gasEstimate.toBigInt()

      const output = formatUnits(out.sub(out.div(10000n).mul(7n)), 18)
      return {
        output,
        route,
      }
    }

    try {
      const out = await curve.router.getBestRouteAndOutput(
        amountsIn.token.address.address,
        this.output[0].address.address,
        amountsIn.format()
      )
      const { _route, _swapParams, _factorySwapAddresses } =
        _getExchangeMultipleArgs(out.route)
      const gasEstimate: ethers.BigNumber =
        await contract.estimateGas.get_exchange_multiple_amount(
          _route,
          _swapParams,
          amountsIn.amount,
          _factorySwapAddresses,
          curveInner.constantOptions
        )

      this.estimate = gasEstimate.toBigInt()
      const outParsed = parseUnits(out.output, 18)
      out.output = formatUnits(outParsed.sub(outParsed.div(10000n).mul(7n)), 18)
      return out
    } catch (e) {
      throw e
    }
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = (await this._quote(amountsIn)).output

    return [this.output[0].fromScale18BN(parseUnits(out, 18))]
  }

  constructor(
    public readonly pool: CurvePool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token,
    private readonly predefiendRoutes: Record<string, IRoute>
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          tokenIn,
          Address.from(curveInner.constants.ALIASES.registry_exchange)
        ),
      ]
    )
  }

  toString(): string {
    return `Curve(${this.tokenIn}.${this.pool.meta.name}.${this.tokenOut})`
  }
}

export const loadCurve = async (
  universe: Universe,
  predefinedRoutes: Record<string, IRoute>
) => {
  const curvesEdges = new DefaultMap<Token, Map<Token, CurveSwap>>(
    () => new Map()
  )

  const fakeRouterTemplate: PoolTemplate = {
    address: Address.from('0x99a58482bd75cbab83b27ec03ca68ff489b5788f'),
    name: 'curve-router',
  } as any
  const router: CurvePool = new CurvePool(
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
    const swap = new CurveSwap(pool, tokenIn, tokenOut, predefinedRoutes)
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
      .filter((i) => !i.startsWith('factory-'))
      .concat(['factory-v2-147', 'factory-v2-277'])

    const poolsUnfiltered = poolNames.map((name) => {
      const pool = curve.getPool(name)

      return {
        name,
        pool,
        poolAddress: Address.from(pool.address),
        underlyingCoinAddresses: pool.underlyingCoinAddresses.map(Address.from),
        wrappedCoinAddresses: pool.wrappedCoinAddresses.map(Address.from)
      }
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
