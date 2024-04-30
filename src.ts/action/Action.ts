import { Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { type Approval } from '../base/Approval'
import * as gen from '../tx-gen/Planner'
import { Universe } from '..'
import {
  BalanceOf__factory,
  EthBalance__factory,
  IERC20__factory,
} from '../contracts'

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

export enum EdgeType {
  MINT,
  BURN,
  SWAP,
}

const useSpecialCaseBalanceOf = new Set<Address>([
  Address.from('0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9'),
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
      if (token == universe.nativeToken) {
        const lib = gen.Contract.createContract(
          EthBalance__factory.connect(
            universe.config.addresses.ethBalanceOf.address,
            universe.provider
          )
        )
        return planner.add(
          lib.ethBalance(owner.address),
          comment,
          varName ?? `bal_${token.symbol}`
        )!
      }
      if (useSpecialCaseBalanceOf.has(token.address)) {
        const lib = gen.Contract.createContract(
          BalanceOf__factory.connect(
            universe.config.addresses.balanceOf.address,
            universe.provider
          )
        )
        return planner.add(
          lib.balanceOf(token.address.address, owner.address),
          comment,
          varName ?? `bal_${token.symbol}`
        )!
      }
      const erc20 = gen.Contract.createContract(
        IERC20__factory.connect(token.address.address, universe.provider)
      )
      return planner.add(
        erc20.balanceOf(owner.address),
        comment,
        varName ?? `bal_${token.symbol}`
      )!
    },
  },
}

export abstract class BaseAction {
  public readonly gen = gen
  public readonly genUtils = plannerUtils

  outputBalanceOf(universe: Universe, planner: gen.Planner) {
    return this.outputToken.map((token) =>
      this.genUtils.erc20.balanceOf(
        universe,
        planner,
        token,
        universe.execAddress,
        undefined,
        `bal_${token.symbol}`
      )
    )
  }

  get protocol(): string {
    return 'Unknown'
  }

  constructor(
    public readonly address: Address,
    public readonly inputToken: Token[],
    public readonly outputToken: Token[],
    public readonly interactionConvention: InteractionConvention,
    public readonly proceedsOptions: DestinationOptions,
    public readonly approvals: Approval[]
  ) {}

  abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>
  public async quoteWithSlippage(
    amountsIn: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    const outputs = await this.quote(amountsIn)
    return outputs
  }
  abstract gasEstimate(): bigint
  public async exchange(amountsIn: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(amountsIn)
    balances.exchange(amountsIn, outputs)
  }

  generateOutputTokenBalance(
    universe: Universe,
    planner: gen.Planner,
    comment?: string
  ) {
    return plannerUtils.erc20.balanceOf(
      universe,
      planner,
      this.outputToken[0],
      universe.execAddress,
      comment
    )
  }

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
  public get addToGraph() {
    return true
  }

  public get outputSlippage() {
    return 0n
  }
}

export const Action = (proto: string) => {
  abstract class ProtocolAction extends BaseAction {
    public get protocol() {
      return proto
    }
  }

  return ProtocolAction
}
