import { IStaticATokenLM__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
import { DestinationOptions, Action, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
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
    gasEstimate() {
        return BigInt(300000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(saTokenInterface.encodeFunctionData('deposit', [
            destination.address,
            amountsIn.amount,
            0,
            true,
        ])), this.saToken.address, 0n, this.gasEstimate(), `Mint(${this.saToken}, input: ${amountsIn}, destination: ${destination})`);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken.fromBigInt(rayDiv(amountsIn.convertTo(this.saToken).amount, this.rate.value)),
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
    gasEstimate() {
        return BigInt(300000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(saTokenInterface.encodeFunctionData('withdraw', [
            destination.address,
            amountsIn.amount,
            true,
        ])), this.saToken.address, 0n, this.gasEstimate(), 'Burn ' + this.saToken.name);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken
                .fromBigInt(rayMul(amountsIn.amount, this.rate.value))
                .convertTo(this.underlying),
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