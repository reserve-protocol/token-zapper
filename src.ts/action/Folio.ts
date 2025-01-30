import { constants, ethers } from 'ethers'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import { BaseAction, DestinationOptions, InteractionConvention } from './Action'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'
import {
  DeployFolioHelper,
  DeployFolioHelper__factory,
  IFolioDeployer,
  IFolioDeployer__factory,
} from '../contracts'
import { getContractAddress } from 'ethers/lib/utils'
import { Approval } from '../base/Approval'
import { DeployFolioConfig } from './DeployFolioConfig'
import deployments from '../contracts/deployments.json'

const config = (folioDeployerAddress: string, helperAddress: string) => ({
  deployer: Address.from(folioDeployerAddress),
  helper: Address.from(helperAddress),
})
const folioDeployerAddress: Record<
  ChainId,
  { deployer: Address; helper: Address }
> = {
  [ChainIds.Mainnet]: config(constants.AddressZero, constants.AddressZero),
  [ChainIds.Base]: config(
    '0xa38A23f85Bae3f9aCeB7b07de665619016db1a06',
    deployments[8453][0].contracts.DeployFolioHelper.address
  ),
  [ChainIds.Arbitrum]: config(constants.AddressZero, constants.AddressZero),
}

export class FolioContext {
  private sentinelTokens: Map<string, { token: Token; mint: BaseAction }> =
    new Map()
  public readonly tokens = new Map<Address, Token>()

  public get provider() {
    return this.universe.provider
  }
  public get usd() {
    return this.universe.usd
  }
  public get fairPrice() {
    return this.universe.fairPrice
  }
  public get singleTokenPriceOracles() {
    return this.universe.singleTokenPriceOracles
  }

  public isSentinel(token: Token) {
    return this.tokens.has(token.address)
  }
  public getSentinelToken(config: DeployFolioConfig) {
    const basket = config.basicDetails.basket
    const key = `folio(${basket.join(', ')})`
    let out = this.sentinelTokens.get(key)
    if (!out) {
      const addr = Address.from(ethers.Wallet.createRandom().address)
      const tok = Token.createToken(
        this,
        addr,
        config.basicDetails.name,
        config.basicDetails.symbol,
        18
      )
      out = {
        token: tok,
        mint: new DeployMintFolioAction(this, config, tok),
      }
      this.sentinelTokens.set(key, out)

      const mintAction = new DeployMintFolioAction(this, config, tok)
      this.universe.addAction(mintAction)
      this.universe.mintableTokens.set(tok, mintAction)

      this.universe.addSingleTokenPriceSource({
        token: tok,
        priceFn: async () => {
          const prices = await Promise.all(
            basket.map((i) => i.price().then((i) => i.into(this.universe.usd)))
          )
          return prices.reduce((a, b) => a.add(b))
        },
      })
    }
    return out
  }

  public async computeNextFolioTokenAddress(
    config: DeployFolioConfig
  ): Promise<Address> {
    const deployer = this.folioDeployerAddress.address
    let nonce = (await this.universe.provider.getTransactionCount(deployer)) + 1

    if (config.existingTradeProposers.length > 0) {
      nonce += 1
    }

    return Address.from(
      getContractAddress({
        from: deployer,
        nonce: nonce,
      })
    )
  }

  public get folioDeployerAddress(): Address {
    return folioDeployerAddress[this.universe.chainId as ChainId].deployer
  }
  public get helperAddress(): Address {
    return folioDeployerAddress[this.universe.chainId as ChainId].helper
  }

  public readonly deployerContract: IFolioDeployer
  public readonly deployerHelperContract: DeployFolioHelper
  public readonly deployerHelperWeiroll: Contract
  public constructor(public readonly universe: Universe) {
    this.deployerContract = IFolioDeployer__factory.connect(
      this.folioDeployerAddress.address,
      universe.provider
    )
    this.deployerHelperContract = DeployFolioHelper__factory.connect(
      this.helperAddress.address,
      universe.provider
    )
    this.deployerHelperWeiroll = Contract.createLibrary(
      this.deployerHelperContract
    )
  }
}

