import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import {
  PricedTokenQuantity,
  Token,
  type TokenQuantity,
} from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { ethers } from 'ethers'
import { Approval } from '../base/Approval'
import {
  IAsset,
  IAsset__factory,
  IAssetRegistry,
  IAssetRegistry__factory,
  IBasketHandler,
  IBasketHandler__factory,
  IFacade,
  IFacade__factory,
  IMain,
  IMain__factory,
  IRToken,
  IRToken__factory,
  RTokenLens,
  RTokenLens__factory,
} from '../contracts'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import { MultiInputUnit } from './MultiInputAction'

export class RTokenDeployment {
  public readonly burn: BurnRTokenAction
  public readonly mint: MintRTokenAction
  public readonly addressesInUse: Set<Address>

  toString() {
    return `RToken[${this.rToken}](basket=${this.basket.join(', ')})`
  }

  public readonly supply: () => Promise<TokenQuantity>
  public async exchangeRate() {
    const supply = await this.supply()
    const baskets = this.rToken.from(
      (await this.contracts.rToken.callStatic.basketsNeeded()).toBigInt()
    )
    const tokenClass = await this.universe.tokenClass.get(this.rToken)
    const out = (baskets.amount * tokenClass.scale) / supply.amount
    return tokenClass.from(out).invert()
  }
  public readonly unitBasket: () => Promise<PricedTokenQuantity[]>
  public readonly maxIssueable: () => Promise<TokenQuantity>
  public readonly quoteMint: (
    input: TokenQuantity[]
  ) => Promise<TokenQuantity[]>
  public readonly quoteRedeem: (
    input: TokenQuantity[]
  ) => Promise<TokenQuantity[]>

  public readonly calculateMultiInputUnit: () => Promise<MultiInputUnit>

  public readonly basket: Token[]

  private constructor(
    public readonly universe: Universe,
    public readonly rToken: Token,
    private unitBasket_: TokenQuantity[],
    private assets: IAsset[],
    public readonly contracts: {
      facade: IFacade
      basketHandler: IBasketHandler
      main: IMain
      rToken: IRToken
      rTokenLens: RTokenLens
      assetRegistry: IAssetRegistry
    },
    public readonly mintEstimate: bigint,
    public readonly burnEstimate: bigint,
    public readonly resolution: TokenQuantity
  ) {
    this.basket = this.unitBasket_.map((i) => i.token)
    this.burn = new BurnRTokenAction(this)
    this.mint = new MintRTokenAction(this)
    this.addressesInUse = new Set([Address.from(this.contracts.main.address)])
    const getIssueanceAvailable = universe.createCachedProducer(
      async () =>
        rToken.from(
          (
            await this.contracts.rToken.callStatic.issuanceAvailable()
          ).toBigInt()
        ),
      12000
    )

    const getSupply = universe.createCachedProducer(
      async () =>
        rToken.from((await this.contracts.rToken.totalSupply()).toBigInt()),
      12000
    )

    const getIssueanceUnit = universe.createCachedProducer(async () => {
      const unit = await this.contracts.facade.callStatic
        .issue(this.rToken.address.address, this.rToken.scale)
        .then(
          async ([basketTokens, amts, uoaAmts]) =>
            await Promise.all(
              basketTokens.map(
                async (addr, index) =>
                  await this.universe
                    .getToken(Address.from(addr))
                    .then((basketToken) =>
                      basketToken
                        .from(amts[index])
                        .withPrice(rToken.from(uoaAmts[index]))
                    )
              )
            )
        )

      let totalPrice: TokenQuantity = this.rToken.zero

      const inputs = unit.map((priced) => {
        totalPrice = totalPrice.add(priced.price)
        return priced.quantity.withPrice(priced.price.into(this.universe.usd))
      })

      return new MultiInputUnit(
        this.rToken.one.withPrice(totalPrice.into(this.universe.usd)),
        inputs
      )
    })

    const unitBasket = universe.createCachedProducer(async () => {
      const { erc20s, quantities } =
        await this.contracts.rTokenLens.callStatic.redeem(
          this.contracts.assetRegistry.address,
          this.contracts.basketHandler.address,
          this.contracts.rToken.address,
          this.rToken.scale
        )

      const unit = await Promise.all(
        erc20s.map((addr, index) =>
          this.universe
            .getToken(Address.from(addr))
            .then((token) => token.from(quantities[index]))
        )
      )

      return unit
    }, 12000)

    const ONE = 10n ** 18n
    const quoteMint = async (input: TokenQuantity[]) => {
      let unit = await unitBasket()
      if (unit.length !== input.length) {
        throw new Error('Invalid input length')
      }
      let baskets = ethers.constants.MaxUint256.toBigInt()
      for (let i = 0; i < input.length; i++) {
        const basketsUsingQtys = (input[i].amount * ONE) / unit[i].amount
        baskets = basketsUsingQtys < baskets ? basketsUsingQtys : baskets
      }

      const inputSpent = unit.map((i) =>
        i.token.from((i.amount * baskets) / ONE)
      )
      const dust = input.map((i, index) => i.sub(inputSpent[index]))

      return [this.rToken.from(baskets), ...dust]
    }

    const quoteRedeem = async ([input]: TokenQuantity[]) => {
      const unit = await unitBasket()
      const out = unit.map((qty) =>
        qty.token.from((qty.amount * input.amount) / ONE)
      )
      return out
    }

    this.supply = getSupply

    this.maxIssueable = getIssueanceAvailable
    this.quoteMint = quoteMint
    this.quoteRedeem = quoteRedeem

    this.calculateMultiInputUnit = getIssueanceUnit

    this.unitBasket = () => this.calculateMultiInputUnit().then((i) => i.basket)

    universe.defineMintable(this.mint, this.burn, true)
  }

