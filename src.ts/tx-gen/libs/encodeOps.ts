import { BigNumber } from 'ethers'
import { Contract, Planner } from '../Planner'

// Format: |sel out': 2 bits|sel a': 2 bits|sel b': 2 bits|op: 2bits|
// Each op is 8 bytes long, you can have up to 32 operations and 4 inputs.
// sel = a=0, b=1, c=2, d=3
// ops = +=0, -=1, *=2, /=3
type Slot = 'a' | 'b' | 'c' | 'd'
type Op = '+' | '-' | '*' | '/'
const typeToInt: Record<Slot | Op, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  '+': 0,
  '-': 1,
  '*': 2,
  '/': 3,
} as const
export const op = <
  const O extends Slot,
  const A extends Slot,
  const Opp extends Op,
  const B extends Slot
>(
  out: O,
  a: A,
  op: Opp,
  b: B
): number => {
  return (
    (typeToInt[out] << 6) |
    (typeToInt[a] << 4) |
    (typeToInt[b] << 2) |
    typeToInt[op]
  )
}
export const encodeOps = <const Ops extends Array<ReturnType<typeof op>>>(
  ...ops: Ops
): BigNumber => {
  if (ops.length > 31)
    throw new Error('We support at most 31 operations in evalExpression')
  const entries = new Array(32).fill(0)
  for (let o = 0; o < 32; o++) {
    entries[31 - o] = ops[o] ?? 0
  }
  const out = BigNumber.from(entries)
  return out
}

const ONE = 10n ** 18n

export const fixedPointMul = (
  planner: Planner,
  a: any,
  b: any,
  expressionEval: Contract,
  comment?: string,
  varName?: string,
  scale: bigint = ONE
) => {
  const input0 = planner.add(
    expressionEval.evalExpression(
      a, // a
      b, // b
      scale, // c
      0, // d unused
      encodeOps(
        op('a', 'b', '*', 'a'), // a = f0 * input
        op('a', 'a', '/', 'c') // a = a / 1e18
      )
    ),
    comment,
    varName
  )
  return input0!
}
