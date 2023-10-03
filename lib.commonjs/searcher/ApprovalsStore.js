"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsStore = void 0;
const IERC20__factory_1 = require("../contracts/factories/contracts/IERC20__factory");
class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async queryAllowance(token, owner, spender) {
        return await IERC20__factory_1.IERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
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
exports.ApprovalsStore = ApprovalsStore;
//# sourceMappingURL=ApprovalsStore.js.map