  public static async load(
    uni: Universe,
    facadeAddress: Address,
    rToken: Token
  ) {
    // console.log('loading ' + rToken)
    const rTokenInst = IRToken__factory.connect(
      rToken.address.address,
      uni.provider
    )
    const facade = IFacade__factory.connect(facadeAddress.address, uni.provider)

    const mainAddr = Address.from(await rTokenInst.main())
    // console.log('mainAddr: ' + mainAddr.address)
    const mainInst = IMain__factory.connect(mainAddr.address, uni.provider)
    const [basketHandlerAddr, assetRegAddr] = await Promise.all([
      mainInst.basketHandler().then((i) => Address.from(i)),
      mainInst.assetRegistry().then((i) => Address.from(i)),
    ])
    const basketHandlerInst = IBasketHandler__factory.connect(
      basketHandlerAddr.address,
      uni.provider
    )
    const assetReg = IAssetRegistry__factory.connect(
      assetRegAddr.address,
      uni.provider
    )

    const [uniBasket, assets] = await basketHandlerInst
      .quote(rToken.scale, 0)
      .then(
        async ([basketTokens, amts]) =>
          await Promise.all([
            Promise.all(
              basketTokens.map((addr, index) =>
                uni
                  .getToken(Address.from(addr))
                  .then((basketToken) => basketToken.from(amts[index]))
              )
            ),
            Promise.all(
              basketTokens.map((addr) =>
                assetReg
                  .toAsset(addr)
                  .then((assetAddress) =>
                    IAsset__factory.connect(assetAddress, uni.provider)
                  )
              )
            ),
          ])
      )

    uni.addSingleTokenPriceSource({
      token: rToken,
      priceFn: async () => {
        const [low, high] = (await facade.price(rToken.address.address)).map(
          (i) => i.toBigInt()
        )
        const mid = (low + high) / 2n
        return uni.usd.from(mid / 10n ** 10n)
      },
    })
    const rTokenPrice = await rToken.price

    return new RTokenDeployment(
      uni,
      rToken,
      uniBasket,
      assets,
      {
        facade,
        basketHandler: basketHandlerInst,
        main: mainInst,
        rToken: rTokenInst,
        rTokenLens: RTokenLens__factory.connect(
          uni.config.addresses.rtokenLens.address,
          uni.provider
        ),
        assetRegistry: assetReg,
      },
      200000n + 100000n * BigInt(uniBasket.length),
      200000n + 100000n * BigInt(uniBasket.length),
      rTokenPrice.into(rToken).invert()
    )
  }
}