const quoteFn = async (
  basket: TokenQuantity[],
  amountsIn: TokenQuantity[],
  outputToken: Token
) => {
  try {
    let smallestUnit: bigint = ethers.constants.MaxUint256.toBigInt()
    for (let i = 0; i < amountsIn.length; i++) {
      const amountIn = amountsIn[i]
      const basketQty = basket[i]
      const amountOut = amountIn.div(basketQty).into(outputToken)

      if (amountOut.amount < smallestUnit) {
        smallestUnit = amountOut.amount
      }
    }
    const outQty = outputToken.from(smallestUnit)
    const out = amountsIn.map((inQty, index) => {
      const spent = basket[index].mul(outQty.into(inQty.token))
      if (spent.amount >= inQty.amount) {
        return inQty.token.zero
      }
      return inQty.sub(spent)
    })

    return {
      output: [outQty],
      dust: out,
    }
  } catch (e) {
    console.log(e)
    return {
      output: [],
      dust: [],
    }
  }
}

export class DeployMintFolioAction extends BaseAction {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return (await this.quoteWithDust(amountsIn)).output
  }
  get dustTokens(): Token[] {
    return this.inputToken
  }
  async inputProportions(): Promise<TokenQuantity[]> {
    const prices = await Promise.all(
      this.config.basicDetails.basket.map((i) =>
        i.price().then((i) => i.asNumber())
      )
    )
    const sum = prices.reduce((a, b) => a + b, 0)
    const props = prices.map((i, index) => this.inputToken[index].from(i / sum))
    return props
  }
  async quoteWithDust(
    amountsIn: TokenQuantity[]
  ): Promise<{ output: TokenQuantity[]; dust: TokenQuantity[] }> {
    const out = await quoteFn(
      this.config.basicDetails.basket,
      amountsIn,
      this.expectedToken
    )

    return out
  }

  get dependsOnRpc() {
    return false
  }

  gasEstimate(): bigint {
    return 1800000n + BigInt(this.config.basicDetails.basket.length) * 200000n
  }
  async plan(
    planner: Planner,
    _: Value[],
    __: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const quote = await this.quote(predictedInputs)

    const slippage = this.config.slippage

    const slippageAmount = quote[0].mul(quote[0].token.from(slippage))
    const expectedOutput = quote[0].amount - slippageAmount.amount

    let encoded: string
    if (this.config.governance.type === 'governed') {
      const serialized = this.config.serializeGoverned(expectedOutput)
      encoded = this.context.deployerContract.interface.encodeFunctionData(
        'deployGovernedFolio',
        [
          serialized[0],
          serialized[1],
          serialized[2],
          serialized[3],
          serialized[4],
          serialized[5],
        ]
      )
    } else {
      const serialized = this.config.serializeUnGoverned(expectedOutput)
      encoded = this.context.deployerContract.interface.encodeFunctionData(
        'deployFolio',
        [
          serialized[0],
          serialized[1],
          serialized[2],
          serialized[3],
          serialized[4],
          serialized[5],
        ]
      )
    }

    const expectedTokenAddress =
      await this.context.computeNextFolioTokenAddress(this.config)
    return [
      planner.add(
        this.context.deployerHelperWeiroll.deployFolio(
          this.context.folioDeployerAddress.address,
          expectedTokenAddress.address,
          this.config.governance.type === 'governed',
          encoded
        )
      )!,
    ]
  }

  public constructor(
    public readonly context: FolioContext,
    public readonly config: DeployFolioConfig,
    public readonly expectedToken: Token
  ) {
    super(
      expectedToken.address,
      config.basicDetails.basket.map((i) => i.token),
      [expectedToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      config.basicDetails.basket.map(
        (i) => new Approval(i.token, context.folioDeployerAddress)
      )
    )
    if (
      config.basicDetails.basket.find(
        (i) => i.token === context.universe.nativeToken
      )
    ) {
      throw new Error('Gas token not allowed in basket')
    }
  }
}
