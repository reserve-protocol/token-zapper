import { Address } from '../base/Address';
import * as gen from '../tx-gen/Planner';
import { BalanceOf__factory, EthBalance__factory, IERC20__factory, } from '../contracts';
import { TRADE_SLIPPAGE_DENOMINATOR } from '../base/constants';
import { SwapPlan } from '../searcher/Swap';
import { defaultAbiCoder, ParamType } from '@ethersproject/abi';
import { formatEther } from 'ethers/lib/utils';
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
    // Address.from('0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6'),
    // Address.from('0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0'),
    // Address.from('0xDbC0cE2321B76D3956412B36e9c0FA9B0fD176E7'),
]);
export const ONE = 10n ** 18n;
export const ONE_Val = new gen.LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [ONE]));
export const plannerUtils = {
    planForwardERC20(universe, planner, token, amount, destination) {
        if (destination == universe.config.addresses.executorAddress) {
            return;
        }
        plannerUtils.erc20.transfer(universe, planner, amount, token, destination);
    },
    fraction: (uni, planner, input, fraction, comment, name) => {
        return planner.add(uni.weirollZapperExec.fpMul(input, fraction, ONE_Val), `${(parseFloat(formatEther(fraction)) * 100).toFixed(2)}% ${comment}`, name);
    },
    sub: (uni, planner, a, b, comment, name) => {
        return planner.add(uni.weirollZapperExec.sub(a, b, ONE_Val), comment, name);
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
    _address;
    inputToken;
    outputToken;
    _interactionConvention;
    _proceedsOptions;
    _approvals;
    gen = gen;
    genUtils = plannerUtils;
    get supportsDynamicInput() {
        return true;
    }
    get oneUsePrZap() {
        return false;
    }
    get returnsOutput() {
        return true;
    }
    get addressesInUse() {
        return new Set([]);
    }
    outputBalanceOf(universe, planner) {
        return this.outputToken.map((token) => this.genUtils.erc20.balanceOf(universe, planner, token, universe.execAddress, undefined, `bal_${token.symbol}`));
    }
    get protocol() {
        return 'Unknown';
    }
    get interactionConvention() {
        return this._interactionConvention;
    }
    get proceedsOptions() {
        return this._proceedsOptions;
    }
    get approvals() {
        return this._approvals;
    }
    get address() {
        return this._address;
    }
    constructor(_address, inputToken, outputToken, _interactionConvention, _proceedsOptions, _approvals) {
        this._address = _address;
        this.inputToken = inputToken;
        this.outputToken = outputToken;
        this._interactionConvention = _interactionConvention;
        this._proceedsOptions = _proceedsOptions;
        this._approvals = _approvals;
    }
    async intoSwapPath(universe, qty) {
        return await new SwapPlan(universe, [this]).quote([qty], universe.execAddress);
    }
    async quoteWithSlippage(amountsIn) {
        const outputs = await this.quote(amountsIn);
        if (this.outputSlippage === 0n) {
            return outputs;
        }
        return outputs.map((output) => {
            return output.token.from(output.amount -
                (output.amount * this.outputSlippage) / TRADE_SLIPPAGE_DENOMINATOR);
        });
    }
    async exchange(amountsIn, balances) {
        const outputs = await this.quote(amountsIn);
        balances.exchange(amountsIn, outputs);
    }
    async planWithOutput(universe, planner, 
    // Actual abstract inputs
    inputs, destination, 
    // Inputs we predicted
    predictedInputs) {
        const out = await this.plan(planner, inputs, destination, predictedInputs);
        if (out == null) {
            if (this.returnsOutput) {
                throw new Error('Action did not return output as expected');
            }
            return this.outputBalanceOf(universe, planner);
        }
        return out;
    }
    toString() {
        return ('UnnamedAction.' +
            this.protocol +
            '.' +
            this.constructor.name +
            ':' +
            this.inputToken.join(', ') +
            '->' +
            this.outputToken.join(', '));
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
    combine(other) {
        const self = this;
        if (!self.outputToken.every((token, index) => other.inputToken[index] === token)) {
            throw new Error('Cannot combine actions with mismatched tokens');
        }
        class CombinedAction extends BaseAction {
            universe;
            get protocol() {
                return `${self.protocol}.${other.protocol}`;
            }
            toString() {
                return `${self.toString()}  -> ${other.toString()}`;
            }
            async quote(amountsIn) {
                const out = await self.quote(amountsIn);
                return await other.quote(out);
            }
            get supportsDynamicInput() {
                return self.supportsDynamicInput && other.supportsDynamicInput;
            }
            get oneUsePrZap() {
                return self.oneUsePrZap && other.oneUsePrZap;
            }
            get addressesInUse() {
                return new Set([...self.addressesInUse, ...other.addressesInUse]);
            }
            get returnsOutput() {
                return other.returnsOutput;
            }
            get outputSlippage() {
                return self.outputSlippage + other.outputSlippage;
            }
            gasEstimate() {
                return self.gasEstimate() + other.gasEstimate() + 10000n;
            }
            async plan(planner, inputs, destination, predicted) {
                const out = await self.planWithOutput(this.universe, planner, inputs, destination, predicted);
                return other.plan(planner, out, destination, predicted);
            }
            constructor(universe) {
                super(self.address, self.inputToken, other.outputToken, self.interactionConvention, other.proceedsOptions, [...self.approvals, ...other.approvals]);
                this.universe = universe;
            }
        }
        return CombinedAction;
    }
}
class TradeEdgeAction extends BaseAction {
    universe;
    choices;
    currentChoice = 0;
    get current() {
        return this.choices[this.currentChoice];
    }
    get interactionConvention() {
        return this.current.interactionConvention;
    }
    get proceedsOptions() {
        return this.current.proceedsOptions;
    }
    get approvals() {
        return this.current.approvals;
    }
    get address() {
        return this.current.address;
    }
    quote(amountsIn) {
        return this.current.quote(amountsIn);
    }
    gasEstimate() {
        return this.current.gasEstimate();
    }
    async plan(planner, inputs, destination, predicted) {
        return this.current.plan(planner, inputs, destination, predicted);
    }
    get totalChoices() {
        return this.choices.length;
    }
    get outputSlippage() {
        return this.current.outputSlippage;
    }
    get supportsDynamicInput() {
        return this.current.supportsDynamicInput;
    }
    get oneUsePrZap() {
        return this.current.oneUsePrZap;
    }
    get returnsOutput() {
        return this.current.returnsOutput;
    }
    get addressesInUse() {
        return this.current.addressesInUse;
    }
    get addToGraph() {
        return this.current.addToGraph;
    }
    constructor(universe, choices) {
        super(choices[0].address, choices[0].inputToken, choices[0].outputToken, choices[0].interactionConvention, choices[0].proceedsOptions, choices[0].approvals);
        this.universe = universe;
        this.choices = choices;
    }
}
export const isMultiChoiceEdge = (edge) => {
    return edge instanceof TradeEdgeAction;
};
export const createMultiChoiceAction = (universe, choices) => {
    if (choices.length === 0) {
        throw new Error('Cannot create a TradeEdgeAction with no choices');
    }
    if (choices.length === 1) {
        return choices[0];
    }
    if (!choices.every((choice) => choice.inputToken.length === 1 &&
        choice.outputToken.length === 1 &&
        choice.inputToken[0] === choice.inputToken[0] &&
        choice.outputToken[0] === choice.outputToken[0])) {
        throw new Error('Add choices in a trade edge must produce the same input and output token');
    }
    return new TradeEdgeAction(universe, choices);
};
export const Action = (proto) => {
    class ProtocolAction extends BaseAction {
        get protocol() {
            return proto;
        }
    }
    return ProtocolAction;
};
//# sourceMappingURL=Action.js.map