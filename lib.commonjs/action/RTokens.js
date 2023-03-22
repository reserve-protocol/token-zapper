"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnRTokenAction = exports.MintRTokenAction = void 0;
const Token_1 = require("../entities/Token");
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const TokenBasket_1 = require("../entities/TokenBasket");
class MintRTokenAction extends Action_1.Action {
    universe;
    basket;
    async quote(amountsIn) {
        if (amountsIn.length !== this.input.length) {
            throw new Error('Invalid inputs for RToken mint');
        }
        const units = (0, Token_1.numberOfUnits)(amountsIn, this.basket.unitBasket);
        return [this.basket.rToken.quantityFromBigInt(units)];
    }
    async exchange(input, balances) {
        const outputs = await this.quote(input);
        const inputsConsumed = this.basket.unitBasket.map((qty) => outputs[0].convertTo(qty.token).mul(qty));
        balances.exchange(inputsConsumed, outputs);
    }
    async encode(amountsIn, destination) {
        const amount = await this.quote(amountsIn);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(TokenBasket_1.rTokenIFace.encodeFunctionData('issueTo', [
            destination.address,
            amount[0].amount
        ])), this.basket.rToken.address, 0n, 'RToken Issue');
    }
    constructor(universe, basket) {
        super(basket.rToken.address, basket.basketTokens, [basket.rToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, basket.basketTokens.map((input) => new Approval_1.Approval(input, basket.rToken.address)));
        this.universe = universe;
        this.basket = basket;
    }
    interactionConvention = Action_1.InteractionConvention.ApprovalRequired;
    proceedsOptions = Action_1.DestinationOptions.Recipient;
    toString() {
        return `RTokenMint(${this.basket.rToken.toString()})`;
    }
}
exports.MintRTokenAction = MintRTokenAction;
class BurnRTokenAction extends Action_1.Action {
    universe;
    basketHandler;
    async encode([quantity]) {
        const nonce = await this.basketHandler.basketNonce;
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(TokenBasket_1.rTokenIFace.encodeFunctionData('redeem', [quantity.amount, nonce])), this.basketHandler.rToken.address, 0n, 'RToken Burn');
    }
    async quote([quantity]) {
        const quantityPrToken = await this.basketHandler.unitBasket;
        return quantityPrToken.map((qty) => quantity.convertTo(qty.token).mul(qty));
    }
    constructor(universe, basketHandler) {
        super(basketHandler.rToken.address, [basketHandler.rToken], basketHandler.basketTokens, Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.basketHandler = basketHandler;
    }
    toString() {
        return `RTokenBurn(${this.basketHandler.rToken.toString()})`;
    }
}
exports.BurnRTokenAction = BurnRTokenAction;
//# sourceMappingURL=RTokens.js.map