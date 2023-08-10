"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MokcApprovalsStore = exports.ApprovalsStore = void 0;
const ERC20__factory_1 = require("../contracts/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory");
class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async queryAllowance(token, owner, spender) {
        return await ERC20__factory_1.ERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
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
class MokcApprovalsStore extends ApprovalsStore {
    constructor() {
        super(null);
    }
    async needsApproval(token, owner, spender, amount) {
        return true;
    }
}
exports.MokcApprovalsStore = MokcApprovalsStore;
//# sourceMappingURL=ApprovalsStore.js.map