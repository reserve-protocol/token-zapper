import { constants, ethers } from 'ethers'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import {
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'
import {
  FolioMintRedeem,
  FolioMintRedeem__factory,
  IFolio,
  IFolio__factory,
  IFolioDeployer,
  IFolioDeployer__factory,
} from '../contracts'
import { DeployFolioConfig } from './DeployFolioConfig'
import deployments from '../contracts/deployments.json'
import { DefaultMap } from '../base/DefaultMap'
import { Approval } from '../base/Approval'

const config = (folioDeployerAddress: string, helperAddress: string) => ({
  deployer: Address.from(folioDeployerAddress),
  helper: Address.from(helperAddress),
})
export const folioDeployerAddress: Record<
  ChainId,
  { deployer: Address; helper: Address }
> = {
  [ChainIds.Mainnet]: config(
    '0x4C64ef51cB057867e40114DcFA3702c2955d3644',
    deployments[1][0].contracts.FolioMintRedeem.address
  ),
  [ChainIds.Base]: config(
    '0xE926577a152fFD5f5036f88BF7E8E8D3652B558C',
    deployments[8453][0].contracts.FolioMintRedeem.address
  ),
  [ChainIds.Arbitrum]: config(constants.AddressZero, constants.AddressZero),
}

export class FolioDeployment {
  public readonly mintAction: MintFolioAction
  public readonly redeemAction: RedeemFolioAction
  public constructor(
    public readonly ctx: FolioContext,
    public readonly fToken: Token,
    public readonly contract: IFolio,
    public readonly basket: TokenQuantity[]
  ) {
    this.mintAction = new MintFolioAction(ctx, this)
    this.redeemAction = new RedeemFolioAction(ctx, this)

    ctx.universe.defineMintable(this.mintAction, this.redeemAction)
    ctx.universe.mintableTokens.set(this.fToken, this.mintAction)
    ctx.universe.addSingleTokenPriceSource({
      token: this.fToken,
      priceFn: async () => {
        const prices = await Promise.all(this.basket.map((i) => i.token.price))
        let sum = this.fToken.zero
        for (let i = 0; i < prices.length; i++) {
          const basketQtyPrice = this.basket[i]
            .into(this.fToken)
            .mul(prices[i].into(this.fToken))
          ctx.universe.logger.debug(
            `${this.basket[i]} => ${basketQtyPrice.format()} USD`
          )
          sum = sum.add(basketQtyPrice)
        }

        sum = sum.into(ctx.universe.usd)

        ctx.universe.logger.debug(`Price of folio ${this.fToken} => ${sum}`)

        return sum
      },
    })
  }
}

export class FolioContext {
  private sentinelTokens: Map<string, { token: Token; mint: BaseAction }> =
    new Map()
  public readonly tokens = new Map<Address, Token>()

  private readonly folios: Map<Address, FolioDeployment> = new Map()
  private readonly folioState: DefaultMap<Token, Promise<boolean>> =
    new DefaultMap(async (token) => {
      if (this.folioState.has(token)) {
        return this.folioState.get(token)!
      }
      const folio = IFolio__factory.connect(
        token.address.address,
        this.provider
      )
      try {
        const [, , , [assets, amounts]] = await Promise.all([
          folio.callStatic.AUCTION_APPROVER(),
          folio.callStatic.AUCTION_LAUNCHER(),
          folio.callStatic.BRAND_MANAGER(),
          folio.callStatic.toAssets(ONE, 1),
        ])

        const qtys = await Promise.all(
          assets.map(async (asset, index) => {
            const token = await this.universe.getToken(Address.from(asset))
            return token.from(amounts[index])
          })
        )

        this.folios.set(
          token.address,
          new FolioDeployment(this, token, folio, qtys)
        )

        return true
      } catch (e) {
        return false
      }
    })

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

  public async getFolioDeployment(token: Token) {
    if (!(await this.isFolio(token))) {
      throw new Error('Not a folio')
    }
    const out = this.folios.get(token.address)
    if (!out) {
      throw new Error('Folio deployment not found')
    }
    return out
  }

  public async isFolio(token: Token) {
    return await this.folioState.get(token)
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
      this.universe.preferredToken.set(tok, this.universe.commonTokens.ERC20GAS)
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

  public get folioDeployerAddress(): Address {
    return folioDeployerAddress[this.universe.chainId as ChainId].deployer
  }
  public get helperAddress(): Address {
    return folioDeployerAddress[this.universe.chainId as ChainId].helper
  }

  public readonly deployerContract: IFolioDeployer
  public readonly mintRedeemContract: FolioMintRedeem
  public readonly mintRedeemContractWeiroll: Contract
  public constructor(public readonly universe: Universe) {
    this.deployerContract = IFolioDeployer__factory.connect(
      this.folioDeployerAddress.address,
      universe.provider
    )
    this.mintRedeemContract = FolioMintRedeem__factory.connect(
      this.helperAddress.address,
      universe.provider
    )
    this.mintRedeemContractWeiroll = Contract.createLibrary(
      this.mintRedeemContract
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
    predicted: TokenQuantity[]
  ) {
    return null
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
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
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

export class MintFolioAction extends BaseAction {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return (await this.quoteWithDust(amountsIn)).output
  }
  get dustTokens(): Token[] {
    return this.inputToken
  }
  async inputProportions(): Promise<TokenQuantity[]> {
    const prices = await Promise.all(
      this.deployment.basket.map((i) => i.price().then((i) => i.asNumber()))
    )
    const sum = prices.reduce((a, b) => a + b, 0)
    const props = prices.map((i, index) => this.inputToken[index].from(i / sum))
    return props
  }
  async quoteWithDust(
    amountsIn: TokenQuantity[]
  ): Promise<{ output: TokenQuantity[]; dust: TokenQuantity[] }> {
    const out = await quoteFn(
      this.deployment.basket,
      amountsIn,
      this.deployment.fToken
    )

    return out
  }

  get dependsOnRpc() {
    return false
  }

  gasEstimate(): bigint {
    return 750000n + BigInt(this.deployment.basket.length) * 200000n
  }
  get returnsOutput() {
    return true
  }
  async plan(planner: Planner) {
    return [
      planner.add(
        this.context.mintRedeemContractWeiroll.mint(
          this.deployment.fToken.address.address
        )
      )!,
    ]
  }

  public constructor(
    public readonly context: FolioContext,
    public readonly deployment: FolioDeployment
  ) {
    super(
      deployment.fToken.address,
      deployment.basket.map((i) => i.token),
      [deployment.fToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      deployment.basket.map(
        (i) => new Approval(i.token, deployment.fToken.address)
      )
    )
    if (
      deployment.basket.find((i) => i.token === context.universe.nativeToken)
    ) {
      throw new Error('Gas token not allowed in basket')
    }
  }

  get isTrade() {
    return false
  }
  get oneUsePrZap() {
    return false
  }
}

export class RedeemFolioAction extends BaseAction {
  async quote([amountIs]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return this.deployment.basket.map((qty) =>
      amountIs.into(qty.token).mul(qty)
    )
  }

  get dependsOnRpc() {
    return false
  }

  gasEstimate(): bigint {
    return 250000n + BigInt(this.deployment.basket.length) * 200000n
  }
  get returnsOutput() {
    return false
  }
  get isTrade() {
    return false
  }

  get oneUsePrZap() {
    return false
  }
  async plan(planner: Planner, [amountIn]: Value[]) {
    planner.add(
      this.context.mintRedeemContractWeiroll.redeem(
        this.deployment.fToken.address.address,
        amountIn
      )
    )!
    return null
  }

  public constructor(
    public readonly context: FolioContext,
    public readonly deployment: FolioDeployment
  ) {
    super(
      deployment.fToken.address,
      [deployment.fToken],
      deployment.basket.map((i) => i.token),
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
