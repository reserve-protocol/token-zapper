import curve, { getPool } from '../curve-js/src';
import { curve as curveInner } from '../curve-js/src/curve';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { DefaultMap } from '../base/DefaultMap';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
import { parseHexStringIntoBuffer } from "../base/utils";
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { LPToken } from './LPToken';
const whiteList = new Set([
    "0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56",
    "0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c",
    // "0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51", // y
    "0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27",
    "0xa5407eae9ba41422680e2e00537571bcc53efbfd",
    "0x06364f10b501e868329afbc005b3492902d6c763",
    // "0x93054188d876f558f4a66b2ef1d97d16edf0895b", // ren
    // "0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714", // sbtc
    // "0x4ca9b3063ec5866a4b82e437059d2c43d1be596f", // hbtc
    "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
    // "0x4f062658eaaf2c1ccf8c8e36d6824cdf41167956", // gusd
    // "0x3ef6a01a0f81d6046290f3e2a8c5b843e738e604", // husd
    // "0x3e01dd8a5e1fb3481f0f589056b428fc308af0fb", // usdk
    "0x0f9cb53ebe405d49a0bbdbd291a65ff571bc83e1",
    // "0x8474ddbe98f5aa3179b3b3f5942d724afcdec9f6", // musd
    "0xc18cc39da8b11da8c3541c598ee022258f9744da",
    // "0xc25099792e9349c7dd09759744ea681c7de2cb66", // tbtc
    "0x8038c01a0390a8c547446a0b2c18fc9aefecc10c",
    // "0x7f55dde206dbad629c080068923b36fe9d6bdbef", // pbtc
    // "0x071c661b4deefb59e2a3ddb20db036821eee8f4b", // bbtc
    // "0xd81da8d904b52208541bade1bd6595d8a251f8dd", // obtc
    "0xc5424b857f758e906013f3555dad202e4bdb4567",
    // "0x0ce6a5ff5217e38315f87032cf90686c96627caa", // eurs
    "0x890f4e345b1daed0367a877a1612f86a1f86985f",
    // "0xdebf20617708857ebe4f679508e7b7863a8a8eee", // aave
    "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
    // "0xeb16ae0052ed37f479f7fe63849198df1765a733", // saave
    "0xa96a65c051bf88b4095ee1f2451c2a9d43f53ae2",
    "0x42d7025938bec20b69cbae5a77421082407f053a",
    "0x2dded6da1bf5dbdf597c45fcfaa3194e53ecfeaf",
    // "0xf178c0b5bb7e7abf4e12a4838c7b7c5ba2c623c0", // link
    "0xecd5e75afb02efa118af914515d6521aabd189f1",
    "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
    "0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca",
    "0x4807862aa8b2bf68830e4c8dc86d0e9a998e085a",
    "0xf9440930043eb3997fc70e1339dbb11f341de7a8",
    // "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c", // alusd
    "0x5a6a4d54456819380173272a5e8e9b9904bdf41b",
    // "0xd51a44d3fae010294c616388b506acda1bfaae46", // tricrypto2
    // "0xfd5db7463a3ab53fd211b4af195c5bccc1a03890", // eurt
    // "0x9838eccc42659fa8aa7daf2ad134b53984c9427b", // eurtusd
    // "0x98a7f18d4e56cfe84e3d081b40001b3d5bd3eb8b", // eursusd
    // "0x8301ae4fc9c624d1d396cbdaa1ed877821d7c511", // crveth
    "0x618788357d0ebd8a37e763adab3bc575d54c2c7d",
    // "0xb576491f1e6e5e62f1d8f26062ee822b40b0e0d4", // cvxeth
    // "0xadcfcf9894335dc340f6cd182afa45999f45fc44", // xautusd
    // "0x98638facf9a3865cd033f36548713183f6996122", // spelleth
    // "0x752ebeb79963cf0732e9c0fec72a49fd1defaeac", // teth
    // "0x1005f7406f32a61bd760cfa14accd2737913d546", // 2pool
    // "0x4e0915c88bc70750d68c481540f081fefaf22273", // 4pool
    "0xdcef968d416a41cdac0ed8702fac8128a64241a2",
    // "0xe84f5b1582ba325fdf9ce6b0c1f087ccfc924e54", // euroc
    "0xa1f8a6807c402e4a15ef4eba36528a3fed24e577",
    // "0xf253f83aca21aabd2a20553ae0bf7f65c755a07f", // sbtc2
    "0xae34574ac03a15cd58a92dc79de7b1a0800f1ce3",
    "0xb30da2376f63de30b42dc055c93fa474f31330a5",
    "0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f",
].map(i => i.toLowerCase()));
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
        return this.estimate ?? 205000n;
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
                const outParsed = parseUnits(parseFloat(out.output).toFixed(this.output[0].decimals), this.output[0].decimals);
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
        // const batcher = new ethers.providers.JsonRpcBatchProvider(p.connection.url)
        await curve.init(universe.provider, () => ({
            gasPrice: universe.gasPrice,
            maxFeePerGas: (universe.gasPrice + universe.gasPrice / 10n),
        }), {
            whitelist: whiteList
        }); // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically
        await Promise.all([
            curve.fetchFactoryPools(true),
            curve.fetchCryptoFactoryPools(true),
        ]);
        const poolsUnfiltered = [...curve.getPoolList(), ...curve.getCryptoFactoryPoolList(), ...curve.getFactoryPoolList()].map((id) => {
            const pool = getPool(id);
            return {
                name: pool.name,
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
        const gaugeToken = await universe.getToken(Address.from(pool.meta.lpToken));
        universe.lpTokens.set(gaugeToken, lpTokenInstance);
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
            // await addLpToken(universe, pool)
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
    const pools = (await loadCurvePools(universe)).filter(i => whiteList.has(i.address.address.toLowerCase()));
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