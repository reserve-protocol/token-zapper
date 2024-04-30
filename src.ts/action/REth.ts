import { formatEther } from 'ethers/lib/utils'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'

import { IWrappedNative__factory, ZapperExecutor__factory } from '../contracts'
import { IRETHRouter } from '../contracts/contracts/IRETHRouter'
import { IRETHRouter__factory } from '../contracts/factories/contracts/IRETHRouter__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Approval } from '../base/Approval'

export class REthRouter {
  public readonly routerInstance: IRETHRouter
  public readonly mintViaWETH: WETHToRETH
  public readonly mintViaETH: ETHToRETH
  public readonly burn: RETHToWETH
  constructor(
    private readonly universe: Universe,
    public readonly reth: Token,
    public readonly routerAddress: Address
  ) {
    this.routerInstance = IRETHRouter__factory.connect(
      routerAddress.address,
      universe.provider
    )

    this.mintViaWETH = new WETHToRETH(this.universe, this)
    this.mintViaETH = new ETHToRETH(this.universe, this)
    this.burn = new RETHToWETH(this.universe, this)
  }

  public gasEstimate(): bigint {
    return 250000n
  }

  public async optimiseToREth(qtyETH: TokenQuantity) {
    const params = await this.routerInstance.callStatic.optimiseSwapTo(
      qtyETH.amount,
      20
    )
    return {
      portions: params.portions,
      amountOut: this.reth.from(params.amountOut),
      params: [
        params.portions[0],
        params.portions[1],
        params.amountOut,
        params.amountOut,
        qtyETH.amount,
      ] as const,
    }
  }

  public async optimiseFromREth(qtyETH: TokenQuantity) {
    const params = await this.routerInstance.callStatic.optimiseSwapFrom(
      qtyETH.amount,
      20
    )
    return {
      portions: params.portions,
      amountOut: this.universe.wrappedNativeToken.from(params.amountOut),
      params: [
        params.portions[0],
        params.portions[1],
        params.amountOut,
        params.amountOut,
        qtyETH.amount,
      ] as const,
    }
  }
}

type IRouter = Pick<
  InstanceType<typeof REthRouter>,
  | 'optimiseToREth'
  | 'optimiseFromREth'
  | 'reth'
  | 'gasEstimate'
  | 'routerInstance'
>

const ONE = 10n ** 18n

