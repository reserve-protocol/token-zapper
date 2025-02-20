import { IDict, IPoolData, REFERENCE_ASSET, ICurve } from '../interfaces'
import ERC20ABI from '../constants/abis/ERC20.json'

import { setFactoryZapContracts } from './common'
import { FACTORY_CONSTANTS } from './constants'
import { formatUnits } from '@ethersproject/units'
import { BigNumber as ethersBigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract as MulticallContract } from '../../../ethcall/src'
import factoryGaugeABIJson from '../constants/abis/gauge_factory.json'
import { JsonFragment } from '@ethersproject/abi'

const factoryGaugeABI = () =>
  Promise.resolve(factoryGaugeABIJson as JsonFragment[])

const BLACK_LIST: { [index: number]: any } = {
  1: ['0x066b6e1e93fa7dcd3f0eb7f8bac7d5a747ce0bf9'],
}

const deepFlatten = (arr: any[]): any[] =>
  [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)))

async function getRecentlyCreatedPoolId(
  this: any,
  swapAddress: string
): Promise<string> {
  const factoryContract =
    this.contracts[this.constants.ALIASES.factory].contract

  const poolCount = Number(
    formatUnits(await factoryContract.pool_count(this.constantOptions), 0)
  )
  for (let i = 1; i <= poolCount; i++) {
    const address: string = await factoryContract.pool_list(poolCount - i)
    if (address.toLowerCase() === swapAddress.toLowerCase())
      return `factory-v2-${poolCount - i}`
  }

  throw Error('Unknown pool')
}

async function getFactoryIdsAndSwapAddresses(
  this: any,
  fromIdx = 0
): Promise<[string[], string[]]> {
  const factoryContract =
    this.contracts[this.constants.ALIASES.factory].contract
  const factoryMulticallContract =
    this.contracts[this.constants.ALIASES.factory].multicallContract

  const poolCount = Number(
    formatUnits(await factoryContract.pool_count(this.constantOptions), 0)
  )
  const calls = []
  for (let i = fromIdx; i < poolCount; i++) {
    calls.push(factoryMulticallContract.pool_list(i))
  }
  if (calls.length === 0) return [[], []]

  let factories: { id: string; address: string }[] = (
    (await this.multicallProvider.all(calls)) as string[]
  ).map((addr, i) => ({
    id: `factory-v2-${fromIdx + i}`,
    address: addr.toLowerCase(),
  }))
  const swapAddresses = Object.values(
    this.constants.POOLS_DATA as IDict<IPoolData>
  ).map((pool: IPoolData) => pool.swap_address.toLowerCase())
  const blacklist = BLACK_LIST[this.chainId] ?? []
  factories = factories.filter(
    (f) => !swapAddresses.includes(f.address) && !blacklist.includes(f.address)
  )

  return [factories.map((f) => f.id), factories.map((f) => f.address)]
}

function _handleReferenceAssets(
  referenceAssets: ethersBigNumber[]
): REFERENCE_ASSET[] {
  return referenceAssets.map((t: ethersBigNumber) => {
    return (
      {
        0: 'USD',
        1: 'ETH',
        2: 'BTC',
      }[formatUnits(t, 0)] || 'OTHER'
    )
  }) as REFERENCE_ASSET[]
}

function _handleCoinAddresses(
  this: ICurve,
  coinAddresses: string[][]
): string[][] {
  return coinAddresses.map((addresses) =>
    addresses
      .filter((addr) => addr !== AddressZero)
      .map((addr) => addr.toLowerCase())
  )
}

async function getPoolsData(
  this: ICurve,
  factorySwapAddresses: string[]
): Promise<
  [
    string[],
    string[],
    REFERENCE_ASSET[],
    string[],
    string[],
    boolean[],
    string[][]
  ]
> {
  const factoryMulticallContract =
    this.contracts[this.constants.ALIASES.factory].multicallContract

  const calls = []
  for (const addr of factorySwapAddresses) {
    const tempSwapContract = new MulticallContract(addr, ERC20ABI)

    calls.push(factoryMulticallContract.get_implementation_address(addr))
    calls.push(factoryMulticallContract.get_gauge(addr))
    calls.push(factoryMulticallContract.get_pool_asset_type(addr))
    calls.push(tempSwapContract.symbol())
    calls.push(tempSwapContract.name())
    calls.push(factoryMulticallContract.is_meta(addr))
    calls.push(factoryMulticallContract.get_coins(addr))
  }

  const res = await this.multicallProvider.all(calls)
  const implememntationAddresses = (
    res.filter((a, i) => i % 7 == 0) as string[]
  ).map((a) => a.toLowerCase())
  const gaugeAddresses = (res.filter((a, i) => i % 7 == 1) as string[]).map(
    (a) => a.toLowerCase()
  )
  const referenceAssets = _handleReferenceAssets(
    res.filter((a, i) => i % 7 == 2) as ethersBigNumber[]
  )
  const symbols = res.filter((a, i) => i % 7 == 3) as string[]
  const names = res.filter((a, i) => i % 7 == 4) as string[]
  const isMeta = res.filter((a, i) => i % 7 == 5) as boolean[]
  const coinAddresses = _handleCoinAddresses.call(
    this,
    res.filter((a, i) => i % 7 == 6) as string[][]
  )

  return [
    implememntationAddresses,
    gaugeAddresses,
    referenceAssets,
    symbols,
    names,
    isMeta,
    coinAddresses,
  ]
}

