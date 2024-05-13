import { type Universe } from '../Universe';
import { type ConfigWithToken } from '../configuration/ChainConfiguration';

export type UniverseWithERC20GasTokenDefined = Universe<ConfigWithToken<{
  ERC20GAS: string;
  WBTC: string;
}>>;
