import { ethers } from 'ethers'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import {
  ChainId,
  ChainIds,
  isChainIdSupported,
} from '../configuration/ReserveAddresses'
import {
  BalancerCall,
  BalancerCall__factory,
  IBalancerQueries,
  IBalancerQueries__factory,
  IBalancerVault,
  IBalancerVault__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import { Universe } from '../Universe'
import { BaseAction, DestinationOptions, InteractionConvention } from './Action'

type CHAIN_IN = 'MAINNET' | 'ARBITRUM' | 'BASE'

const chainIdToChainIn: Record<ChainId, CHAIN_IN> = {
  [ChainIds.Mainnet]: 'MAINNET',
  [ChainIds.Arbitrum]: 'ARBITRUM',
  [ChainIds.Base]: 'BASE',
}

const query = `query GetPools(
  $first: Int,
  $skip: Int,
  $orderBy: GqlPoolOrderBy,
  $orderDirection: GqlPoolOrderDirection,
  $where: GqlPoolFilter,
) {
  poolGetPools(
    first: $first
    skip: $skip
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    address
    decimals
    protocolVersion
    hasErc4626
    hasNestedErc4626
    displayTokens {
      id
      address
      name
      weight
      symbol
      nestedTokens {
        id
        address
        name
        weight
        symbol
        __typename
      }
      __typename
    }
    factory
    id
    name
    owner
    symbol
    type
    __typename
  }
}`

const callBalancerAddresses: Record<ChainId, Address> = {
  [ChainIds.Base]: Address.from('0x0000000000000000000000000000000000000000'),
  [ChainIds.Mainnet]: Address.from(
    '0x4d0889452f049e527756C90F81D7bE417B85F0df'
  ),
  [ChainIds.Arbitrum]: Address.from(
    '0x0000000000000000000000000000000000000000'
  ),
}

const BALANCER_VAULT_ADDRESS = Address.from(
  '0xba12222222228d8ba445958a75a0704d566bf2c8'
)
const queriesAddresess: Record<ChainId, Address> = {
  [ChainIds.Base]: Address.from('0x300ab2038eac391f26d9f895dc61f8f66a548833'),
  [ChainIds.Mainnet]: Address.from(
    '0xe39b5e3b6d74016b2f6a9673d7d7493b6df549d5'
  ),
  [ChainIds.Arbitrum]: Address.from(
    '0xe39b5e3b6d74016b2f6a9673d7d7493b6df549d5'
  ),
}
interface IBalancerToken {
  id: string
  address: string
  name: string
  weight: string
  symbol: string
  nestedTokens: IBalancerToken[]
}

interface IBalancerPool {
  address: string
  decimals: number
  protocolVersion: number
  hasErc4626: boolean
  hasNestedErc4626: boolean
  displayTokens: IBalancerToken[]
  factory: string
  id: string
  name: string
  owner: string
  symbol: string
  type: string
}
type PoolType =
  | 'WEIGHTED'
  | 'STABLE'
  | 'COMPOSABLE_STABLE'
  | 'META_STABLE'
  | 'LIQUIDITY_BOOTSTRAPPING'
  | 'GYRO'
  | 'GYRO3'
  | 'GYROE'
  | 'FX'
const POOLTYPES: PoolType[] = [
  'WEIGHTED',
  'STABLE',
  'COMPOSABLE_STABLE',
  'META_STABLE',
  'LIQUIDITY_BOOTSTRAPPING',
  'GYRO',
  'GYRO3',
  'GYROE',
  'FX',
]

const loadPoolsFromAPI = async (chainId: ChainId) => {
  const chainIn = chainIdToChainIn[chainId]
  const where = {
    chainIn: [chainIn],
    minTvl: 200000,
    poolTypeIn: POOLTYPES,
    tagIn: null,
    tagNotIn: ['BLACK_LISTED'],
    userAddress: null,
  }
  const variables = {
    first: 250,
    orderBy: 'totalLiquidity',
    orderDirection: 'desc',
    skip: 0,
    where,
  }
  const body = {
    operationName: 'GetPools',
    query,
    variables,
  }
  const response = await fetch('https://api-v3.balancer.fi/graphql', {
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors',
    referrer: 'https://balancer.fi/',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
  })
  const json = await response.json()
  if (!json.data) {
    console.error(JSON.stringify(json, null, 2))
    console.log('Failed to load pools from Balancer API')
    throw new Error(
      `No data returned from Balancer API: ${JSON.stringify(json)}`
    )
  }

  return json.data.poolGetPools as IBalancerPool[]
}

class BalancerContext {
  public readonly pools = new Map<Address, BalancerPool>()

  public readonly getPoolBalance: (
    pool: BalancerPool
  ) => Promise<TokenQuantity[]>

  public readonly getPoolLiquidity: (
    pool: BalancerPool
  ) => Promise<TokenQuantity>

  constructor(
    public readonly universe: Universe,
    public readonly queriesContract: IBalancerQueries,
    public readonly vaultContract: IBalancerVault,
    public readonly callContract: BalancerCall
  ) {
    const poolInfoCache = universe.createCache(async (pool: BalancerPool) => {
      const poolId = pool.id
      const tokens = pool.tokens
      const tokenInfos = await Promise.all(
        tokens.map((token) =>
          vaultContract
            .getPoolTokenInfo(poolId, token.address.address)
            .then((info) => ({
              poolBalance: token.from(info.cash),
              poolManaged: token.from(info.managed),
              poolLastChangeBlock: info.lastChangeBlock.toBigInt(),
              poolAssetManager: Address.from(info.assetManager),
            }))
        )
      )
      return tokenInfos
    })

    this.getPoolBalance = async (pool: BalancerPool) => {
      const tokenInfos = await poolInfoCache.get(pool)
      return tokenInfos.map((i) => i.poolBalance)
    }
    const poolLiquidityCache = universe.createCache(
      async (pool: BalancerPool) => {
        const balances = await this.getPoolBalance(pool)
        const priced = await Promise.all(balances.map((i) => i.price()))
        return priced.reduce(
          (acc, i) => acc.add(i.into(universe.usd)),
          universe.usd.zero
        )
      }
    )
    this.getPoolLiquidity = (pool: BalancerPool) => poolLiquidityCache.get(pool)
  }

  public definePool(pool: BalancerPool) {
    this.pools.set(pool.address, pool)
  }
}

enum SwapKind {
  GIVEN_IN,
  GIVEN_OUT,
}

export class BalancerSwap extends BaseAction {
  public readonly tokenInIndex: number
  public readonly tokenOutIndex: number
  public get isTrade(): boolean {
    return true
  }
  public async liquidity(): Promise<number> {
    return await this.context
      .getPoolLiquidity(this.pool)
      .then((i) => i.asNumber())
  }
  public get dependsOnRpc(): boolean {
    return true
  }
  public get oneUsePrZap(): boolean {
    return true
  }
  public get returnsOutput(): boolean {
    return true
  }
  public get supportsDynamicInput(): boolean {
    return true
  }
  public get addressesInUse(): Set<Address> {
    return this.pool.addressesInUse
  }
  get protocol(): string {
    return 'balancer'
  }
  toString(): string {
    return `balancer.swap(${this.tokenIn}, ${this.tokenOut})`
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.context.queriesContract.callStatic.querySwap(
      {
        poolId: this.pool.id,
        kind: SwapKind.GIVEN_IN,
        assetIn: this.tokenIn.address.address,
        assetOut: this.tokenOut.address.address,
        amount: amountsIn.amount,
        userData: '0x',
      },
      {
        sender: this.universe.execAddress.address,
        fromInternalBalance: false,
        recipient: this.universe.execAddress.address,
        toInternalBalance: false,
      }
    )
    return [this.tokenOut.from(out)]
  }
  gasEstimate(): bigint {
    return 350_000n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const lib = Contract.createLibrary(this.context.callContract)

    const predictedOutput = await this.quote(predictedInputs)

    // struct StaticData {
    //   uint256 limit;
    //   address tokenIn;
    //   address tokenOut;
    //   bytes32 poolId;
    //   address payable recipient;
    //   uint256 deadline;
    //   IBalancerVault.SwapKind kind;
    // }
    let minOut = 0n //predictedOutput[0].amount - predictedOutput[0].amount / 5n

    const encodedStaticData = ethers.utils.defaultAbiCoder.encode(
      [
        'uint256',
        'address',
        'address',
        'bytes32',
        'address',
        'uint256',
        'uint8',
      ],
      [
        minOut,
        this.tokenIn.address.address,
        this.tokenOut.address.address,
        this.pool.id,
        destination.address,
        BigInt(Math.floor(Date.now() / 1000 + 60 * 15)),
        SwapKind.GIVEN_IN,
      ]
    )
    // function swap(
    //   uint256 amountIn,
    //   bytes memory data
    // ) external returns (uint256) {
    const out = planner.add(
      lib.swap(input, encodedStaticData),
      `Balancer: Swap ${predictedInputs.join(', ')} -> ${predictedOutput.join(
        ', '
      )} on pool ${this.pool.address}`,
      `balancer_${this.pool.address.toShortString()}_${this.tokenIn}_${
        this.tokenOut
      }`
    )!
    return [out]
  }

  public get context(): BalancerContext {
    return this.pool.balancerContext
  }
  public get universe(): Universe {
    return this.context.universe
  }

  public constructor(
    public readonly pool: BalancerPool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(tokenIn, BALANCER_VAULT_ADDRESS)]
    )

    this.tokenInIndex = this.pool.tokens.indexOf(tokenIn)
    this.tokenOutIndex = this.pool.tokens.indexOf(tokenOut)
    if (this.tokenInIndex === -1 || this.tokenOutIndex === -1) {
      throw new Error(`PANIC: token not found in pool`)
    }
  }
}

