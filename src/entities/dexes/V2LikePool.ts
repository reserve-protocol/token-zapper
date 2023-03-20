import { Address } from '../../base/Address'
import { FEE_SCALE } from '../../base/constants'
import { type Token, type TokenQuantity } from '../Token'
import { UniswapV2Pair__factory } from '../../contracts'
import { type SwapDirection } from './TwoTokenPoolTypes'
import { getCreate2Address, keccak256 } from 'ethers/lib/utils'
import { parseHexStringIntoBuffer } from '../../base/utils'
const INIT_CODE_HASH = parseHexStringIntoBuffer(
  '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
)
const sortTokens = (tokenA: Token, tokenB: Token) => {
  return tokenA.address.gt(tokenB.address) ? [tokenB, tokenA] : [tokenA, tokenB]
}
type Env = {
  pool: V2Pool
  inputToken: Token
  outputToken: Token
  direction: SwapDirection
}
const computeV2PoolAddress = (
  factory: Address,
  token0: Token,
  token1: Token
) => {
  const salt = Buffer.concat([token0.address.bytes, token1.address.bytes])
  return Address.from(
    getCreate2Address(factory.address, keccak256(salt), INIT_CODE_HASH)
  )
}
type QuoteFn = (quantity: TokenQuantity, env: Env) => Promise<TokenQuantity>

type EncodeFn = (
  quantity: TokenQuantity,
  destination: Address,
  env: Env
) => Promise<Buffer>

function getAmountOut(
  amountIn: bigint,
  feeInverse: bigint,
  rin: bigint,
  rout: bigint
): bigint {
  const amountInWithFee = amountIn * feeInverse
  const numerator = amountInWithFee * rout
  const denominator = rin * FEE_SCALE + amountInWithFee
  return numerator / denominator
}
function getAmountIn(
  amountOut: bigint,
  feeInverse: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  const numerator = reserveIn * amountOut * FEE_SCALE
  const denominator = (reserveOut - amountOut) * feeInverse
  return numerator / denominator + 1n
}

export const standardSwap: QuoteFn = async (inputQty, action) => {
  if (action.direction === '0->1') {
    if (inputQty.token === action.pool.token0) {
      return action.pool.token1.quantityFromBigInt(
        getAmountOut(
          inputQty.amount,
          action.pool.feeInv,
          action.pool.reserve0,
          action.pool.reserve1
        )
      )
    } else {
      return action.pool.token0.quantityFromBigInt(
        getAmountIn(
          inputQty.amount,
          action.pool.feeInv,
          action.pool.reserve0,
          action.pool.reserve1
        )
      )
    }
  } else if (action.direction === '1->0') {
    if (inputQty.token === action.pool.token1) {
      return action.pool.token0.quantityFromBigInt(
        getAmountOut(
          inputQty.amount,
          action.pool.feeInv,
          action.pool.reserve1,
          action.pool.reserve0
        )
      )
    } else {
      return action.pool.token1.quantityFromBigInt(
        getAmountIn(
          inputQty.amount,
          action.pool.feeInv,
          action.pool.reserve1,
          action.pool.reserve0
        )
      )
    }
  } else {
    throw new Error('Invalid direction ' + action.direction)
  }
}

const standardPoolIface = UniswapV2Pair__factory.createInterface()
export const standardEncoding: EncodeFn = async (inputQty, to, action) => {
  let amount0 = 0n
  let amount1 = 0n
  if (action.direction === '0->1') {
    if (inputQty.token === action.pool.token0) {
      amount1 = getAmountOut(
        inputQty.amount,
        action.pool.feeInv,
        action.pool.reserve0,
        action.pool.reserve1
      )
    } else {
      amount0 = getAmountIn(
        inputQty.amount,
        action.pool.feeInv,
        action.pool.reserve0,
        action.pool.reserve1
      )
    }
  } else if (action.direction === '1->0') {
    if (inputQty.token === action.pool.token1) {
      amount0 = getAmountOut(
        inputQty.amount,
        action.pool.feeInv,
        action.pool.reserve1,
        action.pool.reserve0
      )
    } else {
      amount1 = getAmountIn(
        inputQty.amount,
        action.pool.feeInv,
        action.pool.reserve1,
        action.pool.reserve0
      )
    }
  } else {
    throw new Error('Invalid direction ' + action.direction)
  }

  return Buffer.from(
    standardPoolIface
      .encodeFunctionData('swap', [
        amount0,
        amount1,
        to.address,
        Buffer.alloc(0),
      ])
      .slice(2),
    'hex'
  )
}

export class V2Pool {
  private _feeInv = 0n

  get fee() {
    return this._fee
  }

  get feeInv() {
    return this._feeInv
  }

  get name() {
    return `V2.${this.address.address.slice(
      0,
      6
    )}..${this.address.address.slice(38)}.${this.token0}.${this.token1}`
  }

  toString() {
    return `V2Pool(${this.name},reserve0=${this.token0.quantityFromBigInt(
      this.reserve0_
    )},reserve1=${this.token1.quantityFromBigInt(this.reserve1_)})`
  }

  constructor(
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    private reserve0_: bigint,
    private reserve1_: bigint,
    private readonly _fee: bigint,
    public readonly swapFn: QuoteFn,
    public readonly encodeSwap: EncodeFn
  ) {
    this._feeInv = FEE_SCALE - _fee
  }

  get reserve0() {
    return this.reserve0_
  }

  get reserve1() {
    return this.reserve1_
  }

  updateReserves(reserve0: bigint, reserve1: bigint) {
    this.reserve0_ = reserve0
    this.reserve1_ = reserve1
  }

  static createStandardV2Pool(
    factory: Address,
    tokenA: Token,
    tokenB: Token,
    fee: bigint,
    poolAddress?: Address
  ) {
    const [token0, token1] = sortTokens(tokenA, tokenB)
    poolAddress =
      poolAddress == null
        ? computeV2PoolAddress(factory, token0, token1)
        : poolAddress

    return new V2Pool(
      poolAddress,
      token0,
      token1,
      0n,
      0n,
      fee,
      standardSwap,
      standardEncoding
    )
  }
}