function setFactorySwapContracts(
  this: ICurve,
  factorySwapAddresses: string[],
  factorySwapABIs: any[]
): void {
  factorySwapAddresses.forEach((addr, i) => {
    this.setContract(addr, factorySwapABIs[i])
  })
}

function setFactoryGaugeContracts(
  this: ICurve,
  factoryGaugeAddresses: string[]
): void {
  factoryGaugeAddresses
    .filter((addr) => addr !== AddressZero)
    .forEach((addr, i) => {
      this.setContract(addr, factoryGaugeABI())
    })
}

function setFactoryCoinsContracts(
  this: ICurve,
  coinAddresses: string[][]
): void {
  const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)))
  for (const addr of flattenedCoinAddresses) {
    if (addr in this.contracts) continue
    this.setContract(addr, ERC20ABI)
  }
}

function getExistingCoinAddressNameDict(this: ICurve): IDict<string> {
  const dict: IDict<string> = {}
  for (const poolData of Object.values(
    this.constants.POOLS_DATA as IDict<IPoolData>
  )) {
    poolData.wrapped_coin_addresses.forEach((addr, i) => {
      if (!(addr.toLowerCase() in dict)) {
        dict[addr.toLowerCase()] = poolData.wrapped_coins[i]
      }
    })

    poolData.underlying_coin_addresses.forEach((addr, i) => {
      if (!(addr.toLowerCase() in dict)) {
        dict[addr.toLowerCase()] = poolData.underlying_coins[i]
      }
    })
  }

  dict[this.constants.NATIVE_TOKEN.address] = this.constants.NATIVE_TOKEN.symbol

  return dict
}

async function getCoinsData(
  this: ICurve,
  coinAddresses: string[][],
  existingCoinAddrNameDict: IDict<string>,
  existingCoinAddrDecimalsDict: IDict<number>
): Promise<[IDict<string>, IDict<number>]> {
  const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)))
  const newCoinAddresses = []
  const coinAddrNamesDict: IDict<string> = {}
  const coinAddrDecimalsDict: IDict<number> = {}

  for (const addr of flattenedCoinAddresses) {
    if (addr in existingCoinAddrNameDict) {
      coinAddrNamesDict[addr] = existingCoinAddrNameDict[addr]
      coinAddrDecimalsDict[addr] = existingCoinAddrDecimalsDict[addr]
    } else {
      newCoinAddresses.push(addr)
    }
  }

  const calls = []
  for (const addr of newCoinAddresses) {
    calls.push(this.contracts[addr].multicallContract.symbol())
    calls.push(this.contracts[addr].multicallContract.decimals())
  }

  const res = await this.multicallProvider.all(calls)
  const symbols = res.filter((a, i) => i % 2 == 0) as string[]
  const decimals = (res.filter((a, i) => i % 2 == 1) as ethersBigNumber[]).map(
    (_d) => Number(formatUnits(_d, 0))
  )

  newCoinAddresses.forEach((addr, i) => {
    coinAddrNamesDict[addr] = symbols[i]
    coinAddrDecimalsDict[addr] = decimals[i]
  })

  return [coinAddrNamesDict, coinAddrDecimalsDict]
}

