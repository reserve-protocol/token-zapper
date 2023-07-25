import { Address } from '../base/Address';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { ethers } from 'ethers';
import curve from '@curvefi/api';
import { curve as curveInner } from '@curvefi/api/lib/curve';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { LPToken } from './LPToken';
import { DefaultMap, parseHexStringIntoBuffer } from '../base';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
const instantiatedCurvePools = {};
const getCurvePool = (name) => {
    if (instantiatedCurvePools[name] == null)
        instantiatedCurvePools[name] = curve.getPool(name);
    return instantiatedCurvePools[name];
};
class CurvePool {
    address;
    tokens;
    underlyingTokens;
    meta;
    templateName;
    [Symbol.toStringTag] = 'CurvePool';
    constructor(address, tokens, underlyingTokens, meta, templateName) {
        this.address = address;
        this.tokens = tokens;
        this.underlyingTokens = underlyingTokens;
        this.meta = meta;
        this.templateName = templateName;
    }
    toString() {
        let out = `CurvePool(name=${this.meta.name},tokens=${this.tokens.join(', ')}`;
        if (this.underlyingTokens.length > 0) {
            out += `,underlying=${this.underlyingTokens.join(', ')}`;
        }
        return out + ')';
    }
}
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
    _route = _route.concat(Array(9 - _route.length).fill(ethers.constants.AddressZero));
    _swapParams = _swapParams.concat(Array(4 - _swapParams.length).fill([0, 0, 0]));
    _factorySwapAddresses = _factorySwapAddresses.concat(Array(4 - _factorySwapAddresses.length).fill(ethers.constants.AddressZero));
    return { _route, _swapParams, _factorySwapAddresses };
};
export class CurveSwap extends Action {
    pool;
    tokenIn;
    tokenOut;
    predefinedRoutes;
    estimate;
    gasEstimate() {
        return BigInt(250000n);
    }
    async encode([amountsIn]) {
        const output = await this._quote(amountsIn);
        const minOut = this.output[0].fromScale18BN(parseUnits(output.output, 18));
        const contract = curveInner.contracts[curveInner.constants.ALIASES.registry_exchange]
            .contract;
        let value = 0n;
        if (amountsIn.token.address.address === GAS_TOKEN_ADDRESS) {
            value = amountsIn.amount;
        }
        const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(output.route);
        const data = contract.interface.encodeFunctionData('exchange_multiple', [
            _route,
            _swapParams,
            amountsIn.amount,
            minOut.amount,
            _factorySwapAddresses,
        ]);
        const exchangeAddress = Address.from(curveInner.constants.ALIASES.registry_exchange);
        return new ContractCall(parseHexStringIntoBuffer(data), exchangeAddress, value, this.gasEstimate(), `Swap ${amountsIn} for at least ${minOut} on Curve}`);
    }
    async _quote(amountsIn) {
        const key = (this.input[0].address +
            '.' +
            this.output[0].address).toLowerCase();
        const contract = curveInner.contracts[curveInner.constants.ALIASES.registry_exchange]
            .contract;
        if (key in this.predefinedRoutes) {
            const route = await this.predefinedRoutes[key];
            const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(route);
            const [out, gasEstimate] = await Promise.all([
                contract.get_exchange_multiple_amount(_route, _swapParams, amountsIn.amount, _factorySwapAddresses, curveInner.constantOptions),
                contract.estimateGas.get_exchange_multiple_amount(_route, _swapParams, amountsIn.amount, _factorySwapAddresses, curveInner.constantOptions),
            ]);
            this.estimate = gasEstimate.toBigInt();
            const output = formatUnits(out.sub(out.div(1000n)), this.output[0].decimals);
            return {
                output,
                route,
            };
        }
        const task = (async () => {
            try {
                const out = await curve.router.getBestRouteAndOutput(amountsIn.token.address.address, this.output[0].address.address, amountsIn.format());
                const { _route, _swapParams, _factorySwapAddresses } = _getExchangeMultipleArgs(out.route);
                const gasEstimate = await contract.estimateGas.get_exchange_multiple_amount(_route, _swapParams, amountsIn.amount, _factorySwapAddresses, curveInner.constantOptions);
                this.estimate = gasEstimate.toBigInt();
                const outParsed = parseUnits(out.output, 18);
                out.output = formatUnits(outParsed.sub(outParsed.div(1000n)), this.output[0].decimals);
                return out;
            }
            catch (e) {
                throw e;
            }
        })();
        this.predefinedRoutes[key] = task.then((out) => out.route);
        return await task;
    }
    async quote([amountsIn]) {
        const out = (await this._quote(amountsIn)).output;
        return [this.output[0].fromScale18BN(parseUnits(out, 18))];
    }
    constructor(pool, tokenIn, tokenOut, predefinedRoutes) {
        super(pool.address, [tokenIn], [tokenOut], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(tokenIn, Address.from(curveInner.constants.ALIASES.registry_exchange)),
        ]);
        this.pool = pool;
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
        this.predefinedRoutes = predefinedRoutes;
    }
    toString() {
        return `Curve(${this.tokenIn}.${this.pool.meta.name}.${this.tokenOut})`;
    }
}
export const loadCurve = async (universe, predefinedRoutes_) => {
    const predefinedRoutes = Object.fromEntries(Object.entries(predefinedRoutes_).map(([key, route]) => [
        key,
        Promise.resolve(route),
    ]));
    const curvesEdges = new DefaultMap(() => new Map());
    const fakeRouterTemplate = {
        address: Address.from('0x99a58482bd75cbab83b27ec03ca68ff489b5788f'),
        name: 'curve-router',
    };
    const router = new CurvePool(Address.from(fakeRouterTemplate.address), [], [], fakeRouterTemplate, 'router');
    const defineCurveEdge = (pool, tokenIn, tokenOut) => {
        const edges = curvesEdges.get(tokenIn);
        if (edges.has(tokenOut)) {
            return edges.get(tokenOut);
        }
        const swap = new CurveSwap(pool, tokenIn, tokenOut, predefinedRoutes);
        edges.set(tokenOut, swap);
        universe.addAction(swap);
        return swap;
    };
    const loadCurvePools = async (universe) => {
        const p = universe.provider;
        // const batcher = new ethers.providers.JsonRpcBatchProvider(p.connection.url)
        await curve.init('Web3', {
            externalProvider: {
                request: async (req) => {
                    if (req.method === 'eth_chainId') {
                        return '0x' + universe.chainId.toString(16);
                    }
                    if (req.method === 'eth_gasPrice') {
                        return '0x' + universe.gasPrice.toString(16);
                    }
                    const resp = await p.send(req.method, req.params);
                    return resp;
                },
            },
        }); // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically
        await Promise.all([
            curve.cryptoFactory.fetchPools(true),
            curve.factory.fetchPools(true),
        ]);
        const poolNames = curve
            .getPoolList()
            .filter((i) => !i.startsWith('factory-'))
            .concat(['factory-v2-147', 'factory-v2-277']);
        const poolsUnfiltered = poolNames.map((name) => {
            const pool = getCurvePool(name);
            return {
                name,
                pool,
                poolAddress: Address.from(pool.address),
                underlyingCoinAddresses: pool.underlyingCoinAddresses.map(Address.from),
                wrappedCoinAddresses: pool.wrappedCoinAddresses.map(Address.from),
            };
        });
        const pools = poolsUnfiltered.filter(({ pool }) => pool.underlyingDecimals.every((i) => i !== 0) &&
            pool.wrappedDecimals.every((i) => i !== 0));
        const tokenAddresses = [
            ...new Set(pools
                .map(({ pool }) => pool.wrappedCoinAddresses
                .concat(pool.underlyingCoinAddresses)
                .map((a) => Address.from(a)))
                .flat()),
        ];
        const badTokens = new Set();
        await Promise.all(tokenAddresses.map(async (address) => universe.getToken(address).catch((e) => {
            badTokens.add(address.address.toString());
        })));
        const curvePools = await Promise.all(pools
            .filter(({ pool }) => {
            for (const addr of pool.wrappedCoinAddresses) {
                if (!universe.tokens.has(Address.from(addr))) {
                    return false;
                }
            }
            for (const addr of pool.underlyingCoinAddresses) {
                if (!universe.tokens.has(Address.from(addr))) {
                    return false;
                }
            }
            return true;
        })
            .map(async ({ name, pool }) => {
            const tokens = pool.wrappedCoinAddresses.map((a) => universe.tokens.get(Address.from(a)));
            const underlying = pool.underlyingCoinAddresses.map((a) => universe.tokens.get(Address.from(a)));
            return new CurvePool(Address.from(pool.address), tokens, underlying, pool, name);
        }));
        return curvePools;
    };
    const addLpToken = async (universe, pool) => {
        const tokensInPosition = pool.meta.wrappedCoinAddresses.map((a) => universe.tokens.get(Address.from(a)));
        const lpToken = await universe.getToken(Address.from(pool.meta.lpToken));
        if (universe.lpTokens.has(lpToken)) {
            return;
        }
        const burn = async (qty) => {
            try {
                const out = await (pool.meta.isPlain
                    ? pool.meta.withdrawExpected(formatUnits(qty.amount, 18))
                    : pool.meta.withdrawWrappedExpected(formatUnits(qty.amount, 18)));
                return out.map((amount, i) => tokensInPosition[i].from(amount));
            }
            catch (e) {
                console.log(pool.meta);
                throw e;
            }
        };
        const mint = async (poolTokens) => {
            const out = await pool.meta.depositWrappedExpected(poolTokens.map((q) => formatUnits(q.amount, 18)));
            return lpToken.from(out);
        };
        const lpTokenInstance = new LPToken(lpToken, tokensInPosition, burn, mint);
        universe.defineLPToken(lpTokenInstance);
        // const gaugeToken = await universe.getToken(Address.from(pool.meta.token))
        // universe.lpTokens.set(gaugeToken, lpTokenInstance)
    };
    const addCurvePoolEdges = async (universe, pools) => {
        for (const pool of pools) {
            let missingTok = false;
            for (const token of pool.tokens) {
                if (!universe.tokens.has(token.address)) {
                    missingTok = true;
                    break;
                }
            }
            for (const token of pool.underlyingTokens) {
                if (!universe.tokens.has(token.address)) {
                    missingTok = true;
                    break;
                }
            }
            await addLpToken(universe, pool);
            if (missingTok) {
                continue;
            }
            if (pool.templateName.startsWith('factory-')) {
                continue;
            }
            for (let aTokenIdx = 0; aTokenIdx < pool.tokens.length; aTokenIdx++) {
                for (let bTokenIdx = aTokenIdx + 1; bTokenIdx < pool.tokens.length; bTokenIdx++) {
                    const aToken = pool.tokens[aTokenIdx];
                    const bToken = pool.tokens[bTokenIdx];
                    if (aToken === universe.nativeToken ||
                        bToken === universe.nativeToken) {
                        continue;
                    }
                    defineCurveEdge(pool, aToken, bToken);
                    defineCurveEdge(pool, bToken, aToken);
                }
            }
            for (let aTokenIdx = 0; aTokenIdx < pool.underlyingTokens.length; aTokenIdx++) {
                for (let bTokenIdx = aTokenIdx + 1; bTokenIdx < pool.underlyingTokens.length; bTokenIdx++) {
                    const aToken = pool.underlyingTokens[aTokenIdx];
                    const bToken = pool.underlyingTokens[bTokenIdx];
                    if (aToken === universe.nativeToken ||
                        bToken === universe.nativeToken) {
                        continue;
                    }
                    defineCurveEdge(pool, aToken, bToken);
                    defineCurveEdge(pool, bToken, aToken);
                }
            }
        }
    };
    const pools = await loadCurvePools(universe);
    await addCurvePoolEdges(universe, pools);
    return {
        createLpToken: async (token) => {
            const pool = pools.find((pool) => pool.address === token.address);
            if (!pool) {
                throw new Error('No curve pool found for token ' + token);
            }
            await addLpToken(universe, pool);
        },
        createRouterEdge: (tokenA, tokenB) => {
            return defineCurveEdge(router, tokenA, tokenB);
        },
    };
};
//# sourceMappingURL=Curve.js.map