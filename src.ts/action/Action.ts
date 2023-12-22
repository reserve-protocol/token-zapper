import { Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { type Approval } from '../base/Approval'
import { type ContractCall } from '../base/ContractCall'
import * as gen from '../tx-gen/Planner'
import { IERC20__factory } from '../contracts/factories/contracts'
import { Universe } from '..'
import { ExpressionEvaluator__factory } from '../contracts/factories/contracts/weiroll-helpers/ExpressionEvaluator__factory'
import { BalanceOf__factory } from '../contracts'

export enum InteractionConvention {
  PayBeforeCall,
  CallbackBased,
  ApprovalRequired,
  None,
}

export enum DestinationOptions {
  Recipient,
  Callee,
}

const useSpecialCaseBalanceOf = new Set<Address>([
  Address.from("0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9")
])

export const plannerUtils = {
  planForwardERC20(
    universe: Universe,
    planner: gen.Planner,
    token: Token,
    amount: gen.Value,
    destination: Address
  ) {
    if (destination == universe.config.addresses.executorAddress) {
      return
    }
    plannerUtils.erc20.transfer(universe, planner, amount, token, destination)
  },
  erc20: {
    transfer(
      universe: Universe,
      planner: gen.Planner,
      amount: gen.Value,
      token: Token,
      destination: Address
    ) {
      const erc20 = gen.Contract.createContract(
        IERC20__factory.connect(token.address.address, universe.provider)
      )
      planner.add(erc20.transfer(destination.address, amount))
    },
    balanceOf(
      universe: Universe,
      planner: gen.Planner,
      token: Token,
      owner: Address,
      comment?: string,
      varName?: string
    ): gen.Value {
      if (useSpecialCaseBalanceOf.has(token.address)) {
        const lib = gen.Contract.createContract(
          BalanceOf__factory.connect(universe.config.addresses.balanceOf.address, universe.provider)
        )
        return planner.add(lib.balanceOf(token.address.address, owner.address), comment, varName??`bal_${token.symbol}`)!
      }
      const erc20 = gen.Contract.createContract(
        IERC20__factory.connect(token.address.address, universe.provider)
      )
      return planner.add(
        erc20.balanceOf(owner.address),
        comment,
        varName??`bal_${token.symbol}`
      )!
    },
  },
}

export abstract class Action {
  protected readonly gen = gen
  protected readonly genUtils = plannerUtils

  constructor(
    public readonly address: Address,
    public readonly input: readonly Token[],
    public readonly output: readonly Token[],
    public readonly interactionConvention: InteractionConvention,
    public readonly proceedsOptions: DestinationOptions,
    public readonly approvals: readonly Approval[]
  ) { }

  abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>

  async quoteWithSlippage(
    amountsIn: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    const outputs = await this.quote(amountsIn)
    return outputs
  }
  abstract gasEstimate(): bigint
  async exchange(amountsIn: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(amountsIn)
    balances.exchange(amountsIn, outputs)
  }
  abstract encode(
    amountsIn: TokenQuantity[],
    destination: Address,
    bytes?: Buffer
  ): Promise<ContractCall>

  abstract plan(
    planner: gen.Planner,
    // Actual abstract inputs
    inputs: gen.Value[],
    destination: Address,

    // Inputs we predicted
    predictedInputs: TokenQuantity[],
    outputNotUsed?: boolean
  ): Promise<gen.Value[]>

  toString() {
    return 'UnnamedAction'
  }

  // TODO: This is sort of a hack for stETH as it's a mintable but not burnable token.
  // But we need the burn Action to calculate the baskets correctly, but we don't want
  // to have the token actually appear in paths.
  get addToGraph() {
    return true
  }

  get outputSlippage() {
    return 0n
  }
}
