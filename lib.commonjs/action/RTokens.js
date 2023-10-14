"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnRTokenAction = exports.MintRTokenAction = void 0;
const Token_1 = require("../entities/Token");
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const rTokenIFace = contracts_1.IRToken__factory.createInterface();
class MintRTokenAction extends Action_1.Action {
    universe;
    basket;
    gasEstimate() {
        return BigInt(600000n);
    }
    async quote(amountsIn) {
        await this.universe.refresh(this.address);
        if (amountsIn.length !== this.input.length) {
            throw new Error('Invalid inputs for RToken mint');
        }
        const unitsRequested = (0, Token_1.numberOfUnits)(amountsIn, this.basket.unitBasket);
        const out = unitsRequested - unitsRequested / 3000000n;
        return [
            this.basket.rToken.fromBigInt(out),
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
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(rTokenIFace.encodeFunctionData('issueTo', [
            destination.address,
            units.amount,
        ])), this.basket.rToken.address, 0n, this.gasEstimate(), `Issue RToken(${this.basket.rToken},input:${amountsIn},issueAmount:${units},destination: ${destination})`);
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
    gasEstimate() {
        return BigInt(600000n);
    }
    async encode([quantity]) {
        const nonce = await this.basketHandler.basketNonce;
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(rTokenIFace.encodeFunctionData('redeem', [quantity.amount, nonce])), this.basketHandler.rToken.address, 0n, this.gasEstimate(), 'RToken Burn');
    }
    async quote([quantity]) {
        await this.universe.refresh(this.address);
        const quantityPrToken = this.basketHandler.unitBasket;
        return quantityPrToken.map((qty) => quantity.into(qty.token).mul(qty));
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