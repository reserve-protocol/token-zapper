import { Address } from "../base/Address"
import { type Universe } from "../Universe"
import { IStargateRewardableWrapper__factory } from "../contracts"
import { StargateWrapperWithdrawAction, StargateWrapperDepositAction } from "../action/StargateWrapper"

export const setupStargateWrapper = async (
    universe: Universe,
    vaultAddr: string[],
    wrappedToUnderlyingMapping: Record<string, string>
) => {

    const tokens = await Promise.all(
        vaultAddr.map(async (addr) => {
            
            const vaultInst = IStargateRewardableWrapper__factory.connect(
                addr,
                universe.provider
            )
            const asset = await vaultInst.callStatic.underlying()
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
        universe.defineMintable(
            new StargateWrapperDepositAction(universe, underlying, wrappedToken),
            new StargateWrapperWithdrawAction(universe, underlying, wrappedToken),
            false
        )
      }
}