"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCustomRouterSimulator = exports.createSimulatorThatUsesOneOfReservesCallManyProxies = exports.simulateZapTransactionUsingProviderDecodeResult = exports.createSimulateZapTransactionUsingProvider = exports.decodeSimulationFunctionOutput = void 0;
const abi_coder_1 = require("@ethersproject/abi/lib/abi-coder");
const ethers_1 = require("ethers");
const constants_1 = require("../base/constants");
const decodeSimulationFunctionOutput = (data) => {
    const [[dust, amountOut, gasUsed]] = abi_coder_1.defaultAbiCoder.decode(['(uint256[],uint256,uint256)'], data);
    const out = {
        dust,
        amountOut: amountOut,
        gasUsed: gasUsed,
    };
    return out;
};
exports.decodeSimulationFunctionOutput = decodeSimulationFunctionOutput;
/**
 *
 * @param provider an ethers provider
 * @param input The input of the zap transaction & setup
 * @returns The output of the zap transaction, assuming that the from user has
 *         the required balance and approval setup beforehand. This is only meant as a
 *         solution for example purposes. For UIs this would not be a good solution
 *         as it requires the user to have the correct balance and approval setup beforehand
 *         to correctly preview the result.
 * @note It will obviously revert if approvals or balances are not setup correctly
 */
const createSimulateZapTransactionUsingProvider = (provider) => async (input) => {
    const data = await provider.call({
        to: input.to,
        from: input.from,
        data: input.data,
        value: input.value,
    });
    return data;
};
exports.createSimulateZapTransactionUsingProvider = createSimulateZapTransactionUsingProvider;
// Default implementation of the simulation function, using the provider
// It works well for zaps that zaps using ETH as the input
const simulateZapTransactionUsingProviderDecodeResult = async (provider, input) => {
    const data = await provider.send('eth_call', [
        {
            to: input.to,
            from: input.from,
            data: input.data,
            value: input.value,
        },
        'latest',
        {
            [input.from]: {
                balance: '0x56bc75e2d6310000000',
            },
        },
    ]);
    return (0, exports.decodeSimulationFunctionOutput)(data);
};
exports.simulateZapTransactionUsingProviderDecodeResult = simulateZapTransactionUsingProviderDecodeResult;
const createSimulatorThatUsesOneOfReservesCallManyProxies = (chainId) => {
    const url = constants_1.simulationUrls[chainId];
    if (url == null) {
        throw new Error('No proxies for this chain yet');
    }
    return async (input) => {
        const body = JSON.stringify({
            from: input.from,
            to: input.to,
            data: input.data,
            gasLimit: 10_000_000,
            value: '0x' + input.value.toString(16),
            quantity: '0x' + input.setup.userBalanceAndApprovalRequirements.toString(16),
            token: input.setup.inputTokenAddress,
        });
        const a = await (await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        })).json();
        if (a.error != null) {
            throw new Error(a.error);
        }
        return a.data;
    };
};
exports.createSimulatorThatUsesOneOfReservesCallManyProxies = createSimulatorThatUsesOneOfReservesCallManyProxies;
const makeCustomRouterSimulator = (url, whales, addreses) => {
    whales = Object.fromEntries(Object.entries(whales).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()]));
    return async (input) => {
        const whale = whales[input.setup.inputTokenAddress.toLowerCase()];
        if (whale == null) {
            console.log('No whale for token ' +
                input.setup.inputTokenAddress +
                ', so will not fund the sender with funds');
        }
        const body = {
            setupApprovals: [
                {
                    owner: input.from,
                    token: input.setup.inputTokenAddress,
                    spender: input.to,
                    value: '0x' + ethers_1.constants.MaxUint256.toBigInt().toString(16),
                },
            ],
            moveFunds: whale != null
                ? [
                    {
                        owner: whale,
                        token: input.setup.inputTokenAddress,
                        spender: input.from,
                        quantity: '0x' +
                            input.setup.userBalanceAndApprovalRequirements.toString(16),
                    },
                ]
                : [],
            transactions: [
                {
                    from: input.from,
                    to: input.to,
                    data: input.data,
                    gas: '0x' + (25_000_000).toString(16),
                    gasPrice: '0x1',
                    value: '0x' + input.value.toString(16),
                },
            ],
            stateOverride: {
                [input.from]: {
                    balance: '0x56bc75e2d6310000000',
                },
            },
        };
        // if (addreses) {
        //   body.stateOverride[addreses.executorAddress.address] = {
        //     code: byteCode,
        //   }
        // }
        if (whale) {
            body.stateOverride[whale] = {
                balance: '0x56bc75e2d6310000000',
            };
        }
        const encodedBody = JSON.stringify(body, null, 2);
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encodedBody,
        });
        if (resp.status !== 200) {
            throw new Error(`Failed to simulate zap, status ${resp.status}`);
        }
        const results = await resp.json();
        const resultOfZap = results[results.length - 1];
        if (resultOfZap.error) {
            if (resultOfZap.error.value != null) {
                return resultOfZap.error.value;
            }
            throw new Error(resultOfZap.error.error);
        }
        return resultOfZap.success.value;
    };
};
exports.makeCustomRouterSimulator = makeCustomRouterSimulator;
//# sourceMappingURL=ZapSimulation.js.map