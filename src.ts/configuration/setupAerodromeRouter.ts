import { BigNumber } from 'ethers'
import { Universe } from '../Universe'
import { RouterAction } from '../action/RouterAction'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import {
  IAerodromeRouter,
  IAerodromeRouter__factory,
  IAerodromeSugar__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Approval } from '../base/Approval'
import { Planner, Value } from '../tx-gen/Planner'
import { SwapPlan } from '../searcher/Swap'

const shuffle = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const routers: Record<number, { router: string; sugar: string }> = {
  8453: {
    router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
    sugar: '0xc301856b4262e49e9239ec8a2d0c754d5ae317c0',
  },
}
type RouteStruct = {
  from: string
  to: string
  stable: boolean
  factory: string
}

const computeIdFromRoute = (route: SwapRouteStep[]) => {
  let outId = 0n
  for (let i = 0; i < route.length; i++) {
    const step = route[i]
    outId = (outId + BigInt(step.stepId)) << BigInt(i * 19)
  }
  // console.log(route.map((i) => i.stepId).join(', '), outId)
  return outId
}
class AerodromePathStep {
  constructor(
    public readonly step: SwapRouteStep,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity
  ) {}

  get pool() {
    return this.step.pool
  }

  toString() {
    return `AerodromePathStep${this.input} -> ${this.output}`
  }
}
class AerodromePath {
  constructor(public readonly steps: AerodromePathStep[]) {}
  compare(other: AerodromePath) {
    return other.output.compare(this.output)
  }
  static from(route: SwapRouteStep[], amts: BigNumber[]) {
    const steps: AerodromePathStep[] = []
    for (let i = 0; i < steps.length; i++) {
      const step = route[i]
      const input = step.tokenIn.from(amts[i].toBigInt())
      const output = step.tokenOut.from(amts[i + 1].toBigInt())
      steps.push(new AerodromePathStep(step, input, output))
    }
    return new AerodromePath(steps)
  }

  get output() {
    return this.steps[this.steps.length - 1].output
  }

  get input() {
    return this.steps[0].input
  }

  toString() {
    return `${this.input} -> ${this.steps
      .map((s) => s.pool.poolAddress.toShortString() + ' -> ' + s.output)
      .join(' -> ')}`
  }
}

class AerodromeRouterSwap extends Action('Aerodrome') {
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      IAerodromeRouter__factory.connect(
        this.router.address,
        this.universe.provider
      )
    )

    const [minOut] = await this.quoteWithSlippage(predicted)
    planner.add(
      lib.swapExactTokensForTokens(
        inputs[0] ?? predicted[0].amount,
        minOut.amount,
        this.path.steps.map((step) => step.step.intoRouteStruct()),
        this.universe.execAddress.address,
        Date.now() + 1000 * 60 * 10
      ),
      this.toString()
    )!

    return this.outputBalanceOf(this.universe, planner)
  }

  public get returnsOutput() {
    return true
  }
  public get supportsDynamicInput() {
    return true
  }
  public get oneUsePrZap() {
    return true
  }
  public get addressesInUse() {
    return this.addrsUsedInSwap
  }
  gasEstimate() {
    return BigInt(200000n) * BigInt(this.path.steps.length)
  }

  async quote([]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return Promise.resolve([this.path.output])
  }
  get outputSlippage() {
    return this.quoteSlippage + 50n
  }
  private addrsUsedInSwap: Set<Address>
  constructor(
    readonly universe: Universe,
    readonly path: AerodromePath,
    readonly router: IAerodromeRouter,
    readonly quoteSlippage: bigint
  ) {
    super(
      universe.execAddress,
      [path.input.token],
      [path.output.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(path.input.token, Address.from(router.address))]
    )
    this.addrsUsedInSwap = new Set(
      this.path.steps.map((i) => i.pool.poolAddress)
    )

    if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
      throw new Error('RouterAction requires exactly one input and one output')
    }
  }
  toString(): string {
    return `AerodromeRouter(${this.path.toString()})`
  }
}

class AerodromePool {
  constructor(
    public readonly poolAddress: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    public readonly poolToken: Token | null,
    public readonly fee: bigint,
    public readonly poolType: number,
    public readonly factory: AerodromeFactory
  ) {}

