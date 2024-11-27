import { type Universe } from '../Universe'
import { Address } from '../base/Address'

import { Approval } from '../base/Approval'
import {
  IRETH,
  IRETH__factory,
  IRETHRouter,
  IRETHRouter__factory,
  RocketDepositPoolInterface,
  RocketDepositPoolInterface__factory,
} from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'

const DEPOSIT_POOL_ADDRESS = Address.from(
  '0xDD3f50F8A6CafbE9b31a427582963f465E745AF8'
)
export class RocketPoolContext {
  public readonly routerInstance: IRETHRouter
  public readonly poolContract: RocketDepositPoolInterface
  public readonly rethContract: IRETH
  public readonly routerToReth: RouterETHToRETH
  public readonly poolDeposit: ETHToRETH
  public readonly routerToETH: RouterRETHToETH

  public async mintRate(rethAmount: TokenQuantity) {
    return this.universe.nativeToken
      .from(await this.rethContract.callStatic.getEthValue(rethAmount.amount))
      .invert()
  }
  constructor(
    private readonly universe: Universe,
    public readonly reth: Token,
    public readonly routerAddress: Address
  ) {
    this.routerInstance = IRETHRouter__factory.connect(
      routerAddress.address,
      universe.provider
    )
    this.rethContract = IRETH__factory.connect(
      reth.address.address,
      universe.provider
    )
    this.poolContract = RocketDepositPoolInterface__factory.connect(
      DEPOSIT_POOL_ADDRESS.address,
      universe.provider
    )

    this.poolDeposit = new ETHToRETH(this, this.universe)

    this.routerToReth = new RouterETHToRETH(this.universe, this)
    this.routerToETH = new RouterRETHToETH(this.universe, this)
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
  InstanceType<typeof RocketPoolContext>,
  | 'optimiseToREth'
  | 'optimiseFromREth'
  | 'reth'
  | 'gasEstimate'
  | 'routerInstance'
>

const ONE = 10n ** 18n

abstract class RouterPoolRouterBase extends Action('RocketpoolRouter') {
  abstract get action(): string
  public get supportsDynamicInput(): boolean {
    return true
  }
  get dependsOnRpc(): boolean {
    return true
  }

  get isTrade(): boolean {
    return true
  }

  get oneUsePrZap(): boolean {
    return true
  }
  get addressesInUse() {
    return new Set([
      Address.from('0xa4e0faA58465A2D369aa21B3e42d43374c6F9613'),
      Address.from('0x1e19cf2d73a72ef1332c882f20534b6519be0276'),
    ])
  }
  toString(): string {
    return `RocketpoolRouter.${this.action}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class ETHToRETH extends BaseAction {
  get protocol(): string {
    return 'RocketPool'
  }
  get action(): string {
    return 'deposit'
  }
  public get returnsOutput(): boolean {
    return false
  }
  public get outputSlippage(): bigint {
    return 1n
  }
  public get isTrade(): boolean {
    return false
  }
  public get oneUsePrZap(): boolean {
    return false
  }
  public get supportsDynamicInput(): boolean {
    return true
  }
  public get dependsOnRpc(): boolean {
    return false
  }
  async plan(planner: Planner, [input]: Value[]) {
    const poolLib = Contract.createContract(this.context.poolContract)
    planner.add(poolLib.deposit().withValue(input), 'RocketPool: ETH -> RETH')
    return null
  }

  gasEstimate(): bigint {
    return 250_000n
  }

  async quote([input]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rethValue = await this.context.rethContract.getRethValue(input.amount)
    return [this.context.reth.from(rethValue)]
  }

  constructor(
    public readonly context: RocketPoolContext,
    public readonly universe: Universe
  ) {
    super(
      Address.from(context.reth.address),
      [universe.nativeToken],
      [context.reth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class RouterETHToRETH extends RouterPoolRouterBase {
  get action(): string {
    return 'swapTo'
  }
  public get returnsOutput(): boolean {
    return false
  }
  public get outputSlippage(): bigint {
    return 1n
  }
  async plan(
    planner: Planner,
    [input_]: Value[],
    _: Address,
    [inputPrecomputed]: TokenQuantity[]
  ) {
    const input = input_ ?? inputPrecomputed.amount
    // We want to avoid running the optimiseToREth on-chain.
    // So rather we precompute it during searching and convert the split into two fractions
    const {
      params: [p0, p1, minOut],
    } = await this.router.optimiseToREth(inputPrecomputed)

    const routerLib = this.gen.Contract.createContract(
      this.router.routerInstance
    )
    planner.add(
      routerLib.swapTo(p0, p1, minOut, minOut).withValue(input),
      this.toString()
    )
    return null
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
      Address.from(router.routerInstance.address),
      [universe.nativeToken],
      [router.reth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class RouterRETHToETH extends RouterPoolRouterBase {
  get action(): string {
    return 'swapFrom'
  }
  public get outputSlippage(): bigint {
    return 1n
  }
  public get supportsDynamicInput(): boolean {
    return true
  }
  public get returnsOutput(): boolean {
    return false
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [amountIn]: TokenQuantity[]
  ) {
    const routerLib = this.gen.Contract.createContract(
      this.router.routerInstance
    )
    const {
      params: [input0, input1, aout],
    } = await this.router.optimiseFromREth(amountIn)
    planner.add(
      routerLib.swapFrom(input0, input1, aout, aout, input),
      this.toString()
    )
    return null
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
      Address.from(router.routerInstance.address),
      [router.reth],
      [universe.nativeToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(router.reth, Address.from(router.routerInstance.address))]
    )
  }
}
