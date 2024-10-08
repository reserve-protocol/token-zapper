"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a deployed contract. Generates a Call per each request.
 * Call generation has a syntax similar to ethers.
 * @example
 * const daiContract = new Contract(daiAddress, erc20Abi);
 * daiContract.balanceOf(address); // returns a Call object
 */
class Contract {
    #address;
    #functions;
    /**
     * Create a contract.
     * @param address Address of the contract
     * @param abi ABI of the contract
     */
    constructor(address, abi) {
        this.#address = address;
        this.#functions = abi.filter((x) => x.type === 'function');
        const callFunctions = this.#functions.filter((x) => x.stateMutability === 'pure' || x.stateMutability === 'view');
        for (const callFunction of callFunctions) {
            const name = callFunction.name;
            if (!name) {
                continue;
            }
            const getCall = this.#makeCallFunction(name);
            if (!this[name]) {
                Object.defineProperty(this, name, {
                    enumerable: true,
                    value: getCall,
                    writable: false,
                });
            }
        }
    }
    #makeCallFunction(name) {
        return (...params) => {
            const address = this.#address;
            const func = this.#functions.find((f) => f.name === name);
            const inputs = func?.inputs || [];
            const outputs = func?.outputs || [];
            return {
                contract: {
                    address,
                },
                name,
                inputs,
                outputs,
                params,
            };
        };
    }
}
exports.default = Contract;
//# sourceMappingURL=contract.js.map