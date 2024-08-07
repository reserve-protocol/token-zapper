import { Address } from '../base/Address'

export * from './ZapSimulation'
import {
  SimulateZapTransactionFunction
} from './ZapSimulation'


const defaultSearcherOptions = {
  requoteTolerance: 1,
  routerDeadline: 4500,
  searcherMinRoutesToProduce: 4,
  searcherMaxRoutesToProduce: 8,
  searchConcurrency: 4,
  defaultInternalTradeSlippage: 250n,
  maxSearchTimeMs: 15000,

  // These parameters will reject zaps that have successfully simulated
  // but even if it produced a valid result, the result should be within some bounds
  zapMaxValueLoss: 5, // 0.05 or 5%

  // total output value = output token value + dust value
  zapMaxDustProduced: 2, // 0.02 or 2% of total output value
}

export type SearcherOptions = (typeof defaultSearcherOptions) & { simulateZapTransaction?: SimulateZapTransactionFunction}

const convertAddressObject = <const T extends Record<string, unknown>>(
  obj: T
) =>
  Object.fromEntries(
    Object.entries(obj).map(([symbol, addr]) => [
      symbol,
      typeof addr === 'string' ? Address.from(addr) : null,
    ])
  ) as { [K in keyof T]: T[K] extends null ? null : Address }

export interface NativeTokenDefinition<
  Name extends string,
  Symbol extends string
> {
  name: Name
  symbol: Symbol
  decimals: number
}
export const makeConfig = <
  const ChainId extends number,
  const NativeToken extends NativeTokenDefinition<string, string>,
  const CommonTokens extends Record<string, string>,
  const RTokens extends Record<string, string>,
  const Blocktime extends number
>(
  chainId: ChainId,
  nativeToken: NativeToken,
  commonTokens: CommonTokens,
  rTokens: RTokens,
  addresses: {
    facadeAddress: string
    oldFacadeAddress: string
    executorAddress: string
    zapperAddress: string
    wrappedNative: string
    rtokenLens: string

    // Weiroll toolkits
    balanceOf: string
    curveRouterCall: string
    ethBalanceOf: string
    uniV3Router: string
    curveStableSwapNGHelper: string
    curveCryptoFactoryHelper: string
  },
  options: {
    blocktime: Blocktime
    blockGasLimit: bigint
  } & Partial<SearcherOptions>
) => {
  return {
    chainId,
    nativeToken,
    addresses: {
      ...convertAddressObject(addresses),
      commonTokens: convertAddressObject(commonTokens),
      rTokens: convertAddressObject(
        Object.fromEntries(
          Object.entries(rTokens).map((i) => [i[0], i[1]])
        ) as { [K in keyof RTokens]: string }
      ),
    },
    ...Object.assign({}, defaultSearcherOptions, options),
  } as const
}
export type Config<
  ChainId extends number = number,
  NativeToken extends NativeTokenDefinition<
    string,
    string
  > = NativeTokenDefinition<string, string>,
  CommonTokens extends Record<string, string> = {},
  RTokens extends Record<string, string> = Record<string, string>,
  Blocktime extends number = number
> = ReturnType<
  typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens, Blocktime>
>

export type ConfigWithToken<K extends { [KK in string]: string }> = Config<
  number,
  NativeTokenDefinition<string, string>,
  K,
  {}
>
