import { Universe } from '../Universe'
import { ERC4626DepositAction, ERC4626WithdrawAction } from '../action/ERC4626'
import { Address } from '../base/Address'
import { IERC4626__factory } from '../contracts/factories/contracts/IERC4626__factory'

export const setupERC4626 = async (
  universe: Universe,
  vaultAddr: string[],
  protocol: string
) => {
  const tokens = await Promise.all(
    vaultAddr.map(async (addr) => {
      const vaultInst = IERC4626__factory.connect(addr, universe.provider)
      const asset = await vaultInst.callStatic.asset()
      const vaultToken = await universe.getToken(Address.from(addr))

      const underlyingToken = await universe.getToken(Address.from(asset))
      return {
        wrappedToken: vaultToken,
        underlying: underlyingToken,
      }
    })
  )
  for (const { wrappedToken, underlying } of tokens) {
    universe.defineMintable(
      new (ERC4626DepositAction(protocol))(universe, underlying, wrappedToken),
      new (ERC4626WithdrawAction(protocol))(universe, underlying, wrappedToken),
      false
    )
  }
}
