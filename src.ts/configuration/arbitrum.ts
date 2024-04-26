import { ethers } from 'ethers'
import { type Universe } from '../Universe'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { makeConfig } from './ChainConfiguration'
import { ChainIds, getAddressesForChain } from './ReserveAddresses'

const chainId = ChainIds.Arbitrum
const reserveAddresses = getAddressesForChain(chainId)

export const COMMON_TOKENS = {
  RSR: reserveAddresses.RSR_ADDRESS,
  CRV: reserveAddresses.CRV_ADDRESS,
  CVX: reserveAddresses.CVX_ADDRESS,
  eUSD: reserveAddresses.EUSD_ADDRESS,
  ['ETH+']: reserveAddresses.ETHPLUS_ADDRESS,
  RGUSD: reserveAddresses.RGUSD_ADDRESS,
  STG: reserveAddresses.STG_ADDRESS,

  ARB: '0x912ce59144191c1204e64559fe8253a0e49e6548',

  USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  DAI: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  ERC20GAS: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  cbETH: '0x1debd73e752beaf79865fd6446b0c970eae7732f',
  wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
  reth: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
  USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  WBTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
  FRAX: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
  COMP: '0x354A6dA3fcde098F8389cad84b0182725c6C91dE',
} as const

export const RTOKENS = {}
export const baseConfig = makeConfig(
  ChainIds.Arbitrum,
  {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
  },
  COMMON_TOKENS,
  RTOKENS,
  {
    facadeAddress: reserveAddresses.FACADE_ADDRESS,
    wrappedNative: COMMON_TOKENS.WETH,

    zapperAddress: ethers.constants.AddressZero,
    executorAddress: ethers.constants.AddressZero,
    rtokenLens: ethers.constants.AddressZero,
    balanceOf: ethers.constants.AddressZero,
    curveRouterCall: ethers.constants.AddressZero,
    ethBalanceOf: ethers.constants.AddressZero,
    uniV3Router: ethers.constants.AddressZero,
    curveStableSwapNGHelper: ethers.constants.AddressZero,
  }
)





export const PROTOCOL_CONFIGS = {
  usdPriceOracles: {
    [COMMON_TOKENS.ARB]: '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6',
    [COMMON_TOKENS.COMP]: '0xe7C53FFd03Eb6ceF7d208bC4C13446c76d1E5884',
    [COMMON_TOKENS.DAI]: '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB',
    [COMMON_TOKENS.USDC]: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
    [COMMON_TOKENS.USDT]: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
    [COMMON_TOKENS.RSR]: '0xcfF9349ec6d027f20fC9360117fef4a1Ad38B488',
  },
  ethPriceOracles: {
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22':
      '0x806b4ac04501c29769051e42783cf04dce41440b', // cbETH / ETH
    '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452':
      '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061', // wsteth / ETH
    // "": "0xf397bf97280b488ca19ee3093e81c0a77f02e9a5", // rETH / ETH
  },
  aave: {
  },
  compoundV3: {
    markets: [
      {
        baseToken: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDC
        receiptToken: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // cUSDCv3
        vaults: [
          '0xbC0033679AEf41Fb9FeB553Fdf55a8Bb2fC5B29e', // Reserve wrapped cUSDCV3
          '0xa8d818C719c1034E731Feba2088F4F011D44ACB3',
        ],
      },
      {
        baseToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
        receiptToken: '0xb125E6687d4313864e53df431d5425969c15Eb2F', // cUSDCv3
        vaults: ['0xa694f7177c6c839c951c74c797283b35d0a486c8'],
      },
    ],
  },
}

export type BaseConfigType = typeof baseConfig
export type BaseUniverse = Universe<BaseConfigType>
