import { ethers } from 'ethers'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token } from './Token'
import { ERC20__factory } from '../contracts'

type IState = {
  D: bigint
  futureAGammaTime: bigint
  futureAGamma: bigint
  initialAGamma: bigint
  initialAGammaTime: bigint
  priceScale: bigint
  tokenSupply: bigint
  balances: bigint[]
  feeGamma: bigint
  midFee: bigint
  outFee: bigint
}

const ethersInterface = new ethers.utils.Interface([
  'function D() external view returns (uint256)',
  'function future_A_gamma_time() external view returns (uint256)',
  'function future_A_gamma() external view returns (uint256)',
  'function initial_A_gamma_time() external view returns (uint256)',
  'function initial_A_gamma() external view returns (uint256)',
  'function price_scale() external view returns (uint256)',
  'function balances(uint256) external view returns (uint256)',
  'function fee_gamma() external view returns (uint256)',
  'function mid_fee() external view returns (uint256)',
  'function out_fee() external view returns (uint256)',
  'function token() external view returns (address)',
])

export const loadPoolState = async (
  universe: Universe,
  pool: Address,
  lpToken: Token
): Promise<{
  initial: IState
  update: (current: IState) => Promise<IState>
}> => {
  const contract = new ethers.Contract(
    pool.address,
    ethersInterface,
    universe.provider
  )

  const tokenContract = ERC20__factory.connect(
    lpToken.address.address,
    universe.provider
  )
  const data = (
    await Promise.all([
      contract.callStatic.D(),
      contract.callStatic.future_A_gamma_time(),
      contract.callStatic.future_A_gamma(),
      contract.callStatic.initial_A_gamma_time(),
      contract.callStatic.initial_A_gamma(),
      contract.callStatic.price_scale(),
      contract.callStatic.balances(0),
      contract.callStatic.balances(1),
      contract.callStatic.fee_gamma(),
      contract.callStatic.mid_fee(),
      contract.callStatic.out_fee(),
      tokenContract.callStatic.totalSupply(),
    ])
  ).map((x) => BigInt(x))

  return {
    initial: {
      D: data[0],
      futureAGammaTime: data[1],
      futureAGamma: data[2],
      initialAGammaTime: data[3],
      initialAGamma: data[4],
      priceScale: data[5],
      balances: [data[6], data[7]],
      feeGamma: data[8],
      midFee: data[9],
      outFee: data[10],
      tokenSupply: data[11],
    },
    update: async (current: IState) => {
      const data = (
        await Promise.all([
          contract.callStatic.D(),
          contract.callStatic.price_scale(),
          contract.callStatic.balances(0),
          contract.callStatic.balances(1),
          tokenContract.callStatic.totalSupply(),
        ])
      ).map((x) => BigInt(x))
      return {
        ...current,
        D: data[0],
        priceScale: data[1],
        balances: [data[2], data[3]],
        tokenSupply: data[4],
      }
    },
  }
}

export class CryptoswapPool {
  public static async load(
    universe: Universe,
    address: Address,
    lpToken: Token,
    coins: Token[]
  ) {
    const state = await loadPoolState(universe, address, lpToken)
    const pool = new CryptoswapPool(address, lpToken, coins, state)
    return pool
  }
  public static readonly constants = {
    ADMIN_ACTIONS_DELAY: 3n * 86400n,
    MIN_RAMP_TIME: 86400n,
    MAX_ADMIN_FEE: 10n * 10n ** 9n,

    MIN_FEE: 5n * 10n ** 5n,
    MAX_FEE: 10n * 10n ** 9n,
    MAX_A_CHANGE: 10n,
    NOISE_FEE: 10n ** 5n,
    MIN_GAMMA: 10n ** 10n,
    MAX_GAMMA: 2n * 10n ** 16n,

    A_MULTIPLIER: 10000n,
    EXP_PRECISION: 10n ** 10n,
    PRECISIONS: 10n ** 18n,
  }

