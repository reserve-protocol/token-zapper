import { Universe } from '../Universe'
import { ERC4626DepositAction, ERC4626WithdrawAction } from '../action/ERC4626'
import { Address } from '../base/Address'
import { IERC4626__factory } from '../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory'
import { Token } from '../entities/Token'

export class ERC4626Deployment {
  public readonly mint: InstanceType<ReturnType<typeof ERC4626DepositAction>>
  public readonly burn: InstanceType<ReturnType<typeof ERC4626WithdrawAction>>
  constructor(
    public readonly protocol: string,
    public readonly universe: Universe,
    public readonly shareToken: Token,
    public readonly assetToken: Token,
    public readonly slippage: bigint
  ) {
    this.mint = new (ERC4626DepositAction(protocol))(
      universe,
      assetToken,
      shareToken,
      slippage
    )
    this.burn = new (ERC4626WithdrawAction(protocol))(
      universe,
      assetToken,
      shareToken,
      slippage
    )

    universe.defineMintable(this.mint, this.burn, true)
  }

  public static async load(
    universe: Universe,
    protocol: string,
    shareTokenAddress: Address,
    slippage: bigint
  ): Promise<ERC4626Deployment> {
    const vaultInst = IERC4626__factory.connect(
      shareTokenAddress.address,
      universe.provider
    )
    const assetTokenAddress = await vaultInst.callStatic.asset()
    const shareToken = await universe.getToken(Address.from(shareTokenAddress))
    const assetToken = await universe.getToken(Address.from(assetTokenAddress))
    universe.addSingleTokenPriceSource({
      token: shareToken,
      priceFn: async () => {
        const wei = await vaultInst.callStatic.previewRedeem(
          shareToken.one.amount
        )
        const assets = assetToken.from(wei)
        const usd = await universe.fairPrice(assets)
        if (usd == null) {
          throw new Error('Price not found for ' + shareToken)
        }
        return usd
      },
    })
    return new ERC4626Deployment(
      protocol,
      universe,
      shareToken,
      assetToken,
      slippage
    )
  }

  toString() {
    return `ERC4626[${this.protocol}](share=${this.shareToken}, asset=${this.assetToken})`
  }
}
export const setupERC4626 = async (
  universe: Universe,
  cfg: {
    protocol: string
    vaultAddress: string
    slippage: bigint
  }
) => {
  return await ERC4626Deployment.load(
    universe,
    cfg.protocol,
    Address.from(cfg.vaultAddress),
    cfg.slippage
  )
}
export const setupERC4626s = async (
  universe: Universe,
  config: {
    protocol: string
    vaultAddress: string
    slippage: bigint
  }[]
) => {
  const deployments = await Promise.all(
    config.map(async (cfg) => {
      const dep = await setupERC4626(universe, {
        protocol: cfg.protocol,
        vaultAddress: cfg.vaultAddress,
        slippage: cfg.slippage,
      })

      universe.addSingleTokenPriceSource({
        token: dep.shareToken,
        priceFn: async () => {
          const assetPrice = await dep.assetToken.price
          const assets = await dep.burn.quote([dep.shareToken.one])

          return universe.usd.from(assets[0].asNumber() * assetPrice.asNumber())
        },
      })

      return dep
    })
  )
  return deployments
}
