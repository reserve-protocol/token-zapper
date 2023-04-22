"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universe = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Address_1 = require("./base/Address");
const chainConfigRegistry_1 = require("./configuration/chainConfigRegistry");
const Graph_1 = require("./exchange-graph/Graph");
const Token_1 = require("./entities/Token");
const DefaultMap_1 = require("./base/DefaultMap");
const contracts_1 = require("./contracts");
const base_1 = require("./base");
const Refreshable_1 = require("./entities/Refreshable");
const ApprovalsStore_1 = require("./searcher/ApprovalsStore");
const TokenBasket_1 = require("./entities/TokenBasket");
const action_1 = require("./action");
class Universe {
    provider;
    chainConfig;
    chainId = 0;
    refreshableEntities = new Map();
    approvalStore;
    tokens = new Map();
    actions = new DefaultMap_1.DefaultMap(() => []);
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    // Sentinel token used for pricing things
    usd = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString('0x0000000000000000000000000000000000000348'), 'USD', 'USD Dollar', 8);
    graph = new Graph_1.Graph();
    wrappedTokens = new Map();
    oracles = [];
    dexAggregators = [];
    // Sentinel token used for pricing things
    rTokens = {
        eUSD: null,
        'ETH+': null,
    };
    commonTokens = {
        USDC: null,
        USDT: null,
        DAI: null,
        WBTC: null,
        ERC20ETH: null,
        ERC20GAS: null,
    };
    async refresh(entity) {
        const refreshable = this.refreshableEntities.get(entity);
        if (refreshable == null) {
            return;
        }
        await refreshable.refresh(this.currentBlock);
    }
    createRefreshableEntitity(address, refresh) {
        this.refreshableEntities.set(address, new Refreshable_1.Refreshable(address, -1, refresh));
    }
    get config() {
        return this.chainConfig.config;
    }
    blockState = {
        currentBlock: 0,
        gasPrice: 0n,
    };
    async fairPrice(qty) {
        const wrappedToken = this.wrappedTokens.get(qty.token);
        if (wrappedToken != null) {
            const outTokens = await wrappedToken.burn.quote([qty]);
            const sums = await Promise.all(outTokens.map(async (qty) => await this.fairPrice(qty).then((i) => i ?? this.usd.zero)));
            return sums.reduce((l, r) => l.add(r));
        }
        else {
            for (const oracle of this.oracles) {
                const price = await oracle.fairTokenPrice(this.currentBlock, qty.token);
                if (price != null) {
                    const out = price.into(qty.token).mul(qty).into(this.usd);
                    return out;
                }
            }
        }
        return null;
    }
    get currentBlock() {
        return this.blockState.currentBlock;
    }
    get gasPrice() {
        return this.blockState.gasPrice;
    }
    async getToken(address) {
        let previous = this.tokens.get(address);
        if (previous == null) {
            const data = await loadERC20FromChain(this.provider, address);
            previous = Token_1.Token.createToken(this.tokens, address, data.symbol, data.symbol, data.decimals);
            this.tokens.set(address, previous);
        }
        return previous;
    }
    createToken(address, symbol, name, decimals) {
        const token = Token_1.Token.createToken(this.tokens, address, symbol, name, decimals);
        return token;
    }
    addAction(action, actionAddress) {
        if (actionAddress != null) {
            this.actions.get(actionAddress).push(action);
        }
        if (action.addToGraph) {
            this.graph.addEdge(action);
        }
        return this;
    }
    defineMintable(mint, burn) {
        const output = mint.output[0];
        this.addAction(mint, output.address);
        this.addAction(burn, output.address);
        this.wrappedTokens.set(output, {
            mint,
            burn,
        });
    }
    constructor(provider, chainConfig, approvalsStore) {
        this.provider = provider;
        this.chainConfig = chainConfig;
        const nativeToken = chainConfig.config.nativeToken;
        this.approvalStore = approvalsStore;
        this.nativeToken = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
    }
    async updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
    }
    static async create(provider) {
        const network = await provider.getNetwork();
        const config = chainConfigRegistry_1.predefinedConfigurations[network.chainId];
        if (config == null) {
            throw new Error(`
Library does not come pre-shipped with config for chainId: ${network.chainId}.
But can set up your own config with 'createWithConfig'`);
        }
        return await Universe.createWithConfig(provider, config, network);
    }
    static async createWithConfig(provider, config, network) {
        const universe = new Universe(provider, config, new ApprovalsStore_1.ApprovalsStore(provider));
        universe.chainId = network.chainId;
        const [currentBlock, gasPrice] = [
            await provider.getBlockNumber(),
            await provider.getGasPrice(),
        ];
        universe.updateBlockState(currentBlock, gasPrice.toBigInt());
        await config.initialize(universe);
        return universe;
    }
    static async createForTest(config) {
        const universe = new Universe(null, config, {
            async needsApproval(_, __, ___) {
                return true;
            },
        });
        return universe;
    }
    async defineRToken(mainAddress) {
        const mainInst = contracts_1.IMain__factory.connect(mainAddress.address, this.provider);
        const [rTokenAddr, basketHandlerAddress] = await Promise.all([
            mainInst.rToken(),
            mainInst.basketHandler(),
        ]);
        const token = await this.getToken(Address_1.Address.from(rTokenAddr));
        const basketHandler = new TokenBasket_1.TokenBasket(this, Address_1.Address.from(basketHandlerAddress), token);
        this.rTokens[token.symbol] = token;
        await basketHandler.update();
        this.createRefreshableEntitity(basketHandler.address, () => basketHandler.update());
        this.defineMintable(new action_1.MintRTokenAction(this, basketHandler), new action_1.BurnRTokenAction(this, basketHandler));
    }
}
exports.Universe = Universe;
async function loadERC20FromChain(provider, address) {
    const erc20 = contracts_1.ERC20__factory.connect(address.address, provider);
    let [symbol, decimals] = await Promise.all([
        provider.call({
            to: address.address,
            data: (0, utils_1.id)('symbol()').slice(0, 10),
        }),
        erc20.decimals().catch(() => 0),
    ]);
    if (symbol.length === 66) {
        let buffer = (0, base_1.parseHexStringIntoBuffer)(symbol);
        let last = buffer.indexOf(0);
        if (last == -1) {
            last = buffer.length;
        }
        buffer = buffer.subarray(0, last);
        symbol = buffer.toString('utf8');
    }
    else {
        symbol = ethers_1.ethers.utils.defaultAbiCoder.decode(['string'], symbol)[0];
    }
    return {
        symbol,
        decimals,
    };
}
//# sourceMappingURL=Universe.js.map