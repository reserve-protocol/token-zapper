"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsStore = void 0;
const constants_1 = require("../base/constants");
const contracts_1 = require("../contracts");
class ApprovalsStore {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    cache = new Map();
    async queryAllowance(token, owner, spender) {
        return await contracts_1.IERC20__factory.connect(token.address.address, this.provider).allowance(owner.address, spender.address);
    }
    async queryBalance(token, owner, universe) {
        if (token === universe.nativeToken) {
            return token.from(await this.provider.getBalance(owner.address));
        }
        return token.from(await contracts_1.IERC20__factory.connect(token.address.address, this.provider).balanceOf(owner.address));
    }
    async needsApproval(token, owner, spender, amount) {
        if (token.address.address === constants_1.GAS_TOKEN_ADDRESS) {
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
exports.ApprovalsStore = ApprovalsStore;
//# sourceMappingURL=ApprovalsStore.js.map