import { ERC20__factory } from '../contracts/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory';
export class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async queryAllowance(token, owner, spender) {
        return await ERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
    }
    async needsApproval(token, owner, spender, amount) {
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
export class MokcApprovalsStore extends ApprovalsStore {
    constructor() {
        super(null);
    }
    async needsApproval(token, owner, spender, amount) {
        return true;
    }
}
//# sourceMappingURL=ApprovalsStore.js.map