import { type Universe } from '../Universe';
import { type ConfigWithToken } from '../configuration/ChainConfiguration';
export type UniverseWithERC20GasTokenDefined = Universe<ConfigWithToken<{
    ERC20GAS: string;
    WBTC: string;
}>>;
export type UniverseWithCommonBaseTokens = Universe<ConfigWithToken<{
    WETH: string;
    WBTC: string;
    USDC: string;
    USDT: string;
    DAI: string;
}>>;
//# sourceMappingURL=UniverseWithERC20GasTokenDefined.d.ts.map