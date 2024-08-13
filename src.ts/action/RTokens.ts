import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import {
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
import { Planner, Value } from '../tx-gen/Planner'

export class RTokenDeployment {
  public readonly burn: BurnRTokenAction
  public readonly mint: MintRTokenAction

  toString() {
    return `RToken[${this.rToken}](basket=${this.basket.join(', ')})`
  }

  private block: number
  public async unitBasket() {
    if (
      Math.abs(this.block - this.universe.currentBlock) >
      this.universe.config.requoteTolerance
    ) {
      this.unitBasket_ = await this.contracts.basketHandler
        .quote(this.rToken.scale, 0)
        .then(
          async ([basketTokens, amts]) =>
            await Promise.all(
              basketTokens.map(
                async (addr, index) =>
                  await this.universe
                    .getToken(Address.from(addr))
                    .then((basketToken) => basketToken.from(amts[index]))
              )
            )
        )
      this.block = this.universe.currentBlock
    }
    return this.unitBasket_
  }

  async maxIssueable() {
    return this.rToken.from(
      await this.contracts.rToken.callStatic.issuanceAvailable()
    )
  }

  public readonly basket: Token[]
  private constructor(
    public readonly universe: Universe,
    public readonly rToken: Token,
    private unitBasket_: TokenQuantity[],
    public readonly contracts: {
      facade: IFacade
      basketHandler: IBasketHandler
      main: IMain
      rToken: IRToken
      rTokenLens: RTokenLens
      assetRegistry: IAssetRegistry
    },
    public readonly mintEstimate: bigint,
    public readonly burnEstimate: bigint
  ) {
    this.block = universe.currentBlock
    this.basket = this.unitBasket_.map((i) => i.token)
    this.burn = new BurnRTokenAction(this)
    this.mint = new MintRTokenAction(this)

    universe.defineMintable(this.mint, this.burn, true)
  }

  public static async load(
    uni: Universe,
    facadeAddress: Address,
    rToken: Token,
    mintEstimate: bigint = 1000000n,
    burnEstimate: bigint = 1000000n
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

    const uniBasket = await basketHandlerInst
      .quote(rToken.scale, 0)
      .then(
        async ([basketTokens, amts]) =>
          await Promise.all(
            basketTokens.map(
              async (addr, index) =>
                await uni
                  .getToken(Address.from(addr))
                  .then((basketToken) => basketToken.from(amts[index]))
            )
          )
      )
    return new RTokenDeployment(
      uni,
      rToken,
      uniBasket,
      {
        facade,
        basketHandler: basketHandlerInst,
        main: mainInst,
        rToken: rTokenInst,
        rTokenLens: RTokenLens__factory.connect(
          uni.config.addresses.rtokenLens.address,
          uni.provider
        ),
        assetRegistry: IAssetRegistry__factory.connect(
          assetRegAddr.address,
          uni.provider
        ),
      },
      mintEstimate,
      burnEstimate
    )
  }
}

abstract class ReserveRTokenBase extends Action('Reserve.RToken') {
  abstract action: string
  get supportsDynamicInput() {
    return true
  }
  get oneUsePrZap() {
    return false
  }
  get returnsOutput() {
    return false
  }
  toString(): string {
    return `RToken(action=${this.action}, ${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')}`
  }
}

export class MintRTokenAction extends ReserveRTokenBase {
  action = 'issue'
  async plan(planner: Planner, _: Value[], destination: Address) {
    planner.add(
      this.universe.weirollZapperExec.mintMaxRToken(
        this.universe.config.addresses.oldFacadeAddress.address,
        this.address.address,
        destination.address
      )
    )
    return null
  }
  get universe() {
    return this.rTokenDeployment.universe
  }
  gasEstimate() {
    return this.rTokenDeployment.mintEstimate
  }
  get outputSlippage() {
    return 1n
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    if (this.universe.config.addresses.facadeAddress !== Address.ZERO) {
      const out = await this.rTokenDeployment.contracts.facade.callStatic
        .maxIssuableByAmounts(
          this.outputToken[0].address.address,
          amountsIn.map((i) => i.amount)
        )
        .then((amt) => this.rTokenDeployment.rToken.from(amt))

      return [out]
    } else {
      const unit = await this.rTokenDeployment.unitBasket()
      let out = this.outputToken[0].zero
      unit.map((unit, index) => {
        const thisOut = amountsIn[index].div(unit).into(this.outputToken[0])
        if (thisOut.gt(out)) {
          out = thisOut
        }
      })

      return [out]
    }
  }
  get basket() {
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
  get universe() {
    return this.rTokenDeployment.universe
  }
  gasEstimate() {
    return this.rTokenDeployment.burnEstimate
  }
  get outputSlippage() {
    return 1n
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await this.quote_(amountsIn)
  }

  async quote_([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const basket = this.rTokenDeployment.basket
    const out = await this.rTokenDeployment.contracts.rTokenLens.callStatic
      .redeem(
        this.rTokenDeployment.contracts.assetRegistry.address,
        this.rTokenDeployment.contracts.basketHandler.address,
        this.rTokenDeployment.rToken.address.address,
        amountIn.amount
      )
      .then(
        async ([ercs, amts]) =>
          await Promise.all(
            amts.map(async (amt, index) => {
              const erc = await this.universe.getToken(
                Address.from(ercs[index])
              )
              if (erc !== basket[index]) {
                throw new Error(
                  'rTokenLens.redeem produced different output tokens'
                )
              }
              return basket[index].from(amt)
            })
          )
      )

    return out
  }
  get basket() {
    return this.rTokenDeployment.basket
  }
  // private quoteCache: BlockCache<TokenQuantity, TokenQuantity[]>
  constructor(public readonly rTokenDeployment: RTokenDeployment) {
    super(
      rTokenDeployment.rToken.address,
      [rTokenDeployment.rToken],
      rTokenDeployment.basket,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
    // this.quoteCache = this.universe.createCache<TokenQuantity, TokenQuantity[]>(
    //   async (amountsIn) => await this.quote_([amountsIn])
    // )
  }
}
