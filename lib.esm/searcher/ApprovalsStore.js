import { IERC20__factory } from '../contracts';
export class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async needsApproval(token, owner, spender) {
        const key = `${token}.${owner}.${spender}`;
        let check = this.cache.get(key);
        if (check == null) {
            check = new Promise((resolve, reject) => {
                void (async () => {
                    try {
                        const allowance = await IERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
                        if (allowance.isZero()) {
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