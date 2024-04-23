import BigNumber from 'bignumber.js';
import { IChainId, IDict, INetworkName, IRewardFromApi } from './interfaces';
import { BigNumber as ethersBigNumber } from "@ethersproject/bignumber";
export declare const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export declare const MAX_ALLOWANCE: ethersBigNumber;
export declare const _cutZeros: (strn: string) => string;
export declare const checkNumber: (n: number | string) => number | string;
export declare const formatNumber: (n: number | string, decimals?: number) => string;
export declare const parseUnits: (n: number | string, decimals?: number) => ethersBigNumber;
export declare const BN: (val: number | string) => BigNumber;
export declare const toBN: (n: ethersBigNumber, decimals?: number) => BigNumber;
export declare const toBN2: (n: bigint, decimals?: number) => BigNumber;
export declare const toStringFromBN: (bn: BigNumber, decimals?: number) => string;
export declare const fromBN: (bn: BigNumber, decimals?: number) => ethersBigNumber;
export declare const fromBN2: (bn: BigNumber, decimals?: number) => bigint;
export declare const isEth: (address: string) => boolean;
export declare const getEthIndex: (addresses: string[]) => number;
export declare const _getCoinAddressesNoCheck: (...coins: string[] | string[][]) => string[];
export declare const _getCoinAddresses: (...coins: string[] | string[][]) => string[];
export declare const _getCoinDecimals: (...coinAddresses: string[] | string[][]) => number[];
export declare const _getBalances: (coins: string[], addresses: string[]) => Promise<IDict<string[]>>;
export declare const _prepareAddresses: (addresses: string[] | string[][]) => string[];
export declare const getBalances: (coins: string[], ...addresses: string[] | string[][]) => Promise<IDict<string[]> | string[]>;
export declare const _getAllowance: (coins: string[], address: string, spender: string) => Promise<ethersBigNumber[]>;
export declare const getAllowance: (coins: string[], address: string, spender: string) => Promise<string[]>;
export declare const hasAllowance: (coins: string[], amounts: (number | string)[], address: string, spender: string) => Promise<boolean>;
export declare const getPoolNameBySwapAddress: (swapAddress: string) => string;
export declare const _getUsdPricesFromApi: () => Promise<IDict<number>>;
export declare const _getCrvApyFromApi: () => Promise<IDict<[
    number,
    number
]>>;
export declare const _getRewardsFromApi: () => Promise<IDict<IRewardFromApi[]>>;
export declare const _getUsdRate: (assetId: string) => Promise<number>;
export declare const getUsdRate: (coin: string) => Promise<number>;
export declare const getTVL: (network?: INetworkName | IChainId) => Promise<number>;
export declare const getVolume: (network?: INetworkName | IChainId) => Promise<{
    totalVolume: number;
    cryptoVolume: number;
    cryptoShare: number;
}>;
export declare const _setContracts: (address: string, abi: any) => void;
export declare const _get_small_x: (_x: ethersBigNumber, _y: ethersBigNumber, x_decimals: number, y_decimals: number) => BigNumber;
export declare const _get_price_impact: (_x: ethersBigNumber, _y: ethersBigNumber, _small_x: ethersBigNumber, _small_y: ethersBigNumber, x_decimals: number, y_decimals: number) => BigNumber;
export declare const getCoinsData: (...coins: string[] | string[][]) => Promise<{
    name: string;
    symbol: string;
    decimals: number;
}[]>;
//# sourceMappingURL=utils.d.ts.map