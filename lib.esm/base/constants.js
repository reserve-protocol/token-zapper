import { ChainIds } from '../configuration/ReserveAddresses';
import { Address } from './Address';
/**
 * Internally  we use Uniswap v3's fee scale.
 */
export const FEE_SCALE = 1000000n;
export const GAS_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const BTC_TOKEN_ADDRESS = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
export const ZERO = '0x0000000000000000000000000000000000000000';
export const CHAINLINK_BTC_TOKEN_ADDRESS = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';
// It is a stand-in for USD. Address matches chainlink's designation. Which is based
// on some ISO standard.
export const USD_ADDRESS = '0x0000000000000000000000000000000000000348';
export const TRADE_SLIPPAGE_DENOMINATOR = 100000n;
export const simulationUrls = {
    [ChainIds.Base]: 'https://resbasesimulator.mig2151.workers.dev',
    [ChainIds.Arbitrum]: 'https://arbisimulator.mig2151.workers.dev/',
    [ChainIds.Mainnet]: 'https://worker-frosty-pine-5440.mig2151.workers.dev',
};
export const CHAINLINK = {
    ETH: Address.from(GAS_TOKEN_ADDRESS),
    BTC: Address.from(CHAINLINK_BTC_TOKEN_ADDRESS),
    USD: Address.from(USD_ADDRESS),
};
//# sourceMappingURL=constants.js.map