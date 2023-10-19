"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryEach = exports.tryAll = exports.all = void 0;
const deploylessMulticall_json_1 = __importDefault(require("./abi/deploylessMulticall.json"));
const deploylessMulticall2_json_1 = __importDefault(require("./abi/deploylessMulticall2.json"));
const deploylessMulticall3_json_1 = __importDefault(require("./abi/deploylessMulticall3.json"));
const multicall_json_1 = __importDefault(require("./abi/multicall.json"));
const multicall2_json_1 = __importDefault(require("./abi/multicall2.json"));
const multicall3_json_1 = __importDefault(require("./abi/multicall3.json"));
const abi_1 = __importDefault(require("./abi"));
const multicall_1 = require("./multicall");
const contracts_1 = require("@ethersproject/contracts");
const bytes_1 = require("@ethersproject/bytes");
async function all(provider, multicall, calls, overrides) {
    const contract = multicall
        ? new contracts_1.Contract(multicall.address, multicall_json_1.default, provider)
        : null;
    const callRequests = calls.map((call) => {
        const callData = abi_1.default.encode(call.name, call.inputs, call.params);
        return {
            target: call.contract.address,
            callData,
        };
    });
    const response = contract
        ? await contract.aggregate(callRequests, overrides || {})
        : await callDeployless(provider, callRequests, overrides?.blockTag);
    const callCount = calls.length;
    const callResult = [];
    for (let i = 0; i < callCount; i++) {
        const name = calls[i].name;
        const outputs = calls[i].outputs;
        const returnData = response.returnData[i];
        const params = abi_1.default.decode(name, outputs, returnData);
        const result = outputs.length === 1 ? params[0] : params;
        callResult.push(result);
    }
    return callResult;
}
exports.all = all;
async function tryAll(provider, multicall2, calls, overrides) {
    const contract = multicall2
        ? new contracts_1.Contract(multicall2.address, multicall2_json_1.default, provider)
        : null;
    const callRequests = calls.map((call) => {
        const callData = abi_1.default.encode(call.name, call.inputs, call.params);
        return {
            target: call.contract.address,
            callData,
        };
    });
    const response = contract
        ? await contract.tryAggregate(false, callRequests, overrides || {})
        : await callDeployless2(provider, callRequests, overrides?.blockTag);
    const callCount = calls.length;
    const callResult = [];
    for (let i = 0; i < callCount; i++) {
        const name = calls[i].name;
        const outputs = calls[i].outputs;
        const result = response[i];
        if (!result.success) {
            callResult.push(null);
        }
        else {
            try {
                const params = abi_1.default.decode(name, outputs, result.returnData);
                const data = outputs.length === 1 ? params[0] : params;
                callResult.push(data);
            }
            catch (e) {
                // Failed to decode the data: most likely calling non-existing contract
                callResult.push(null);
            }
        }
    }
    return callResult;
}
exports.tryAll = tryAll;
async function tryEach(provider, multicall3, calls, overrides) {
    const contract = multicall3
        ? new contracts_1.Contract(multicall3.address, multicall3_json_1.default, provider)
        : null;
    const callRequests = calls.map((call) => {
        const callData = abi_1.default.encode(call.name, call.inputs, call.params);
        return {
            target: call.contract.address,
            allowFailure: call.canFail,
            callData,
        };
    });
    const response = contract
        ? await contract.aggregate3(callRequests, overrides || {})
        : await callDeployless3(provider, callRequests, overrides?.blockTag);
    const callCount = calls.length;
    const callResult = [];
    for (let i = 0; i < callCount; i++) {
        const name = calls[i].name;
        const outputs = calls[i].outputs;
        const result = response[i];
        if (!result.success) {
            callResult.push(null);
        }
        else {
            try {
                const params = abi_1.default.decode(name, outputs, result.returnData);
                const data = outputs.length === 1 ? params[0] : params;
                callResult.push(data);
            }
            catch (e) {
                // Failed to decode the data: most likely calling non-existing contract
                callResult.push(null);
            }
        }
    }
    return callResult;
}
exports.tryEach = tryEach;
async function callDeployless(provider, callRequests, block) {
    const inputAbi = deploylessMulticall_json_1.default;
    const constructor = inputAbi.find((f) => f.type === 'constructor');
    const inputs = constructor?.inputs || [];
    const args = abi_1.default.encodeConstructor(inputs, [callRequests]);
    const data = (0, bytes_1.concat)([multicall_1.deploylessMulticallBytecode, args]);
    const callData = await provider.call({ data: data }, block);
    const outputAbi = multicall_json_1.default;
    const outputFunc = outputAbi.find((f) => f.type === 'function' && f.name === 'aggregate');
    const name = outputFunc?.name || '';
    const outputs = outputFunc?.outputs || [];
    const response = abi_1.default.decode(name, outputs, callData);
    return response;
}
async function callDeployless2(provider, callRequests, block) {
    const inputAbi = deploylessMulticall2_json_1.default;
    const constructor = inputAbi.find((f) => f.type === 'constructor');
    const inputs = constructor?.inputs || [];
    const args = abi_1.default.encodeConstructor(inputs, [false, callRequests]);
    const data = (0, bytes_1.concat)([multicall_1.deploylessMulticall2Bytecode, args]);
    const callData = await provider.call({ data: data }, block);
    const outputAbi = multicall2_json_1.default;
    const outputFunc = outputAbi.find((f) => f.type === 'function' && f.name === 'tryAggregate');
    const name = outputFunc?.name || '';
    const outputs = outputFunc?.outputs || [];
    // Note "[0]": low-level calls don't automatically unwrap tuple output
    const response = abi_1.default.decode(name, outputs, callData)[0];
    return response;
}
async function callDeployless3(provider, callRequests, block) {
    const inputAbi = deploylessMulticall3_json_1.default;
    const constructor = inputAbi.find((f) => f.type === 'constructor');
    const inputs = constructor?.inputs || [];
    const args = abi_1.default.encodeConstructor(inputs, [callRequests]);
    const data = (0, bytes_1.concat)([multicall_1.deploylessMulticall3Bytecode, args]);
    const callData = await provider.call({ data: data }, block);
    const outputAbi = multicall3_json_1.default;
    const outputFunc = outputAbi.find((f) => f.type === 'function' && f.name === 'aggregate3');
    const name = outputFunc?.name || '';
    const outputs = outputFunc?.outputs || [];
    // Note "[0]": low-level calls don't automatically unwrap tuple output
    const response = abi_1.default.decode(name, outputs, callData)[0];
    return response;
}
//# sourceMappingURL=call.js.map