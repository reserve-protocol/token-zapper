"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAerodromeRouter = void 0;
const RouterAction_1 = require("../action/RouterAction");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const Address_1 = require("../base/Address");
const DefaultMap_1 = require("../base/DefaultMap");
const contracts_1 = require("../contracts");
const Action_1 = require("../action/Action");
const Approval_1 = require("../base/Approval");
const Swap_1 = require("../searcher/Swap");
const routers = {
    8453: {
        router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
        sugar: '0xc301856b4262e49e9239ec8a2d0c754d5ae317c0',
    },
};
class AerodromePathStep {
    step;
    input;
    output;
    constructor(step, input, output) {
        this.step = step;
        this.input = input;
        this.output = output;
    }
    get pool() {
        return this.step.pool;
    }
    toString() {
        return `${this.input} -> ${this.output}`;
    }
}
class AerodromePath {
    steps;
    constructor(steps) {
        this.steps = steps;
    }
    compare(other) {
        return this.output.compare(other.output);
    }
    static from(route, amts) {
        const steps = [];
        for (let i = 1; i < amts.length; i++) {
            const step = route[i - 1];
            const input = step.tokenIn.from(amts[i - 1]);
            const output = step.tokenOut.from(amts[i]);
            steps.push(new AerodromePathStep(step, input, output));
        }
        return new AerodromePath(steps);
    }
    get output() {
        return this.steps[this.steps.length - 1].output;
    }
    get input() {
        return this.steps[0].input;
    }
    toString() {
        return `${this.input} -> ${this.steps.map((s) => s.output).join(' -> ')}`;
    }
}
class AerodromeRouterSwap extends (0, Action_1.Action)('Aerodrome') {
    universe;
    path;
    router;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(contracts_1.IAerodromeRouter__factory.connect(this.router.address, this.universe.provider));
        planner.add(lib.swapExactTokensForTokens(inputs[0] ?? predicted[0].amount, this.path.output.amount, this.path.steps.map((step) => step.step.intoRouteStruct()), this.universe.execAddress.address, Date.now() + 1000 * 60 * 10), 'Aerodrome.swapExactTokensForTokens(' + this.path.toString() + ')');
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.path.output.token, this.universe.execAddress),
        ];
    }
    gasEstimate() {
        return BigInt(200000n) * BigInt(this.path.steps.length);
    }
    quote([]) {
        return Promise.resolve([this.path.output]);
    }
    constructor(universe, path, router) {
        super(universe.execAddress, [path.input.token], [path.output.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(path.input.token, Address_1.Address.from(router.address))]);
        this.universe = universe;
        this.path = path;
        this.router = router;
        if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
            throw new Error('RouterAction requires exactly one input and one output');
        }
    }
    toString() {
        return `AerodromeRouterSwap(${this.path.toString()})`;
    }
}
class AerodromePool {
    poolAddress;
    token0;
    token1;
    poolToken;
    fee;
    poolType;
    factory;
    constructor(poolAddress, token0, token1, poolToken, fee, poolType, factory) {
        this.poolAddress = poolAddress;
        this.token0 = token0;
        this.token1 = token1;
        this.poolToken = poolToken;
        this.fee = fee;
        this.poolType = poolType;
        this.factory = factory;
    }
    toString() {
        return `AerodromePool(${this.token0}.${this.token1})`;
    }
}
class SwapRouteStep {
    pool;
    tokenIn;
    tokenOut;
    constructor(pool, tokenIn, tokenOut) {
        this.pool = pool;
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
    }
    toString() {
        return `SwapRouteStep(${this.tokenIn} -> ${this.tokenOut})`;
    }
    intoRouteStruct() {
        return {
            from: this.tokenIn.address.address,
            to: this.tokenOut.address.address,
            stable: this.pool.poolType === 0,
            factory: this.pool.factory.address,
        };
    }
}
const setupAerodromeRouter = async (universe) => {
    const routerAddr = Address_1.Address.from(routers[universe.chainId].router);
    const sugarAddr = Address_1.Address.from(routers[universe.chainId].sugar);
    const sugarInst = contracts_1.IAerodromeSugar__factory.connect(sugarAddr.address, universe.provider);
    const routerInst = contracts_1.IAerodromeRouter__factory.connect(routerAddr.address, universe.provider);
    const pools = await Promise.all((await sugarInst.forSwaps(1000, 0)).map(async ({ token0, token1, lp, poolType, poolFee, factory }) => {
        const [tok0, tok1, poolToken] = await Promise.all([
            await universe.getToken(Address_1.Address.from(token0)),
            await universe.getToken(Address_1.Address.from(token1)),
            universe.getToken(Address_1.Address.from(lp)).catch(() => null),
        ]);
        if (tok0 == null || tok1 == null) {
            return null;
        }
        const pool = new AerodromePool(Address_1.Address.from(lp), tok0, tok1, poolToken, poolFee.toBigInt(), poolType, Address_1.Address.from(factory));
        return pool;
    }));
    const directSwaps = new DefaultMap_1.DefaultMap(() => new DefaultMap_1.DefaultMap(() => []));
    for (const pool of pools) {
        if (pool == null) {
            continue;
        }
        directSwaps.get(pool.token0).get(pool.token1).push(pool);
        directSwaps.get(pool.token1).get(pool.token0).push(pool);
    }
    const twoStepSwaps = new DefaultMap_1.DefaultMap(() => new DefaultMap_1.DefaultMap(() => []));
    const toks = [...directSwaps.keys()];
    const findRoutes = (src, dst) => {
        const direct = directSwaps
            .get(src)
            .get(dst)
            .map((pool) => [new SwapRouteStep(pool, src, dst)]);
        if (direct.length > 0) {
            return direct;
        }
        return twoStepSwaps.get(src).get(dst);
    };
    for (const token0 of toks) {
        for (const token1 of toks) {
            if (token0 === token1)
                continue;
            for (const token2 of toks) {
                if (token0 === token2 || token1 === token2)
                    continue;
                const pool01 = directSwaps.get(token0).get(token1);
                if (pool01.length === 0)
                    continue;
                const pool12 = directSwaps.get(token1).get(token2);
                if (pool12.length === 0)
                    continue;
                for (const p0 of pool01) {
                    for (const p1 of pool12) {
                        twoStepSwaps
                            .get(token0)
                            .get(token2)
                            .push([
                            new SwapRouteStep(p0, token0, token1),
                            new SwapRouteStep(p1, token1, token2),
                        ]);
                        twoStepSwaps
                            .get(token2)
                            .get(token0)
                            .push([
                            new SwapRouteStep(p1, token2, token1),
                            new SwapRouteStep(p0, token1, token0),
                        ]);
                    }
                }
            }
        }
    }
    const out = new DexAggregator_1.DexRouter('aerodrome', async (src, dst, input, output, slippage) => {
        const routes = findRoutes(input.token, output);
        if (routes.length === 0) {
            throw new Error('No route found');
        }
        const outAmts = (await Promise.all(routes.map(async (route) => await routerInst
            .getAmountsOut(input.amount, route.map((step) => step.intoRouteStruct()))
            .then((parts) => AerodromePath.from(route, parts))
            .catch(() => {
            return null;
        })))).filter((i) => i != null);
        if (outAmts.length === 0) {
            throw new Error('No route found');
        }
        outAmts.sort((a, b) => b.compare(a));
        const outAction = new AerodromeRouterSwap(universe, outAmts[0], routerInst);
        const plan = new Swap_1.SwapPlan(universe, [outAction]);
        return await plan.quote([input], universe.execAddress);
    }, true);
    universe.dexAggregators.push(out);
    return {
        dex: out,
        addTradeAction: (inputToken, outputToken) => {
            universe.addAction(new ((0, RouterAction_1.RouterAction)('Aerodrome'))(out, universe, routerAddr, inputToken, outputToken), routerAddr);
        },
    };
};
exports.setupAerodromeRouter = setupAerodromeRouter;
//# sourceMappingURL=setupAerodromeRouter.js.map