"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveSwap = exports.addCurvePoolEdges = exports.loadCurvePools = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const Action_1 = require("./Action");
const base_1 = require("../base");
const api_1 = tslib_1.__importDefault(require("@curvefi/api"));
class CurvePool {
    address;
    tokens;
    underlyingTokens;
    meta;
    [Symbol.toStringTag] = 'CurvePool';
    constructor(address, tokens, underlyingTokens, meta) {
        this.address = address;
        this.tokens = tokens;
        this.underlyingTokens = underlyingTokens;
        this.meta = meta;
    }
    toString() {
        let out = `CurvePool(name=${this.meta.name},tokens=${this.tokens.join(', ')}`;
        if (this.underlyingTokens.length > 0) {
            out += `,underlying=${this.underlyingTokens.join(', ')}`;
        }
        return out + ')';
    }
}
const loadCurvePools = async (universe) => {
    const p = universe.provider;
    await api_1.default.init('Web3', {
        externalProvider: {
            sendAsync: (request, callback) => {
                p.send(request.method, request.params ?? [])
                    .then((r) => callback(null, r))
                    .catch((e) => callback(e, null));
            },
            send: (request, callback) => {
                p.send(request.method, request.params ?? [])
                    .then((r) => callback(null, r))
                    .catch((e) => callback(e, null));
            },
            request: async (request) => {
                return await p.send(request.method, request.params ?? []);
            },
        },
    }, {
        chainId: universe.chainId,
    }); // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically
    await api_1.default.cryptoFactory.fetchPools(true);
    await api_1.default.factory.fetchPools(true);
    const poolNames = api_1.default
        .getPoolList()
        .concat(api_1.default.factory.getPoolList())
        .concat(api_1.default.cryptoFactory.getPoolList());
    const pools = poolNames
        .map((name) => {
        return api_1.default.getPool(name);
    })
        .filter((pool) => pool.underlyingDecimals.every((i) => i !== 0) &&
        pool.wrappedDecimals.every((i) => i !== 0));
    const tokenAddresses = [
        ...new Set(pools
            .map((pool) => pool.wrappedCoinAddresses
            .concat(pool.underlyingCoinAddresses)
            .map((a) => Address_1.Address.from(a)))
            .flat()),
    ];
    const badTokens = new Set();
    await Promise.all(tokenAddresses.map(async (address) => universe.getToken(address).catch((e) => {
        badTokens.add(address.address.toString());
    })));
    const curvePools = await Promise.all(pools
        .filter((pool) => {
        for (const addr of pool.wrappedCoinAddresses) {
            if (!universe.tokens.has(Address_1.Address.from(addr))) {
                return false;
            }
        }
        for (const addr of pool.underlyingCoinAddresses) {
            if (!universe.tokens.has(Address_1.Address.from(addr))) {
                return false;
            }
        }
        return true;
    })
        .map(async (pool) => {
        const tokens = pool.wrappedCoinAddresses.map((a) => universe.tokens.get(Address_1.Address.from(a)));
        const underlying = pool.underlyingCoinAddresses.map((a) => universe.tokens.get(Address_1.Address.from(a)));
        return new CurvePool(Address_1.Address.from(pool.address), tokens, underlying, pool);
    }));
    return curvePools;
};
exports.loadCurvePools = loadCurvePools;
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
        if (missingTok) {
            continue;
        }
        for (let aTokenIdx = 0; aTokenIdx < pool.tokens.length; aTokenIdx++) {
            for (let bTokenIdx = aTokenIdx + 1; bTokenIdx < pool.tokens.length; bTokenIdx++) {
                const edgeI_J = new CurveSwap(pool, aTokenIdx, pool.tokens[aTokenIdx], bTokenIdx, pool.tokens[bTokenIdx], false);
                const edgeJ_I = new CurveSwap(pool, bTokenIdx, pool.tokens[bTokenIdx], aTokenIdx, pool.tokens[aTokenIdx], false);
                universe.addAction(edgeI_J);
                universe.addAction(edgeJ_I);
            }
        }
        for (let aTokenIdx = 0; aTokenIdx < pool.underlyingTokens.length; aTokenIdx++) {
            for (let bTokenIdx = aTokenIdx + 1; bTokenIdx < pool.underlyingTokens.length; bTokenIdx++) {
                const edgeI_J = new CurveSwap(pool, aTokenIdx, pool.underlyingTokens[aTokenIdx], bTokenIdx, pool.underlyingTokens[bTokenIdx], true);
                const edgeJ_I = new CurveSwap(pool, bTokenIdx, pool.underlyingTokens[bTokenIdx], aTokenIdx, pool.underlyingTokens[aTokenIdx], true);
                universe.addAction(edgeI_J);
                universe.addAction(edgeJ_I);
            }
        }
    }
};
exports.addCurvePoolEdges = addCurvePoolEdges;
class CurveSwap extends Action_1.Action {
    pool;
    tokenInIdx;
    tokenOutIdx;
    exchangeUnderlying;
    gasEstimate() {
        return BigInt(250000n);
    }
    async encode([amountsIn], destination) {
        throw new Error('not implemented');
        // if (this.exchangeUnderlying) {
        //   curve.router.getBestRouteAndOutput
        //   await this.pool.meta.wallet.underlyingCoinBalances()
        //   const out = await this.pool.meta.swapExpected(
        //     this.tokenInIdx,
        //     this.tokenOutIdx,
        //     amountsIn.amount.toString()
        //   )
        //   throw new Error('not implemented')
        // } else {
        //   await this.pool.meta.wallet.wrappedCoinBalances()
        //   const out = await this.pool.meta.swapWrappedExpected(
        //     this.tokenInIdx,
        //     this.tokenOutIdx,
        //     amountsIn.amount.toString()
        //   )
        //   throw new Error('not implemented')
        // }
    }
    /**
     * @node V2Actions can quote in both directions!
     * @returns
     */
    async quote([amountsIn]) {
        try {
            if (this.exchangeUnderlying) {
                await this.pool.meta.wallet.underlyingCoinBalances();
                const out = await this.pool.meta.swapExpected(this.tokenInIdx, this.tokenOutIdx, amountsIn.format());
                return [this.output[0].from(out)];
            }
            else {
                await this.pool.meta.wallet.wrappedCoinBalances();
                const out = await this.pool.meta.swapWrappedExpected(this.tokenInIdx, this.tokenOutIdx, amountsIn.format());
                return [this.output[0].from(out)];
            }
        }
        catch (e) {
            return [this.output[0].zero];
        }
    }
    constructor(pool, tokenInIdx, tokenIn, tokenOutIdx, tokenOut, exchangeUnderlying) {
        super(pool.address, [tokenIn], [tokenOut], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [
            new base_1.Approval(!exchangeUnderlying
                ? pool.tokens[tokenInIdx]
                : pool.underlyingTokens[tokenInIdx], pool.address),
        ]);
        this.pool = pool;
        this.tokenInIdx = tokenInIdx;
        this.tokenOutIdx = tokenOutIdx;
        this.exchangeUnderlying = exchangeUnderlying;
    }
    toString() {
        return `Crv(${this.input[0]}.${this.pool.meta.name}.${this.output[0]})`;
    }
}
exports.CurveSwap = CurveSwap;
//# sourceMappingURL=Curve.js.map