"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefillama = exports.fetchQuote = exports.protocol = void 0;
const Action_1 = require("../action/Action");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const constants_1 = require("../base/constants");
const utils_1 = require("../base/utils");
const ZapperExecutor__factory_1 = require("../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory");
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
    const url = `https://swap-api.defillama.com/dexAggregatorQuote?protocol=${protocol}&chain=${CHAIN_SLUG[chainId]}&from=${qty.token.address.address.toLowerCase()}&to=${output.address.address.toLowerCase()}&amount=${qty.amount.toString()}&api_key=nsr_UYWxuvj1hOCgHxJhDEKZ0g30c4Be3I5fOMBtFAA`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'omit',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
            Accept: '*/*',
            'Accept-Language': 'en-GB,en;q=0.5',
            'Content-Type': 'text/plain;charset=UTF-8',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
        },
        referrer: 'https://swap.defillama.com/',
        body: JSON.stringify(request),
        mode: 'cors',
    });
    console.log(await response.text());
    const p = response.json();
    const json = await p;
    console.log(json);
    return json;
};
exports.fetchQuote = fetchQuote;
class DefillamaAction extends Action_1.Action {
    request;
    quantityIn;
    universe;
    slippage;
    protocol;
    async plan(planner) {
        const zapperLib = this.gen.Contract.createContract(ZapperExecutor__factory_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        planner.add(zapperLib.rawCall(this.request.rawQuote.to, this.request.rawQuote.value, this.request.rawQuote.data));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], this.universe.config.addresses.executorAddress);
        return [out];
    }
    outputQuantity = [];
    constructor(request, quantityIn, output, universe, slippage, protocol) {
        super(Address_1.Address.from(request.tokenApprovalAddress), [quantityIn.token], [output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [
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