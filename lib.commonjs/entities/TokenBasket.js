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
            this.basketHandler.nonce(),
            this.basketHandler.quote(this.rToken.scale, 2),
            // this.basketHandler.basketsNeeded(),
            // await IERC20__factory.connect(
            //   this.rToken.address.address,
            //   this.universe.provider
            // ).totalSupply(),
        ]);
        // this.basketsNeeded = basketsNeeded.toBigInt()
        // this.totalSupply = totalSupply.toBigInt()
        this.basketNonce = nonce;
        this.unitBasket = await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address_1.Address.fromHexString(erc20s[i]));
            return token.fromBigInt(q.toBigInt());
        }));
    }
}
exports.TokenBasket = TokenBasket;
//# sourceMappingURL=TokenBasket.js.map