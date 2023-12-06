import { Address } from '../base/Address';
import { IBasketHandler__factory } from '../contracts/factories/contracts/IBasketHandler__factory';
import { RTokenLens__factory } from '../contracts/factories/contracts/RTokenLens__factory';
export class TokenBasket {
    universe;
    basketHandlerAddress;
    rToken;
    assetRegistry;
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
    constructor(universe, basketHandlerAddress, rToken, assetRegistry) {
        this.universe = universe;
        this.basketHandlerAddress = basketHandlerAddress;
        this.rToken = rToken;
        this.assetRegistry = assetRegistry;
        this.basketHandler = IBasketHandler__factory.connect(basketHandlerAddress.address, universe.provider);
        this.lens = RTokenLens__factory.connect(universe.config.addresses.rtokenLens.address, universe.provider);
    }
    async update() {
        const [unit, nonce] = await Promise.all([
            this.redeem(this.rToken.one),
            this.basketHandler.nonce()
        ]);
        this.basketNonce = nonce;
        this.unitBasket = unit;
    }
    async redeem(quantity) {
        const { quantities, erc20s } = await this.lens.callStatic.redeem(this.assetRegistry.address, this.basketHandlerAddress.address, this.rToken.address.address, quantity.amount).catch(() => this.basketHandler.quote(quantity.amount, 2));
        return await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address.fromHexString(erc20s[i]));
            return token.fromBigInt(q.toBigInt());
        }));
    }
}
//# sourceMappingURL=TokenBasket.js.map