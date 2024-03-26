import { type Universe } from '../Universe';
import { Address } from '../base/Address';

export const convertWrapperTokenAddressesIntoWrapperTokenPairs = async (
  universe: Universe,
  markets: string[],
  underlyingTokens: { [address: string]: string; }
) => {
  return await Promise.all(
    markets
      .map(Address.from)
      .map(async (address) => {
        if (underlyingTokens[address.address] == null) {
          throw new Error(`No underlying token for ${address.address}`);
        }
        const [underlying, wrappedToken] = await Promise.all([
          universe.getToken(Address.from(underlyingTokens[address.address])),
          universe.getToken(address),
        ]);
        return { underlying, wrappedToken };
      })
  );
};
