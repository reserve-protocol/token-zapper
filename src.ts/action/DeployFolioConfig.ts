import { Universe } from '..'
import { Address } from '../base/Address'
import { TokenQuantity, Token } from '../entities/Token'

class BasicDetails {
  public constructor(
    public readonly basket: TokenQuantity[],
    public readonly name: string,
    public readonly symbol: string,
    public readonly initialShares: bigint
  ) {}

  public serialize() {
    return {
      assets: this.basket.map((i) => i.token.address.address),
      amounts: this.basket.map((i) => i.amount),
      name: this.name,
      symbol: this.symbol,
      initialShares: this.initialShares,
    }
  }
}
class AdditionalDetails {
  public constructor(
    public readonly tradeDelay: bigint,
    public readonly auctionLength: bigint,
    public readonly feeRecipients: FeeRecipient[],
    public readonly folioFee: bigint,
    public readonly mintingFee: bigint
  ) {}

  public serialize() {
    return {
      tradeDelay: this.tradeDelay,
      auctionLength: this.auctionLength,
      feeRecipients: this.feeRecipients.map((i) => i.serialize()),
      folioFee: this.folioFee,
      mintingFee: this.mintingFee,
    }
  }
}
class FeeRecipient {
  public constructor(
    public readonly recipient: Address,
    public readonly portion: bigint
  ) {}
  public serialize() {
    return {
      recipient: this.recipient.address,
      portion: this.portion,
    }
  }
}
class GovParams {
  public constructor(
    public readonly votingDelay: bigint,
    public readonly votingPeriod: bigint,
    public readonly proposalThreshold: bigint,
    public readonly quorumPercent: bigint,
    public readonly timelockDelay: bigint,
    public readonly guardian: Address
  ) {}

  public serialize() {
    return {
      votingDelay: this.votingDelay,
      votingPeriod: this.votingPeriod,
      proposalThreshold: this.proposalThreshold,
      quorumPercent: this.quorumPercent,
      timelockDelay: this.timelockDelay,
      guardian: this.guardian.address,
    }
  }
}
export type GovParamsJson = {
  votingDelay: StringEncodedHexOrIntegerOrBigInt
  votingPeriod: StringEncodedHexOrIntegerOrBigInt
  proposalThreshold: StringEncodedHexOrIntegerOrBigInt
  quorumPercent: StringEncodedHexOrIntegerOrBigInt
  timelockDelay: StringEncodedHexOrIntegerOrBigInt
  guardian: string
}
type StringEncodedHexOrIntegerOrBigInt = string | bigint
export type DeployFolioConfigJson = {
  stToken: string
  basicDetails: {
    assets: string[]
    amounts: StringEncodedHexOrIntegerOrBigInt[]
    name: string
    symbol: string
    initialShares: StringEncodedHexOrIntegerOrBigInt
  }
  additionalDetails: {
    tradeDelay: StringEncodedHexOrIntegerOrBigInt
    auctionLength: StringEncodedHexOrIntegerOrBigInt
    feeRecipients: {
      recipient: string
      portion: StringEncodedHexOrIntegerOrBigInt
    }[]
    folioFee: StringEncodedHexOrIntegerOrBigInt
    mintingFee: StringEncodedHexOrIntegerOrBigInt
  }
  ownerGovParams: GovParamsJson
  tradingGovParams: GovParamsJson
  existingTradeProposers: string[]
  tradeLaunchers: string[]
  vibesOfficers: string[]
}

export class DeployFolioConfig {
  public constructor(
    public readonly stToken: Token,
    public readonly basicDetails: BasicDetails,
    public readonly additionalDetails: AdditionalDetails,
    public readonly ownerGovParams: GovParams,
    public readonly tradingGovParams: GovParams,
    public readonly existingTradeProposers: Address[],
    public readonly tradeLaunchers: Address[],
    public readonly vibesOfficers: Address[]
  ) {}

  public static async create(universe: Universe, json: DeployFolioConfigJson) {
    const basket = await Promise.all(
      json.basicDetails.assets.map((asset, index) =>
        universe
          .getToken(Address.from(asset))
          .then((tok) => tok.from(BigInt(json.basicDetails.amounts[index])))
      )
    )

    return new DeployFolioConfig(
      await universe.getToken(Address.from(json.stToken)),
      new BasicDetails(
        basket,
        json.basicDetails.name,
        json.basicDetails.symbol,
        BigInt(json.basicDetails.initialShares)
      ),
      new AdditionalDetails(
        BigInt(json.additionalDetails.tradeDelay),
        BigInt(json.additionalDetails.auctionLength),
        json.additionalDetails.feeRecipients.map(
          (i) => new FeeRecipient(Address.from(i.recipient), BigInt(i.portion))
        ),
        BigInt(json.additionalDetails.folioFee),
        BigInt(json.additionalDetails.mintingFee)
      ),
      new GovParams(
        BigInt(json.ownerGovParams.votingDelay),
        BigInt(json.ownerGovParams.votingPeriod),
        BigInt(json.ownerGovParams.proposalThreshold),
        BigInt(json.ownerGovParams.quorumPercent),
        BigInt(json.ownerGovParams.timelockDelay),
        Address.from(json.ownerGovParams.guardian)
      ),
      new GovParams(
        BigInt(json.tradingGovParams.votingDelay),
        BigInt(json.tradingGovParams.votingPeriod),
        BigInt(json.tradingGovParams.proposalThreshold),
        BigInt(json.tradingGovParams.quorumPercent),
        BigInt(json.tradingGovParams.timelockDelay),
        Address.from(json.tradingGovParams.guardian)
      ),
      json.existingTradeProposers.map((i) => Address.from(i)),
      json.tradeLaunchers.map((i) => Address.from(i)),
      json.vibesOfficers.map((i) => Address.from(i))
    )
  }

  public serialize() {
    const out = [
      this.stToken.address.address,
      this.basicDetails.serialize(),
      this.additionalDetails.serialize(),
      this.ownerGovParams.serialize(),
      this.tradingGovParams.serialize(),
      this.existingTradeProposers.map((i) => i.address),
      this.tradeLaunchers.map((i) => i.address),
      this.vibesOfficers.map((i) => i.address),
    ] as const

    return out
  }
}
