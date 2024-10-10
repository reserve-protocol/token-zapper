import { Address } from "../base/Address";
import { DefaultMap } from "../base/DefaultMap";
import { TokenQuantity, Token } from "../entities/Token";

export const createDisabledParisTable = () => {
  const disabled = new DefaultMap(
    (_: number) => new DefaultMap((_: Address) => new Set<Address>())
  );
  const defineDisablePair = (
    chainId: number,
    token0: string,
    token1: string
  ) => {
    disabled.get(chainId).get(Address.from(token0)).add(Address.from(token1));
    disabled.get(chainId).get(Address.from(token1)).add(Address.from(token0));
  };
  const isDisabled = (chainId: number, inp: TokenQuantity, out: Token) => {
    return disabled.get(chainId).get(inp.token.address).has(out.address);
  };

  return {
    define: defineDisablePair,
    isDisabled,
  };
};
