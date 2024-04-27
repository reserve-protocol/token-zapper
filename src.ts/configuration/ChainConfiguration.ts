import { Address } from '../base/Address'

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
  const RTokens extends Record<string, string>
>(
  chainId: ChainId,
  nativeToken: NativeToken,
  commonTokens: CommonTokens,
  rTokenDeployments: RTokens,
  addresses: {
    facadeAddress: string
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
  }
) => {
  return {
    chainId,
    nativeToken,
    addresses: {
      ...convertAddressObject(addresses),
      commonTokens: convertAddressObject(commonTokens),
      rTokens: convertAddressObject(
        Object.fromEntries(
          Object.entries(rTokenDeployments).map((i) => [i[0], i[1]])
        ) as { [K in keyof RTokens]: string }
      ),
    },
  } as const
}
export type Config<
  ChainId extends number = number,
  NativeToken extends NativeTokenDefinition<
    string,
    string
  > = NativeTokenDefinition<string, string>,
  CommonTokens extends Record<string, string> = {},
  RTokens extends Record<string, string> = Record<string, string>
> = ReturnType<typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens>>

export type ConfigWithToken<K extends { [KK in string]: string }> = Config<
  number,
  NativeTokenDefinition<string, string>,
  K,
  {}
>