class BalancerPool {
  public readonly actions: BalancerSwap[] = []
  public readonly addressesInUse: Set<Address> = new Set()
  constructor(
    public readonly balancerContext: BalancerContext,
    public readonly id: string,
    public readonly name: string,
    public readonly poolType: string,
    public readonly address: Address,
    public readonly tokens: Token[],
    public readonly weights: (number | null)[]
  ) {
    this.addressesInUse.add(address)

    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        this.actions.push(new BalancerSwap(this, tokens[i], tokens[j]))
        this.actions.push(new BalancerSwap(this, tokens[j], tokens[i]))
      }
    }
  }

  public toString(): string {
    return `BalancePool(name="${this.name}", type=${
      this.poolType
    }, tokens=${this.tokens.join(', ')})`
  }
}
export const setupBalancer = async (universe: Universe) => {
  const provider = universe.provider
  const chainId = universe.chainId
  if (!isChainIdSupported(chainId)) {
    throw new Error(`Balancer not supported on chain ${chainId}`)
  }
  const queriesAddress = queriesAddresess[chainId]
  const poolData = await loadPoolsFromAPI(chainId)

  const vaultContract = IBalancerVault__factory.connect(
    BALANCER_VAULT_ADDRESS.address,
    provider
  )
  const queriesContract = IBalancerQueries__factory.connect(
    queriesAddress.address,
    provider
  )
  const callContract = BalancerCall__factory.connect(
    callBalancerAddresses[chainId].address,
    provider
  )
  const balancerContext = new BalancerContext(
    universe,
    queriesContract,
    vaultContract,
    callContract
  )
  const pools = await Promise.all(
    poolData.map(async (data) => {
      const poolAddress = Address.from(data.address)
      const tokens = await Promise.all(
        data.displayTokens.map(async (token) => {
          const tokenAddress = Address.from(token.address)
          return universe.getToken(tokenAddress)
        })
      )
      const weights = data.displayTokens.map((token) =>
        token.weight == null ? null : parseFloat(token.weight)
      )
      const out = new BalancerPool(
        balancerContext,
        data.id,
        data.name,
        data.type,
        poolAddress,
        tokens,
        weights
      )
      balancerContext.definePool(out)
      return out
    })
  )

  for (const pool of pools) {
    for (const action of pool.actions) {
      // console.log(action.toString())
      universe.addAction(action)
    }
  }

  return balancerContext
}
