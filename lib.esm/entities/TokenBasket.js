import { Address } from '../base/Address';
import { IBasketHandler__factory, IRToken__factory, } from '../contracts';
export const rTokenIFace = IRToken__factory.createInterface();
export class TokenBasket {
    universe;
    address;
    rToken;
    basketHandler;
    basketNonce = 0;
    unitBasket = [];
    get basketTokens() {
        return this.unitBasket.map((i) => i.token);
    }
    constructor(universe, address, rToken) {
        this.universe = universe;
        this.address = address;
        this.rToken = rToken;
        this.basketHandler = IBasketHandler__factory.connect(address.address, universe.provider);
    }
    async update() {
        // const supply = await IERC20__factory.connect(
        //   this.rToken.address.address,
        //   this.universe.provider
        // ).totalSupply()
        const [nonce, { quantities, erc20s }] = await Promise.all([
            this.basketHandler.nonce(),
            this.basketHandler.quote(this.rToken.scale, 0),
        ]);
        this.basketNonce = nonce;
        this.unitBasket = await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address.fromHexString(erc20s[i]));
            return token.quantityFromBigInt(q.toBigInt());
        }));
    }
}
//# sourceMappingURL=TokenBasket.js.map