export async function getFactoryPoolData(
  this: ICurve,
  fromIdx = 0,
  swapAddress?: string
): Promise<IDict<IPoolData>> {
  const [rawPoolIds, rawSwapAddresses] = swapAddress
    ? [
        [await getRecentlyCreatedPoolId.call(this, swapAddress)],
        [swapAddress.toLowerCase()],
      ]
    : await getFactoryIdsAndSwapAddresses.call(this, fromIdx)
  if (rawPoolIds.length === 0) return {}

  const [
    rawImplementations,
    rawGauges,
    rawReferenceAssets,
    rawPoolSymbols,
    rawPoolNames,
    rawIsMeta,
    rawCoinAddresses,
  ] = await getPoolsData.call(this, rawSwapAddresses)
  const poolIds: string[] = []
  const swapAddresses: string[] = []
  const implementations: string[] = []
  const gaugeAddresses: string[] = []
  const referenceAssets: REFERENCE_ASSET[] = []
  const poolSymbols: string[] = []
  const poolNames: string[] = []
  const isMeta: boolean[] = []
  const coinAddresses: string[][] = []
  const implementationABIDict =
    FACTORY_CONSTANTS[this.chainId].implementationABIDict
  for (let i = 0; i < rawPoolIds.length; i++) {
    if (rawImplementations[i] in implementationABIDict) {
      poolIds.push(rawPoolIds[i])
      swapAddresses.push(rawSwapAddresses[i])
      implementations.push(rawImplementations[i])
      gaugeAddresses.push(rawGauges[i])
      referenceAssets.push(rawReferenceAssets[i])
      poolSymbols.push(rawPoolSymbols[i])
      poolNames.push(rawPoolNames[i])
      isMeta.push(rawIsMeta[i])
      coinAddresses.push(rawCoinAddresses[i])
    }
  }
  const swapABIs = implementations.map(
    (addr: string) => implementationABIDict[addr]
  )
  setFactorySwapContracts.call(this, swapAddresses, swapABIs)
  setFactoryGaugeContracts.call(this, gaugeAddresses)
  setFactoryCoinsContracts.call(this, coinAddresses)
  setFactoryZapContracts.call(this, false)
  const [coinAddressNameDict, coinAddressDecimalsDict] =
    await getCoinsData.call(
      this,
      coinAddresses,
      getExistingCoinAddressNameDict.call(this),
      this.constants.DECIMALS
    )
  const implementationBasePoolIdDict =
    FACTORY_CONSTANTS[this.chainId].implementationBasePoolIdDict
  const basePoolIds = implementations.map(
    (addr: string) => implementationBasePoolIdDict[addr]
  )

  const FACTORY_POOLS_DATA: IDict<IPoolData> = {}
  for (let i = 0; i < poolIds.length; i++) {
    if (!isMeta[i]) {
      FACTORY_POOLS_DATA[poolIds[i]] = {
        name: poolNames[i].split(': ')[1].trim(),
        full_name: poolNames[i],
        symbol: poolSymbols[i],
        implementation: '',
        reference_asset: referenceAssets[i],
        swap_address: swapAddresses[i],
        token_address: swapAddresses[i],
        gauge_address: gaugeAddresses[i],
        implementation_address: implementations[i], // Only for testing
        is_plain: true,
        is_factory: true,
        underlying_coins: coinAddresses[i].map(
          (addr) => coinAddressNameDict[addr]
        ),
        wrapped_coins: coinAddresses[i].map(
          (addr) => coinAddressNameDict[addr]
        ),
        underlying_coin_addresses: coinAddresses[i],
        wrapped_coin_addresses: coinAddresses[i],
        underlying_decimals: coinAddresses[i].map(
          (addr) => coinAddressDecimalsDict[addr]
        ),
        wrapped_decimals: coinAddresses[i].map(
          (addr) => coinAddressDecimalsDict[addr]
        ),
        swap_abi: swapABIs[i],
        gauge_abi: factoryGaugeABI,
      }
    } else {
      const allPoolsData = {
        ...this.constants.POOLS_DATA,
        ...FACTORY_POOLS_DATA,
      }
      // @ts-ignore
      const basePoolIdCoinsDict = Object.fromEntries(
        basePoolIds.map((poolId) => [
          poolId,
          allPoolsData[poolId]?.underlying_coins,
        ])
      )
      // @ts-ignore
      const basePoolIdCoinAddressesDict = Object.fromEntries(
        basePoolIds.map((poolId) => [
          poolId,
          allPoolsData[poolId]?.underlying_coin_addresses,
        ])
      )
      // @ts-ignore
      const basePoolIdDecimalsDict = Object.fromEntries(
        basePoolIds.map((poolId) => [
          poolId,
          allPoolsData[poolId]?.underlying_decimals,
        ])
      )
      const basePoolIdZapDict =
        FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict
      const basePoolZap = basePoolIdZapDict[basePoolIds[i]]

      FACTORY_POOLS_DATA[poolIds[i]] = {
        name: poolNames[i].split(': ')[1].trim(),
        full_name: poolNames[i],
        symbol: poolSymbols[i],
        reference_asset: referenceAssets[i],
        implementation: '',
        swap_address: swapAddresses[i],
        token_address: swapAddresses[i],
        gauge_address: gaugeAddresses[i],
        deposit_address: basePoolIdZapDict[basePoolIds[i]].address,
        implementation_address: implementations[i], // Only for testing
        is_meta: true,
        is_factory: true,
        base_pool: basePoolIds[i],
        underlying_coins: [
          coinAddressNameDict[coinAddresses[i][0]],
          ...basePoolIdCoinsDict[basePoolIds[i]],
        ],
        wrapped_coins: coinAddresses[i].map(
          (addr) => coinAddressNameDict[addr]
        ),
        underlying_coin_addresses: [
          coinAddresses[i][0],
          ...basePoolIdCoinAddressesDict[basePoolIds[i]],
        ],
        wrapped_coin_addresses: coinAddresses[i],
        underlying_decimals: [
          coinAddressDecimalsDict[coinAddresses[i][0]],
          ...basePoolIdDecimalsDict[basePoolIds[i]],
        ],
        wrapped_decimals: coinAddresses[i].map(
          (addr) => coinAddressDecimalsDict[addr]
        ),
        swap_abi: swapABIs[i],
        gauge_abi: factoryGaugeABI,
        deposit_abi: basePoolZap.ABI,
      }
    }
  }

  return FACTORY_POOLS_DATA
}
