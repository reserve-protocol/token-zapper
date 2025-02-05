import { Address } from '../base/Address'
import { IPXETH__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import { Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

abstract class PXBase extends Action('PXETH') {
  get actionName(): string {
    return 'deposit'
  }
  public get returnsOutput(): boolean {
    return false
  }
}

export class PXETHDeposit extends PXBase {
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountsIn.into(this.pxeth)]
  }
  get dependsOnRpc(): boolean {
    return false
  }

  gasEstimate(): bigint {
    return 50000n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<null | Value[]> {
    const pxeth = IPXETH__factory.connect(
      '0xD664b74274DfEB538d9baC494F3a4760828B02b0',
      this.universe.provider
    )

    const lib = Contract.createContract(pxeth)
    planner.add(lib.deposit(destination.address, false).withValue(inputs[0]))
    return null
  }
  constructor(
    public readonly universe: Universe,
    public readonly pxeth: Token,
    public readonly oracleAddress: Address
  ) {
    super(
      pxeth.address,
      [universe.nativeToken],
      [pxeth],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
}