abstract class ReserveRTokenBase extends Action('Reserve.RToken') {
  abstract action: string
  get oneUsePrZap() {
    return false
  }
  get returnsOutput() {
    return false
  }
  toString(): string {
    return `RToken(action=${this.action}, ${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class MintRTokenAction extends ReserveRTokenBase {
  action = 'issue'
  get supportsDynamicInput() {
    return false
  }
  async plan(
    planner: Planner,
    _: Value[],
    destination: Address,
    predictedInput: TokenQuantity[]
  ) {
    const totalSupply =
      await this.rTokenDeployment.contracts.rToken.totalSupply()
    if (totalSupply.isZero()) {
      const quote = (await this.quote(predictedInput))[0]
      planner.add(
        Contract.createContract(this.rTokenDeployment.contracts.rToken).issueTo(
          destination.address,
          quote.amount
        )
      )
    } else {
      planner.add(
        this.universe.weirollZapperExec.mintMaxRToken(
          this.universe.config.addresses.oldFacadeAddress.address,
          this.address.address,
          destination.address
        )
      )
    }
    return null
  }

  public async inputProportions() {
    const proportions = (await this.rTokenDeployment.calculateMultiInputUnit())
      .proportions

    return proportions
  }

  get universe() {
    return this.rTokenDeployment.universe
  }

  get oneUsePrZap() {
    return true
  }
  get addressesInUse() {
    return this.rTokenDeployment.addressesInUse
  }
  gasEstimate() {
    return this.rTokenDeployment.mintEstimate
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.rTokenDeployment.quoteMint(amountsIn))[0]]
  }
  async quoteWithDust(amountsIn: TokenQuantity[]) {
    const [rTokenQty, ...dust] = await this.rTokenDeployment.quoteMint(
      amountsIn
    )
    return {
      output: [rTokenQty],
      dust,
    }
  }

  get outputSlippage() {
    return 0n
  }
  get basket() {
    return this.rTokenDeployment.basket
  }
  get dustTokens() {
    return this.rTokenDeployment.basket
  }
  constructor(public readonly rTokenDeployment: RTokenDeployment) {
    super(
      rTokenDeployment.rToken.address,
      rTokenDeployment.basket,
      [rTokenDeployment.rToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      rTokenDeployment.basket.map(
        (input) => new Approval(input, rTokenDeployment.rToken.address)
      )
    )
  }
}

export class BurnRTokenAction extends ReserveRTokenBase {
  action = 'redeem'
  get supportsDynamicInput() {
    return true
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    __: Address,
    [predictedInput]: TokenQuantity[]
  ) {
    const rtokenContract = this.gen.Contract.createContract(
      this.rTokenDeployment.contracts.rToken
    )
    planner.add(rtokenContract.redeem(input ?? predictedInput.amount))
    return null
  }

  get oneUsePrZap() {
    return true
  }
  get addressesInUse() {
    return this.rTokenDeployment.addressesInUse
  }
  get universe() {
    return this.rTokenDeployment.universe
  }
  gasEstimate() {
    return this.rTokenDeployment.burnEstimate
  }
  get outputSlippage() {
    return 0n
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await this.quote_(amountsIn)
  }

  async quote_([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const supply = await this.rTokenDeployment.supply()

    if (supply.isZero) {
      const [erc20s, amts] =
        await this.rTokenDeployment.contracts.basketHandler.callStatic.quote(
          amountIn.amount,
          0
        )
      return amts.map((amt, i) => {
        const output = this.outputToken.find(
          (tok) => tok.address.address === erc20s[i]
        )
        if (output == null) {
          throw new Error('Failed to find output token')
        }
        return output.from(amt)
      })
    }
    return await this.rTokenDeployment.quoteRedeem([amountIn])
  }
  get basket() {
    return this.rTokenDeployment.basket
  }

  constructor(public readonly rTokenDeployment: RTokenDeployment) {
    super(
      rTokenDeployment.rToken.address,
      [rTokenDeployment.rToken],
      rTokenDeployment.basket,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
