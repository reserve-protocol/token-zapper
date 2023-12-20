import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { BalanceOf__factory } from '../contracts';
import { CEther__factory } from '../contracts/factories/contracts/ICToken.sol/CEther__factory';
import { ICToken__factory } from '../contracts/factories/contracts/ICToken.sol/ICToken__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const iCTokenInterface = ICToken__factory.createInterface();
const iCEtherInterface = CEther__factory.createInterface();
const ONEFP18 = 10n ** 18n;
export class MintCTokenAction extends Action {
    universe;
    underlying;
    cToken;
    rate;
    async plan(planner, inputs) {
        if (this.underlying === this.universe.nativeToken) {
            const lib = this.gen.Contract.createContract(CEther__factory.connect(this.cToken.address.address, this.universe.provider));
            planner.add(lib.mint().withValue(inputs[0]));
            return [
                this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], this.universe.config.addresses.executorAddress),
            ];
        }
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.mint(inputs[0]));
        const balanceOfLib = this.gen.Contract.createContract(BalanceOf__factory.connect(this.universe.config.addresses.balanceOf.address, this.universe.provider));
        return [
            planner.add(balanceOfLib.balanceOf(this.output[0].address.address, this.universe.config.addresses.executorAddress.address)),
        ];
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        if (this.underlying === this.universe.nativeToken) {
            return new ContractCall(parseHexStringIntoBuffer(iCEtherInterface.encodeFunctionData('mint')), this.cToken.address, amountsIn.amount, this.gasEstimate(), 'Mint CEther');
        }
        return new ContractCall(parseHexStringIntoBuffer(iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into ${this.cToken.symbol}`);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rateScale) /
            this.rate.value /
            this.underlying.scale;
        // out = out - out / 3_000_000n;
        return [this.cToken.fromBigInt(out)];
    }
    get outputSlippage() {
        return 3000000n;
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [underlying], [cToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, cToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenMint(${this.cToken.toString()})`;
    }
}
export class BurnCTokenAction extends Action {
    universe;
    underlying;
    cToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs) {
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0]));
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], this.universe.config.addresses.executorAddress),
        ];
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Burn ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rate.value * this.underlying.scale) /
            this.rateScale;
        return [this.underlying.fromBigInt(out)];
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [cToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenBurn(${this.cToken.toString()})`;
    }
}
//# sourceMappingURL=CTokens.js.map