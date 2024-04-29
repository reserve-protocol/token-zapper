"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationUrls = exports.USD_ADDRESS = exports.CHAINLINK_BTC_TOKEN_ADDRESS = exports.ZERO = exports.BTC_TOKEN_ADDRESS = exports.GAS_TOKEN_ADDRESS = exports.FEE_SCALE = void 0;
const ReserveAddresses_1 = require("../configuration/ReserveAddresses");
/**
 * Internally  we use Uniswap v3's fee scale.
 */
exports.FEE_SCALE = 1000000n;
exports.GAS_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
exports.BTC_TOKEN_ADDRESS = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
exports.ZERO = '0x0000000000000000000000000000000000000000';
exports.CHAINLINK_BTC_TOKEN_ADDRESS = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';
// It is a stand-in for USD. Address matches chainlink's designation. Which is based
// on some ISO standard.
exports.USD_ADDRESS = '0x0000000000000000000000000000000000000348';
exports.simulationUrls = {
    [ReserveAddresses_1.ChainIds.Base]: 'https://resbasesimulator.mig2151.workers.dev',
    [ReserveAddresses_1.ChainIds.Arbitrum]: 'https://arbisimulator.mig2151.workers.dev/',
    [ReserveAddresses_1.ChainIds.Mainnet]: 'https://worker-frosty-pine-5440.mig2151.workers.dev',
};
//# sourceMappingURL=constants.js.map