  toString() {
    return `${this.token0}.AD.${this.poolAddress.toShortString()}.${this.fee},${
      this.token1
    }`
  }
}

class SwapRouteStep {
  private static _id = 0
  public readonly stepId = SwapRouteStep._id++
  constructor(
    public readonly pool: AerodromePool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token
  ) {}

  toString() {
    return `(${this.tokenIn} -> ${this.tokenOut})`
  }

  intoRouteStruct(): RouteStruct {
    return {
      from: this.tokenIn.address.address,
      to: this.tokenOut.address.address,
      stable: this.pool.poolType === 0,
      factory: this.pool.factory.address.address,
    }
  }
}
class AerodromeFactory {
  constructor(public readonly address: Address) {}

  public toString() {
    return `AerodromeFactory(${this.address})`
  }
}

export const setupAerodromeRouter = async (universe: Universe) => {
  const routerAddr = Address.from(routers[universe.chainId].router)
  const sugarAddr = Address.from(routers[universe.chainId].sugar)

  const sugarInst = IAerodromeSugar__factory.connect(
    sugarAddr.address,
    universe.provider
  )

  const routerInst = IAerodromeRouter__factory.connect(
    routerAddr.address,
    universe.provider
  )

  const factories = new Map<Address, AerodromeFactory>([
    [
      Address.from('0x420DD381b31aEf6683db6B902084cB0FFECe40Da'),
      new AerodromeFactory(
        Address.from('0x420DD381b31aEf6683db6B902084cB0FFECe40Da')
      ),
    ],
    [
      Address.from('0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A'),
      new AerodromeFactory(
        Address.from('0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A')
      ),
    ],
  ])

  console.log('Aerodrome: Loading pools')
  let pools = await Promise.all(
    (
      await sugarInst.forSwaps(1000, 0)
    ).map(async ({ token0, token1, lp, poolType, poolFee, factory }) => {
      const [tok0, tok1, poolToken] = await Promise.all([
        await universe.getToken(Address.from(token0)),
        await universe.getToken(Address.from(token1)),
        universe.getToken(Address.from(lp)).catch(() => null),
      ])
      if (tok0 == null || tok1 == null) {
        return null
      }

      const factoryAddr = Address.from(factory)

      let factoryInst = factories.get(factoryAddr)
      if (factoryInst == null) {
        factoryInst = new AerodromeFactory(factoryAddr)
        factories.set(factoryAddr, factoryInst)
      }

      const pool = new AerodromePool(
        Address.from(lp),
        tok0,
        tok1,
        poolToken,
        poolFee.toBigInt(),
        poolType,
        factoryInst
      )
      return pool
    })
  )
  pools.concat(
    await Promise.all(
      (
        await sugarInst.forSwaps(1000, 1000)
      ).map(async ({ token0, token1, lp, poolType, poolFee, factory }) => {
        const [tok0, tok1, poolToken] = await Promise.all([
          await universe.getToken(Address.from(token0)),
          await universe.getToken(Address.from(token1)),
          universe.getToken(Address.from(lp)).catch(() => null),
        ])
        if (tok0 == null || tok1 == null) {
          return null
        }

        const factoryAddr = Address.from(factory)

        let factoryInst = factories.get(factoryAddr)
        if (factoryInst == null) {
          factoryInst = new AerodromeFactory(factoryAddr)
          factories.set(factoryAddr, factoryInst)
        }

        const pool = new AerodromePool(
          Address.from(lp),
          tok0,
          tok1,
          poolToken,
          poolFee.toBigInt(),
          poolType,
          factoryInst
        )
        return pool
      })
    )
  )

  const directSwaps = new DefaultMap<Token, DefaultMap<Token, AerodromePool[]>>(
    () => new DefaultMap(() => [])
  )

  for (const pool of pools) {
    if (pool == null) {
      continue
    }
    directSwaps.get(pool.token0).get(pool.token1).push(pool)
    directSwaps.get(pool.token1).get(pool.token0).push(pool)
  }

  const twoStepSwaps = new DefaultMap<
    Token,
    DefaultMap<Token, SwapRouteStep[][]>
  >(() => new DefaultMap(() => []))

  const toks = [...directSwaps.keys()]

  const badRoutes = new Set<bigint>()
  const findRoutes = (src: Token, dst: Token): SwapRouteStep[][] => {
    const resultSet = [
      ...directSwaps
        .get(src)
        .get(dst)
        .map((pool) => [new SwapRouteStep(pool, src, dst)]),
      ...twoStepSwaps.get(src).get(dst),
    ]

    return resultSet.filter((route) => {
      const id = computeIdFromRoute(route)
      if (badRoutes.has(id)) {
        return false
      }
      return true
    })
  }

  for (const token0 of toks) {
    for (const token1 of toks) {
      if (token0 === token1) continue
      for (const token2 of toks) {
        if (token0 === token2 || token1 === token2) continue
        const pool01 = directSwaps.get(token0).get(token1)
        if (pool01.length === 0) continue
        const pool12 = directSwaps.get(token1).get(token2)
        if (pool12.length === 0) continue
        for (const p0 of pool01) {
          for (const p1 of pool12) {
            twoStepSwaps
              .get(token0)
              .get(token2)
              .push([
                new SwapRouteStep(p0, token0, token1),
                new SwapRouteStep(p1, token1, token2),
              ])

            twoStepSwaps
              .get(token2)
              .get(token0)
              .push([
                new SwapRouteStep(p1, token2, token1),
                new SwapRouteStep(p0, token1, token0),
              ])
          }
        }
      }
    }
  }

  const out = new DexRouter(
    'aerodrome',
    async (abort, input, output, slippage) => {
      const routes = findRoutes(input.token, output)

      if (routes.length === 0) {
        throw new Error('No route found')
      }

      for (const route of routes) {
        if (route.length <= 1) {
          continue
        }
        const lastStep = route.at(-1)!
        const pools = directSwaps.get(lastStep.tokenOut).get(output)

        if (pools.length === 0) {
          continue
        }
        for (const pool of pools) {
          routes.push([
            ...route,
            new SwapRouteStep(pool, lastStep.tokenOut, output),
          ])
        }
      }

      const toEvaluate = shuffle(routes).slice(0, 20)

      const inputValue = await universe.fairPrice(input)
      if (inputValue == null || inputValue.amount === 0n) {
        throw new Error('Failed to quote')
      }
      const inpValue = parseFloat(inputValue.format())

      const outputs: AerodromePath[] = []
      await Promise.all(
        toEvaluate.map(async (route) => {
          if (outputs.length > 10) {
            return
          }
          const parts = await routerInst.getAmountsOut(
            input.amount,
            route.map((step) => step.intoRouteStruct())
          )
          const outRoute = AerodromePath.from(route, parts)
          if (outRoute.output.amount === 0n) {
            return
          }
          if (outputs.length > 10) {
            return
          }
          const outputValue =
            (await universe.fairPrice(outRoute.output)) ?? universe.usd.zero
          if (outputValue.amount === 0n) {
            return
          }
          const ratio = parseFloat(outputValue.format()) / inpValue
          if (ratio < 0.95) {
            return outputs.push(AerodromePath.from(route, parts))
          }
          const id = computeIdFromRoute(route)
          badRoutes.add(id)
          return null!
        })
      )

      outputs.sort((a, b) => a.compare(b))

      if (outputs.length == 0) {
        throw new Error('No results')
      }
      console.log('Aerodrome generated out:')
      console.log(outputs.map((i) => `  ${i}`).join('\n'))

      const outAction = new AerodromeRouterSwap(
        universe,
        outputs[0],
        routerInst,
        BigInt(slippage)
      )
      const plan = new SwapPlan(universe, [outAction])
      return await plan.quote([input], universe.execAddress)
    },
    true
  )

  return new TradingVenue(
    universe,
    out,
    async (inputToken: Token, outputToken: Token) => {
      return new RouterAction(
        out,
        universe,
        routerAddr,
        inputToken,
        outputToken,
        universe.config.defaultInternalTradeSlippage
      )
    }
  )
}
