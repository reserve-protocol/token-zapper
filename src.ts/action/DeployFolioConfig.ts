import { formatEther } from 'ethers/lib/utils'
import { Universe } from '..'
import { Address } from '../base/Address'
import { TokenQuantity, Token } from '../entities/Token'
import { ONE } from './Action'

class BasicDetails {
  public constructor(
    public readonly basket: TokenQuantity[],
    public readonly name: string,
    public readonly symbol: string
  ) {}

  public serialize(initialShares: bigint) {
    return {
      assets: this.basket.map((i) => i.token.address.address),
      amounts: this.basket.map((i) => (i.amount * initialShares) / ONE),
      name: this.name,
      symbol: this.symbol,
      initialShares: initialShares,
    }
  }

  public toString() {
    return `BasicDetails(${this.name}, ${this.symbol}, basket=${this.basket
      .map((i) => i.toString())
      .join(', ')})`
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

  public toString() {
    return `AdditionalDetails(tradeDelay=${this.tradeDelay}s, auctionLength=${
      this.auctionLength
    }s, feeRecipients=${this.feeRecipients
      .map((i) => i.toString())
      .join(', ')}, folioFee=${formatEther(
      this.folioFee
    )}, mintingFee=${formatEther(this.mintingFee)})`
  }

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
  public toString() {
    return `FeeRecipient(${this.recipient.address}, ${formatEther(
      this.portion
    )})`
  }
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
  public toString() {
    return `GovParams(votingDelay=${this.votingDelay}s, votingPeriod=${
      this.votingPeriod
    }s, proposalThreshold=${formatEther(
      this.proposalThreshold
    )}, quorumPercent=${this.quorumPercent}%, timelockDelay=${
      this.timelockDelay
    }s, guardian=${this.guardian.address})`
  }
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
type StringEncodedHexOrIntegerOrBigInt = string | bigint

export type GovParamsJson = {
  votingDelay: StringEncodedHexOrIntegerOrBigInt
  votingPeriod: StringEncodedHexOrIntegerOrBigInt
  proposalThreshold: StringEncodedHexOrIntegerOrBigInt
  quorumPercent: StringEncodedHexOrIntegerOrBigInt
  timelockDelay: StringEncodedHexOrIntegerOrBigInt
  guardian: string
}
export type DeployFolioConfigJson = {
  stToken: string
  basicDetails: {
    assets: string[]
    amounts: StringEncodedHexOrIntegerOrBigInt[]
    name: string
    symbol: string
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
  public toString() {
    return `DeployFolioConfig(stToken=${
      this.stToken
    }, basicDetails=${this.basicDetails.toString()}, additionalDetails=${this.additionalDetails.toString()}, ownerGovParams=${this.ownerGovParams.toString()}, tradingGovParams=${this.tradingGovParams.toString()}, existingTradeProposers=${this.existingTradeProposers.join(
      ', '
    )}, tradeLaunchers=${this.tradeLaunchers.join(
      ', '
    )}, vibesOfficers=${this.vibesOfficers.join(', ')})`
  }
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
        json.basicDetails.symbol
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

  public serialize(initialShares: bigint) {
    const out = [
      this.stToken.address.address,
      this.basicDetails.serialize(initialShares),
      this.additionalDetails.serialize(),
      this.ownerGovParams.serialize(),
      this.tradingGovParams.serialize(),
      {
        existingTradeProposers: this.existingTradeProposers.map(
          (i) => i.address
        ),
        tradeLaunchers: this.tradeLaunchers.map((i) => i.address),
        vibesOfficers: this.vibesOfficers.map((i) => i.address),
      },
    ] as const

    return out
  }
}
