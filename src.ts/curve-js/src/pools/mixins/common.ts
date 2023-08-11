import BigNumber from "bignumber.js";
import { PoolTemplate } from "../PoolTemplate";
import { curve } from "../../curve";
import { fromBN, toBN } from "../../utils";
import { BigNumber as ethersBigNumber } from "@ethersproject/bignumber"
export async function _calcExpectedAmounts(this: PoolTemplate, _lpTokenAmount: ethersBigNumber): Promise<ethersBigNumber[]> {
    const coinBalancesBN: BigNumber[] = [];
    for (let i = 0; i < this.wrappedCoinAddresses.length; i++) {
        const _balance: ethersBigNumber = await curve.contracts[this.address].contract.balances(i, curve.constantOptions);
        coinBalancesBN.push(toBN(_balance, this.wrappedDecimals[i]));
    }
    const totalSupplyBN: BigNumber = toBN(await curve.contracts[this.lpToken].contract.totalSupply(curve.constantOptions));

    const expectedAmountsBN: BigNumber[] = [];
    for (const coinBalance of coinBalancesBN) {
        expectedAmountsBN.push(coinBalance.times(toBN(_lpTokenAmount)).div(totalSupplyBN));
    }

    return expectedAmountsBN.map((amount: BigNumber, i: number) => fromBN(amount, this.wrappedDecimals[i]));
}

export async function _calcExpectedUnderlyingAmountsMeta(this: PoolTemplate, _lpTokenAmount: ethersBigNumber): Promise<ethersBigNumber[]> {
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
