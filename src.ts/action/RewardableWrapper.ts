import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { InteractionConvention, DestinationOptions, Action } from './Action'

import * as gen from '../tx-gen/Planner'
import { Address } from '..'
import { Approval } from '../base/Approval'
import {
  IRewardableERC20Wrapper,
  IRewardableERC20Wrapper__factory,
} from '../contracts'

export const createProtocolWithWrappers = (
  universe: Universe,
  protocol: string
) => {
  abstract class RewardableERC20Wrapper extends Action(protocol) {
    abstract get actionName(): string
    async quote([input]: TokenQuantity[]): Promise<TokenQuantity[]> {
      return [input.into(this.output)]
    }
    public get outputSlippage(): bigint {
      return 0n
    }
    public get supportsDynamicInput(): boolean {
      return true
    }
    public get returnsOutput(): boolean {
      return false
    }
    constructor(
      address: Address,
      public readonly input: Token,
      public readonly output: Token,
      approval:
        | {
          convention: InteractionConvention
          spender: Address
        }
        | { convention: InteractionConvention.None } = {
          convention: InteractionConvention.None,
        }
    ) {
      super(
        address,
        [input],
        [output],
        approval.convention,
        DestinationOptions.Recipient,
        approval.convention !== InteractionConvention.None
          ? [new Approval(input, approval.spender)]
          : []
      )
    }

    toString(): string {
      return `${this.protocol}Wrapper${this.actionName}`
    }
  }

  // interface IRewardableERC20Wrapper is IERC20 {
  //     function deposit(uint256 _amount, address _to) external;
  //     function withdraw(uint256 _amount, address _to) external;
  // }
  class RewardableERC20WrapperDeposit extends RewardableERC20Wrapper {
    public readonly wrapperContract: IRewardableERC20Wrapper
    public readonly wrapperWeiroll: gen.Contract
    get actionName(): string {
      return `Deposit${this.rewardableToken}For${this.wrappedRewardableToken}`
    }
    gasEstimate(): bigint {
      return 500000n
    }
    async plan(
      planner: gen.Planner,
      [input]: gen.Value[],
      destination: Address,
      predictedInputs: TokenQuantity[]
    ): Promise<null | gen.Value[]> {
      planner.add(
        this.wrapperWeiroll.deposit(input, destination.address),
        `${this.protocol}.deposit(${predictedInputs.join(
          ', '
        )}, ${destination})`
      )

      return null
    }

    constructor(
      public readonly rewardableToken: Token,
      public readonly wrappedRewardableToken: Token
    ) {
      super(
        wrappedRewardableToken.address,
        rewardableToken,
        wrappedRewardableToken,
        {
          convention: InteractionConvention.ApprovalRequired,
          spender: wrappedRewardableToken.address,
        }
      )

      this.wrapperContract = IRewardableERC20Wrapper__factory.connect(
        wrappedRewardableToken.address.address,
        universe.provider
      )

      this.wrapperWeiroll = gen.Contract.createContract(
        this.wrapperContract,
        gen.CommandFlags.CALL
      )
    }
  }
  class RewardableERC20WrapperWithdraw extends RewardableERC20Wrapper {
    public readonly wrapperContract: IRewardableERC20Wrapper
    public readonly wrapperWeiroll: gen.Contract
    get actionName(): string {
      return `Withdraw${this.wrappedRewardableToken}For${this.rewardableToken}`
    }
    gasEstimate(): bigint {
      return 500000n
    }
    async plan(
      planner: gen.Planner,
      [input]: gen.Value[],
      destination: Address,
      predictedInputs: TokenQuantity[]
    ): Promise<null | gen.Value[]> {
      planner.add(
        this.wrapperWeiroll.withdraw(input, destination.address),
        `${this.protocol}.withdraw(${predictedInputs.join(
          ', '
        )}, ${destination})`
      )

      return null
    }

    constructor(
      public readonly rewardableToken: Token,
      public readonly wrappedRewardableToken: Token
    ) {
      super(
        wrappedRewardableToken.address,
        wrappedRewardableToken,
        rewardableToken
      )

      this.wrapperContract = IRewardableERC20Wrapper__factory.connect(
        wrappedRewardableToken.address.address,
        universe.provider
      )

      this.wrapperWeiroll = gen.Contract.createContract(
        this.wrapperContract,
        gen.CommandFlags.CALL
      )
    }
  }

  return {
    addWrapper: async (wrapper: Token) => {
      const rewardable = await universe.getToken(
        Address.from(
          await IRewardableERC20Wrapper__factory.connect(
            wrapper.address.address,
            universe.provider
          ).callStatic.underlying()
        )
      )

      const deposit = new RewardableERC20WrapperDeposit(rewardable, wrapper)
      const withdraw = new RewardableERC20WrapperWithdraw(rewardable, wrapper)

      universe.addSingleTokenPriceSource({
        token: wrapper,
        priceFn: async () => {
          const out = await universe.fairPrice(rewardable.one)
          if (out == null) {
            throw new Error("Can't price")
          }
          return out
        },
        priceToken: universe.usd,
      })
      universe.addAction(deposit)
      universe.addAction(withdraw)
      return {
        deposit,
        withdraw,
      }
    },
  }
}
