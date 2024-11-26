import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
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
  // The action requires callee to send tokens to the contract before calling it
  // UniswapV2 Pool's for example
  PayBeforeCall,

  // The action requires the callee to call the contract
  // UniswapV3 Pool's do this
  CallbackBased,

  // The action requires the caller to approve the contract
  // Most contracts taking ERC20 token inputs work like this
  ApprovalRequired,

  // The action does not require any interaction with the contract
  // Burning tokens or contracts using ETH as input do this
  None,
}

export enum DestinationOptions {
  // The contract supports a destination address
  Recipient,

  // The contract sends funds back to the caller
  Callee,
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

const needsZeroedOutFirst = new Set([
  Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7'),
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
    if (needsZeroedOutFirst.has(input.address)) {
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
  add: (
    uni: Universe,
    planner: gen.Planner,
    a: gen.Value | bigint,
    b: gen.Value | bigint,
    comment: string,
    name?: string
  ) => {
    if (a instanceof gen.LiteralValue && b instanceof gen.LiteralValue) {
      return gen.encodeArg(
        BigInt(a.value) + BigInt(b.value),
        ParamType.from('uint256')
      )
    }
    return planner.add(uni.weirollZapperExec.add(a, b), comment, name)!
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

  public async liquidity(): Promise<number> {
    return Infinity
  }

  get isTrade() {
    return false
  }
  get dependsOnRpc() {
    return false
  }

  get isMultiInput() {
    return this.inputToken.length !== 1
  }
  get isMultiOutput() {
    return this.outputToken.length !== 1
  }

  /**
   * Signals to the transaction generator wether or the input of this action
   * gets statically baked into the transaction. This is only really relevant if
   * the planner does a .rawCall(...)
   */
  public get supportsDynamicInput() {
    return true
  }

  /**
   * Signals that the action is only used once per zap. This is relevant for
   * Trades and other actions where interacting with a contract changes the 'price'
   *
   * Uses the 'addressesInUse' to determine if conflicts occur
   */
  public get oneUsePrZap() {
    return false
  }

  /**
   * See @oneUsePrZap
   */
  public get addressesInUse(): Set<Address> {
    return new Set([])
  }

  /**
   * Signals that the action returns the result of the operation.
   * Some contracts do not return anything, or return a value that we can not use
   * in this case return a null in the planner and return false in this method.
   */
  public get returnsOutput() {
    return true
  }

  /**
   * Returns the proportion of the input tokens that is used in this action.
   * This is used by token basket type tokens or LP tokens.
   *
   * If the action takes a single input this should not be ovewritten.
   */
  public async inputProportions() {
    if (this.inputToken.length !== this.inputToken.length) {
      throw new Error(
        `${this}: Unimplemented output token proportions, for multi-input action`
      )
    }
    return [this.inputToken[0].one]
  }

  /**
   * Returns the proportion of the output tokens that is used in this action.
   * This is used by token basket type tokens or LP tokens.
   *
   * If the action produces a single output this should not be ovewritten.
   */
  public async outputProportions(): Promise<TokenQuantity[]> {
    if (this.outputToken.length !== 1) {
      throw new Error(
        `${this}: Unimplemented output token proportions, for multi-output action`
      )
    }
    return [this.outputToken[0].one]
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

  get dustTokens(): Token[] {
    return []
  }
  /**
   * The interaction convention of the action.
   * See @InteractionConvention for more information
   */
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

  public get is1to1() {
    return this.inputToken.length === 1 && this.outputToken.length === 1
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
    return await new SwapPlan(universe, [this]).quote([qty])
  }
  abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>
  public async quoteWithDust(amountsIn: TokenQuantity[]): Promise<{
    output: TokenQuantity[]
    dust: TokenQuantity[]
  }> {
    if (this.dustTokens.length === 0) {
      return {
        output: await this.quote(amountsIn),
        dust: [],
      }
    }
    throw new Error('Unimplemented')
  }
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

  public async quoteWithSlippageAndDust(
    amountsIn: TokenQuantity[]
  ): Promise<{ output: TokenQuantity[]; dust: TokenQuantity[] }> {
    const outputs = await this.quoteWithDust(amountsIn)
    if (this.outputSlippage === 0n) {
      return outputs
    }
    return {
      output: outputs.output.map((output) => {
        return output.token.from(
          output.amount -
            (output.amount * this.outputSlippage) / TRADE_SLIPPAGE_DENOMINATOR
        )
      }),
      dust: outputs.dust.map((output) => {
        return output.token.from(
          output.amount -
            (output.amount * this.outputSlippage) / TRADE_SLIPPAGE_DENOMINATOR
        )
      }),
    }
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

  public get outputSlippage() {
    return 0n
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

export const Action = (proto: string) => {
  abstract class ProtocolAction extends BaseAction {
    public get protocol() {
      return proto
    }
  }

  return ProtocolAction
}

export const findTradeSize = async (
  action: BaseAction,
  maxInput: TokenQuantity,
  limitPrice: number,
  eps: number = 1e-4,
  iterations: number = 32
) => {
  if (!action.is1to1) {
    throw new Error(`${action}: Unimplemented for non-1to1 trades`)
  }
  const liquidity = await action.liquidity()
  if (!isFinite(liquidity)) {
    return Infinity
  }

  let searchSpan = maxInput.scalarDiv(2n)
  let input = maxInput
  for (let i = 0; i < iterations; i++) {
    const [outputAmount] = await action.quote([input])
    const price = outputAmount.asNumber() / input.asNumber()

    const diff = Math.abs(limitPrice - price)

    if (diff < eps && price > limitPrice) {
      break
    }

    if (price < limitPrice) {
      input = input.sub(searchSpan)
    } else {
      input = input.add(searchSpan)
    }
    searchSpan = searchSpan.scalarDiv(2n)
  }
  return input.asNumber()
}
