import { formatEther } from 'ethers/lib/utils';
import { Address } from '../base/Address';
import { IWrappedNative__factory } from '../contracts';
import { IRETHRouter__factory } from '../contracts/factories/contracts/IRETHRouter__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
export class REthRouter {
    universe;
    reth;
    routerAddress;
    routerInstance;
    mintViaWETH;
    mintViaETH;
    burnToWETH;
    burnToETH;
    constructor(universe, reth, routerAddress) {
        this.universe = universe;
        this.reth = reth;
        this.routerAddress = routerAddress;
        this.routerInstance = IRETHRouter__factory.connect(routerAddress.address, universe.provider);
        this.mintViaWETH = new WETHToRETH(this.universe, this);
        this.mintViaETH = new ETHToRETH(this.universe, this);
        this.burnToWETH = new RETHToWETH(this.universe, this);
        this.burnToETH = new RETHToETH(this.universe, this);
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
const ONE = 10n ** 18n;
class RocketPoolBase extends Action('Rocketpool') {
    get supportsDynamicInput() {
        return true;
    }
    toString() {
        return `RocketpoolRouter.${this.action}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
export class ETHToRETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapTo';
    }
    get returnsOutput() {
        return false;
    }
    get outputSlippage() {
        return 30n;
    }
    async plan(planner, [input_], _, [inputPrecomputed]) {
        const input = input_ ?? inputPrecomputed.amount;
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseToREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        const zapperLib = this.universe.weirollZapperExec;
        if (f0 !== 0n && f1 !== 0n) {
            // Using a helper library we
            const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${formatEther(f0)}`, 'frac0');
            const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${formatEther(f1)}`, 'frac1');
            planner.add(routerLib.swapTo(input0, input1, 0, 0).withValue(input), 'RocketPool: ETH -> RETH');
        }
        else {
            planner.add(routerLib
                .swapTo(f0 !== 0n ? input : 0, f1 !== 0n ? input : 0, 0, 0)
                .withValue(input), 'RocketPool: ETH -> RETH');
        }
        return null;
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([input]) {
        return [(await this.router.optimiseToREth(input)).amountOut];
    }
    constructor(universe, router) {
        super(router.reth.address, [universe.nativeToken], [router.reth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
}
export class WETHToRETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapTo';
    }
    get outputSlippage() {
        return 30n;
    }
    get returnsOutput() {
        return false;
    }
    async plan(planner, [input], _, [inputPrecomputed]) {
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseToREth(inputPrecomputed);
        const inp = input ?? inputPrecomputed.amount;
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        const zapperLib = this.universe.weirollZapperExec;
        const wethlib = this.gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inp), 'RocketPool: WETH -> ETH');
        if (f0 !== 0n && f1 !== 0n) {
            // Using a helper library we
            const input0 = planner.add(zapperLib.fpMul(f0, inp, ONE), `input * ${formatEther(f0)}`, 'frac0');
            const input1 = planner.add(zapperLib.fpMul(f1, inp, ONE), `input * ${formatEther(f1)}`, 'frac1');
            planner.add(routerLib.swapTo(input0, input1, aout, aout).withValue(inp), 'RocketPool: ETH -> RETH');
        }
        else {
            planner.add(routerLib
                .swapTo(f0 !== 0n ? inp : 0, f1 !== 0n ? inp : 0, aout, aout)
                .withValue(inp), 'RocketPool: ETH -> RETH');
        }
        return null;
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([input]) {
        return [(await this.router.optimiseToREth(input)).amountOut];
    }
    constructor(universe, router) {
        super(universe.wrappedNativeToken.address, [universe.wrappedNativeToken], [router.reth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
    get supportsDynamicInput() {
        return true;
    }
}
export class RETHToWETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapFrom';
    }
    get outputSlippage() {
        return 30n;
    }
    get supportsDynamicInput() {
        return true;
    }
    get returnsOutput() {
        return false;
    }
    async plan(planner, [input_], _, [inputPrecomputed]) {
        const input = input_ ?? inputPrecomputed.amount;
        const zapperLib = this.universe.weirollZapperExec;
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseFromREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        // Using a helper library we
        const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${formatEther(f0)}`, 'frac0');
        const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${formatEther(f1)}`, 'frac1');
        // uint256 _uniswapPortion,
        // uint256 _balancerPortion,
        // uint256 _minTokensOut,
        // uint256 _idealTokensOut,
        // uint256 _tokensIn
        planner.add(routerLib.swapFrom(input0, input1, aout, aout, input), 'RocketPool: RETH -> ETH');
        const outBalanace = this.genUtils.erc20.balanceOf(this.universe, planner, this.universe.nativeToken, this.universe.execAddress);
        const wethlib = this.gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.deposit().withValue(outBalanace), 'RocketPool: ETH -> WETH');
        return null;
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([ethQty]) {
        return [(await this.router.optimiseFromREth(ethQty)).amountOut];
    }
    constructor(universe, router) {
        super(universe.wrappedNativeToken.address, [router.reth], [universe.wrappedNativeToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(router.reth, Address.from(router.routerInstance.address))]);
        this.universe = universe;
        this.router = router;
    }
}
export class RETHToETH extends RocketPoolBase {
    universe;
    router;
    get action() {
        return 'swapFrom';
    }
    get outputSlippage() {
        return 30n;
    }
    get supportsDynamicInput() {
        return true;
    }
    get returnsOutput() {
        return false;
    }
    async plan(planner, [input_], _, [inputPrecomputed]) {
        const input = input_ ?? inputPrecomputed.amount;
        const zapperLib = this.universe.weirollZapperExec;
        // We want to avoid running the optimiseToREth on-chain.
        // So rather we precompute it during searching and convert the split into two fractions
        const { params: [p0, p1, aout, , qty], } = await this.router.optimiseFromREth(inputPrecomputed);
        const f0 = (p0.toBigInt() * ONE) / qty;
        const f1 = (p1.toBigInt() * ONE) / qty;
        const routerLib = this.gen.Contract.createContract(this.router.routerInstance);
        // Using a helper library we
        const input0 = planner.add(zapperLib.fpMul(f0, input, ONE), `input * ${formatEther(f0)}`, 'frac0');
        const input1 = planner.add(zapperLib.fpMul(f1, input, ONE), `input * ${formatEther(f1)}`, 'frac1');
        planner.add(routerLib.swapFrom(input0, input1, aout, aout, input), 'RocketPool: RETH -> ETH');
        return null;
    }
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async quote([ethQty]) {
        return [(await this.router.optimiseFromREth(ethQty)).amountOut];
    }
    constructor(universe, router) {
        super(universe.nativeToken.address, [router.reth], [universe.nativeToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(router.reth, Address.from(router.routerInstance.address))]);
        this.universe = universe;
        this.router = router;
    }
}
//# sourceMappingURL=REth.js.map