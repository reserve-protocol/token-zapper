import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { encodeArg } from '../tx-gen/Planner';
import { Action, DestinationOptions, InteractionConvention, } from './Action';
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json';
import { BigNumber, Contract } from 'ethers';
import { ParamType } from '@ethersproject/abi';
import { CurveCryptoFactoryHelper__factory, IERC20__factory, } from '../contracts';
class CurveFactoryCryptoPoolBase extends Action('CurveFactoryCryptoPool') {
    get outputSlippage() {
        return 1n;
    }
    gasEstimate() {
        return 10000000n;
    }
    plan(planner, inputs, destination, predictedInputs) {
        throw new Error('Method not implemented.');
    }
    get addToGraph() {
        return false;
    }
}
class CryptoFactoryPoolSwapMint extends CurveFactoryCryptoPoolBase {
    pool;
    async quote(amountsIn) {
        const amts = await this.pool.poolInstance.callStatic.calc_token_amount(amountsIn.map((amt) => amt.amount));
        return [this.pool.lpToken.from(amts)];
    }
    constructor(pool) {
        super(pool.pool, pool.underlying, [pool.lpToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, pool.underlying.map((token) => new Approval(token, pool.pool)));
        this.pool = pool;
    }
}
class CryptoFactoryPoolSwapBurn extends CurveFactoryCryptoPoolBase {
    pool;
    async quote([amount]) {
        const [bal0, bal1, totalSupply] = (await Promise.all([
            this.pool.poolInstance.callStatic.balances(0),
            this.pool.poolInstance.callStatic.balances(1),
            IERC20__factory.connect(this.pool.lpToken.address.address, this.pool.universe.provider).callStatic.totalSupply(),
        ]));
        return [
            this.outputToken[0].from((bal0.toBigInt() *
                ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
                amount.token.scale),
            this.outputToken[1].from((bal1.toBigInt() *
                ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
                amount.token.scale),
        ];
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        planner.add(lib.remove_liquidity(inputs[0] ?? predictedInputs[0].amount, encodeArg([0, 0], ParamType.fromString('uint256[2]')), false));
        return null;
    }
    get returnsOutput() {
        return false;
    }
    constructor(pool) {
        super(pool.pool, [pool.lpToken], pool.underlying, InteractionConvention.None, DestinationOptions.Callee, []);
        this.pool = pool;
    }
}
class CurveFactoryCryptoPoolAddLiquidityAction extends Action('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 100000n;
    }
    get outputSlippage() {
        return 1n;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, _, predicted) {
        const helper = CurveCryptoFactoryHelper__factory.connect(this.universe.config.addresses.curveCryptoFactoryHelper.address, this.universe.provider);
        const lib = this.gen.Contract.createLibrary(helper);
        const mintOutQuote = await this.quote(predicted);
        const input = inputs[0] ?? encodeArg(predicted[0].amount, ParamType.from('uint256'));
        return [
            planner.add(lib.addliquidity(input, this.tokenIndex, this.pool.address.address, 0n, this.inputToken[0] === this.universe.nativeToken), `CurveFactoryCryptoPool.add_liquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.calc_token_amount(this.tokenIndex === 0 ? [amountsIn.amount, 0n] : [0n, amountsIn.amount]);
        return [this.outputToken[0].from(out)];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.underlying[tokenIndex]], [pool.lpToken], pool.underlying[tokenIndex] === universe.nativeToken
            ? InteractionConvention.None
            : InteractionConvention.ApprovalRequired, DestinationOptions.Callee, pool.underlying[tokenIndex] === universe.nativeToken
            ? []
            : [new Approval(pool.underlying[tokenIndex], pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveFactoryCryptoPool.addLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class CurveFactoryCryptoPoolRemoveLiquidityAction extends Action('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 100000n;
    }
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, inputs, _, predicted) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        const mintOutQuote = await this.quote(predicted);
        const input = inputs[0] ?? encodeArg(predicted[0].amount, ParamType.from('uint256'));
        return [
            planner.add(lib.remove_liquidity_one_coin(input, this.tokenIndex, this.universe.execAddress.address, false), `CurveFactoryCryptoPool.removeLiquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.callStatic.calc_withdraw_one_coin(amountsIn.amount, this.tokenIndex);
        return [this.outputToken[0].from(BigNumber.from(out))];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.lpToken], [pool.underlying[tokenIndex]], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveFactoryCryptoPool.removeLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
export class CurveFactoryCryptoPool {
    universe;
    pool;
    lpToken;
    underlying;
    actions;
    get outputSlippage() {
        return 1n;
    }
    get address() {
        return this.pool;
    }
    poolInstance;
    get allPoolTokens() {
        return this.underlying;
    }
    constructor(universe, pool, lpToken, underlying) {
        this.universe = universe;
        this.pool = pool;
        this.lpToken = lpToken;
        this.underlying = underlying;
        this.actions = underlying.map((_, index) => ({
            remove: new CurveFactoryCryptoPoolRemoveLiquidityAction(universe, this, index),
            add: new CurveFactoryCryptoPoolAddLiquidityAction(universe, this, index),
        }));
        const mintable = {
            mint: new CryptoFactoryPoolSwapMint(this),
            burn: new CryptoFactoryPoolSwapBurn(this),
        };
        this.poolInstance = new Contract(this.pool.address, ABI, this.universe.provider);
        for (const { add, remove } of this.actions) {
            universe.addAction(add);
            universe.addAction(remove);
        }
        universe.addSingleTokenPriceSource({
            token: this.lpToken,
            priceFn: async () => {
                const out = await mintable.burn.quote([this.lpToken.one]);
                const underlyingTokens = await Promise.all(out.map(async (i) => (await universe.fairPrice(i)) ?? universe.usd.zero));
                const sum = underlyingTokens.reduce((a, b) => a.add(b), universe.usd.zero);
                return sum;
            },
            priceToken: universe.usd,
        });
        universe.defineMintable(mintable.mint, mintable.burn, true);
    }
    toString() {
        return `CurveFactoryCryptoPool(addr=${this.pool.address}, lp=${this.lpToken}, coins=[${this.underlying.join(', ')}])`;
    }
}
export const setupCurveFactoryCryptoPool = async (universe, pool) => {
    const poolInstance = new Contract(pool.address, ABI, universe.provider);
    const n = 2;
    const underlying = [];
    for (let i = 0; i < n; i++) {
        const token = await poolInstance.coins(i);
        underlying.push(await universe.getToken(Address.from(token)));
    }
    const lpToken = await universe.getToken(Address.from(await poolInstance.token()));
    const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying);
    return out;
};
//# sourceMappingURL=CurveFactoryCryptoPool.js.map