  private _currentState: IState
  constructor(
    public readonly address: Address,
    public readonly lpToken: Token,
    public readonly coins: Token[],
    private readonly stateProvider: {
      initial: IState
      update: (current: IState) => Promise<IState>
    }
  ) {
    this._currentState = stateProvider.initial
  }

  get state() {
    return this._currentState
  }

  public async update() {
    this._currentState = await this.stateProvider.update(this._currentState)
  }

  getPrecisions() {
    return this.coins.map((c) => 1n)
  }
  public get xp(): bigint[] {
    const precisions = this.getPrecisions()
    return [
      this.state.balances[0] * precisions[0],
      (this.state.balances[1] * precisions[1] * this.state.priceScale) /
        CryptoswapPool.constants.PRECISIONS,
    ]
  }

  public getAGamma(): bigint[] {
    const A_gamma_1 = this.state.futureAGamma
    let gamma1 = A_gamma_1 & ((1n << 128n) - 1n)
    let A1 = A_gamma_1 >> 128n

    const timestamp = BigInt(Math.floor(Date.now() / 1000))
    if (timestamp < this.state.futureAGammaTime) {
      const A_gamma_0 = this.state.initialAGamma
      const t0 = this.state.initialAGammaTime
      const t1 = this.state.futureAGammaTime - t0
      const t2 = timestamp - t0
      A1 = ((A_gamma_0 >> 128n) * t2 + A1 * t0) / t1
      gamma1 = ((A_gamma_0 & ((1n << 128n) - 1n)) * t2 + gamma1 * t0) / t1
    }
    return [A1, gamma1]
  }

  public calcTokenAmount(amount0: bigint, amount1: bigint): bigint {
    const tokenSupply = this.state.tokenSupply
    const precisions = this.getPrecisions()
    const priceScale = this.state.priceScale * precisions[1]

    const A_gamma = this.getAGamma()
    const xp = this.xp

    const amountsp = [
      amount0 * precisions[0],
      (amount1 * priceScale) / CryptoswapPool.constants.PRECISIONS,
    ]

    let D0 = this.state.D
    if (this.state.futureAGammaTime > 0) {
      D0 = newtonD(A_gamma[0], A_gamma[1], xp, CryptoswapPool.constants)
    }
    xp[0] += amountsp[0]
    xp[1] += amountsp[1]
    const D = newtonD(A_gamma[0], A_gamma[1], xp, CryptoswapPool.constants)
    const d_token = (tokenSupply * D) / D0 - tokenSupply
    const tokenFee = this._calcTokenFee(amountsp, xp)
    return d_token - tokenFee
  }

  public getDy(i: bigint, j: bigint, dx: bigint): bigint {
    if (i === j) {
      throw new Error('same input and output coin')
    }
    if (i >= this.coins.length || i < 0 || j >= this.coins.length || j < 0) {
      throw new Error('coin index out of range')
    }

    const precisions = this.getPrecisions()
    const priceScale = this.state.priceScale * precisions[1]
    let xp = this.xp

    xp[Number(i)] += dx
    xp = [
      xp[0] * precisions[0],
      (xp[1] * priceScale) / CryptoswapPool.constants.PRECISIONS,
    ]

    const [, xp_j] = xp

    const A_gamma = this.getAGamma()
    let D = this.state.D
    if (this.state.futureAGammaTime > 0) {
      D = newtonD(A_gamma[0], A_gamma[1], xp, CryptoswapPool.constants)
    }

    const y = newtonY(
      A_gamma[0],
      A_gamma[1],
      xp,
      D,
      j,
      CryptoswapPool.constants
    )
    let dy = xp_j - y - 1n
    xp[Number(j)] = y
    if (j > 0) {
      dy = (dy * CryptoswapPool.constants.PRECISIONS) / priceScale
    } else {
      dy /= precisions[0]
    }
    const fee = this._fee(xp)
    return dy - (dy * fee) / 10n ** 10n
  }

