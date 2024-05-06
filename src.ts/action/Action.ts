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
import { TRADE_SLIPPAGE_DENOMINATOR } from '../base/constants'

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

  public get supportsDynamicInput() {
    return true
  }
  public get oneUsePrZap() {
    return false
  }
  public get returnsOutput() {
    return true
  }
  public get addressesInUse(): Set<Address> {
    return new Set([])
  }

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
    if (this.outputSlippage === 0n) {
      return outputs
    }
    return outputs.map((output) => {
      return output.token.from(
        output.amount -
          (output.amount * this.outputSlippage) / TRADE_SLIPPAGE_DENOMINATOR
      )
    })
  }
  abstract gasEstimate(): bigint
  public async exchange(amountsIn: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(amountsIn)
    balances.exchange(amountsIn, outputs)
  }

  abstract plan(
    planner: gen.Planner,
    // Actual abstract inputs
    inputs: gen.Value[],
    destination: Address,
    // Inputs we predicted
    predictedInputs: TokenQuantity[]
  ): Promise<null | gen.Value[]>

  async planWithOutput(
    universe: Universe,
    planner: gen.Planner,
    // Actual abstract inputs
    inputs: gen.Value[],
    destination: Address,
    // Inputs we predicted
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[]> {
    const out = await this.plan(planner, inputs, destination, predictedInputs)

    if (out == null) {
      if (this.returnsOutput) {
        throw new Error('Action did not return output as expected')
      }
      return this.outputBalanceOf(universe, planner)
    }
    return out!
  }

  toString() {
    return (
      'UnnamedAction.' +
      this.protocol +
      '.' +
      this.constructor.name +
      ':' +
      this.inputToken.join(', ') +
      '->' +
      this.outputToken.join(', ')
    )
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

  public combine(other: BaseAction) {
    const self = this

    if (
      !self.outputToken.every(
        (token, index) => other.inputToken[index] === token
      )
    ) {
      throw new Error('Cannot combine actions with mismatched tokens')
    }
    class CombinedAction extends BaseAction {
      public get protocol(): string {
        return `${self.protocol}.${other.protocol}`
      }
      toString(): string {
        return `${self.toString()}  -> ${other.toString()}`
      }

      public async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
        const out = await self.quote(amountsIn)
        return await other.quote(out)
      }

      get supportsDynamicInput() {
        return self.supportsDynamicInput && other.supportsDynamicInput
      }

      get oneUsePrZap() {
        return self.oneUsePrZap && other.oneUsePrZap
      }

      get addressesInUse() {
        return new Set([...self.addressesInUse, ...other.addressesInUse])
      }

      get returnsOutput() {
        return other.returnsOutput
      }

      get outputSlippage() {
        return self.outputSlippage + other.outputSlippage
      }

      public gasEstimate(): bigint {
        return self.gasEstimate() + other.gasEstimate() + 10000n
      }

      public async plan(
        planner: gen.Planner,
        inputs: gen.Value[],
        destination: Address,
        predicted: TokenQuantity[]
      ): Promise<null | gen.Value[]> {
        const out = await self.planWithOutput(
          this.universe,
          planner,
          inputs,
          destination,
          predicted
        )

        return other.plan(planner, out, destination, predicted)
      }

      constructor(public readonly universe: Universe) {
        super(
          self.address,
          self.inputToken,
          other.outputToken,
          self.interactionConvention,
          other.proceedsOptions,
          [...self.approvals, ...other.approvals]
        )
      }
    }

    return CombinedAction
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
