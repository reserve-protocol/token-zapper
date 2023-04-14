import { ethers } from 'ethers';
import { id } from 'ethers/lib/utils';
import { Address } from './base/Address';
import { predefinedConfigurations } from './configuration/chainConfigRegistry';
import { Graph } from './exchange-graph/Graph';
import { Token } from './entities/Token';
import { DefaultMap } from './base/DefaultMap';
import { ERC20__factory } from './contracts';
import { parseHexStringIntoBuffer } from './base';
import { Refreshable } from './entities/Refreshable';
import { ApprovalsStore } from './searcher/ApprovalsStore';
export class Universe {
    provider;
    chainConfig;
    chainId = 0;
    refreshableEntities = new Map();
    approvalStore;
    tokens = new Map();
    actions = new DefaultMap(() => []);
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    // Sentinel token used for pricing things
    usd = Token.createToken(this.tokens, Address.fromHexString('0x0000000000000000000000000000000000000348'), 'USD', 'USD Dollar', 8);
    graph = new Graph();
    wrappedTokens = new Map();
    oracles = [];
    dexAggregators = [];
    // Sentinel token used for pricing things
    rTokens = {
        eUSD: null,
        ETHPlus: null,
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
        this.refreshableEntities.set(address, new Refreshable(address, -1, refresh));
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
                    const out = price.convertTo(qty.token).mul(qty).convertTo(this.usd);
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
            previous = Token.createToken(this.tokens, address, data.symbol, data.symbol, data.decimals);
            this.tokens.set(address, previous);
        }
        return previous;
    }
    createToken(address, symbol, name, decimals) {
        const token = Token.createToken(this.tokens, address, symbol, name, decimals);
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
        this.nativeToken = Token.createToken(this.tokens, Address.fromHexString('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
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
        const config = predefinedConfigurations[network.chainId];
        if (config == null) {
            throw new Error(`
Library does not come pre-shipped with config for chainId: ${network.chainId}.
But can set up your own config with 'createWithConfig'`);
        }
        return await Universe.createWithConfig(provider, config, network);
    }
    static async createWithConfig(provider, config, network) {
        const universe = new Universe(provider, config, new ApprovalsStore(provider));
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
}
async function loadERC20FromChain(provider, address) {
    const erc20 = ERC20__factory.connect(address.address, provider);
    let [symbol, decimals] = await Promise.all([
        provider.call({
            to: address.address,
            data: id('symbol()').slice(0, 10),
        }),
        erc20.decimals(),
    ]);
    if (symbol.length === 66) {
        let buffer = parseHexStringIntoBuffer(symbol);
        let last = buffer.indexOf(0);
        if (last == -1) {
            last = buffer.length;
        }
        buffer = buffer.subarray(0, last);
        symbol = buffer.toString('utf8');
    }
    else {
        symbol = ethers.utils.defaultAbiCoder.decode(['string'], symbol)[0];
    }
    return {
        symbol,
        decimals,
    };
}
//# sourceMappingURL=Universe.js.map