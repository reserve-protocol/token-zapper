"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBasket = void 0;
const Address_1 = require("../base/Address");
const IBasketHandler__factory_1 = require("../contracts/factories/contracts/IBasketHandler__factory");
const RTokenLens__factory_1 = require("../contracts/factories/contracts/RTokenLens__factory");
class TokenBasket {
    universe;
    basketHandlerAddress;
    rToken;
    assetRegistry;
    version;
    basketHandler;
    lens;
    issueRate = 10n ** 18n;
    basketNonce = 0;
    unitBasket = [];
    basketsNeeded = 0n;
    totalSupply = 0n;
    get basketTokens() {
        return this.unitBasket.map((i) => i.token);
    }
    constructor(universe, basketHandlerAddress, rToken, assetRegistry, version) {
        this.universe = universe;
        this.basketHandlerAddress = basketHandlerAddress;
        this.rToken = rToken;
        this.assetRegistry = assetRegistry;
        this.version = version;
        this.basketHandler = IBasketHandler__factory_1.IBasketHandler__factory.connect(basketHandlerAddress.address, universe.provider);
        this.lens = RTokenLens__factory_1.RTokenLens__factory.connect(universe.config.addresses.rtokenLens.address, universe.provider);
    }
    async update() {
        const [unit, nonce] = await Promise.all([
            this.redeem(this.rToken.one),
            this.basketHandler.nonce(),
        ]);
        this.basketNonce = nonce;
        this.unitBasket = unit;
    }
    async redeem(quantity) {
        const { quantities, erc20s } = await this.lens.callStatic
            .redeem(this.assetRegistry.address, this.basketHandlerAddress.address, this.rToken.address.address, quantity.amount)
            .catch(() => this.basketHandler.quote(quantity.amount, 2));
        return await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address_1.Address.fromHexString(erc20s[i]));
            return token.fromBigInt(q.toBigInt());
        }));
    }
}
exports.TokenBasket = TokenBasket;
//# sourceMappingURL=TokenBasket.js.map