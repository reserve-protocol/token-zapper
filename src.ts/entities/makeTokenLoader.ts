import { type Address } from '../base/Address';
import { parseHexStringIntoBuffer } from '../base/utils';
import { id } from "@ethersproject/hash";
import { defaultAbiCoder } from "@ethersproject/abi";
import { type Provider } from '@ethersproject/providers'
import { IERC20__factory } from '../contracts/factories/IERC20__factory';

export const makeTokenLoader = (provider: Provider) => async (
  address: Address
) => {
  const erc20 = IERC20__factory.connect(address.address, provider);
  let [symbol, decimals] = await Promise.all([
    provider.call({
      to: address.address,
      data: id('symbol()').slice(0, 10),
    }),
    erc20.decimals().catch(() => 0),
  ]);

  if (symbol.length === 66) {
    let buffer = parseHexStringIntoBuffer(symbol);
    let last = buffer.indexOf(0);
    if (last == -1) {
      last = buffer.length;
    }
    buffer = buffer.subarray(0, last);
    symbol = buffer.toString('utf8');
  } else {
    symbol = defaultAbiCoder.decode(['string'], symbol)[0];
  }

  return {
    symbol,
    decimals,
  };
};
export type TokenLoader = ReturnType<typeof makeTokenLoader>;
