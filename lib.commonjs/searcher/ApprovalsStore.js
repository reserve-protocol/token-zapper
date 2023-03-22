"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsStore = void 0;
const contracts_1 = require("../contracts");
class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async needsApproval(token, owner, spender) {
        let check = this.cache.get(token);
        if (check == null) {
            check = new Promise((resolve, reject) => {
                void (async () => {
                    try {
                        const allowance = await contracts_1.IERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
                        if (allowance.isZero()) {
                            resolve(true);
                            this.cache.delete(token);
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
            this.cache.set(token, check);
        }
        return await check;
    }
}
exports.ApprovalsStore = ApprovalsStore;
//# sourceMappingURL=ApprovalsStore.js.map