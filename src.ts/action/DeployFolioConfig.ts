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
  ) {
    if (basket.some((i) => i.isZero)) {
      throw new Error('ZERO QUANTITY IN BASKET')
    }
  }

  public serialize() {
    return {
      assets: this.basket.map((i) => i.token.address.address),
      amounts: this.basket.map((i) => i.amount),
      name: this.name,
      symbol: this.symbol,
      initialShares: 0n,
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
    public readonly auctionDelay: bigint,
    public readonly auctionLength: bigint,
    public readonly feeRecipients: FeeRecipient[],
    public readonly tvlFee: bigint,
    public readonly mintFee: bigint,
    public readonly mandate: string
  ) {}

  public toString() {
    return `AdditionalDetails(auctionDelay=${
      this.auctionDelay
    }s, auctionLength=${this.auctionLength}s, feeRecipients=${this.feeRecipients
      .map((i) => i.toString())
      .join(', ')}, tvlFee=${formatEther(this.tvlFee)}, mintFee=${formatEther(
      this.mintFee
    )})`
  }

  public serialize() {
    return {
      auctionDelay: this.auctionDelay,
      auctionLength: this.auctionLength,
      feeRecipients: this.feeRecipients.map((i) => i.serialize()),
      tvlFee: this.tvlFee,
      mintFee: this.mintFee,
      mandate: this.mandate,
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
    }s, guardians=${this.guardians.join(', ')})`
  }
  public constructor(
    public readonly votingDelay: bigint,
    public readonly votingPeriod: bigint,
    public readonly proposalThreshold: bigint,
    public readonly quorumPercent: bigint,
    public readonly timelockDelay: bigint,
    public readonly guardians: Address[]
  ) {}

  // (uint48,uint32,uint256,uint256,uint256,address[])
  public serialize() {
    return {
      votingDelay: this.votingDelay,
      votingPeriod: this.votingPeriod,
      proposalThreshold: this.proposalThreshold,
      quorumPercent: this.quorumPercent,
      timelockDelay: this.timelockDelay,
      guardians: this.guardians.map((i) => i.address),
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
  guardians: string[]
}
type BaseConfigJSON = {
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
    mandate: string
  }
  existingTradeProposers: string[]
  tradeLaunchers: string[]
  vibesOfficers: string[]
}

export type DeployFolioConfigJson =
  | (BaseConfigJSON & {
      type: 'governed'
      stToken: string
      ownerGovParams: GovParamsJson
      tradingGovParams: GovParamsJson
    })
  | (BaseConfigJSON & {
      type: 'ungoverned'
      owner: string
    })

export class DeployFolioConfig {
  public toString() {
    if (this.governance.type === 'governed') {
      return `DeployFolioConfig(stToken=${
        this.governance.stToken
      }, basicDetails=${this.basicDetails.toString()}, additionalDetails=${this.additionalDetails.toString()}, ownerGovParams=${this.governance?.ownerGovParams.toString()}, tradingGovParams=${this.governance?.tradingGovParams.toString()}, existingTradeProposers=${this.existingTradeProposers.join(
        ', '
      )}, tradeLaunchers=${this.tradeLaunchers.join(
        ', '
      )}, vibesOfficers=${this.vibesOfficers.join(', ')})`
    } else {
      return `DeployFolioConfig(basicDetails=${this.basicDetails.toString()}, additionalDetails=${this.additionalDetails.toString()}, owner=${
        this.governance.owner.address
      }, existingTradeProposers=${this.existingTradeProposers.join(
        ', '
      )}, tradeLaunchers=${this.tradeLaunchers.join(
        ', '
      )}, vibesOfficers=${this.vibesOfficers.join(', ')})`
    }
  }
  public constructor(
    public readonly basicDetails: BasicDetails,
    public readonly additionalDetails: AdditionalDetails,
    public readonly governance:
      | {
          type: 'governed'
          stToken: Token
          ownerGovParams: GovParams
          tradingGovParams: GovParams
        }
      | {
          type: 'ungoverned'
          owner: Address
        },
    public readonly existingTradeProposers: Address[],
    public readonly tradeLaunchers: Address[],
    public readonly vibesOfficers: Address[],
    public readonly slippage = 0.01
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
        BigInt(json.additionalDetails.mintingFee),
        json.additionalDetails.mandate
      ),
      json.type === 'governed'
        ? {
            type: 'governed',
            stToken: await universe.getToken(Address.from(json.stToken)),
            ownerGovParams: new GovParams(
              BigInt(json.ownerGovParams.votingDelay),
              BigInt(json.ownerGovParams.votingPeriod),
              BigInt(json.ownerGovParams.proposalThreshold),
              BigInt(json.ownerGovParams.quorumPercent),
              BigInt(json.ownerGovParams.timelockDelay),
              json.ownerGovParams.guardians.map(Address.from)
            ),
            tradingGovParams: new GovParams(
              BigInt(json.tradingGovParams.votingDelay),
              BigInt(json.tradingGovParams.votingPeriod),
              BigInt(json.tradingGovParams.proposalThreshold),
              BigInt(json.tradingGovParams.quorumPercent),
              BigInt(json.tradingGovParams.timelockDelay),
              json.tradingGovParams.guardians.map(Address.from)
            ),
          }
        : {
            type: 'ungoverned',
            owner: Address.from(json.owner),
          },
      json.existingTradeProposers.map((i) => Address.from(i)),
      json.tradeLaunchers.map((i) => Address.from(i)),
      json.vibesOfficers.map((i) => Address.from(i))
    )
  }

  public serializeGoverned() {
    const governance = this.governance
    if (governance.type === 'ungoverned') {
      throw new Error('Governance is not set')
    }
    const out = [
      governance.stToken.address.address,
      this.basicDetails.serialize(),
      this.additionalDetails.serialize(),
      governance.ownerGovParams.serialize(),
      governance.tradingGovParams.serialize(),
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

  public serializeUnGoverned() {
    if (this.governance.type !== 'ungoverned') {
      throw new Error('Governance is set')
    }
    const out = [
      this.basicDetails.serialize(),
      this.additionalDetails.serialize(),
      this.governance.owner.address,
      this.existingTradeProposers.map((i) => i.address),
      this.tradeLaunchers.map((i) => i.address),
      this.vibesOfficers.map((i) => i.address),
    ] as const

    return out
  }
}
