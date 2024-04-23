import { DestinationOptions, Action, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory';
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
const saTokenInterface = IStaticATokenLM__factory.createInterface();
export class MintSATokensAction extends Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(destination.address, inputs[0], 0, true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
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
        super(saToken.address, [underlying], [saToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(underlying, saToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.saToken = saToken;
        this.rate = rate;
    }
    toString() {
        return `SATokenMint(${this.saToken.toString()})`;
    }
}
export class BurnSATokensAction extends Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.withdraw(destination.address, inputs[0], true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
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
        super(saToken.address, [saToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
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