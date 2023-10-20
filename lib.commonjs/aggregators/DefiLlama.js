"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefillama = exports.fetchQuote = void 0;
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
    return token.address.address;
};
const tokenToRequest = (token, chainId) => {
    const address = tokenToDefillameAddress(token);
    return {
        address: address,
        chainId: chainId,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        label: token.symbol,
        value: address,
        geckoId: null,
    };
};
const fetchQuote = async ({ userAddress, destination, quantity: qty, output, chainId, slippage, }) => {
    if (CHAIN_SLUG[chainId] == null) {
        throw new Error(`Chain ${chainId} not supported`);
    }
    const request = {
        userAddress: userAddress.address,
        fromToken: tokenToRequest(qty.token, chainId),
        toToken: tokenToRequest(output, chainId),
        slippage,
        amount: qty.format(),
        isPrivacyEnabled: false,
        amountOut: 0,
    };
    const BASE = 'https://swap-api.defillama.com/dexAggregatorQuote';
    const response = await fetch(`${BASE}?api_key=zT82BQ38E5unVRDGswzgUzfM2yyaQBK8mFBrzTzX6s&protocol=Matcha/0x&chain=${CHAIN_SLUG[chainId]}&from=${userAddress.address}&to=${destination}&amount=${qty.amount.toString()}`, {
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
    constructor(request, quantityIn, output, universe, slippage) {
        super(Address_1.Address.from(request.tokenApprovalAddress), [quantityIn.token], [output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [
            new Approval_1.Approval(quantityIn.token, Address_1.Address.from(request.tokenApprovalAddress)),
        ]);
        this.request = request;
        this.quantityIn = quantityIn;
        this.universe = universe;
        this.slippage = slippage;
    }
    async quote(_) {
        const amount = BigInt(this.request.amountReturned);
        const minOut = amount - (amount / 10000n) * BigInt(this.slippage);
        const out = this.output[0].from(minOut);
        return [out];
    }
    gasEstimate() {
        return BigInt(this.request.rawQuote.estimatedGas);
    }
    async encode(inputs, __) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.request.rawQuote.data), Address_1.Address.from(this.request.rawQuote.to), 0n, this.gasEstimate(), `Kyberswap(${this.address}) (${inputs.join(',')}) -> (${await this.quote(inputs)})`);
    }
}
const createDefillama = (aggregatorName, universe, slippage) => {
    return new DexAggregator_1.DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await (0, exports.fetchQuote)({
            userAddress: universe.config.addresses.zapperAddress,
            destination,
            quantity: input,
            output,
            chainId: universe.chainId,
            slippage,
        });
        return await new Swap_1.SwapPlan(universe, [
            new DefillamaAction(req, input, output, universe, slippage),
        ]).quote([input], destination);
    });
};
exports.createDefillama = createDefillama;
//# sourceMappingURL=DefiLlama.js.map