import { PoolTemplate } from "../PoolTemplate";
import { curve } from "../../curve";
import { fromBN, toBN } from "../../utils";
export async function _calcExpectedAmounts(_lpTokenAmount) {
    const coinBalancesBN = [];
    for (let i = 0; i < this.wrappedCoinAddresses.length; i++) {
        const _balance = await curve.contracts[this.address].contract.balances(i, curve.constantOptions);
        coinBalancesBN.push(toBN(_balance, this.wrappedDecimals[i]));
    }
    const totalSupplyBN = toBN(await curve.contracts[this.lpToken].contract.totalSupply(curve.constantOptions));
    const expectedAmountsBN = [];
    for (const coinBalance of coinBalancesBN) {
        expectedAmountsBN.push(coinBalance.times(toBN(_lpTokenAmount)).div(totalSupplyBN));
    }
    return expectedAmountsBN.map((amount, i) => fromBN(amount, this.wrappedDecimals[i]));
}
export async function _calcExpectedUnderlyingAmountsMeta(_lpTokenAmount) {
    const _expectedWrappedAmounts = await _calcExpectedAmounts.call(this, _lpTokenAmount);
    const [_expectedMetaCoinAmount] = _expectedWrappedAmounts.splice(this.metaCoinIdx, 1);
    const _expectedUnderlyingAmounts = _expectedWrappedAmounts;
    const basePool = new PoolTemplate(this.basePool);
    const _basePoolExpectedAmounts = basePool.isMeta ?
        await _calcExpectedUnderlyingAmountsMeta.call(basePool, _expectedMetaCoinAmount) :
        await _calcExpectedAmounts.call(basePool, _expectedMetaCoinAmount);
    _expectedUnderlyingAmounts.splice(this.metaCoinIdx, 0, ..._basePoolExpectedAmounts);
    return _expectedUnderlyingAmounts;
}
//# sourceMappingURL=common.js.map