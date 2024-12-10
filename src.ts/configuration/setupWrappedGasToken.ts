import { type Universe } from '../Universe'
import { DepositAction, WithdrawAction } from '../action/WrappedNative'
import { Config } from './ChainConfiguration'
import { TokenType } from '../entities/TokenClass'

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

  universe.tokenClass.set(wrappedToken, Promise.resolve(universe.wrappedNativeToken))
  universe.tokenType.set(wrappedToken, Promise.resolve(TokenType.Asset))
  universe.tokenClass.set(universe.nativeToken, Promise.resolve(universe.wrappedNativeToken))
  universe.tokenType.set(universe.nativeToken, Promise.resolve(TokenType.Asset))
}
