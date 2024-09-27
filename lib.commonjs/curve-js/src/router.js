"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestRouteAndOutput = void 0;
const tslib_1 = require("tslib");
const memoizee_1 = tslib_1.__importDefault(require("memoizee"));
const curve_1 = require("./curve");
const utils_1 = require("./utils");
const pools_1 = require("./pools");
const utils_2 = require("./pools/utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const getNewRoute = (routeTvl, poolId, poolAddress, inputCoinAddress, outputCoinAddress, i, j, swapType, swapAddress, tvl) => {
    const routePoolIds = routeTvl.route.map((s) => s.poolId);
    // Steps <= 4
    if (routePoolIds.length >= 4)
        return { route: [], minTvl: Infinity, totalTvl: 0 };
    // Exclude such cases as cvxeth -> tricrypto2 -> tricrypto2 -> susd
    if (routePoolIds.includes(poolId))
        return { route: [], minTvl: Infinity, totalTvl: 0 };
    return {
        route: [...routeTvl.route, { poolId, poolAddress, inputCoinAddress, outputCoinAddress, i, j, swapType, swapAddress }],
        minTvl: Math.min(tvl, routeTvl.minTvl),
        totalTvl: routeTvl.totalTvl + tvl,
    };
};
const MAX_ROUTES_FOR_ONE_COIN = 3;
const filterRoutes = (routes, inputCoinAddress, sortFn) => {
    return routes
        .filter((r) => r.route.length > 0)
        .filter((r) => r.route[0].inputCoinAddress === inputCoinAddress) // Truncated routes
        .filter((r, i, _routes) => {
        const routesByPoolIds = _routes.map((r) => r.route.map((s) => s.poolId).toString());
        return routesByPoolIds.indexOf(r.route.map((s) => s.poolId).toString()) === i;
    }) // Route duplications
        .sort(sortFn).slice(0, MAX_ROUTES_FOR_ONE_COIN);
};
const sortByTvl = (a, b) => b.minTvl - a.minTvl || b.totalTvl - a.totalTvl || a.route.length - b.route.length;
const sortByLength = (a, b) => a.route.length - b.route.length || b.minTvl - a.minTvl || b.totalTvl - a.totalTvl;
// Inspired by Dijkstra's algorithm
const _findAllRoutes = async (inputCoinAddress, outputCoinAddress) => {
    inputCoinAddress = inputCoinAddress.toLowerCase();
    outputCoinAddress = outputCoinAddress.toLowerCase();
    const ALL_POOLS = Object.entries({
        ...curve_1.curve.constants.POOLS_DATA,
        ...curve_1.curve.constants.FACTORY_POOLS_DATA,
        ...curve_1.curve.constants.CRYPTO_FACTORY_POOLS_DATA,
    });
    const amplificationCoefficientDict = await (0, utils_2._getAmplificationCoefficientsFromApi)();
    // Coins we are searching routes for on the current step
    let curCoins = [inputCoinAddress];
    // Coins we will search routes for on the next step
    let nextCoins = new Set();
    // Routes for all coins found
    const routesByTvl = {
        [inputCoinAddress]: [{ route: [], minTvl: Infinity, totalTvl: 0 }],
    };
    const routesByLength = {
        [inputCoinAddress]: [{ route: [], minTvl: Infinity, totalTvl: 0 }],
    };
    // No more than 4 steps (swaps)
    for (let step = 0; step < 4; step++) {
        for (const inCoin of curCoins) {
            for (const [poolId, poolData] of ALL_POOLS) {
                const wrapped_coin_addresses = poolData.wrapped_coin_addresses.map((a) => a.toLowerCase());
                const underlying_coin_addresses = poolData.underlying_coin_addresses.map((a) => a.toLowerCase());
                const base_pool = poolData.is_meta ? curve_1.curve.constants.POOLS_DATA[poolData.base_pool] : null;
                const meta_coin_addresses = base_pool ? base_pool.underlying_coin_addresses.map((a) => a.toLowerCase()) : [];
                const token_address = poolData.token_address.toLowerCase();
                const is_aave_like_lending = poolData.is_lending && wrapped_coin_addresses.length === 3 && !poolData.deposit_address;
                const tvlMultiplier = poolData.is_crypto ? 1 : (amplificationCoefficientDict[poolData.swap_address] ?? 1);
                const inCoinIndexes = {
                    wrapped_coin: wrapped_coin_addresses.indexOf(inCoin),
                    underlying_coin: underlying_coin_addresses.indexOf(inCoin),
                    meta_coin: meta_coin_addresses ? meta_coin_addresses.indexOf(inCoin) : -1,
                };
                // Skip pools which don't contain inCoin
                if (inCoinIndexes.wrapped_coin === -1 && inCoinIndexes.underlying_coin === -1 && inCoinIndexes.meta_coin === -1 && inCoin !== token_address)
                    continue;
                const tvl = Number(await ((0, pools_1.getPool)(poolId)).statsTotalLiquidity()) * tvlMultiplier;
                // Skip empty pools
                if (tvl === 0)
                    continue;
                let poolAddress = poolData.is_fake ? poolData.deposit_address : poolData.swap_address;
                const coin_addresses = (is_aave_like_lending || poolData.is_fake) ? underlying_coin_addresses : wrapped_coin_addresses;
                // LP -> wrapped coin (underlying for lending or fake pool) "swaps" (actually remove_liquidity_one_coin)
                if (coin_addresses.length < 6 && inCoin === token_address) {
                    for (let j = 0; j < coin_addresses.length; j++) {
                        // Looking for outputCoinAddress only on the final step
                        if (step === 3 && coin_addresses[j] !== outputCoinAddress)
                            continue;
                        // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
                        const outputCoinIdx = coin_addresses.indexOf(outputCoinAddress);
                        if (outputCoinIdx >= 0 && j !== outputCoinIdx)
                            continue;
                        const swapType = poolData.is_crypto ? 14 : is_aave_like_lending ? 13 : 12;
                        const newRoutesByTvl = routesByTvl[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, coin_addresses[j], 0, j, swapType, constants_1.AddressZero, tvl));
                        const newRoutesByLength = routesByLength[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, coin_addresses[j], 0, j, swapType, constants_1.AddressZero, tvl));
                        routesByTvl[coin_addresses[j]] = [...(routesByTvl[coin_addresses[j]] ?? []), ...newRoutesByTvl];
                        routesByTvl[coin_addresses[j]] = filterRoutes(routesByTvl[coin_addresses[j]], inputCoinAddress, sortByTvl);
                        routesByLength[coin_addresses[j]] = [...(routesByLength[coin_addresses[j]] ?? []), ...newRoutesByLength];
                        routesByLength[coin_addresses[j]] = filterRoutes(routesByLength[coin_addresses[j]], inputCoinAddress, sortByLength);
                        nextCoins.add(coin_addresses[j]);
                    }
                }
                // Wrapped coin (underlying for lending or fake pool) -> LP "swaps" (actually add_liquidity)
                const inCoinIndex = (is_aave_like_lending || poolData.is_fake) ? inCoinIndexes.underlying_coin : inCoinIndexes.wrapped_coin;
                if (coin_addresses.length < 6 && inCoinIndex >= 0) {
                    // Looking for outputCoinAddress only on the final step
                    if (!(step === 3 && token_address !== outputCoinAddress)) {
                        const swapType = is_aave_like_lending ? 9
                            : coin_addresses.length === 2 ? 7
                                : coin_addresses.length === 3 ? 8
                                    : coin_addresses.length === 4 ? 10 : 11;
                        const newRoutesByTvl = routesByTvl[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, token_address, coin_addresses.indexOf(inCoin), 0, swapType, constants_1.AddressZero, tvl));
                        const newRoutesByLength = routesByLength[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, token_address, coin_addresses.indexOf(inCoin), 0, swapType, constants_1.AddressZero, tvl));
                        routesByTvl[token_address] = [...(routesByTvl[token_address] ?? []), ...newRoutesByTvl];
                        routesByTvl[token_address] = filterRoutes(routesByTvl[token_address], inputCoinAddress, sortByTvl);
                        routesByLength[token_address] = [...(routesByLength[token_address] ?? []), ...newRoutesByLength];
                        routesByLength[token_address] = filterRoutes(routesByLength[token_address], inputCoinAddress, sortByLength);
                        nextCoins.add(token_address);
                    }
                }
                // Wrapped swaps
                if (inCoinIndexes.wrapped_coin >= 0 && !poolData.is_fake) {
                    for (let j = 0; j < wrapped_coin_addresses.length; j++) {
                        if (j === inCoinIndexes.wrapped_coin)
                            continue;
                        // Native swaps spend less gas
                        // TODO uncomment
                        // if (wrapped_coin_addresses[j] !== outputCoinAddress && wrapped_coin_addresses[j] === curve.constants.NATIVE_TOKEN.wrappedAddress) continue;
                        // Looking for outputCoinAddress only on the final step
                        if (step === 3 && wrapped_coin_addresses[j] !== outputCoinAddress)
                            continue;
                        // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
                        const outputCoinIdx = wrapped_coin_addresses.indexOf(outputCoinAddress);
                        if (outputCoinIdx >= 0 && j !== outputCoinIdx)
                            continue;
                        const swapType = poolData.is_crypto ? 3 : 1;
                        const newRoutesByTvl = routesByTvl[inCoin].map((route) => getNewRoute(route, poolId, poolData.swap_address, inCoin, wrapped_coin_addresses[j], inCoinIndexes.wrapped_coin, j, swapType, constants_1.AddressZero, tvl));
                        const newRoutesByLength = routesByLength[inCoin].map((route) => getNewRoute(route, poolId, poolData.swap_address, inCoin, wrapped_coin_addresses[j], inCoinIndexes.wrapped_coin, j, swapType, constants_1.AddressZero, tvl));
                        routesByTvl[wrapped_coin_addresses[j]] = [...(routesByTvl[wrapped_coin_addresses[j]] ?? []), ...newRoutesByTvl];
                        routesByTvl[wrapped_coin_addresses[j]] = filterRoutes(routesByTvl[wrapped_coin_addresses[j]], inputCoinAddress, sortByTvl);
                        routesByLength[wrapped_coin_addresses[j]] = [...(routesByLength[wrapped_coin_addresses[j]] ?? []), ...newRoutesByLength];
                        routesByLength[wrapped_coin_addresses[j]] = filterRoutes(routesByLength[wrapped_coin_addresses[j]], inputCoinAddress, sortByLength);
                        nextCoins.add(wrapped_coin_addresses[j]);
                    }
                }
                // Only for underlying swaps
                poolAddress = (poolData.is_crypto && poolData.is_meta) || (base_pool?.is_lending && poolData.is_factory) ?
                    poolData.deposit_address : poolData.swap_address;
                // Underlying swaps
                if (!poolData.is_plain && inCoinIndexes.underlying_coin >= 0) {
                    for (let j = 0; j < underlying_coin_addresses.length; j++) {
                        if (j === inCoinIndexes.underlying_coin)
                            continue;
                        // Don't swap metacoins since they can be swapped directly in base pool
                        if (inCoinIndexes.meta_coin >= 0 && meta_coin_addresses.includes(underlying_coin_addresses[j]))
                            continue;
                        // Looking for outputCoinAddress only on the final step
                        if (step === 3 && underlying_coin_addresses[j] !== outputCoinAddress)
                            continue;
                        // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
                        const outputCoinIdx = underlying_coin_addresses.indexOf(outputCoinAddress);
                        if (outputCoinIdx >= 0 && j !== outputCoinIdx)
                            continue;
                        // Skip empty pools
                        const tvl = Number(await ((0, pools_1.getPool)(poolId)).statsTotalLiquidity());
                        if (tvl === 0)
                            continue;
                        const hasEth = (inCoin === curve_1.curve.constants.NATIVE_TOKEN.address || underlying_coin_addresses[j] === curve_1.curve.constants.NATIVE_TOKEN.address);
                        const swapType = (poolData.is_crypto && poolData.is_meta && poolData.is_factory) ? 6
                            : (base_pool?.is_lending && poolData.is_factory) ? 5
                                : hasEth && poolId !== 'avaxcrypto' ? 3
                                    : poolData.is_crypto ? 4
                                        : 2;
                        const newRoutesByTvl = routesByTvl[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, underlying_coin_addresses[j], inCoinIndexes.underlying_coin, j, swapType, (swapType === 5 || swapType === 6) ? poolData.swap_address : constants_1.AddressZero, tvl));
                        const newRoutesByLength = routesByLength[inCoin].map((route) => getNewRoute(route, poolId, poolAddress, inCoin, underlying_coin_addresses[j], inCoinIndexes.underlying_coin, j, swapType, (swapType === 5 || swapType === 6) ? poolData.swap_address : constants_1.AddressZero, tvl));
                        routesByTvl[underlying_coin_addresses[j]] = [...(routesByTvl[underlying_coin_addresses[j]] ?? []), ...newRoutesByTvl];
                        routesByTvl[underlying_coin_addresses[j]] = filterRoutes(routesByTvl[underlying_coin_addresses[j]], inputCoinAddress, sortByTvl);
                        routesByLength[underlying_coin_addresses[j]] = [...(routesByLength[underlying_coin_addresses[j]] ?? []), ...newRoutesByLength];
                        routesByLength[underlying_coin_addresses[j]] = filterRoutes(routesByLength[underlying_coin_addresses[j]], inputCoinAddress, sortByLength);
                        nextCoins.add(underlying_coin_addresses[j]);
                    }
                }
            }
        }
        curCoins = Array.from(nextCoins);
        nextCoins = new Set();
    }
    const routes = [...(routesByTvl[outputCoinAddress] ?? []), ...(routesByLength[outputCoinAddress] ?? [])];
    return routes.map((r) => r.route);
};
const _getRouteKey = (route, inputCoinAddress, outputCoinAddress) => {
    const sortedCoins = [inputCoinAddress, outputCoinAddress].sort();
    let key = `${sortedCoins[0]}-->`;
    for (const routeStep of route) {
        key += `${routeStep.poolId}-->`;
    }
    key += sortedCoins[1];
    return key;
};
const _getExchangeMultipleArgs = (route) => {
    let _route = [];
    if (route.length > 0)
        _route.push(route[0].inputCoinAddress);
    let _swapParams = [];
    let _factorySwapAddresses = [];
    for (const routeStep of route) {
        _route.push(routeStep.poolAddress, routeStep.outputCoinAddress);
        _swapParams.push([routeStep.i, routeStep.j, routeStep.swapType]);
        _factorySwapAddresses.push(routeStep.swapAddress);
    }
    _route = _route.concat(Array(9 - _route.length).fill(constants_1.AddressZero));
    _swapParams = _swapParams.concat(Array(4 - _swapParams.length).fill([0, 0, 0]));
    _factorySwapAddresses = _factorySwapAddresses.concat(Array(4 - _factorySwapAddresses.length).fill(constants_1.AddressZero));
    return { _route, _swapParams, _factorySwapAddresses };
};
const _estimatedGasForDifferentRoutesCache = {};
const _estimateGasForDifferentRoutes = async (routes, inputCoinAddress, outputCoinAddress, _amount) => {
    inputCoinAddress = inputCoinAddress.toLowerCase();
    outputCoinAddress = outputCoinAddress.toLowerCase();
    const contract = curve_1.curve.contracts[curve_1.curve.constants.ALIASES.registry_exchange].contract;
    const gasPromises = [];
    const value = (0, utils_1.isEth)(inputCoinAddress) ? _amount : bignumber_1.BigNumber.from(0);
    for (const route of routes) {
        const routeKey = _getRouteKey(route, inputCoinAddress, outputCoinAddress);
        let gasPromise;
        const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(route);
        if ((_estimatedGasForDifferentRoutesCache[routeKey]?.time || 0) + 3600000 < Date.now()) {
            gasPromise = contract.estimateGas.exchange_multiple(_route, _swapParams, _amount, 0, _factorySwapAddresses, { ...curve_1.curve.constantOptions, value });
        }
        else {
            gasPromise = Promise.resolve(_estimatedGasForDifferentRoutesCache[routeKey].gas);
        }
        gasPromises.push(gasPromise);
    }
    try {
        const _gasAmounts = await Promise.all(gasPromises);
        routes.forEach((route, i) => {
            const routeKey = _getRouteKey(route, inputCoinAddress, outputCoinAddress);
            _estimatedGasForDifferentRoutesCache[routeKey] = { 'gas': _gasAmounts[i], 'time': Date.now() };
        });
        return _gasAmounts.map((_g) => Number((0, units_1.formatUnits)(_g, 0)));
    }
    catch (err) { // No allowance
        return routes.map(() => 0);
    }
};
const _getBestRoute = (0, memoizee_1.default)(async (inputCoinAddress, outputCoinAddress, amount) => {
    const [inputCoinDecimals, outputCoinDecimals] = (0, utils_1._getCoinDecimals)(inputCoinAddress, outputCoinAddress);
    const _amount = (0, utils_1.parseUnits)(amount, inputCoinDecimals);
    if (_amount.eq(0))
        return [];
    const routesRaw = (await _findAllRoutes(inputCoinAddress, outputCoinAddress)).map((route) => ({ route, _output: bignumber_1.BigNumber.from(0), outputUsd: 0, txCostUsd: 0 }));
    const routes = [];
    try {
        const calls = [];
        const multicallContract = curve_1.curve.contracts[curve_1.curve.constants.ALIASES.registry_exchange].multicallContract;
        for (const r of routesRaw) {
            const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(r.route);
            calls.push(multicallContract.get_exchange_multiple_amount(_route, _swapParams, _amount, _factorySwapAddresses));
        }
        const _outputAmounts = await curve_1.curve.multicallProvider.all(calls);
        for (let i = 0; i < _outputAmounts.length; i++) {
            routesRaw[i]._output = _outputAmounts[i];
            routes.push(routesRaw[i]);
        }
    }
    catch (err) {
        const promises = [];
        const contract = curve_1.curve.contracts[curve_1.curve.constants.ALIASES.registry_exchange].contract;
        for (const r of routesRaw) {
            const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(r.route);
            const p = contract.get_exchange_multiple_amount(_route, _swapParams, _amount, _factorySwapAddresses, curve_1.curve.constantOptions);
            promises.push(p.then(pp => ({ route: r, output: pp })));
        }
        const res = await Promise.allSettled(promises);
        for (const p of res) {
            if (p.status === 'rejected') {
                continue;
            }
            p.value.route._output = p.value.output;
            routes.push(p.value.route);
        }
    }
    if (routes.length === 0)
        return [];
    if (routes.length === 1)
        return routes[0].route;
    const [gasAmounts, outputCoinUsdRate, gasData, ethUsdRate] = await Promise.all([
        _estimateGasForDifferentRoutes(routes.map((r) => r.route), inputCoinAddress, outputCoinAddress, _amount),
        (0, utils_1._getUsdRate)(outputCoinAddress),
        await (await fetch("https://api.curve.fi/api/getGas")).json(),
        (0, utils_1._getUsdRate)(utils_1.ETH_ADDRESS),
    ]);
    const gasPrice = gasData.data.gas.standard;
    const expectedAmounts = (routes).map((route) => Number((0, units_1.formatUnits)(route._output, outputCoinDecimals)));
    const expectedAmountsUsd = expectedAmounts.map((a) => a * outputCoinUsdRate);
    const txCostsUsd = gasAmounts.map((a) => ethUsdRate * a * gasPrice / 1e18);
    routes.forEach((route, i) => {
        route.outputUsd = expectedAmountsUsd[i];
        route.txCostUsd = txCostsUsd[i];
    });
    return routes.reduce((route1, route2) => {
        const diff = (route1.outputUsd - route1.txCostUsd) - (route2.outputUsd - route2.txCostUsd);
        if (diff > 0)
            return route1;
        if (diff === 0 && route1.route.length < route2.route.length)
            return route1;
        return route2;
    }).route;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
const _getOutputForRoute = (0, memoizee_1.default)(async (route, _amount) => {
    const contract = curve_1.curve.contracts[curve_1.curve.constants.ALIASES.registry_exchange].contract;
    const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(route);
    return await contract.get_exchange_multiple_amount(_route, _swapParams, _amount, _factorySwapAddresses, curve_1.curve.constantOptions);
}, {
    promise: true,
    maxAge: 15 * 1000, // 15s
});
const getBestRouteAndOutput = async (inputCoin, outputCoin, amount) => {
    const [inputCoinAddress, outputCoinAddress] = (0, utils_1._getCoinAddresses)(inputCoin, outputCoin);
    const [inputCoinDecimals, outputCoinDecimals] = (0, utils_1._getCoinDecimals)(inputCoinAddress, outputCoinAddress);
    const route = await _getBestRoute(inputCoinAddress, outputCoinAddress, amount); // 5 minutes cache
    if (route.length === 0)
        return { route, output: '0.0' };
    const _output = await _getOutputForRoute(route, (0, utils_1.parseUnits)(amount, inputCoinDecimals)); // 15 seconds cache, so we call it to get fresh output estimation
    return { route, output: (0, units_1.formatUnits)(_output, outputCoinDecimals) };
};
exports.getBestRouteAndOutput = getBestRouteAndOutput;
//# sourceMappingURL=router.js.map