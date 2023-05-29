"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETHToETH = exports.ETHToRETH = exports.REthRouter = void 0;
const contracts_1 = require("../contracts");
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
class REthRouter {
    universe;
    reth;
    routerAddress;
    routerInstance;
    constructor(universe, reth, routerAddress) {
        this.universe = universe;
        this.reth = reth;
        this.routerAddress = routerAddress;
        this.routerInstance = contracts_1.IRETHRouter__factory.connect(routerAddress.address, universe.provider);
    }
    gasEstimate() {
        return 250000n;
    }
    async optimiseToREth(qtyETH) {
        if (qtyETH.token !== this.universe.nativeToken) {
            throw new Error('Token must be ETH token');
        }
        const params = await this.routerInstance.callStatic.optimiseSwapTo(qtyETH.amount, 10);
        return {
            portions: params.portions,
            amountOut: this.reth.from(params.amountOut),
            contractCall: new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.routerInstance.interface.encodeFunctionData('swapTo', [
                params.portions[0],
                params.portions[1],
                params.amountOut,
                params.amountOut,
            ])), this.routerAddress, qtyETH.amount, this.gasEstimate(), 'Swap ETH to RETH via RETHRouter'),
        };
    }
    async optimiseFromREth(qtyETH) {
        if (qtyETH.token !== this.reth) {
            throw new Error('Token must be ETH token');
        }
        const params = await this.routerInstance.callStatic.optimiseSwapFrom(qtyETH.amount, 10);
        return {
            portions: params.portions,
            amountOut: this.universe.nativeToken.from(params.amountOut),
            contractCall: new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.routerInstance.interface.encodeFunctionData('swapFrom', [
                params.portions[0],
                params.portions[1],
                params.amountOut,
                params.amountOut,
                qtyETH.amount,
            ])), this.routerAddress, qtyETH.amount, this.gasEstimate(), 'Swap RETH to ETH via RETHRouter'),
        };
    }
}
exports.REthRouter = REthRouter;
class ETHToRETH extends Action_1.Action {
    universe;
    router;
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async encode([ethQty]) {
        const { contractCall } = await this.router.optimiseToREth(ethQty);
        return contractCall;
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
    gasEstimate() {
        return this.router.gasEstimate();
    }
    async encode([rethQty]) {
        const { contractCall } = await this.router.optimiseFromREth(rethQty);
        return contractCall;
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