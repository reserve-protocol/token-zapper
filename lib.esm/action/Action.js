import { Address } from '../base/Address';
import * as gen from '../tx-gen/Planner';
import { BalanceOf__factory, EthBalance__factory, IERC20__factory, } from '../contracts';
export var InteractionConvention;
(function (InteractionConvention) {
    InteractionConvention[InteractionConvention["PayBeforeCall"] = 0] = "PayBeforeCall";
    InteractionConvention[InteractionConvention["CallbackBased"] = 1] = "CallbackBased";
    InteractionConvention[InteractionConvention["ApprovalRequired"] = 2] = "ApprovalRequired";
    InteractionConvention[InteractionConvention["None"] = 3] = "None";
})(InteractionConvention || (InteractionConvention = {}));
export var DestinationOptions;
(function (DestinationOptions) {
    DestinationOptions[DestinationOptions["Recipient"] = 0] = "Recipient";
    DestinationOptions[DestinationOptions["Callee"] = 1] = "Callee";
})(DestinationOptions || (DestinationOptions = {}));
export var EdgeType;
(function (EdgeType) {
    EdgeType[EdgeType["MINT"] = 0] = "MINT";
    EdgeType[EdgeType["BURN"] = 1] = "BURN";
    EdgeType[EdgeType["SWAP"] = 2] = "SWAP";
})(EdgeType || (EdgeType = {}));
const useSpecialCaseBalanceOf = new Set([
    Address.from('0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9'),
]);
export const plannerUtils = {
    planForwardERC20(universe, planner, token, amount, destination) {
        if (destination == universe.config.addresses.executorAddress) {
            return;
        }
        plannerUtils.erc20.transfer(universe, planner, amount, token, destination);
    },
    erc20: {
        transfer(universe, planner, amount, token, destination) {
            const erc20 = gen.Contract.createContract(IERC20__factory.connect(token.address.address, universe.provider));
            planner.add(erc20.transfer(destination.address, amount));
        },
        balanceOf(universe, planner, token, owner, comment, varName) {
            if (token == universe.nativeToken) {
                const lib = gen.Contract.createContract(EthBalance__factory.connect(universe.config.addresses.ethBalanceOf.address, universe.provider));
                return planner.add(lib.ethBalance(owner.address), comment, varName ?? `bal_${token.symbol}`);
            }
            if (useSpecialCaseBalanceOf.has(token.address)) {
                const lib = gen.Contract.createContract(BalanceOf__factory.connect(universe.config.addresses.balanceOf.address, universe.provider));
                return planner.add(lib.balanceOf(token.address.address, owner.address), comment, varName ?? `bal_${token.symbol}`);
            }
            const erc20 = gen.Contract.createContract(IERC20__factory.connect(token.address.address, universe.provider));
            return planner.add(erc20.balanceOf(owner.address), comment, varName ?? `bal_${token.symbol}`);
        },
    },
};
export class BaseAction {
    address;
    inputToken;
    outputToken;
    interactionConvention;
    proceedsOptions;
    approvals;
    gen = gen;
    genUtils = plannerUtils;
    outputBalanceOf(universe, planner) {
        return this.outputToken.map((token) => this.genUtils.erc20.balanceOf(universe, planner, token, universe.execAddress, undefined, `bal_${token.symbol}`));
    }
    get protocol() {
        return 'Unknown';
    }
    constructor(address, inputToken, outputToken, interactionConvention, proceedsOptions, approvals) {
        this.address = address;
        this.inputToken = inputToken;
        this.outputToken = outputToken;
        this.interactionConvention = interactionConvention;
        this.proceedsOptions = proceedsOptions;
        this.approvals = approvals;
    }
    async quoteWithSlippage(amountsIn) {
        const outputs = await this.quote(amountsIn);
        return outputs;
    }
    async exchange(amountsIn, balances) {
        const outputs = await this.quote(amountsIn);
        balances.exchange(amountsIn, outputs);
    }
    generateOutputTokenBalance(universe, planner, comment) {
        return plannerUtils.erc20.balanceOf(universe, planner, this.outputToken[0], universe.execAddress, comment);
    }
    toString() {
        return 'UnnamedAction';
    }
    // TODO: This is sort of a hack for stETH as it's a mintable but not burnable token.
    // But we need the burn Action to calculate the baskets correctly, but we don't want
    // to have the token actually appear in paths.
    get addToGraph() {
        return true;
    }
    get outputSlippage() {
        return 0n;
    }
}
export const Action = (proto) => {
    class ProtocolAction extends BaseAction {
        get protocol() {
            return proto;
        }
    }
    return ProtocolAction;
};
//# sourceMappingURL=Action.js.map