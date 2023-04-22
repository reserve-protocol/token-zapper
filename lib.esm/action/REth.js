import { IRETHRouter__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
export class REthRouter {
    universe;
    reth;
    routerAddress;
    routerInstance;
    constructor(universe, reth, routerAddress) {
        this.universe = universe;
        this.reth = reth;
        this.routerAddress = routerAddress;
        this.routerInstance = IRETHRouter__factory.connect(routerAddress.address, universe.provider);
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
            contractCall: new ContractCall(parseHexStringIntoBuffer(this.routerInstance.interface.encodeFunctionData('swapTo', [
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
            contractCall: new ContractCall(parseHexStringIntoBuffer(this.routerInstance.interface.encodeFunctionData('swapFrom', [
                params.portions[0],
                params.portions[1],
                params.amountOut,
                params.amountOut,
                qtyETH.amount,
            ])), this.routerAddress, qtyETH.amount, this.gasEstimate(), 'Swap RETH to ETH via RETHRouter'),
        };
    }
}
export class ETHToRETH extends Action {
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
        super(router.reth.address, [universe.nativeToken], [router.reth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
    toString() {
        return `RETHRouter(direction=ToETH)`;
    }
}
export class RETHToETH extends Action {
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
        super(router.reth.address, [router.reth], [universe.nativeToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, []);
        this.universe = universe;
        this.router = router;
    }
    toString() {
        return `RETHRouter(direction=FromRETH)`;
    }
}
//# sourceMappingURL=REth.js.map