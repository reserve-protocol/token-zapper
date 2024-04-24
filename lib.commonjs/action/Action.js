"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.plannerUtils = exports.DestinationOptions = exports.InteractionConvention = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const contracts_1 = require("../contracts");
const IERC20__factory_1 = require("../contracts/factories/contracts/IERC20__factory");
var InteractionConvention;
(function (InteractionConvention) {
    InteractionConvention[InteractionConvention["PayBeforeCall"] = 0] = "PayBeforeCall";
    InteractionConvention[InteractionConvention["CallbackBased"] = 1] = "CallbackBased";
    InteractionConvention[InteractionConvention["ApprovalRequired"] = 2] = "ApprovalRequired";
    InteractionConvention[InteractionConvention["None"] = 3] = "None";
})(InteractionConvention || (exports.InteractionConvention = InteractionConvention = {}));
var DestinationOptions;
(function (DestinationOptions) {
    DestinationOptions[DestinationOptions["Recipient"] = 0] = "Recipient";
    DestinationOptions[DestinationOptions["Callee"] = 1] = "Callee";
})(DestinationOptions || (exports.DestinationOptions = DestinationOptions = {}));
const useSpecialCaseBalanceOf = new Set([
    Address_1.Address.from("0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9")
]);
exports.plannerUtils = {
    planForwardERC20(universe, planner, token, amount, destination) {
        if (destination == universe.config.addresses.executorAddress) {
            return;
        }
        exports.plannerUtils.erc20.transfer(universe, planner, amount, token, destination);
    },
    erc20: {
        transfer(universe, planner, amount, token, destination) {
            const erc20 = gen.Contract.createContract(IERC20__factory_1.IERC20__factory.connect(token.address.address, universe.provider));
            planner.add(erc20.transfer(destination.address, amount));
        },
        balanceOf(universe, planner, token, owner, comment, varName) {
            if (token == universe.nativeToken) {
                const lib = gen.Contract.createContract(contracts_1.EthBalance__factory.connect(universe.config.addresses.ethBalanceOf.address, universe.provider));
                return planner.add(lib.ethBalance(owner.address), comment, varName ?? `bal_${token.symbol}`);
            }
            if (useSpecialCaseBalanceOf.has(token.address)) {
                const lib = gen.Contract.createContract(contracts_1.BalanceOf__factory.connect(universe.config.addresses.balanceOf.address, universe.provider));
                return planner.add(lib.balanceOf(token.address.address, owner.address), comment, varName ?? `bal_${token.symbol}`);
            }
            const erc20 = gen.Contract.createContract(IERC20__factory_1.IERC20__factory.connect(token.address.address, universe.provider));
            return planner.add(erc20.balanceOf(owner.address), comment, varName ?? `bal_${token.symbol}`);
        },
    },
};
class Action {
    address_;
    inputToken;
    outputToken;
    interactionConvention;
    proceedsOptions;
    approvals;
    gen = gen;
    genUtils = exports.plannerUtils;
    get address() {
        return this.address_;
    }
    constructor(address_, inputToken, outputToken, interactionConvention, proceedsOptions, approvals) {
        this.address_ = address_;
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
exports.Action = Action;
//# sourceMappingURL=Action.js.map