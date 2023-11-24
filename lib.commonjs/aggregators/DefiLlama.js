"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefillama = exports.fetchQuote = exports.protocol = void 0;
const Action_1 = require("../action/Action");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const constants_1 = require("../base/constants");
const utils_1 = require("../base/utils");
const Swap_1 = require("../searcher/Swap");
const DexAggregator_1 = require("./DexAggregator");
const CHAIN_SLUG = {
    1: 'ethereum',
    8453: 'base',
};
const tokenToDefillameAddress = (token) => {
    if (token.address.address === constants_1.GAS_TOKEN_ADDRESS) {
        // Remap to address 0
        return constants_1.ZERO;
    }
    return token.address.address.toLowerCase();
};
const tokenToRequest = (universe, token, chainId) => {
    const address = tokenToDefillameAddress(token);
    const out = {
        volume24h: 145686469.40093708,
        address: address,
        chainId: chainId,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        label: token.symbol,
        value: address,
        logoURI: 'https://token-icons.llamao.fi/icons/tokens/1/' + address + '?h=20&w=20',
        logoURI2: 'https://token-icons.llamao.fi/icons/tokens/1/' + address,
        tags: ['tokens'],
        geckoId: null,
        wrappedNative: universe.config.addresses.wrappedNative === token.address,
    };
    if (out.wrappedNative === false) {
        delete out.wrappedNative;
    }
    return out;
};
exports.protocol = {
    Matcha: 'Matcha/0x',
    Hashflow: 'Hashflow',
};
const fetchQuote = async (protocol, universe, { userAddress, destination, quantity: qty, output, chainId, slippage, }) => {
    if (CHAIN_SLUG[chainId] == null) {
        throw new Error(`Chain ${chainId} not supported`);
    }
    const feeData = await universe.provider.getFeeData();
    const request = {
        gasPriceData: {
            formatted: {
                gasPrice: feeData.gasPrice?.toString(),
                maxFeePerGas: feeData.maxFeePerGas?.toString(),
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
            },
            ...feeData,
        },
        userAddress: userAddress.address.toLowerCase(),
        fromToken: tokenToRequest(universe, qty.token, chainId),
        toToken: tokenToRequest(universe, output, chainId),
        slippage: slippage / 10000,
        amount: qty.format(),
        isPrivacyEnabled: false,
        amountOut: 0,
    };
    const BASE = 'https://swap-api.defillama.com/dexAggregatorQuote';
    const url = `${BASE}?api_key=zT82BQ38E5unVRDGswzgUzfM2yyaQBK8mFBrzTzX6s&protocol=Matcha/0x&chain=${CHAIN_SLUG[chainId]}&from=${qty.token.address.address.toLowerCase()}&to=${output.address.address.toLowerCase()}&amount=${qty.amount.toString()}`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
        },
    });
    const json = await response.json();
    return json;
};
exports.fetchQuote = fetchQuote;
class DefillamaAction extends Action_1.Action {
    request;
    quantityIn;
    universe;
    slippage;
    protocol;
    outputQuantity = [];
    constructor(request, quantityIn, output, universe, slippage, protocol) {
        super(Address_1.Address.from(request.tokenApprovalAddress), [quantityIn.token], [output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [
            new Approval_1.Approval(quantityIn.token, Address_1.Address.from(request.tokenApprovalAddress)),
        ]);
        this.request = request;
        this.quantityIn = quantityIn;
        this.universe = universe;
        this.slippage = slippage;
        this.protocol = protocol;
        const amount = BigInt(this.request.amountReturned);
        const minOut = amount - (amount / 10000n) * BigInt(this.slippage);
        const out = this.output[0].from(minOut);
        this.outputQuantity = [out];
    }
    toString() {
        return `DefiLama[${this.protocol}](${this.quantityIn} => ${this.outputQuantity}})`;
    }
    async quote(_) {
        return this.outputQuantity;
    }
    gasEstimate() {
        return BigInt(this.request.rawQuote.estimatedGas);
    }
    async encode(inputs, __) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.request.rawQuote.data), Address_1.Address.from(this.request.rawQuote.to), 0n, this.gasEstimate(), `DefiLlama(${this.address}) (${inputs.join(',')}) -> (${this.outputQuantity})`);
    }
}
const createDefillama = (aggregatorName, universe, slippage, protocol) => {
    return new DexAggregator_1.DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await (0, exports.fetchQuote)(protocol, universe, {
            userAddress: universe.config.addresses.zapperAddress,
            destination,
            quantity: input,
            output,
            chainId: universe.chainId,
            slippage,
        });
        return await new Swap_1.SwapPlan(universe, [
            new DefillamaAction(req, input, output, universe, slippage, protocol),
        ]).quote([input], destination);
    });
};
exports.createDefillama = createDefillama;
//# sourceMappingURL=DefiLlama.js.map