import { numberOfUnits } from '../entities/Token';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { rTokenIFace } from '../entities/TokenBasket';
export class MintRTokenAction extends Action {
    universe;
    basket;
    async quote(amountsIn) {
        if (amountsIn.length !== this.input.length) {
            throw new Error('Invalid inputs for RToken mint');
        }
        const units = numberOfUnits(amountsIn, this.basket.unitBasket);
        return [this.basket.rToken.quantityFromBigInt(units)];
    }
    async exchange(input, balances) {
        const outputs = await this.quote(input);
        const inputsConsumed = this.basket.unitBasket.map((qty) => outputs[0].convertTo(qty.token).mul(qty));
        balances.exchange(inputsConsumed, outputs);
    }
    async encode(amountsIn, destination) {
        const amount = await this.quote(amountsIn);
        return new ContractCall(parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('issueTo', [
            destination.address,
            amount[0].amount
        ])), this.basket.rToken.address, 0n, 'RToken Issue');
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
    async encode([quantity]) {
        const nonce = await this.basketHandler.basketNonce;
        return new ContractCall(parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('redeem', [quantity.amount, nonce])), this.basketHandler.rToken.address, 0n, 'RToken Burn');
    }
    async quote([quantity]) {
        const quantityPrToken = await this.basketHandler.unitBasket;
        return quantityPrToken.map((qty) => quantity.convertTo(qty.token).mul(qty));
    }
    constructor(universe, basketHandler) {
        super(basketHandler.rToken.address, [basketHandler.rToken], basketHandler.basketTokens, InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.basketHandler = basketHandler;
    }
    toString() {
        return `RTokenBurn(${this.basketHandler.rToken.toString()})`;
    }
}
//# sourceMappingURL=RTokens.js.map