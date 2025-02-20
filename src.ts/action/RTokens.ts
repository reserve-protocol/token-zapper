import { Universe } from '../Universe'
import { Address } from '../base/Address'
import {
  PricedTokenQuantity,
  Token,
  type TokenQuantity,
} from '../entities/Token'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
  lit,
  plannerUtils,
} from './Action'

import { constants, ethers } from 'ethers'
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
  RTokenMintHelper__factory,
} from '../contracts'
import { Contract, LiteralValue, Planner, Value } from '../tx-gen/Planner'
import { MultiInputUnit } from './MultiInputAction'

import deployments from '../contracts/deployments.json'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'

const config = (helperAddress: string) => ({
  helper: Address.from(helperAddress),
})
export const rTokenConfigs: Record<ChainId, { helper: Address }> = {
  [ChainIds.Mainnet]: config(
    deployments[1][0].contracts.RTokenMintHelper.address
  ),
  [ChainIds.Base]: config(
    deployments[8453][0].contracts.RTokenMintHelper.address
  ),
  [ChainIds.Arbitrum]: config(constants.AddressZero),
}

export class RTokenDeployment {
  public readonly burn: BurnRTokenAction
  public readonly mint: MintRTokenAction
  public readonly addressesInUse: Set<Address>
  private get config() {
    const out = rTokenConfigs[this.universe.chainId as ChainId]
    if (out == null || out?.helper.address === constants.AddressZero) {
      throw new Error(
        'No helper address configured for chain ' + this.universe.chainId
      )
    }
    return out
  }
  public get helper() {
    return this.config.helper
  }

  toString() {
    return `RToken[${this.rToken}](basket=${this.basket.join(', ')})`
  }

  public readonly supply: () => Promise<TokenQuantity>
  public async exchangeRate() {
    const underlyingTokens = new Set([
      ...(await Promise.all(
        this.basket.map(
          async (token) => await this.universe.underlyingToken.get(token)
        )
      )),
    ]).size
    const supply = await this.supply()
    const baskets = this.rToken.from(
      (await this.contracts.rToken.callStatic.basketsNeeded()).toBigInt()
    )
    const tokenClass = await this.universe.tokenClass.get(this.rToken)
    const amount = supply.amount

    if (amount === 0n) {
      const classPrice = await tokenClass.price
      const ourPrice = await this.contracts.facade.callStatic.price(
        this.rToken.address.address
      )
      const ourPriceUSD = this.universe.usd.from(
        (((ourPrice.low.toBigInt() + ourPrice.high.toBigInt()) / 2n) *
          this.universe.usd.scale) /
          10n ** 18n
      )

      const out = ourPriceUSD.div(classPrice).into(tokenClass)

      return out
    }
    const out = (baskets.amount * tokenClass.scale) / amount
    let res = tokenClass.from(out).invert()

    return res
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
    private assets: [Token, IAsset][],
    public readonly backingManager: Address,
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

    const getSupply = () => this.universe.approvalsStore.totalSupply(rToken)

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
      const supply = await this.supply()
      if (supply.amount < this.rToken.scale) {
        const { erc20s, quantities } =
          await this.contracts.basketHandler.callStatic.quote(
            this.rToken.scale,
            0
          )
        const unit = await Promise.all(
          erc20s.map((addr, index) =>
            this.universe
              .getToken(Address.from(addr))
              .then((token) => token.from(quantities[index]))
          )
        )

        return unit
      }
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

    for (const [token, asset] of assets) {
      this.universe.addSingleTokenPriceSource({
        token,
        priceFn: async () => {
          const price = await asset.callStatic.price()
          const out = this.universe.usd.from(
            (((price.low.toBigInt() + price.high.toBigInt()) / 2n) *
              this.universe.usd.scale) /
              ONE
          )
          return out
        },
      })
    }

    const ONE = 10n ** 18n

    const quoteRedeem = async ([input]: TokenQuantity[]) => {
      const unit = await unitBasket()
      const out = unit.map((qty) =>
        qty.token.from((qty.amount * input.amount) / ONE)
      )
      return out
    }

    const quoteMint = async (input: TokenQuantity[]) => {
      if (input.some((i) => i.amount === 0n)) {
        return [this.rToken.zero, ...input]
      }
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
                  .then(async (assetAddr) =>
                    Promise.all([
                      uni.getToken(Address.from(addr)),
                      assetAddr,
                    ] as const)
                  )
              )
            ),
          ])
      )

    const rTokenPricer = uni.createCachedProducer(async () => {
      const [low, high] = (await facade.price(rToken.address.address)).map(
        (i) => i.toBigInt()
      )
      const mid = (low + high) / 2n
      return uni.usd.from(mid / 10n ** 10n)
    }, 60000)

    uni.addSingleTokenPriceSource({
      token: rToken,
      priceFn: async () => {
        return await rTokenPricer()
      },
    })
    const backingManager = Address.from(
      await mainInst.callStatic.backingManager()
    )
    const rTokenPrice = await rToken.price

    return new RTokenDeployment(
      uni,
      rToken,
      uniBasket,
      assets,
      backingManager,
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
    values: Value[],
    _: Address,
    __: TokenQuantity[]
  ) {
    const helper = RTokenMintHelper__factory.connect(
      this.rTokenDeployment.helper.address,
      this.universe.provider
    )
    const helperContract = Contract.createContract(helper)

    // Move tokens to helper
    for (let i = 0; i < this.basket.length; i++) {
      const token = this.basket[i]
      const qty = values[i]
      plannerUtils.erc20.transfer(
        this.universe,
        planner,
        qty,
        token,
        this.rTokenDeployment.helper
      )
    }
    return [
      planner.add(
        helperContract.mintToken(
          this.rTokenDeployment.contracts.facade.address,
          ethers.utils.defaultAbiCoder.encode(
            ['address[]'],
            [this.basket.map((i) => i.address.address)]
          ),
          this.rTokenDeployment.rToken.address.address
        )
      )!,
    ]
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
  private lastBlock = 0
  private cache = new Map<string, Promise<TokenQuantity[]>>()
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    if (this.lastBlock !== this.universe.currentBlock) {
      this.lastBlock = this.universe.currentBlock
      this.cache.clear()
    }
    const key = amountsIn.map((i) => i.amount).join(',')
    let out = this.cache.get(key)
    if (out == null) {
      out = this.rTokenDeployment.quoteMint(amountsIn)
      this.cache.set(key, out)
    }

    return await out
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
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
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
    const { quantities } =
      await this.rTokenDeployment.contracts.rTokenLens.callStatic.redeem(
        this.rTokenDeployment.contracts.assetRegistry.address,
        this.rTokenDeployment.contracts.basketHandler.address,
        this.rTokenDeployment.contracts.rToken.address,
        amountIn.amount
      )
    const out = quantities.map((amt, i) => {
      const output = this.outputToken[i]
      return output.from(amt)
    })
    return out
  }
  get dependsOnRpc(): boolean {
    return true
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
