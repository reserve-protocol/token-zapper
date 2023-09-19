import { type EthereumUniverse } from './ethereum';
import { ERC4626DepositAction, ERC4626WithdrawAction } from '../action/ERC4626';
import { IERC4626__factory } from '../contracts';
import { Address } from '../base/Address';

export const setupERC4626 = async (
    universe: EthereumUniverse,
    vaultAddr: string[],
    wrappedToUnderlyingMapping: Record<string, string>
) => {

    const tokens = await Promise.all(
        vaultAddr.map(async (addr) => {
            
            const vaultInst = IERC4626__factory.connect(
                addr,
                universe.provider
            )
            const asset = await vaultInst.callStatic.asset()
            const vaultToken = await universe.getToken(
                Address.from(addr)
            )

            const underlyingToken = await universe.getToken(
                Address.from(asset)
            )
            return {
                wrappedToken: vaultToken,
                underlying: underlyingToken,
            }
        })
    )
    for (const { wrappedToken, underlying } of tokens) {
        console.log(`Setting up ERC4626 ${underlying} -> ${wrappedToken}`)
        universe.defineMintable(
            new ERC4626DepositAction(universe, underlying, wrappedToken),
            new ERC4626WithdrawAction(universe, underlying, wrappedToken),
            false
        )
      }
}