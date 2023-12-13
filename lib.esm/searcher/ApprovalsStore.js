import { IERC20__factory } from '../contracts/factories/contracts/IERC20__factory';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
export class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async queryAllowance(token, owner, spender) {
        return await IERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
    }
    async queryBalance(token, owner, universe) {
        if (token === universe.nativeToken) {
            return token.from(await this.provider.getBalance(owner.address));
        }
        return token.from(await IERC20__factory.connect(token.address.address, this.provider).balanceOf(owner.address));
    }
    async needsApproval(token, owner, spender, amount) {
        if (token.address.address === GAS_TOKEN_ADDRESS) {
            return false;
        }
        const key = `${token}.${owner}.${spender}`;
        let check = this.cache.get(key);
        if (check == null) {
            check = new Promise((resolve, reject) => {
                void (async () => {
                    try {
                        const allowance = await this.queryAllowance(token, owner, spender);
                        if (allowance.lt(amount)) {
                            resolve(true);
                            this.cache.delete(key);
                        }
                        else {
                            resolve(false);
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                })();
            });
            this.cache.set(key, check);
        }
        return await check;
    }
}
//# sourceMappingURL=ApprovalsStore.js.map