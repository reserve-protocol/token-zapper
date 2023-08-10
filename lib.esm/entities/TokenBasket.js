import { Address } from '../base/Address';
import { IBasketHandler__factory, } from '../contracts/factories/contracts/IBasketHandler__factory';
import { IRToken__factory, } from '../contracts/factories/contracts/IRToken__factory';
'../contracts/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory';
export const rTokenIFace = IRToken__factory.createInterface();
export class TokenBasket {
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
        this.basketHandler = IBasketHandler__factory.connect(address.address, universe.provider);
    }
    async update() {
        const [nonce, { quantities, erc20s }] = await Promise.all([
            this.basketHandler.callStatic.nonce(),
            this.basketHandler.callStatic.quote(this.rToken.scale.toString(), 2),
        ]);
        this.basketNonce = nonce;
        this.unitBasket = await Promise.all(quantities.map(async (q, i) => {
            const token = await this.universe.getToken(Address.fromHexString(erc20s[i]));
            return token.fromBigInt(q.toBigInt());
        }));
    }
}
//# sourceMappingURL=TokenBasket.js.map