import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { type TokenQuantity } from '../entities/Token';
import { SwapPlan } from '../searcher/Swap';
import { DepositAction, WithdrawAction } from '../action/WrappedNative';
import { type ConfigWithToken } from './ChainConfiguration';


export const setupWrappedGasToken = async <
  const WrappedTokenName extends string
>(
  universe: Universe<ConfigWithToken<{
    [K in WrappedTokenName]: string;
  }>>,
  wrappedTokenName = "ERC20GAS" as WrappedTokenName
) => {
  const k = universe.config.addresses.commonTokens[wrappedTokenName]
  const wrappedToken = await universe.getToken(
    k!
  );

  const wrappedGasTokenActions = {
    burn: new DepositAction(universe, wrappedToken),
    mint: new WithdrawAction(universe, wrappedToken),
  }
  universe.addAction(wrappedGasTokenActions.burn)
  universe.addAction(wrappedGasTokenActions.mint)
  universe.tokenTradeSpecialCases.set(
    universe.nativeToken,
    async (input: TokenQuantity, dest: Address) => {
      if (input.token === wrappedToken) {
        return await new SwapPlan(universe, [wrappedGasTokenActions.burn]).quote(
          [input],
          dest
        );
      }
      return null;
    }
  );

  universe.tokenTradeSpecialCases.set(
    wrappedToken,
    async (input: TokenQuantity, dest: Address) => {
      if (input.token === universe.nativeToken) {
        return await new SwapPlan(universe, [wrappedGasTokenActions.mint]).quote(
          [input],
          dest
        );
      }
      return null;
    }
  );
};
