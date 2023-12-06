import { numberOfUnits, } from '../entities/Token';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { IRToken__factory } from '../contracts';
const rTokenIFace = IRToken__factory.createInterface();
export class MintRTokenAction extends Action {
    universe;
    basket;
    gasEstimate() {
        return BigInt(600000n);
    }
    get outputSlippage() {
        return 3000000n;
    }
    async quote(amountsIn) {
        await this.universe.refresh(this.address);
        if (amountsIn.length !== this.input.length) {
            throw new Error('Invalid inputs for RToken mint');
        }
        const unitsRequested = numberOfUnits(amountsIn, this.basket.unitBasket);
        return [
            this.basket.rToken.fromBigInt(unitsRequested),
        ];
    }
    async exchange(input, balances) {
        const outputs = await this.quote(input);
        const inputsConsumed = this.basket.unitBasket.map((qty) => outputs[0].into(qty.token).mul(qty));
        balances.exchange(inputsConsumed, outputs);
    }
    async encode(amountsIn, destination) {
        const units = (await this.quote(amountsIn))[0];
        return this.encodeIssueTo(amountsIn, units, destination);
    }
    async encodeIssueTo(amountsIn, units, destination) {
        return new ContractCall(parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('issueTo', [
            destination.address,
            units.amount,
        ])), this.basket.rToken.address, 0n, this.gasEstimate(), `Issue RToken(${this.basket.rToken},input:${amountsIn},issueAmount:${units},destination: ${destination})`);
    }
    constructor(universe, basket) {
        super(basket.rToken.address, basket.basketTokens, [basket.rToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, basket.basketTokens.map((input) => new Approval(input, basket.rToken.address)));
        this.universe = universe;
        this.basket = basket;
    }
    interactionConvention = InteractionConvention.ApprovalRequired;
    proceedsOptions = DestinationOptions.Recipient;
    toString() {
        return `RTokenMint(${this.basket.rToken.toString()})`;
    }
}
export class BurnRTokenAction extends Action {
    universe;
    basketHandler;
    get outputSlippage() {
        return 300000n;
    }
    gasEstimate() {
        return BigInt(600000n);
    }
    async encode([quantity], destination) {
        return new ContractCall(parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('redeem', [quantity.amount])), this.basketHandler.rToken.address, 0n, this.gasEstimate(), `Burn RToken(${this.output.join(",")},input:${quantity},destination: ${destination})`);
    }
    async quote([quantity]) {
        await this.universe.refresh(this.address);
        return await this.basketHandler.redeem(quantity);
    }
    constructor(universe, basketHandler) {
        super(basketHandler.rToken.address, [basketHandler.rToken], basketHandler.basketTokens, InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.basketHandler = basketHandler;
    }
    toString() {
        return `RTokenBurn(${this.basketHandler.rToken.toString()})`;
    }
}
//# sourceMappingURL=RTokens.js.map