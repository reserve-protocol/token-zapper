"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const call_1 = require("./call");
const calls_1 = tslib_1.__importDefault(require("./calls"));
const multicall_1 = require("./multicall");
/**
 * Represents a Multicall provider. Used to execute multiple Calls.
 */
class Provider {
    #provider;
    #config;
    #multicall;
    #multicall2;
    #multicall3;
    /**
     * Create a provider.
     * @param provider ethers provider
     * @param chainId Network chain
     * @param config Provider configuration
     */
    constructor(chainId, provider, config) {
        this.#provider = provider;
        this.#config = config || {};
        this.#multicall = this.#getMulticall(chainId, 1);
        this.#multicall2 = this.#getMulticall(chainId, 2);
        this.#multicall3 = this.#getMulticall(chainId, 3);
    }
    /**
     * Make one call to the multicall contract to retrieve eth balance of the given address.
     * @param address Address of the account you want to look up
     * @returns Ether balance fetching call
     */
    getEthBalance(address) {
        const multicall = this.#multicall3 || this.#multicall2 || this.#multicall;
        if (!multicall) {
            throw Error('Multicall contract is not available on this network.');
        }
        return (0, calls_1.default)(address, multicall.address);
    }
    /**
     * Aggregate multiple calls into one call.
     * Reverts when any of the calls fails.
     * For ignoring the success of each call, use {@link tryAll} instead.
     * @param calls Array of Call objects containing information about each read call
     * @param block Block number for this call
     * @returns List of fetched data
     */
    async all(calls, overrides) {
        if (!this.#provider) {
            throw Error('Provider should be initialized before use.');
        }
        const multicall = this.#getContract('BASIC', overrides?.blockTag);
        const provider = this.#provider;
        return await (0, call_1.all)(provider, multicall, calls, overrides);
    }
    /**
     * Aggregate multiple calls into one call.
     * If any of the calls fail, it returns a null value in place of the failed call's return data.
     * @param calls Array of Call objects containing information about each read call
     * @param block Block number for this call
     * @returns List of fetched data. Failed calls will result in null values.
     */
    async tryAll(calls, overrides) {
        if (!this.#provider) {
            throw Error('Provider should be initialized before use.');
        }
        const multicall = this.#getContract('TRY_ALL', overrides?.blockTag);
        const provider = this.#provider;
        return await (0, call_1.tryAll)(provider, multicall, calls, overrides);
    }
    /**
     * Aggregates multiple calls into one call.
     * If any of the calls that are allowed to fail do fail,
     * it returns a null value in place of the failed call's return data.
     * @param calls Array of Call objects containing information about each read call
     * @param canFail Array of booleans specifying whether each call can fail
     * @param block Block number for this call
     * @returns List of fetched data. Failed calls will result in null values.
     */
    async tryEach(calls, canFail, overrides) {
        if (!this.#provider) {
            throw Error('Provider should be initialized before use.');
        }
        const multicall = this.#getContract('TRY_EACH', overrides?.blockTag);
        const provider = this.#provider;
        const failableCalls = calls.map((call, index) => {
            return {
                ...call,
                canFail: canFail[index],
            };
        });
        return await (0, call_1.tryEach)(provider, multicall, failableCalls, overrides);
    }
    #getContract(call, block) {
        const multicall = this.#isAvailable(this.#multicall, block)
            ? this.#multicall
            : null;
        const multicall2 = this.#isAvailable(this.#multicall2, block)
            ? this.#multicall2
            : null;
        const multicall3 = this.#isAvailable(this.#multicall3, block)
            ? this.#multicall3
            : null;
        switch (call) {
            case 'BASIC':
                return multicall3 || multicall2 || multicall;
            case 'TRY_ALL':
                return multicall3 || multicall2;
            case 'TRY_EACH':
                return multicall3;
        }
    }
    #isAvailable(multicall, block) {
        if (!multicall) {
            return false;
        }
        if (!block) {
            return true;
        }
        if (block === 'latest' || block === 'pending') {
            return true;
        }
        return multicall.block < block;
    }
    #getMulticall(chainId, version) {
        function getRegistryMulticall(chainId, version) {
            switch (version) {
                case 1:
                    return (0, multicall_1.getMulticall)(chainId);
                case 2:
                    return (0, multicall_1.getMulticall2)(chainId);
                case 3:
                    return (0, multicall_1.getMulticall3)(chainId);
            }
        }
        const customMulticall = this.#config?.multicall;
        if (!customMulticall) {
            return getRegistryMulticall(chainId, version);
        }
        const address = customMulticall.address;
        if (!address) {
            return getRegistryMulticall(chainId, version);
        }
        return {
            address,
            block: customMulticall.block || 0,
        };
    }
}
exports.default = Provider;
//# sourceMappingURL=provider.js.map