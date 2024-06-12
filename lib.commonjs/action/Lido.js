"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LidoDeployment = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const IWStETH__factory_1 = require("../contracts/factories/contracts/IWStETH__factory");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const Action_1 = require("./Action");
const ethers_1 = require("ethers");
class LidoDeployment {
    universe;
    steth;
    wsteth;
    contracts;
    weiroll;
    rateCache;
    actions;
    constructor(universe, steth, wsteth) {
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.contracts = {
            wstethInstance: IWStETH__factory_1.IWStETH__factory.connect(wsteth.address.address, universe.provider),
            stethInstance: contracts_1.IStETH__factory.connect(steth.address.address, universe.provider),
        };
        this.weiroll = {
            wstethInstance: gen.Contract.createContract(this.contracts.wstethInstance),
            stethInstance: gen.Contract.createContract(this.contracts.stethInstance),
            weth: gen.Contract.createContract(contracts_1.IWrappedNative__factory.connect(universe.wrappedNativeToken.address.address, universe.provider)),
        };
        this.rateCache = universe.createCache(async (qty) => {
            if (qty.token === wsteth) {
                return await this.quoteBurn_(qty);
            }
            else {
                return await this.quoteMint_(qty);
            }
        });
        const wrap = new STETHToWSTETH(this);
        const unwrap = new WSTETHToSTETH(this);
        const stake = new ETHToSTETH(this);
        const wethMintable = universe.wrappedTokens.get(universe.wrappedNativeToken);
        if (!wethMintable) {
            throw new Error('WETH is not mintable??');
        }
        const stakeFromWETH = new (wethMintable.burn.combine(stake))(universe);
        universe.defineMintable(wrap, unwrap, true);
        universe.addAction(stake, steth.address);
        universe.addAction(stakeFromWETH, steth.address);
        this.actions = {
            stake: {
                eth: stake,
                weth: stakeFromWETH,
            },
            wrap: {
                steth: wrap,
            },
            unwrap: {
                stEth: unwrap,
            },
        };
    }
    async quoteWrap(amountsIn) {
        return await this.rateCache.get(amountsIn);
    }
    async quoteUnwrap(amountsIn) {
        return await this.rateCache.get(amountsIn);
    }
    async quoteMint_(amountsIn) {
        const out = (await this.contracts.wstethInstance.callStatic.getWstETHByStETH(amountsIn.amount)).toBigInt();
        return this.wsteth.from(out);
    }
    async quoteBurn_(amountsIn) {
        const out = await this.contracts.wstethInstance.callStatic.getStETHByWstETH(amountsIn.amount);
        return this.steth.from(out);
    }
    static async load(universe, config) {
        const [steth, wsteth] = await Promise.all([
            universe.getToken(Address_1.Address.from(config.steth)),
            universe.getToken(Address_1.Address.from(config.wsteth)),
        ]);
        return new LidoDeployment(universe, steth, wsteth);
    }
}
exports.LidoDeployment = LidoDeployment;
class BaseLidoAction extends (0, Action_1.Action)('Lido.Base') {
    get oneUsePrZap() {
        return false;
    }
    get supportsDynamicInput() {
        return true;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, _, predicted) {
        const input = inputs[0] ?? gen.encodeArg(predicted[0].amount, abi_1.ParamType.from('uint256'));
        const out = planner.add(this.planAction(input));
        if (out == null) {
            throw new Error('Failed to plan action');
        }
        return [out];
    }
    async quote([amountsIn]) {
        return [await this.quoteAction(amountsIn)];
    }
    toString() {
        return `Lido(${this.inputToken[0]}.${this.actionName} -> ${this.outputToken[0]})`;
    }
}
class BaseStETHAction extends BaseLidoAction {
    lido;
    input;
    output;
    get outputSlippage() {
        return 0n;
    }
    async quoteAction(amountsIn) {
        return this.output.from(amountsIn.amount - 1n);
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    constructor(lido, input, output) {
        super(lido.steth.address, [input], [output], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.lido = lido;
        this.input = input;
        this.output = output;
    }
}
class ETHToSTETH extends BaseStETHAction {
    lido;
    get actionName() {
        return 'submit';
    }
    planAction(input) {
        return this.lido.weiroll.stethInstance
            .submit(ethers_1.constants.AddressZero)
            .withValue(input);
    }
    constructor(lido) {
        super(lido, lido.universe.nativeToken, lido.steth);
        this.lido = lido;
    }
}
class BaseWSTETHAction extends BaseLidoAction {
    lido;
    input;
    output;
    get outputSlippage() {
        return 0n;
    }
    get returnsOutput() {
        return true;
    }
    get supportsDynamicInput() {
        return true;
    }
    get oneUsePrZap() {
        return false;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async quote([amountsIn]) {
        return [await this.quoteAction(amountsIn)];
    }
    constructor(lido, input, output) {
        super(lido.steth.address, [input], [output], input === lido.steth
            ? Action_1.InteractionConvention.ApprovalRequired
            : Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, input === lido.steth ? [new Approval_1.Approval(input, output.address)] : []);
        this.lido = lido;
        this.input = input;
        this.output = output;
    }
}
class STETHToWSTETH extends BaseWSTETHAction {
    lido;
    get actionName() {
        return 'wrap';
    }
    planAction(input) {
        return this.lido.weiroll.wstethInstance.wrap(input);
    }
    async quoteAction(amountsIn) {
        return await this.lido.quoteWrap(amountsIn);
    }
    constructor(lido) {
        super(lido, lido.steth, lido.wsteth);
        this.lido = lido;
    }
}
class WSTETHToSTETH extends BaseWSTETHAction {
    lido;
    get actionName() {
        return 'unwrap';
    }
    planAction(input) {
        return this.lido.weiroll.wstethInstance.unwrap(input);
    }
    async quoteAction(amountsIn) {
        return await this.lido.quoteUnwrap(amountsIn);
    }
    constructor(lido) {
        super(lido, lido.wsteth, lido.steth);
        this.lido = lido;
    }
}
//# sourceMappingURL=Lido.js.map