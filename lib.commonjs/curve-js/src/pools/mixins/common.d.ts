import { PoolTemplate } from "../PoolTemplate";
import { BigNumber as ethersBigNumber } from "@ethersproject/bignumber";
export declare function _calcExpectedAmounts(this: PoolTemplate, _lpTokenAmount: ethersBigNumber): Promise<ethersBigNumber[]>;
export declare function _calcExpectedUnderlyingAmountsMeta(this: PoolTemplate, _lpTokenAmount: ethersBigNumber): Promise<ethersBigNumber[]>;
