"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETHToETH = exports.ETHToRETH = exports.REthRouter = void 0;
const utils_1 = require("ethers/lib/utils");
const contracts_1 = require("../contracts");
const IRETHRouter__factory_1 = require("../contracts/factories/contracts/IRETHRouter__factory");
const Action_1 = require("./Action");
class REthRouter {
    universe;
    reth;
    routerAddress;
    routerInstance;
    constructor(universe, reth, routerAddress) {
        this.universe = universe;
        this.reth = reth;
        this.routerAddress = routerAddress;
        this.routerInstance = IRETHRouter__factory_1.IRETHRouter__factory.connect(routerAddress.address, universe.provider);
    }
    gasEstimate() {
        return 250000n;
    }
    async optimiseToREth(qtyETH) {
        if (qtyETH.token !== this.universe.nativeToken) {
            throw new Error('Token must be ETH token');
        }
        const params = await this.routerInstance.callStatic.optimiseSwapTo(qtyETH.amount, 20);
        return {
            portions: params.portions,
            amountOut: this.reth.from(params.amountOut),
            params: [
                params.portions[0],
                params.portions[1],
                params.amountOut,
                params.amountOut,
                qtyETH.amount,
            ],
        };
    }
    async optimiseFromREth(qtyETH) {
        if (qtyETH.token !== this.reth) {
            throw new Error('Token must be ETH token');
        }
        const params = await this.routerInstance.callStatic.optimiseSwapFrom(qtyETH.amount, 20);
        return {
            portions: params.portions,
            amountOut: this.universe.nativeToken.from(params.amountOut),
            params: [
                params.portions[0],
                params.portions[1],
                params.amountOut,
                params.amountOut,
                qtyETH.amount,
            ],
        };
    }
}
exports.REthRouter = REthRouter;
const ONE = 10n ** 18n;
class ETHToRETH extends Action_1.Action {
    universe;
    router;
    async plan(planner, [input], _, [inputPrecomputed]) {
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseToREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        const zapperLib = this.gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.zapperAddress.address, this.universe.provider));
        if (f0 !== 0n && f1 !== 0n) {
            // Using a helper library we
            const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${(0, utils_1.formatEther)(f0)}`, 'frac0');
            const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${(0, utils_1.formatEther)(f1)}`, 'frac1');
            return [
                planner.add(routerLib.swapTo(input0, input1, aout, aout).withValue(input), 'reth, mint rETH via router with split'),
            ];
        }
        else {
            return [
                planner.add(routerLib
                    .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, aout, aout)
                    .withValue(input), 'reth, mint rETH via router'),
            ];
        }
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([ethQty]) {
        return [(await this.router.optimiseToREth(ethQty)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [universe.nativeToken], [router.reth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
    toString() {
        return `RETHRouter(direction=ToRETH)`;
    }
}
exports.ETHToRETH = ETHToRETH;
class RETHToETH extends Action_1.Action {
    universe;
    router;
    async plan(planner, [input], _, [inputPrecomputed]) {
        const zapperLib = this.gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.zapperAddress.address, this.universe.provider));
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseFromREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        // Using a helper library we
        const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${(0, utils_1.formatEther)(f0)}`, 'frac0');
        const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${(0, utils_1.formatEther)(f1)}`, 'frac1');
        return [planner.add(routerLib.swapTo(input0, input1, aout, aout))];
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([ethQty]) {
        return [(await this.router.optimiseFromREth(ethQty)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [router.reth], [universe.nativeToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
    toString() {
        return `RETHRouter(direction=ToETH)`;
    }
}
exports.RETHToETH = RETHToETH;
//# sourceMappingURL=REth.js.map