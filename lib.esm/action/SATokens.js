import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory';
import { rayDiv, rayMul } from './aaveMath';
export class MintSATokensAction extends Action('AaveV2') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, [input], _, [predicted]) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        planner.add(lib.deposit(this.universe.execAddress.address, input ?? predicted.amount, 0, true), undefined, `bal_${this.outputToken[0].symbol}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken.fromBigInt(rayDiv(amountsIn.into(this.saToken).amount, this.rate.value)),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [underlying], [saToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, saToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.saToken = saToken;
        this.rate = rate;
    }
    toString() {
        return `SATokenMint(${this.saToken.toString()})`;
    }
}
export class BurnSATokensAction extends Action('AaveV2') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, [input], _, [predicted]) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        planner.add(lib.withdraw(this.universe.execAddress.address, input ?? predicted.amount, true));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken
                .fromBigInt(rayMul(amountsIn.amount, this.rate.value))
                .into(this.underlying),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [saToken], [underlying], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.underlying = underlying;
        this.saToken = saToken;
        this.rate = rate;
    }
    toString() {
        return `SATokenBurn(${this.saToken.toString()})`;
    }
}
//# sourceMappingURL=SATokens.js.map