  private _calcTokenFee(amounts: bigint[], xp: bigint[]): bigint {
    const fee = this._fee(xp)
    const S = sum(amounts)
    const avg = S / BigInt(amounts.length)
    let Sdiff = 0n
    for (const _x of amounts) {
      if (_x > avg) {
        Sdiff += _x - avg
      } else {
        Sdiff += avg - _x
      }
    }
    return (fee * Sdiff) / S + CryptoswapPool.constants.NOISE_FEE
  }

  public fee(): bigint {
    return this._fee(this.xp)
  }
  private _fee(xp: bigint[]): bigint {
    const fee_gamma = this.state.feeGamma
    let f = sum(xp) // sum

    const N = BigInt(this.coins.length)

    const K = (xp[0] * xp[1]) / (f / N) ** N
    f = (fee_gamma * 10n ** 18n) / (fee_gamma + 10n ** 18n - K)
    return (
      (this.state.midFee * f + this.state.outFee * (10n ** 18n - f)) /
      10n ** 18n
    )
  }
}

function geometricMean(unsortedX: bigint[], sort: boolean): bigint {
  let x = unsortedX
  if (sort && x[0] < x[1]) {
    x = [x[1], x[0]]
  }

  const N = BigInt(unsortedX.length)
  let D = x[0]
  let diff = 0n
  for (let i = 0; i < 255; i++) {
    const D_prev = D
    D = (D + (x[0] * x[1]) / D) / N
    if (D > D_prev) {
      diff = D - D_prev
    } else {
      diff = D_prev - D
    }
    if (diff <= 1n || diff * 10n ** 18n < D) {
      return D
    }
  }
  throw new Error('Did not converge')
}
const cmdSwap = (a: bigint[], i: number, j: number) => {
  if (a[i] > a[j]) {
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
}
// Input array is either 2, 3, or 4 length. Never more.
const sortInPlace = (a: bigint[]) => {
  if (a.length <= 1) {
    return
  } else if (a.length === 2) {
    cmdSwap(a, 0, 1)
  } else if (a.length === 3) {
    cmdSwap(a, 0, 2)
    cmdSwap(a, 0, 1)
    cmdSwap(a, 1, 2)
  } else if (a.length === 4) {
    cmdSwap(a, 0, 2)
    cmdSwap(a, 1, 3)
    cmdSwap(a, 0, 1)
    cmdSwap(a, 2, 3)
    cmdSwap(a, 1, 2)
  } else {
    throw new Error('Unsupported length')
  }
}

const sum = (a: bigint[]) => {
  if (a.length === 0) {
    return 0n
  } else if (a.length === 1) {
    return a[0]
  } else if (a.length === 2) {
    return a[0] + a[1]
  } else if (a.length === 3) {
    return a[0] + a[1] + a[2]
  } else if (a.length === 4) {
    return a[0] + a[1] + a[2] + a[3]
  } else {
    throw new Error('Unsupported length')
  }
}

const ONE = 10n ** 18n
const maxBN = (a: bigint, b: bigint) => (a > b ? a : b)

const newtonD = (
  ANN: bigint,
  gamma: bigint,
  x: bigint[],
  constants: {
    A_MULTIPLIER: bigint
  }
): bigint => {
  sortInPlace(x)

  const N = BigInt(x.length)
  let D = N * geometricMean(x, false)
  const S = sum(x)

  for (let i = 0; i < 255; i++) {
    // D_prev: uint256 = D
    const D_prev = D

    // K0: uint256 = (10**18 * N**2) * x[0] / D * x[1] / D
    const K0 = (ONE * N ** 2n * x[0] * x[1]) / D

    // _g1k0: uint256 = gamma + 10**18
    let _g1k0 = gamma + ONE
    // if _g1k0 > K0:
    //   _g1k0 = _g1k0 - K0 + 1
    // else:
    //   _g1k0 = K0 - _g1k0 + 1
    if (_g1k0 > K0) {
      _g1k0 = _g1k0 - K0 + 1n
    } else {
      _g1k0 = K0 - _g1k0 + 1n
    }

    // mul1: uint256 = 10**18 * D / gamma * _g1k0 / gamma * _g1k0 * A_MULTIPLIER / ANN
    const mul1 =
      (((((ONE * D) / gamma) * _g1k0) / gamma) *
        _g1k0 *
        constants.A_MULTIPLIER) /
      ANN

    // mul2: uint256 = (2 * 10**18) * N_COINS * K0 / _g1k0
    const mul2 = (2n * ONE * N * K0) / _g1k0

    // neg_fprime: uint256 = (S + S * mul2 / 10**18) + mul1 * N_COINS / K0 - mul2 * D / 10**18
    const neg_fprime = S + (S * mul2) / ONE + (mul1 * N) / K0 - (mul2 * D) / ONE

    // D_plus: uint256 = D * (neg_fprime + S) / neg_fprime
    const D_plus = (D * (neg_fprime + S)) / neg_fprime
    // D_minus: uint256 = D*D / neg_fprime
    const D_minus = (D * D) / neg_fprime

    // if D_plus > D_minus:
    //   D = D_plus - D_minus
    // else:
    //   D = (D_minus - D_plus) / 2
    if (D_plus > D_minus) {
      D = D_plus - D_minus
    } else {
      D = (D_minus - D_plus) / 2n
    }

    // diff: uint256 = 0
    // if D > D_prev:
    //   diff = D - D_prev
    // else:
    //   diff = D_prev - D
    const diff = D > D_prev ? D - D_prev : D_prev - D

    // if diff * 10**14 < max(10**16, D):  # Could reduce precision for gas efficiency here
    if (diff * 10n ** 14n < maxBN(10n ** 16n, D)) {
      // Test that we are safe with the next newton_y
      for (const _x of x) {
        const frac = (_x * ONE) / D
        const assertion = frac > 10n ** 16n - 1n && frac < 10n ** 20n + 1n
        if (!assertion) {
          throw new Error(
            'assert (frac > 10**16 - 1) and (frac < 10**20 + 1) failed'
          )
        }
      }
      return D
    }
  }
  throw new Error('Did not converge')
}

// def newton_y(ANN: uint256, gamma: uint256, x: uint256[N_COINS], D: uint256, i: uint256) -> uint256:
//     """
//     Calculating x[i] given other balances x[0..N_COINS-1] and invariant D
//     ANN = A * N**N
//     """
//     # Safety checks
//     assert ANN > MIN_A - 1 and ANN < MAX_A + 1  # dev: unsafe values A
//     assert gamma > MIN_GAMMA - 1 and gamma < MAX_GAMMA + 1  # dev: unsafe values gamma
//     assert D > 10**17 - 1 and D < 10**15 * 10**18 + 1 # dev: unsafe values D

//     x_j: uint256 = x[1 - i]
//     y: uint256 = D**2 / (x_j * N_COINS**2)
//     K0_i: uint256 = (10**18 * N_COINS) * x_j / D
//     # S_i = x_j

//     # frac = x_j * 1e18 / D => frac = K0_i / N_COINS
//     assert (K0_i > 10**16*N_COINS - 1) and (K0_i < 10**20*N_COINS + 1)  # dev: unsafe values x[i]

//     # x_sorted: uint256[N_COINS] = x
//     # x_sorted[i] = 0
//     # x_sorted = self.sort(x_sorted)  # From high to low
//     # x[not i] instead of x_sorted since x_soted has only 1 element

//     convergence_limit: uint256 = max(max(x_j / 10**14, D / 10**14), 100)

//     for j in range(255):
//         y_prev: uint256 = y

//         K0: uint256 = K0_i * y * N_COINS / D
//         S: uint256 = x_j + y

//         _g1k0: uint256 = gamma + 10**18
//         if _g1k0 > K0:
//             _g1k0 = _g1k0 - K0 + 1
//         else:
//             _g1k0 = K0 - _g1k0 + 1

//         # D / (A * N**N) * _g1k0**2 / gamma**2
//         mul1: uint256 = 10**18 * D / gamma * _g1k0 / gamma * _g1k0 * A_MULTIPLIER / ANN

//         # 2*K0 / _g1k0
//         mul2: uint256 = 10**18 + (2 * 10**18) * K0 / _g1k0

//         yfprime: uint256 = 10**18 * y + S * mul2 + mul1
//         _dyfprime: uint256 = D * mul2
//         if yfprime < _dyfprime:
//             y = y_prev / 2
//             continue
//         else:
//             yfprime -= _dyfprime
//         fprime: uint256 = yfprime / y

//         # y -= f / f_prime;  y = (y * fprime - f) / fprime
//         # y = (yfprime + 10**18 * D - 10**18 * S) // fprime + mul1 // fprime * (10**18 - K0) // K0
//         y_minus: uint256 = mul1 / fprime
//         y_plus: uint256 = (yfprime + 10**18 * D) / fprime + y_minus * 10**18 / K0
//         y_minus += 10**18 * S / fprime

//         if y_plus < y_minus:
//             y = y_prev / 2
//         else:
//             y = y_plus - y_minus

//         diff: uint256 = 0
//         if y > y_prev:
//             diff = y - y_prev
//         else:
//             diff = y_prev - y
//         if diff < max(convergence_limit, y / 10**14):
//             frac: uint256 = y * 10**18 / D
//             assert (frac > 10**16 - 1) and (frac < 10**20 + 1)  # dev: unsafe value for y
//             return y

//     raise "Did not converge"

const newtonY = (
  ANN: bigint,
  gamma: bigint,
  x: bigint[],
  D: bigint,
  i: bigint,
  constants: {
    A_MULTIPLIER: bigint
  }
): bigint => {
  const N = BigInt(x.length)
  const x_j = x[1 - Number(i)]
  let y = D ** 2n / (x_j * N ** 2n)

  const K0_i = (ONE * N * x_j) / D

  const convergence_limit = maxBN(maxBN(x_j / 10n ** 14n, D / 10n ** 14n), 100n)

  for (let j = 0; j < 255; j++) {
    const y_prev = y

    const K0 = (K0_i * y * N) / D
    const S = x_j + y

    let _g1k0 = gamma + ONE

    if (_g1k0 > K0) {
      _g1k0 = _g1k0 - K0 + 1n
    } else {
      _g1k0 = K0 - _g1k0 + 1n
    }

    const mul1 =
      (((((ONE * D) / gamma) * _g1k0) / gamma) *
        _g1k0 *
        constants.A_MULTIPLIER) /
      ANN
    const mul2 = 10n ** 18n + (2n * 10n ** 18n * K0) / _g1k0

    let yfprime = ONE * y + S * mul2 + mul1
    const _dyfprime = D * mul2

    if (yfprime < _dyfprime) {
      y = y_prev / 2n
      continue
    } else {
      yfprime -= _dyfprime
    }

    const fprime = yfprime / y

    let y_minus = mul1 / fprime
    const y_plus = (yfprime + ONE * D) / fprime + (y_minus * ONE) / K0
    y_minus += (ONE * S) / fprime

    if (y_plus < y_minus) {
      y = y_prev / 2n
    } else {
      y = y_plus - y_minus
    }

    const diff = y > y_prev ? y - y_prev : y_prev - y
    if (diff < convergence_limit || diff * 10n ** 14n < y) {
      const frac = (y * ONE) / D
      if (frac > 10n ** 16n - 1n && frac < 10n ** 20n + 1n) {
        return y
      }
      throw new Error(
        'assert (frac > 10**16 - 1) and (frac < 10**20 + 1) failed'
      )
    }
  }
  throw new Error('Did not converge')
}
