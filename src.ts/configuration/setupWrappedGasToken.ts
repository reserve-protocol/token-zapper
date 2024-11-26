import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { type TokenQuantity } from '../entities/Token'
import { SwapPlan } from '../searcher/Swap'
import { DepositAction, WithdrawAction } from '../action/WrappedNative'
import { Config } from './ChainConfiguration'

export const setupWrappedGasToken = async (universe: Universe<Config>) => {
  const k = universe.config.addresses.commonTokens.ERC20GAS
  const wrappedToken = await universe.getToken(k!)

  const wrappedGasTokenActions = {
    burn: new DepositAction(universe, wrappedToken),
    mint: new WithdrawAction(universe, wrappedToken),
  }
  universe.defineMintable(
    wrappedGasTokenActions.burn,
    wrappedGasTokenActions.mint,
    true
  )
}
