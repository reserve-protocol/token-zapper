import { ethers } from 'ethers'
import { type Universe } from '../Universe'
import { makeConfig } from './ChainConfiguration'

import deployments from '../contracts/deployments.json'
import { GAS_TOKEN_ADDRESS } from '../base/constants'

const baseDeployments = deployments[8453][0]

const contractAddress = (name: keyof typeof baseDeployments.contracts) => {
  return baseDeployments.contracts[name].address
}

export const COMMON_TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  DAI: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
  ETH: GAS_TOKEN_ADDRESS,
  WETH: '0x4200000000000000000000000000000000000006',
  ERC20GAS: '0x4200000000000000000000000000000000000006',
  cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
  wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',

  meUSD: '0xbb819D845b573B5D7C538F5b85057160cfb5f313',
  eUSD: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
  'wsAMM-eUSD/USDC': '0xDB5b8cead52f77De0f6B5255f73F348AAf2CBb8D',

  MOG: '0x2da56acb9ea78330f947bd57c54119debda7af71',
  DEGEN: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
  AERO: '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
  WELL: '0xA88594D404727625A9437C3f886C7643872296AE',
  cbBTC: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',

  RSR: '0xab36452dbac151be02b16ca17d8919826072f64a',

  SuperOETH: '0xdbfefd2e8460a6ee4955a68582f85708baea60a3',
  wsuperOETH: '0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6',

  // Folios
  ABX: '0xeBcda5b80f62DD4DD2A96357b42BB6Facbf30267',
  CLX: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
  VTF: '0x47686106181b3cefe4eaf94c4c10b48ac750370b',
  AI: '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9',
  BGCI: '0x23418de10d422ad71c9d5713a2b8991a9c586443',
  MVTT10F: '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e',
  MVDA25: '0xd600e748c17ca237fcb5967fa13d688aff17be78',
  BDTF: '0xb8753941196692e322846cfee9c14c97ac81928a',
  CLUB: '0xf8ef6e785473e82527908b06023ac3e401ccfdcd',
} as const

export const RTOKENS = {
  hyUSD: '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e',
  bsd: '0xcb327b99ff831bf8223cced12b1338ff3aa322ff',
  RIVOTKN: '0xd7a1c6d60d3c152aaae4f685f419f364153afe4e',
  BSDX: '0x8f0987ddb485219c767770e2080e5cc01ddc772a',
} as const

export const baseConfig = makeConfig(
  8453,
  {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
  },
  COMMON_TOKENS,
  RTOKENS,
  {
    emitId: contractAddress('EmitId'),
    facadeAddress: '0xEb2071e9B542555E90E6e4E1F83fa17423583991',
    oldFacadeAddress: '0xe1aa15DA8b993c6312BAeD91E0b470AE405F91BF',
    zapperAddress: '0xaa560d5c2fade67cf6836ab793e56a79f09d4282',
    zapper2Address: contractAddress('Zapper2'),
    executorAddress: '0x560740052f380669c90811f711f80b21306d4713',
    executorAddress2: contractAddress('ZapperExecutor'),
    wrappedNative: '0x4200000000000000000000000000000000000006',
    rtokenLens: contractAddress('RTokenLens'),

    balanceOf: contractAddress('BalanceOf'),
    curveRouterCall: contractAddress('CurveRouterCall'),
    ethBalanceOf: contractAddress('EthBalance'),
    uniV3Router: contractAddress('UniV3RouterCall'),
    curveStableSwapNGHelper: ethers.constants.AddressZero,
    curveCryptoFactoryHelper: ethers.constants.AddressZero,

    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  {
    blocktime: 2000,
    zapMaxDustProduced: 8,
    blockGasLimit: 60_000_000n,
    requoteTolerance: 4,
  }
)

//

export const PROTOCOL_CONFIGS = {
  usdPriceOracles: {
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913':
      '0x7e860098f58bbfc8648a4311b374b1d669a2bc6b', // USDC/USD
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA':
      '0x7e860098f58bbfc8648a4311b374b1d669a2bc6b', // USDbC/USD
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb':
      '0x591e79239a7d679378ec8c847e5038150364c78f', // DAI/USD
    '0x2da56acb9ea78330f947bd57c54119debda7af71':
      '0x4aeb6D15769EaD32D0c5Be2940F40c7CFf53801d', // MOG/USD
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed':
      '0xE62BcE5D7CB9d16AB8b4D622538bc0A50A5799c2', // DEGEN/USD
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631':
      '0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0', // AERO/USD
    '0xA88594D404727625A9437C3f886C7643872296AE':
      '0xc15d9944dAefE2dB03e53bef8DDA25a56832C5fe', // WELL/USD
    '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf':
      '0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D', // cbBTC/USD
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22':
      '0xd7818272b9e248357d13057aab0b417af31e817d', // cbETH/USD
    '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452':
      '0xf586d0728a47229e747d824a939000Cf21dEF5A0', // wsteth/USD
  },
  erc4626: [
    ['0xbb819D845b573B5D7C538F5b85057160cfb5f313', 'morpho'],
    ['0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6', 'superOETH'],
  ],
  aaveV3: {
    pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    wrappers: [
      '0x308447562442Cc43978f8274fA722C9C14BafF8b',
      '0x184460704886f9F2A7F3A0c2887680867954dC6E',
      '0x6F6f81e5E66f503184f2202D83a79650c3285759',
    ],
  },
  compV3: {
    comets: {
      CUSDCV3: '0xb125E6687d4313864e53df431d5425969c15Eb2F',
      CUSDbCV3: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
      CWETHV3: '0x46e6b214b524310239732D51387075E0e70970bf', // WETH
    },
    wrappers: [
      '0xbC0033679AEf41Fb9FeB553Fdf55a8Bb2fC5B29e',
      '0xa8d818C719c1034E731Feba2088F4F011D44ACB3',
      '0xa694f7177c6c839c951c74c797283b35d0a486c8',
      '0x53f1Df4E5591Ae35Bf738742981669c3767241FA',
    ],
  },
  stargate: {
    router: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
    wrappers: ['0x073F98792ef4c00bB5f11B1F64f13cB25Cde0d8D'],
    tokens: ['0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA'],
  },

  aerodrome: {
    lpPoolWrappers: {
      'wsAMM-eUSD/USDC': '0xDB5b8cead52f77De0f6B5255f73F348AAf2CBb8D',
      'wvAMM-WETH/AERO2': '0x3712DDCF9aE516dD01042948B76A76901a84CD36',
      'wvAMM-Mog/WETH2': '0xCcC18B21be01a37ebFa5C932eD09574752F88C15',
      'wsAMM-USDz/USDC': '0x246Df11B856E9fD6120494F168475e1b41321c61',
      'wvAMM-WETH/DEGEN': '0xA762F790a31654D9AeF7DE550A473A0F5621E4F1',
      'wvAMM-WETH/WELL': '0x1F599F8657CAA38Ee825e4E2d64F695749E2a161',
      'wvAMM-WETH/cbBTC': '0x4BD08a771CdAbA5333CAc6F20322eD7d72b6cBfA',
      'wvAMM-Mog/WETH': '0xfaAC26b279338dF8cF56B11A572617f674A2F69C',
      'wvAMM-WETH/AERO': '0x65f2c1b253a3E45670aDD259C9688Edf1A3b814d',
    },
  },
}

export type BaseConfigType = typeof baseConfig
export type BaseUniverse = Universe<BaseConfigType>
