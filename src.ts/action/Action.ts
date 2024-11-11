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
import { SwapPlan } from '../searcher/Swap'
import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { formatEther } from 'ethers/lib/utils'
import { constants } from 'ethers'

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
  // Address.from('0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6'),
  // Address.from('0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0'),
  // Address.from('0xDbC0cE2321B76D3956412B36e9c0FA9B0fD176E7'),
])
export const ONE = 10n ** 18n
export const ONE_Val = new gen.LiteralValue(
  ParamType.fromString('uint256'),
  defaultAbiCoder.encode(['uint256'], [ONE])
)

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
  fraction: (
    uni: Universe,
    planner: gen.Planner,
    input: gen.Value,
    fraction: bigint,
    comment: string,
    name?: string
  ) => {
    if (input instanceof gen.LiteralValue) {
      return gen.encodeArg(
        (BigInt(input.value) * fraction) / ONE,
        ParamType.from('uint256')
      )
    }
    return planner.add(
      uni.weirollZapperExec.fpMul(input, fraction, ONE_Val),
      `${(parseFloat(formatEther(fraction)) * 100).toFixed(2)}% ${comment}`,
      name
    )!
  },

  approve: async (
    universe: Universe,
    planner: gen.Planner,
    { token: input }: TokenQuantity,
    spender: Address
  ) => {
    const allowance = (
      await universe.approvalsStore.queryAllowance(
        input,
        universe.execAddress,
        spender
      )
    ).toBigInt()
    if (allowance >= constants.MaxUint256.toBigInt() / 2n) {
      return
    }
    const token = gen.Contract.createContract(
      IERC20__factory.connect(input.address.address, universe.provider)
    )
    if (input.resetApproval) {
      planner.add(token.approve(spender.address, 0))
    }
    planner.add(token.approve(spender.address, constants.MaxUint256))
  },

  sub: (
    uni: Universe,
    planner: gen.Planner,
    a: gen.Value | bigint,
    b: gen.Value | bigint,
    comment: string,
    name?: string
  ) => {
    if (a instanceof gen.LiteralValue && b instanceof gen.LiteralValue) {
      return gen.encodeArg(
        BigInt(a.value) - BigInt(b.value),
        ParamType.from('uint256')
      )
    }
    return planner.add(uni.weirollZapperExec.sub(a, b), comment, name)!
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

  get interactionConvention(): InteractionConvention {
    return this._interactionConvention
  }
  get proceedsOptions(): DestinationOptions {
    return this._proceedsOptions
  }
  get approvals(): Approval[] {
    return this._approvals
  }
  get address(): Address {
    return this._address
  }
  constructor(
    public _address: Address,
    public readonly inputToken: Token[],
    public readonly outputToken: Token[],
    public _interactionConvention: InteractionConvention,
    public _proceedsOptions: DestinationOptions,
    public _approvals: Approval[]
  ) {}

  public async intoSwapPath(universe: Universe, qty: TokenQuantity) {
    return await new SwapPlan(universe, [this]).quote(
      [qty],
      universe.execAddress
    )
  }
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

class TradeEdgeAction extends BaseAction {
  private currentChoice = 0
  private get current() {
    return this.choices[this.currentChoice]
  }
  public get interactionConvention() {
    return this.current.interactionConvention
  }
  public get proceedsOptions() {
    return this.current.proceedsOptions
  }
  public get approvals() {
    return this.current.approvals
  }
  public get address() {
    return this.current.address
  }
  public quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return this.current.quote(amountsIn)
  }
  public gasEstimate() {
    return this.current.gasEstimate()
  }
  public async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<null | gen.Value[]> {
    return this.current.plan(planner, inputs, destination, predicted)
  }

  get totalChoices() {
    return this.choices.length
  }

  get outputSlippage() {
    return this.current.outputSlippage
  }

  get supportsDynamicInput() {
    return this.current.supportsDynamicInput
  }
  get oneUsePrZap() {
    return this.current.oneUsePrZap
  }
  get returnsOutput() {
    return this.current.returnsOutput
  }
  get addressesInUse() {
    return this.current.addressesInUse
  }
  get addToGraph() {
    return this.current.addToGraph
  }

  constructor(
    public readonly universe: Universe,
    public readonly choices: BaseAction[]
  ) {
    super(
      choices[0].address,
      choices[0].inputToken,
      choices[0].outputToken,
      choices[0].interactionConvention,
      choices[0].proceedsOptions,
      choices[0].approvals
    )
  }
}

export const isMultiChoiceEdge = (
  edge: BaseAction
): edge is TradeEdgeAction => {
  return edge instanceof TradeEdgeAction
}

export const createMultiChoiceAction = (
  universe: Universe,
  choices: BaseAction[]
) => {
  if (choices.length === 0) {
    throw new Error('Cannot create a TradeEdgeAction with no choices')
  }
  if (choices.length === 1) {
    return choices[0]
  }
  if (
    !choices.every(
      (choice) =>
        choice.inputToken.length === 1 &&
        choice.outputToken.length === 1 &&
        choice.inputToken[0] === choice.inputToken[0] &&
        choice.outputToken[0] === choice.outputToken[0]
    )
  ) {
    throw new Error(
      'Add choices in a trade edge must produce the same input and output token'
    )
  }

  return new TradeEdgeAction(universe, choices)
}

export const Action = (proto: string) => {
  abstract class ProtocolAction extends BaseAction {
    public get protocol() {
      return proto
    }
  }

  return ProtocolAction
}
