import { Address } from "../base/Address"
import { type Universe } from "../Universe"
import { StargateWithdrawAction, StargateDepositAction } from "../action/Stargate"
import { IStargatePool__factory } from "../contracts"

export const setupStargate = async (
    universe: Universe,
    tokenAddres: string[],
    router: string,
    wrappedToUnderlyingMapping: Record<string, string>
) => {

    const startgateTokens = await Promise.all(
        tokenAddres.map(async (token) => {
            const vaultInst = IStargatePool__factory.connect(
                token,
                universe.provider
            )
            const [asset, poolId] = await Promise.all([
                vaultInst.callStatic.token(),
                vaultInst.callStatic.poolId()
            ])
            const vaultToken = await universe.getToken(
                Address.from(token)
            )

            const underlyingToken = await universe.getToken(
                Address.from(asset)
            )
            return {
                wrappedToken: vaultToken,
                underlying: underlyingToken,
                poolId: poolId.toNumber()
            }
        })
    )
    const routerAddress = Address.from(router)
    for (const { wrappedToken, underlying, poolId } of startgateTokens) {
        universe.defineMintable(
            new StargateDepositAction(universe, underlying, wrappedToken, poolId, routerAddress),
            new StargateWithdrawAction(universe, underlying, wrappedToken, poolId, routerAddress),
            false
        )
    }
}