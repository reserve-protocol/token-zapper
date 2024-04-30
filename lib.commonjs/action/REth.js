"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETHToWETH = exports.WETHToRETH = exports.ETHToRETH = exports.REthRouter = void 0;
const utils_1 = require("ethers/lib/utils");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const IRETHRouter__factory_1 = require("../contracts/factories/contracts/IRETHRouter__factory");
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
class REthRouter {
    universe;
    reth;
    routerAddress;
    routerInstance;
    mintViaWETH;
    mintViaETH;
    burn;
    constructor(universe, reth, routerAddress) {
        this.universe = universe;
        this.reth = reth;
        this.routerAddress = routerAddress;
        this.routerInstance = IRETHRouter__factory_1.IRETHRouter__factory.connect(routerAddress.address, universe.provider);
        this.mintViaWETH = new WETHToRETH(this.universe, this);
        this.mintViaETH = new ETHToRETH(this.universe, this);
        this.burn = new RETHToWETH(this.universe, this);
    }
    gasEstimate() {
        return 250000n;
    }
    async optimiseToREth(qtyETH) {
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
        const params = await this.routerInstance.callStatic.optimiseSwapFrom(qtyETH.amount, 20);
        return {
            portions: params.portions,
            amountOut: this.universe.wrappedNativeToken.from(params.amountOut),
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
class RocketPoolBase extends (0, Action_1.Action)('Rocketpool') {
    toString() {
        return `RocketpoolRouter.${this.action}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class ETHToRETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapTo';
    }
    get outputSlippage() {
        return this.universe.config.defaultInternalTradeSlippage;
    }
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
            planner.add(routerLib.swapTo(input0, input1, aout, aout).withValue(input), 'RocketPool: ETH -> RETH');
        }
        else {
            planner.add(routerLib
                .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, aout, aout)
                .withValue(input), 'RocketPool: ETH -> RETH');
        }
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([input]) {
        return [(await this.router.optimiseToREth(input)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [universe.nativeToken], [router.reth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
}
exports.ETHToRETH = ETHToRETH;
class WETHToRETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapTo';
    }
    get outputSlippage() {
        return this.universe.config.defaultInternalTradeSlippage;
    }
    async plan(planner, [input], _, [inputPrecomputed]) {
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseToREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        const zapperLib = this.gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.zapperAddress.address, this.universe.provider));
        const wethlib = this.gen.Contract.createContract(contracts_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(input), 'RocketPool: WETH -> ETH');
        if (f0 !== 0n && f1 !== 0n) {
            // Using a helper library we
            const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${(0, utils_1.formatEther)(f0)}`, 'frac0');
            const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${(0, utils_1.formatEther)(f1)}`, 'frac1');
            planner.add(routerLib.swapTo(input0, input1, aout, aout).withValue(input), 'RocketPool: ETH -> RETH');
        }
        else {
            planner.add(routerLib
                .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, aout, aout)
                .withValue(input), 'RocketPool: ETH -> RETH');
        }
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([input]) {
        return [(await this.router.optimiseToREth(input)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [universe.wrappedNativeToken], [router.reth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
}
exports.WETHToRETH = WETHToRETH;
class RETHToWETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapFrom';
    }
    get outputSlippage() {
        return this.universe.config.defaultInternalTradeSlippage;
    }
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
        planner.add(routerLib.swapFrom(input0, input1, aout, aout), 'RocketPool: RETH -> ETH');
        const outBalanace = this.genUtils.erc20.balanceOf(this.universe, planner, this.universe.nativeToken, this.universe.execAddress);
        const wethlib = this.gen.Contract.createContract(contracts_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.deposit().withValue(outBalanace), 'RocketPool: ETH -> WETH');
        return [outBalanace];
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([ethQty]) {
        return [(await this.router.optimiseFromREth(ethQty)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [router.reth], [universe.wrappedNativeToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(router.reth, Address_1.Address.from(router.routerInstance.address))]);
        this.universe = universe;
        this.router = router;
    }
}
exports.RETHToWETH = RETHToWETH;
//# sourceMappingURL=REth.js.map