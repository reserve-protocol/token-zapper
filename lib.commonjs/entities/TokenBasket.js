"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBasket = exports.rTokenIFace = void 0;
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
exports.rTokenIFace = contracts_1.IRToken__factory.createInterface();
class TokenBasket {
    universe;
    address;
    rToken;
    basketHandler;
    issueRate = 10n ** 18n;
    basketNonce = 0;
    unitBasket = [];
    basketsNeeded = 0n;
    totalSupply = 0n;
    get basketTokens() {
        return this.unitBasket.map((i) => i.token);
    }
    constructor(universe, address, rToken) {
        this.universe = universe;
        this.address = address;
        this.rToken = rToken;
        this.basketHandler = contracts_1.IBasketHandler__factory.connect(address.address, universe.provider);
    }
    async update() {
        const [nonce, { quantities, erc20s }] = await Promise.all([
            this.basketHandler.callStatic.nonce(),
            this.basketHandler.callStatic.quote(this.rToken.scale.toString(), 2),
        ]);
        this.basketNonce = nonce;
        this.unitBasket = await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address_1.Address.fromHexString(erc20s[i]));
            return token.fromBigInt(q.toBigInt());
        }));
    }
}
exports.TokenBasket = TokenBasket;
//# sourceMappingURL=TokenBasket.js.map