abstract class RocketPoolBase extends Action('Rocketpool') {
  abstract get action(): string
  toString(): string {
    return `RocketpoolRouter.${this.action}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class ETHToRETH extends RocketPoolBase {
  get action(): string {
    return 'swapTo'
  }
  public get outputSlippage(): bigint {
    return this.universe.config.defaultInternalTradeSlippage
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPrecomputed]: TokenQuantity[]
  ): Promise<Value[]> {
    // We want to avoid running the optimiseToREth on-chain.
    // So rather we precompute it during searching and convert the split into two fractions
    const {
      params: [p0, p1, aout, , qty],
    } = await this.router.optimiseToREth(inputPrecomputed)

    const f0 = (p0.toBigInt() * ONE) / qty
    const f1 = (p1.toBigInt() * ONE) / qty

    const routerLib = this.gen.Contract.createContract(
      this.router.routerInstance
    )
    const zapperLib = this.gen.Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.zapperAddress.address,
        this.universe.provider
      )
    )
    if (f0 !== 0n && f1 !== 0n) {
      // Using a helper library we
      const input0 = planner.add(
        zapperLib.fpMul(f0, input, ONE),
        `input * ${formatEther(f0)}`,
        'frac0'
      )
      const input1 = planner.add(
        zapperLib.fpMul(f1, input, ONE),
        `input * ${formatEther(f1)}`,
        'frac1'
      )
      planner.add(
        routerLib.swapTo(input0, input1, aout, aout).withValue(input),
        'RocketPool: ETH -> RETH'
      )
    } else {
      planner.add(
        routerLib
          .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, aout, aout)
          .withValue(input),
        'RocketPool: ETH -> RETH'
      )
    }
    return this.outputBalanceOf(this.universe, planner)
  }

  gasEstimate(): bigint {
    return this.router.gasEstimate()
  }

  async quote([input]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.router.optimiseToREth(input)).amountOut]
  }

  constructor(
    public readonly universe: Universe,
    public readonly router: IRouter
  ) {
    super(
      router.reth.address,
      [universe.nativeToken],
      [router.reth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class WETHToRETH extends RocketPoolBase {
  get action(): string {
    return 'swapTo'
  }
  public get outputSlippage(): bigint {
    return this.universe.config.defaultInternalTradeSlippage
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPrecomputed]: TokenQuantity[]
  ): Promise<Value[]> {
    // We want to avoid running the optimiseToREth on-chain.
    // So rather we precompute it during searching and convert the split into two fractions
    const {
      params: [p0, p1, aout, , qty],
    } = await this.router.optimiseToREth(inputPrecomputed)

    const f0 = (p0.toBigInt() * ONE) / qty
    const f1 = (p1.toBigInt() * ONE) / qty

    const routerLib = this.gen.Contract.createContract(
      this.router.routerInstance
    )
    const zapperLib = this.gen.Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.zapperAddress.address,
        this.universe.provider
      )
    )
    const wethlib = this.gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.universe.wrappedNativeToken.address.address,
        this.universe.provider
      )
    )
    planner.add(wethlib.withdraw(input), 'RocketPool: WETH -> ETH')

    if (f0 !== 0n && f1 !== 0n) {
      // Using a helper library we
      const input0 = planner.add(
        zapperLib.fpMul(f0, input, ONE),
        `input * ${formatEther(f0)}`,
        'frac0'
      )
      const input1 = planner.add(
        zapperLib.fpMul(f1, input, ONE),
        `input * ${formatEther(f1)}`,
        'frac1'
      )
      planner.add(
        routerLib.swapTo(input0, input1, aout, aout).withValue(input),
        'RocketPool: ETH -> RETH'
      )
    } else {
      planner.add(
        routerLib
          .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, aout, aout)
          .withValue(input),
        'RocketPool: ETH -> RETH'
      )
    }
    return this.outputBalanceOf(this.universe, planner)
  }

  gasEstimate(): bigint {
    return this.router.gasEstimate()
  }

  async quote([input]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.router.optimiseToREth(input)).amountOut]
  }

  constructor(
    public readonly universe: Universe,
    public readonly router: IRouter
  ) {
    super(
      router.reth.address,
      [universe.wrappedNativeToken],
      [router.reth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class RETHToWETH extends RocketPoolBase {
  get action(): string {
    return 'swapFrom'
  }
  public get outputSlippage(): bigint {
    return this.universe.config.defaultInternalTradeSlippage
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPrecomputed]: TokenQuantity[]
  ): Promise<Value[]> {
    const zapperLib = this.gen.Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.zapperAddress.address,
        this.universe.provider
      )
    )
    // We want to avoid running the optimiseToREth on-chain.
    // So rather we precompute it during searching and convert the split into two fractions
    const {
      params: [p0, p1, aout, , qty],
    } = await this.router.optimiseFromREth(inputPrecomputed)
    const f0 = (p0.toBigInt() * ONE) / qty
    const f1 = (p1.toBigInt() * ONE) / qty

    const routerLib = this.gen.Contract.createContract(
      this.router.routerInstance
    )

    // Using a helper library we
    const input0 = planner.add(
      zapperLib.fpMul(f0, input, ONE),
      `input * ${formatEther(f0)}`,
      'frac0'
    )
    const input1 = planner.add(
      zapperLib.fpMul(f1, input, ONE),
      `input * ${formatEther(f1)}`,
      'frac1'
    )

    planner.add(
      routerLib.swapFrom(input0, input1, aout, aout),
      'RocketPool: RETH -> ETH'
    )!

    const outBalanace = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.universe.nativeToken,
      this.universe.execAddress
    )
    const wethlib = this.gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.universe.wrappedNativeToken.address.address,
        this.universe.provider
      )
    )
    planner.add(
      wethlib.deposit().withValue(outBalanace),
      'RocketPool: ETH -> WETH'
    )

    return [outBalanace]
  }
  gasEstimate(): bigint {
    return this.router.gasEstimate()
  }

  async quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.router.optimiseFromREth(ethQty)).amountOut]
  }

  constructor(
    public readonly universe: Universe,
    public readonly router: IRouter
  ) {
    super(
      router.reth.address,
      [router.reth],
      [universe.wrappedNativeToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(router.reth, Address.from(router.routerInstance.address))]
    )
  }
}
