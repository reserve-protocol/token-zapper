import { BigNumber as ethersBignumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { formatUnits } from "@ethersproject/units";
import memoize from "memoizee";
import { curve } from "../curve";
import { _getPoolsFromApi } from '../external-api';
import { BN, _cutZeros, _getBalances, _getCoinAddresses, _getUsdRate, _get_price_impact, _get_small_x, _prepareAddresses, checkNumber, fromBN, hasAllowance, parseUnits, toBN } from '../utils';
export class PoolTemplate {
    id;
    name;
    fullName;
    symbol;
    referenceAsset;
    address;
    lpToken;
    gauge;
    zap;
    sRewardContract;
    rewardContract;
    isPlain;
    isLending;
    isMeta;
    isCrypto;
    isFake;
    isFactory;
    isMetaFactory;
    basePool;
    metaCoinIdx;
    underlyingCoins;
    wrappedCoins;
    underlyingCoinAddresses;
    wrappedCoinAddresses;
    underlyingDecimals;
    wrappedDecimals;
    useLending;
    inApi;
    wallet;
    constructor(id) {
        const poolData = curve.constants.POOLS_DATA[id] || curve.constants.FACTORY_POOLS_DATA[id] || curve.constants.CRYPTO_FACTORY_POOLS_DATA[id];
        this.id = id;
        this.name = poolData.name;
        this.fullName = poolData.full_name;
        this.symbol = poolData.symbol;
        this.referenceAsset = poolData.reference_asset;
        this.address = poolData.swap_address;
        this.lpToken = poolData.token_address;
        this.gauge = poolData.gauge_address;
        this.zap = poolData.deposit_address || null;
        this.sRewardContract = poolData.sCurveRewards_address || null;
        this.rewardContract = poolData.reward_contract || null;
        this.isPlain = poolData.is_plain || false;
        this.isLending = poolData.is_lending || false;
        this.isMeta = poolData.is_meta || false;
        this.isCrypto = poolData.is_crypto || false;
        this.isFake = poolData.is_fake || false;
        this.isFactory = poolData.is_factory || false;
        this.isMetaFactory = (this.isMeta && this.isFactory) || this.zap === '0xa79828df1850e8a3a3064576f380d90aecdd3359';
        this.basePool = poolData.base_pool || '';
        this.metaCoinIdx = this.isMeta ? poolData.meta_coin_idx ?? poolData.wrapped_coins.length - 1 : -1;
        this.underlyingCoins = poolData.underlying_coins;
        this.wrappedCoins = poolData.wrapped_coins;
        this.underlyingCoinAddresses = poolData.underlying_coin_addresses;
        this.wrappedCoinAddresses = poolData.wrapped_coin_addresses;
        this.underlyingDecimals = poolData.underlying_decimals;
        this.wrappedDecimals = poolData.wrapped_decimals;
        this.useLending = poolData.use_lending || poolData.underlying_coin_addresses.map(() => false);
        this.inApi = poolData.in_api ?? false;
        this.wallet = {
            balances: this.walletBalances.bind(this),
            lpTokenBalances: this.walletLpTokenBalances.bind(this),
            underlyingCoinBalances: this.walletUnderlyingCoinBalances.bind(this),
            wrappedCoinBalances: this.walletWrappedCoinBalances.bind(this),
            allCoinBalances: this.walletAllCoinBalances.bind(this),
        };
    }
    async _pureCalcLpTokenAmount(_amounts, isDeposit = true, useUnderlying = true) {
        const calcContractAddress = this.isMeta && useUnderlying ? this.zap : this.address;
        const N_coins = useUnderlying ? this.underlyingCoins.length : this.wrappedCoins.length;
        const contract = curve.contracts[calcContractAddress].contract;
        if (this.isMetaFactory && useUnderlying) {
            if (contract[`calc_token_amount(address,uint256[${N_coins}],bool)`]) {
                return await contract.calc_token_amount(this.address, _amounts, isDeposit, curve.constantOptions);
            }
            return await contract.calc_token_amount(this.address, _amounts, curve.constantOptions);
        }
        if (contract[`calc_token_amount(uint256[${N_coins}],bool)`]) {
            return await contract.calc_token_amount(_amounts, isDeposit, curve.constantOptions);
        }
        return await contract.calc_token_amount(_amounts, curve.constantOptions);
    }
    _calcLpTokenAmount = memoize(async (_amounts, isDeposit = true, useUnderlying = true) => {
        let _rates = [];
        if (!this.isMeta && useUnderlying) {
            // For lending pools. For others rate = 1
            _rates = await this._getRates();
            _amounts = _amounts.map((_amount, i) => _amount.mul(ethersBignumber.from(10).pow(18)).div(_rates[i]));
        }
        if (this.isCrypto) {
            try {
                return await this._pureCalcLpTokenAmount(_amounts, isDeposit, useUnderlying);
            }
            catch (e) {
                const lpContract = curve.contracts[this.lpToken].contract;
                const _lpTotalSupply = await lpContract.totalSupply(curve.constantOptions);
                if (_lpTotalSupply.gt(0))
                    throw e; // Already seeded
                if (this.isMeta && useUnderlying)
                    throw Error("Initial deposit for crypto meta pools must be in wrapped coins");
                const decimals = useUnderlying ? this.underlyingDecimals : this.wrappedDecimals;
                const amounts = _amounts.map((_a, i) => formatUnits(_a, decimals[i]));
                const seedAmounts = await this.cryptoSeedAmounts(amounts[0]); // Checks N coins == 2 and amounts > 0
                amounts.forEach((a, i) => {
                    if (!BN(a).eq(BN(seedAmounts[i])))
                        throw Error(`Amounts must be = ${seedAmounts}`);
                });
                return parseUnits(Math.sqrt(Number(amounts[0]) * Number(amounts[1])));
            }
        }
        try {
            // --- Getting lpAmount before fees and pool params ---
            const N_coins = this.isMeta && useUnderlying ? this.underlyingCoins.length : this.wrappedCoins.length;
            const decimals = this.isMeta && useUnderlying ? this.underlyingDecimals : this.wrappedDecimals;
            const calcContractAddress = this.isMeta && useUnderlying ? this.zap : this.address;
            const calcContract = curve.contracts[calcContractAddress].multicallContract;
            const poolContract = curve.contracts[this.address].multicallContract;
            const lpContract = curve.contracts[this.lpToken].multicallContract;
            // totalSupply and fee
            const calls = [lpContract.totalSupply(), poolContract.fee()];
            // lpAmount before fees
            if (this.isMetaFactory && useUnderlying) {
                calls.push(calcContract.calc_token_amount(this.address, _amounts, isDeposit));
            }
            else if (calcContract[`calc_token_amount(uint256[${N_coins}],bool)`]) {
                calls.push(calcContract.calc_token_amount(_amounts, isDeposit, curve.constantOptions));
            }
            else {
                calls.push(calcContract.calc_token_amount(_amounts, curve.constantOptions));
            }
            const res = await Promise.all([
                curve.multicallProvider.all(calls),
                this.isMeta && useUnderlying ? this.statsUnderlyingBalances() : this.statsWrappedBalances(),
            ]);
            const [_totalSupply, _fee, _lpTokenAmount] = res[0];
            const balances = res[1];
            const [totalSupplyBN, feeBN, lpTokenAmountBN] = [toBN(_totalSupply), toBN(_fee, 10).times(N_coins).div(4 * (N_coins - 1)), toBN(_lpTokenAmount)];
            const balancesBN = balances.map((b) => BN(b));
            const amountsBN = _amounts.map((_a, i) => toBN(_a, decimals[i]));
            // --- Calculating new amounts (old amounts minus fees) ---
            // fees[i] = | expected1/total_supply * balances[i] - amounts[i] | * fee
            const feesBN = Array(N_coins).fill(BN(0));
            if (totalSupplyBN.gt(0)) {
                for (let i = 0; i < N_coins; i++) {
                    feesBN[i] = balancesBN[i].times(lpTokenAmountBN).div(totalSupplyBN).minus(amountsBN[i]).times(feeBN);
                    if (feesBN[i].lt(0))
                        feesBN[i] = feesBN[i].times(-1);
                }
            }
            const _fees = feesBN.map((fBN, i) => fromBN(fBN, decimals[i]));
            // --- Getting final lpAmount ---
            let _lpTokenFee = await this._pureCalcLpTokenAmount(_fees, !isDeposit, this.isMeta && useUnderlying);
            if (isDeposit)
                _lpTokenFee = _lpTokenFee.mul(-1);
            return _lpTokenAmount.add(_lpTokenFee);
        }
        catch (e) { // Seeding
            if (!isDeposit)
                throw e; // Seeding is only for deposit
            const lpContract = curve.contracts[this.lpToken].contract;
            const _lpTotalSupply = await lpContract.totalSupply(curve.constantOptions);
            if (_lpTotalSupply.gt(0))
                throw e; // Already seeded
            const decimals = useUnderlying ? this.underlyingDecimals : this.wrappedDecimals;
            const amounts = _amounts.map((_a, i) => formatUnits(_a, decimals[i]));
            if (this.isMeta && useUnderlying) {
                const seedAmounts = await this.metaUnderlyingSeedAmounts(amounts[0]); // Checks N coins == 2 and amounts > 0
                amounts.forEach((a, i) => {
                    if (!BN(a).eq(BN(seedAmounts[i])))
                        throw Error(`Amounts must be = ${seedAmounts}`);
                });
            }
            else {
                if (_amounts[0].lte(0))
                    throw Error("Initial deposit amounts must be >0");
                amounts.forEach((a) => {
                    if (a !== amounts[0])
                        throw Error("Initial deposit amounts must be equal");
                });
            }
            const _amounts18Decimals = amounts.map((a) => parseUnits(a));
            return _amounts18Decimals.reduce((_a, _b) => _a.add(_b));
        }
    }, {
        primitive: true,
        promise: true,
        maxAge: 60 * 1000, // 1m
    });
    async statsWrappedBalances() {
        const contract = curve.contracts[this.address].multicallContract;
        const calls = [];
        for (let i = 0; i < this.wrappedCoins.length; i++)
            calls.push(contract.balances(i));
        const _wrappedBalances = await curve.multicallProvider.all(calls);
        return _wrappedBalances.map((_b, i) => formatUnits(_b, this.wrappedDecimals[i]));
    }
    // OVERRIDE
    async statsUnderlyingBalances() {
        return await this.statsWrappedBalances();
    }
    async calcLpTokenAmount(amounts, isDeposit = true) {
        if (amounts.length !== this.underlyingCoinAddresses.length) {
            throw Error(`${this.name} pool has ${this.underlyingCoinAddresses.length} coins (amounts provided for ${amounts.length})`);
        }
        const _underlyingAmounts = amounts.map((amount, i) => parseUnits(amount, this.underlyingDecimals[i]));
        const _expected = await this._calcLpTokenAmount(_underlyingAmounts, isDeposit, true);
        return formatUnits(_expected);
    }
    async calcLpTokenAmountWrapped(amounts, isDeposit = true) {
        if (amounts.length !== this.wrappedCoinAddresses.length) {
            throw Error(`${this.name} pool has ${this.wrappedCoinAddresses.length} coins (amounts provided for ${amounts.length})`);
        }
        if (this.isFake) {
            throw Error(`${this.name} pool doesn't have this method`);
        }
        const _amounts = amounts.map((amount, i) => parseUnits(amount, this.wrappedDecimals[i]));
        const _expected = await this._calcLpTokenAmount(_amounts, isDeposit, false);
        return formatUnits(_expected);
    }
    // ---------------- DEPOSIT ----------------
    metaUnderlyingSeedAmounts(amount1) {
        if (this.isCrypto)
            throw Error(`Use cryptoSeedAmounts method for ${this.name} pool`);
        if (!this.isMeta)
            throw Error("metaUnderlyingSeedAmounts method exists only for meta stable pools");
        const amount1BN = BN(amount1);
        if (amount1BN.lte(0))
            throw Error("Initial deposit amounts must be > 0");
        const amounts = [_cutZeros(amount1BN.toFixed(this.underlyingDecimals[0]))];
        for (let i = 1; i < this.underlyingDecimals.length; i++) {
            amounts.push(amount1BN.div(this.underlyingDecimals.length - 1).toFixed(this.underlyingDecimals[i]));
        }
        return amounts;
    }
    async cryptoSeedAmounts(amount1) {
        if (!this.isCrypto)
            throw Error("cryptoSeedAmounts method doesn't exist for stable pools");
        const decimals = this.isMeta ? this.wrappedDecimals : this.underlyingDecimals;
        if (decimals.length > 2)
            throw Error("cryptoSeedAmounts method doesn't exist for pools with N coins > 2");
        const amount1BN = BN(amount1);
        if (amount1BN.lte(0))
            throw Error("Initial deposit amounts must be > 0");
        const priceScaleBN = toBN(await curve.contracts[this.address].contract.price_scale(curve.constantOptions));
        return [_cutZeros(amount1BN.toFixed(decimals[0])), _cutZeros(amount1BN.div(priceScaleBN).toFixed(decimals[1]))];
    }
    // OVERRIDE
    async depositBalancedAmounts() {
        throw Error(`depositBalancedAmounts method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async depositExpected(amounts) {
        return await this.calcLpTokenAmount(amounts);
    }
    // | balanced[i] / sum(balanced[j]) = balance[i] / sum(balance[j]) |
    // | sum(pj * balanced[j]) = sum(aj * pj)                          |
    //
    // --- Answer ---
    // balanced[i] = sum(aj * pj) / sum(rj * pj / ri)
    //
    // totalValueBN = sum(aj * pj)
    // totalBalanceBN = sum(balance[j])
    // ratiosBN[i] = balancesBN[i] / totalBalanceBN = ri = balance[i] / sum(balance[j])
    // denominatorBN = sum(rj * pj / ri)
    _balancedAmountsWithSameValue(amountsBN, pricesBN, balancesBN) {
        const valuesBN = amountsBN.map((aBN, i) => aBN.times(pricesBN[i]));
        const totalValueBN = valuesBN.reduce((v1BN, v2BN) => v1BN.plus(v2BN));
        const totalBalanceBN = balancesBN.reduce((b1BN, b2BN) => b1BN.plus(b2BN));
        const ratiosBN = balancesBN.map((bBN) => bBN.div(totalBalanceBN));
        const balancedAmountsBN = [];
        for (let i = 0; i < amountsBN.length; i++) {
            const denominatorBN = ratiosBN.map((rBN, j) => rBN.times(pricesBN[j])
                .div(ratiosBN[i])).reduce((xBN, yBN) => xBN.plus(yBN));
            balancedAmountsBN.push(totalValueBN.div(denominatorBN));
        }
        return balancedAmountsBN.map(String);
    }
    async depositIsApproved(amounts) {
        return await hasAllowance(this.underlyingCoinAddresses, amounts, curve.signerAddress, this.zap || this.address);
    }
    // OVERRIDE
    async depositEstimateGas(amounts) {
        throw Error(`depositEstimateGas method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async deposit(amounts, slippage = 0.5) {
        throw Error(`deposit method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- DEPOSIT WRAPPED ----------------
    async depositWrappedBalancedAmounts() {
        throw Error(`depositWrappedBalancedAmounts method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async depositWrappedExpected(amounts) {
        if (this.isFake) {
            throw Error(`depositWrappedExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
        }
        return await this.calcLpTokenAmountWrapped(amounts);
    }
    async depositWrappedIsApproved(amounts) {
        if (this.isFake) {
            throw Error(`depositWrappedIsApproved method doesn't exist for pool ${this.name} (id: ${this.name})`);
        }
        return await hasAllowance(this.wrappedCoinAddresses, amounts, curve.signerAddress, this.address);
    }
    // OVERRIDE
    async depositWrapped(amounts, slippage = 0.5) {
        throw Error(`depositWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW ----------------
    // OVERRIDE
    async withdrawExpected(lpTokenAmount) {
        throw Error(`withdrawExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async withdrawIsApproved(lpTokenAmount) {
        if (!this.zap)
            return true;
        return await hasAllowance([this.lpToken], [lpTokenAmount], curve.signerAddress, this.zap);
    }
    // OVERRIDE
    async withdraw(lpTokenAmount, slippage = 0.5) {
        throw Error(`withdraw method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW WRAPPED ----------------
    // OVERRIDE
    async withdrawWrappedExpected(lpTokenAmount) {
        throw Error(`withdrawWrappedExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async withdrawWrapped(lpTokenAmount, slippage = 0.5) {
        throw Error(`withdrawWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW IMBALANCE ----------------
    async withdrawImbalanceExpected(amounts) {
        if (this.isCrypto)
            throw Error(`withdrawImbalanceExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
        return await this.calcLpTokenAmount(amounts, false);
    }
    async withdrawImbalanceBonus(amounts) {
        const prices = (this.isCrypto || this.id === 'wsteth') ? await this._underlyingPrices() : this.underlyingCoins.map(() => 1);
        const value = amounts.map(checkNumber).map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        const lpTokenAmount = await this.withdrawImbalanceExpected(amounts);
        const balancedAmounts = await this.withdrawExpected(lpTokenAmount);
        const balancedValue = balancedAmounts.map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        return String((value - balancedValue) / balancedValue * 100);
    }
    async withdrawImbalanceIsApproved(amounts) {
        if (this.isCrypto)
            throw Error(`withdrawImbalanceIsApproved method doesn't exist for pool ${this.name} (id: ${this.name})`);
        if (this.zap) {
            const _amounts = amounts.map((amount, i) => parseUnits(amount, this.underlyingDecimals[i]));
            const _maxBurnAmount = (await this._calcLpTokenAmount(_amounts, false)).mul(101).div(100);
            return await hasAllowance([this.lpToken], [formatUnits(_maxBurnAmount, 18)], curve.signerAddress, this.zap);
        }
        return true;
    }
    // OVERRIDE
    async withdrawImbalanceEstimateGas(amounts) {
        throw Error(`withdrawImbalance method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async withdrawImbalance(amounts, slippage = 0.5) {
        throw Error(`withdrawImbalance method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW IMBALANCE WRAPPED ----------------
    async withdrawImbalanceWrappedExpected(amounts) {
        if (this.isCrypto || this.isPlain || this.isFake)
            throw Error(`withdrawImbalanceWrappedExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
        return await this.calcLpTokenAmountWrapped(amounts, false);
    }
    async withdrawImbalanceWrappedBonus(amounts) {
        const prices = await this._wrappedPrices();
        const value = amounts.map(checkNumber).map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        const lpTokenAmount = Number(await this.withdrawImbalanceWrappedExpected(amounts));
        const balancedAmounts = await this.withdrawWrappedExpected(lpTokenAmount);
        const balancedValue = balancedAmounts.map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        return String((value - balancedValue) / balancedValue * 100);
    }
    // OVERRIDE
    async withdrawImbalanceWrappedEstimateGas(amounts) {
        throw Error(`withdrawImbalanceWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async withdrawImbalanceWrapped(amounts, slippage = 0.5) {
        throw Error(`withdrawImbalanceWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW ONE COIN ----------------
    // OVERRIDE
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        throw Error(`withdrawOneCoinExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async withdrawOneCoinExpected(lpTokenAmount, coin) {
        const i = this._getCoinIdx(coin);
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await this._withdrawOneCoinExpected(_lpTokenAmount, i);
        return formatUnits(_expected, this.underlyingDecimals[i]);
    }
    async withdrawOneCoinBonus(lpTokenAmount, coin) {
        const prices = (this.isCrypto || this.id === 'wsteth') ? await this._underlyingPrices() : this.underlyingCoins.map(() => 1);
        const coinPrice = prices[this._getCoinIdx(coin)];
        const amount = Number(await this.withdrawOneCoinExpected(lpTokenAmount, coin));
        const value = amount * coinPrice;
        const balancedAmounts = await this.withdrawExpected(lpTokenAmount);
        const balancedValue = balancedAmounts.map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        return String((value - balancedValue) / balancedValue * 100);
    }
    async withdrawOneCoinIsApproved(lpTokenAmount) {
        if (!this.zap)
            return true;
        return await hasAllowance([this.lpToken], [lpTokenAmount], curve.signerAddress, this.zap);
    }
    // OVERRIDE
    async withdrawOneCoinEstimateGas(lpTokenAmount, coin) {
        throw Error(`withdrawOneCoin method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async withdrawOneCoin(lpTokenAmount, coin, slippage = 0.5) {
        throw Error(`withdrawOneCoin method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WITHDRAW ONE COIN WRAPPED ----------------
    // OVERRIDE
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount, i) {
        throw Error(`withdrawOneCoinWrappedExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async withdrawOneCoinWrappedExpected(lpTokenAmount, coin) {
        const i = this._getCoinIdx(coin, false);
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await this._withdrawOneCoinWrappedExpected(_lpTokenAmount, i);
        return formatUnits(_expected, this.wrappedDecimals[i]);
    }
    async withdrawOneCoinWrappedBonus(lpTokenAmount, coin) {
        const prices = await this._wrappedPrices();
        const coinPrice = prices[this._getCoinIdx(coin, false)];
        const amount = Number(await this.withdrawOneCoinWrappedExpected(lpTokenAmount, coin));
        const value = amount * coinPrice;
        const balancedAmounts = await this.withdrawWrappedExpected(lpTokenAmount);
        const balancedValue = balancedAmounts.map(Number).reduce((s, a, i) => s + (a * prices[i]), 0);
        return String((value - balancedValue) / balancedValue * 100);
    }
    // OVERRIDE
    async withdrawOneCoinWrapped(lpTokenAmount, coin, slippage = 0.5) {
        throw Error(`withdrawOneCoinWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- WALLET BALANCES ----------------
    async walletBalances(...addresses) {
        if (this.gauge === AddressZero) {
            return await this._balances(['lpToken', ...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], [this.lpToken, ...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], ...addresses);
        }
        else {
            return await this._balances(['lpToken', 'gauge', ...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], [this.lpToken, this.gauge, ...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], ...addresses);
        }
    }
    async walletLpTokenBalances(...addresses) {
        if (this.gauge === AddressZero) {
            return await this._balances(['lpToken'], [this.lpToken], ...addresses);
        }
        else {
            return await this._balances(['lpToken', 'gauge'], [this.lpToken, this.gauge], ...addresses);
        }
    }
    async walletUnderlyingCoinBalances(...addresses) {
        return await this._balances(this.underlyingCoinAddresses, this.underlyingCoinAddresses, ...addresses);
    }
    async walletWrappedCoinBalances(...addresses) {
        return await this._balances(this.wrappedCoinAddresses, this.wrappedCoinAddresses, ...addresses);
    }
    async walletAllCoinBalances(...addresses) {
        return await this._balances([...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], [...this.underlyingCoinAddresses, ...this.wrappedCoinAddresses], ...addresses);
    }
    // ---------------- USER BALANCES, BASE PROFIT AND SHARE ----------------
    async _userLpTotalBalance(address) {
        const lpBalances = await this.walletLpTokenBalances(address);
        let lpTotalBalanceBN = BN(lpBalances.lpToken);
        if ('gauge' in lpBalances)
            lpTotalBalanceBN = lpTotalBalanceBN.plus(BN(lpBalances.gauge));
        return lpTotalBalanceBN;
    }
    async userBalances(address = "") {
        address = address || curve.signerAddress;
        if (!address)
            throw Error("Need to connect wallet or pass address into args");
        const lpTotalBalanceBN = await this._userLpTotalBalance(address);
        if (lpTotalBalanceBN.eq(0))
            return this.underlyingCoins.map(() => "0");
        return await this.withdrawExpected(lpTotalBalanceBN.toFixed(18));
    }
    async userWrappedBalances(address = "") {
        address = address || curve.signerAddress;
        if (!address)
            throw Error("Need to connect wallet or pass address into args");
        const lpTotalBalanceBN = await this._userLpTotalBalance(address);
        if (lpTotalBalanceBN.eq(0))
            return this.wrappedCoins.map(() => "0");
        return await this.withdrawWrappedExpected(lpTotalBalanceBN.toFixed(18));
    }
    async userLiquidityUSD(address = "") {
        const lpBalanceBN = await this._userLpTotalBalance(address);
        const lpPrice = await _getUsdRate(this.lpToken);
        return lpBalanceBN.times(lpPrice).toFixed(8);
    }
    statsTotalLiquidity = async (useApi = true) => {
        if (useApi) {
            const network = curve.constants.NETWORK_NAME;
            const poolType = !this.isFactory && !this.isCrypto ? "main" :
                !this.isFactory ? "crypto" :
                    !(this.isCrypto && this.isFactory) ? "factory" :
                        "factory-crypto";
            const poolsData = (await _getPoolsFromApi(network, poolType)).poolData;
            try {
                const totalLiquidity = poolsData.filter((data) => data.address.toLowerCase() === this.address.toLowerCase())[0].usdTotal;
                return String(totalLiquidity);
            }
            catch (err) {
                // console.log(this.id, (err as Error).message);
            }
        }
        const balances = await this.statsUnderlyingBalances();
        const promises = [];
        for (const addr of this.underlyingCoinAddresses) {
            promises.push(_getUsdRate(addr));
        }
        const prices = await Promise.all(promises);
        const totalLiquidity = balances.reduce((liquidity, b, i) => liquidity + (Number(b) * prices[i]), 0);
        return totalLiquidity.toFixed(8);
    };
    async userShare(address = "") {
        const withGauge = this.gauge !== AddressZero;
        address = address || curve.signerAddress;
        if (!address)
            throw Error("Need to connect wallet or pass address into args");
        const userLpBalance = await this.walletLpTokenBalances(address);
        let userLpTotalBalanceBN = BN(userLpBalance.lpToken);
        if (withGauge)
            userLpTotalBalanceBN = userLpTotalBalanceBN.plus(BN(userLpBalance.gauge));
        let totalLp, gaugeLp;
        if (withGauge) {
            [totalLp, gaugeLp] = (await curve.multicallProvider.all([
                curve.contracts[this.lpToken].multicallContract.totalSupply(),
                curve.contracts[this.gauge].multicallContract.totalSupply(),
            ])).map((_supply) => formatUnits(_supply));
        }
        else {
            totalLp = formatUnits(await curve.contracts[this.lpToken].contract.totalSupply(curve.constantOptions));
        }
        return {
            lpUser: userLpTotalBalanceBN.toString(),
            lpTotal: totalLp,
            lpShare: BN(totalLp).gt(0) ? userLpTotalBalanceBN.div(totalLp).times(100).toString() : '0',
            gaugeUser: userLpBalance.gauge,
            gaugeTotal: gaugeLp,
            gaugeShare: !withGauge ? undefined : BN(gaugeLp).gt(0) ? BN(userLpBalance.gauge).div(gaugeLp).times(100).toString() : '0',
        };
    }
    // ---------------- SWAP ----------------
    async _swapExpected(i, j, _amount) {
        const contractAddress = this.isCrypto && this.isMeta ? this.zap : this.address;
        const contract = curve.contracts[contractAddress].contract;
        if (Object.prototype.hasOwnProperty.call(contract, 'get_dy_underlying')) {
            return await contract.get_dy_underlying(i, j, _amount, curve.constantOptions);
        }
        else {
            if ('get_dy(address,uint256,uint256,uint256)' in contract) { // atricrypto3 based metapools
                return await contract.get_dy(this.address, i, j, _amount, curve.constantOptions);
            }
            return await contract.get_dy(i, j, _amount, curve.constantOptions);
        }
    }
    async swapExpected(inputCoin, outputCoin, amount) {
        const i = this._getCoinIdx(inputCoin);
        const j = this._getCoinIdx(outputCoin);
        const _amount = parseUnits(amount, this.underlyingDecimals[i]);
        const _expected = await this._swapExpected(i, j, _amount);
        return formatUnits(_expected, this.underlyingDecimals[j]);
    }
    async swapPriceImpact(inputCoin, outputCoin, amount) {
        const i = this._getCoinIdx(inputCoin);
        const j = this._getCoinIdx(outputCoin);
        const [inputCoinDecimals, outputCoinDecimals] = [this.underlyingDecimals[i], this.underlyingDecimals[j]];
        const _amount = parseUnits(amount, inputCoinDecimals);
        const _output = await this._swapExpected(i, j, _amount);
        const smallAmountIntBN = _get_small_x(_amount, _output, inputCoinDecimals, outputCoinDecimals);
        const amountIntBN = toBN(_amount, 0);
        if (smallAmountIntBN.gte(amountIntBN))
            return 0;
        const _smallAmount = fromBN(smallAmountIntBN.div(10 ** inputCoinDecimals), inputCoinDecimals);
        const _smallOutput = await this._swapExpected(i, j, _smallAmount);
        const priceImpactBN = _get_price_impact(_amount, _output, _smallAmount, _smallOutput, inputCoinDecimals, outputCoinDecimals);
        return Number(_cutZeros(priceImpactBN.toFixed(4)));
    }
    _swapContractAddress() {
        return (this.isCrypto && this.isMeta) || (this.isMetaFactory && (new PoolTemplate(this.basePool).isLending)) ? this.zap : this.address;
    }
    async swapIsApproved(inputCoin, amount) {
        const contractAddress = this._swapContractAddress();
        const i = this._getCoinIdx(inputCoin);
        return await hasAllowance([this.underlyingCoinAddresses[i]], [amount], curve.signerAddress, contractAddress);
    }
    // OVERRIDE
    async swap(inputCoin, outputCoin, amount, slippage = 0.5) {
        throw Error(`swap method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // ---------------- SWAP WRAPPED ----------------
    async _swapWrappedExpected(i, j, _amount) {
        return await curve.contracts[this.address].contract.get_dy(i, j, _amount, curve.constantOptions);
    }
    // OVERRIDE
    async swapWrappedExpected(inputCoin, outputCoin, amount) {
        throw Error(`swapWrappedExpected method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    async swapWrappedPriceImpact(inputCoin, outputCoin, amount) {
        if (this.isPlain || this.isFake) {
            throw Error(`swapWrappedPriceImpact method doesn't exist for pool ${this.name} (id: ${this.name})`);
        }
        const i = this._getCoinIdx(inputCoin, false);
        const j = this._getCoinIdx(outputCoin, false);
        const [inputCoinDecimals, outputCoinDecimals] = [this.wrappedDecimals[i], this.wrappedDecimals[j]];
        const _amount = parseUnits(amount, inputCoinDecimals);
        const _output = await this._swapWrappedExpected(i, j, _amount);
        const smallAmountIntBN = _get_small_x(_amount, _output, inputCoinDecimals, outputCoinDecimals);
        const amountIntBN = toBN(_amount, 0);
        if (smallAmountIntBN.gte(amountIntBN))
            return 0;
        const _smallAmount = fromBN(smallAmountIntBN.div(10 ** inputCoinDecimals), inputCoinDecimals);
        const _smallOutput = await this._swapWrappedExpected(i, j, _smallAmount);
        const priceImpactBN = _get_price_impact(_amount, _output, _smallAmount, _smallOutput, inputCoinDecimals, outputCoinDecimals);
        return Number(_cutZeros(priceImpactBN.toFixed(4)));
    }
    // OVERRIDE
    async swapWrappedIsApproved(inputCoin, amount) {
        throw Error(`swapWrappedIsApproved method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async swapWrappedApprove(inputCoin, amount) {
        throw Error(`swapWrappedApprove method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async swapWrappedEstimateGas(inputCoin, outputCoin, amount) {
        throw Error(`swapWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    // OVERRIDE
    async swapWrapped(inputCoin, outputCoin, amount, slippage = 0.5) {
        throw Error(`swapWrapped method doesn't exist for pool ${this.name} (id: ${this.name})`);
    }
    _getCoinIdx = (coin, useUnderlying = true) => {
        if (typeof coin === 'number') {
            const coins_N = useUnderlying ? this.underlyingCoins.length : this.wrappedCoins.length;
            const idx = coin;
            if (!Number.isInteger(idx)) {
                throw Error('Index must be integer');
            }
            if (idx < 0) {
                throw Error('Index must be >= 0');
            }
            if (idx > coins_N - 1) {
                throw Error(`Index must be < ${coins_N}`);
            }
            return idx;
        }
        const [coinAddress] = _getCoinAddresses(coin);
        const lowerCaseCoinAddresses = useUnderlying ?
            this.underlyingCoinAddresses.map((c) => c.toLowerCase()) :
            this.wrappedCoinAddresses.map((c) => c.toLowerCase());
        const idx = lowerCaseCoinAddresses.indexOf(coinAddress.toLowerCase());
        if (idx === -1) {
            throw Error(`There is no ${coin} among ${this.name} pool ${useUnderlying ? 'underlying' : 'wrapped'} coins`);
        }
        return idx;
    };
    _getRates = async () => {
        const _rates = [];
        for (let i = 0; i < this.wrappedCoinAddresses.length; i++) {
            const addr = this.wrappedCoinAddresses[i];
            if (this.useLending[i]) {
                if (['compound', 'usdt', 'ib'].includes(this.id)) {
                    _rates.push(await curve.contracts[addr].contract.exchangeRateStored());
                }
                else if (['y', 'busd', 'pax'].includes(this.id)) {
                    _rates.push(await curve.contracts[addr].contract.getPricePerFullShare());
                }
                else {
                    _rates.push(ethersBignumber.from(10).pow(18)); // Aave ratio 1:1
                }
            }
            else {
                _rates.push(ethersBignumber.from(10).pow(18));
            }
        }
        return _rates;
    };
    _balances = async (rawCoinNames, rawCoinAddresses, ...addresses) => {
        const coinNames = [];
        const coinAddresses = [];
        // removing duplicates
        for (let i = 0; i < rawCoinAddresses.length; i++) {
            if (!coinAddresses.includes(rawCoinAddresses[i])) {
                coinNames.push(rawCoinNames[i]);
                coinAddresses.push(rawCoinAddresses[i]);
            }
        }
        addresses = _prepareAddresses(addresses);
        const rawBalances = await _getBalances(coinAddresses, addresses);
        const balances = {};
        for (const address of addresses) {
            balances[address] = {};
            for (const coinName of coinNames) {
                balances[address][coinName] = rawBalances[address].shift();
            }
        }
        return addresses.length === 1 ? balances[addresses[0]] : balances;
    };
    _underlyingPrices = async () => {
        const promises = [];
        for (const addr of this.underlyingCoinAddresses) {
            promises.push(_getUsdRate(addr));
        }
        return await Promise.all(promises);
    };
    // NOTE! It may crash!
    _wrappedPrices = async () => {
        const promises = [];
        for (const addr of this.wrappedCoinAddresses) {
            promises.push(_getUsdRate(addr));
        }
        return await Promise.all(promises);
    };
}
//# sourceMappingURL=PoolTemplate.js.map