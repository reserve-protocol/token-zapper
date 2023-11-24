import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type Address } from '../base/Address'
import { IRETHRouter } from '../contracts/contracts/IRETHRouter'
import { IRETHRouter__factory } from '../contracts/factories/contracts/IRETHRouter__factory'
import { Planner, Value } from '../tx-gen/Planner'

export class REthRouter {
  public readonly routerInstance: IRETHRouter
  constructor(
    private readonly universe: Universe,
    public readonly reth: Token,
    public readonly routerAddress: Address
  ) {
    this.routerInstance = IRETHRouter__factory.connect(
      routerAddress.address,
      universe.provider
    )
  }

  public gasEstimate(): bigint {
    return 250000n
  }

  public async optimiseToREth(qtyETH: TokenQuantity) {
    if (qtyETH.token !== this.universe.nativeToken) {
      throw new Error('Token must be ETH token')
    }
    const params = await this.routerInstance.callStatic.optimiseSwapTo(
      qtyETH.amount,
      10
    )
    return {
      portions: params.portions,
      amountOut: this.reth.from(params.amountOut),
      contractCall: new ContractCall(
        parseHexStringIntoBuffer(
          this.routerInstance.interface.encodeFunctionData('swapTo', [
            params.portions[0],
            params.portions[1],
            params.amountOut,
            params.amountOut,
          ])
        ),
        this.routerAddress,
        qtyETH.amount,
        this.gasEstimate(),
        'Swap ETH to RETH via RETHRouter'
      ),
    }
  }

  public async optimiseFromREth(qtyETH: TokenQuantity) {
    if (qtyETH.token !== this.reth) {
      throw new Error('Token must be ETH token')
    }
    const params = await this.routerInstance.callStatic.optimiseSwapFrom(
      qtyETH.amount,
      10
    )
    return {
      portions: params.portions,
      amountOut: this.universe.nativeToken.from(params.amountOut),
      contractCall: new ContractCall(
        parseHexStringIntoBuffer(
          this.routerInstance.interface.encodeFunctionData('swapFrom', [
            params.portions[0],
            params.portions[1],
            params.amountOut,
            params.amountOut,
            qtyETH.amount,
          ])
        ),
        this.routerAddress,
        qtyETH.amount,
        this.gasEstimate(),
        'Swap RETH to ETH via RETHRouter'
      ),
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

export class ETHToRETH extends Action {
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address
  ): Promise<Value[]> {
    throw new Error('Panner not supported, use router')
  }

  gasEstimate(): bigint {
    return this.router.gasEstimate()
  }
  async encode([ethQty]: TokenQuantity[]): Promise<ContractCall> {
    const { contractCall } = await this.router.optimiseToREth(ethQty)
    return contractCall
  }

  async quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.router.optimiseToREth(ethQty)).amountOut]
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

  toString(): string {
    return `RETHRouter(direction=ToRETH)`
  }
}

export class RETHToETH extends Action {
  plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    throw new Error('Panner not supported, use router')
  }
  gasEstimate(): bigint {
    return this.router.gasEstimate()
  }
  async encode([rethQty]: TokenQuantity[]): Promise<ContractCall> {
    const { contractCall } = await this.router.optimiseFromREth(rethQty)
    return contractCall
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
      [universe.nativeToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return `RETHRouter(direction=ToETH)`
  }
}
