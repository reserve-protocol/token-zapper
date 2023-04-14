import { Address } from '../base/Address';
import { Universe } from '../Universe';
import { CommonTokens, RTokens } from './StaticConfig';

export interface JsonTokenEntry {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}
/**
 * Helper method for loading in tokens from a JSON file into the universe
 * It also initializes the rTokens and commonTokens fields based on the
 * addresses in the chain configuration.
 * 
 * @param universe 
 * @param tokens 
 */
export const loadTokens = async (
  universe: Universe,
  tokens: JsonTokenEntry[]
) => {

  for (const token of tokens) {
    universe.createToken(
      Address.from(token.address),
      token.symbol,
      token.name,
      token.decimals
    );
  }
  const rTokenSymbols = Object.keys(universe.rTokens) as (keyof RTokens)[];
  await Promise.all(
    rTokenSymbols.map(async (key) => {
      const addr = universe.chainConfig.config.addresses.rtokens[key];
      if (addr == null) {
        return;
      }
      universe.rTokens[key] = await universe.getToken(addr);
    })
  );

  const commonTokenSymbols = Object.keys(
    universe.commonTokens
  ) as (keyof CommonTokens)[];
  await Promise.all(
    commonTokenSymbols.map(async (key) => {
      const addr = universe.chainConfig.config.addresses.commonTokens[key];
      if (addr == null) {
        return;
      }
      universe.commonTokens[key] = await universe.getToken(addr);
    })
  );
};
