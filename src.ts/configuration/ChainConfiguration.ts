import { Address } from '../base/Address'

export * from './ZapSimulation'
import { SimulateZapTransactionFunction } from './ZapSimulation'

const defaultSearcherOptions = {
  requoteTolerance: 1,

  // How long any individual trade may use
  routerDeadline: 2500,
  routerMinResults: 1,
  searcherMinRoutesToProduce: 2,
  searcherMaxRoutesToProduce: 8,

  searchConcurrency: 32,

  defaultInternalTradeSlippage: 50n,

  maxSearchTimeMs: 12000,

  // These parameters will reject zaps that have successfully simulated
  // but even if it produced a valid result, the result should be within some bounds
  zapMaxValueLoss: 4, // 0.04 or 3%

  // total output value = output token value + dust value
  zapMaxDustProduced: 3, // 0.02 or 2% of total output value

  largeZapThreshold: 300000,
  largeZapSearchTime: 6000,

  // New options
  optimisationSteps: 10,
  refinementOptimisationSteps: 5,
  minimiseDustPhase1Steps: 10,
  minimiseDustPhase2Steps: 5,

  cacheResolution: 4,
  tfgCacheTTL: 5 * 60 * 1000, // 5 minutes

  // Use new contract for all zaps
  useNewZapperContract: false,

  rejectHighDust: true,

  maxPhase2TimeRefinementTime: 5000,

  dynamicConfigURL: null as string | null,
  maxOptimisationTime: 60000,

  topLevelTradeMintOptimisationParts: 10
}
export const getDefaultSearcherOptions = () => {
  return defaultSearcherOptions
}

export type SearcherOptions = typeof defaultSearcherOptions & {
  simulateZapTransaction?: SimulateZapTransactionFunction
}

export const convertAddressObject = <const T extends Record<string, unknown>>(
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
  // eslint-disable-next-line @typescript-eslint/ban-types
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
    executorAddress2?: string
    emitId: string
    zapperAddress: string
    zapper2Address?: string
    wrappedNative: string
    rtokenLens: string

    // Weiroll toolkits
    balanceOf: string
    curveRouterCall: string
    ethBalanceOf: string
    uniV3Router: string
    curveStableSwapNGHelper: string
    curveCryptoFactoryHelper: string

    usdc: string
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
  CommonTokens extends {
    ERC20GAS: string
  } & Record<string, string> = {
    ERC20GAS: string
  },
  RTokens extends Record<string, string> = Record<string, string>,
  Blocktime extends number = number
> = ReturnType<
  typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens, Blocktime>
>

export type ConfigWithToken<
  K extends { [KK in string]: string },
  R extends { [KK in string]: string } = Record<string, string>
> = Config<
  number,
  NativeTokenDefinition<string, string>,
  K & { ERC20GAS: string },
  R
>
