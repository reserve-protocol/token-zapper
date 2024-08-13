import { BigNumber } from 'ethers';
import { Contract, Planner } from '../Planner';
type Slot = 'a' | 'b' | 'c' | 'd';
type Op = '+' | '-' | '*' | '/';
export declare const op: <const O extends Slot, const A extends Slot, const Opp extends Op, const B extends Slot>(out: O, a: A, op: Opp, b: B) => number;
export declare const encodeOps: <const Ops extends number[]>(...ops: Ops) => BigNumber;
export declare const fixedPointMul: (planner: Planner, a: any, b: any, expressionEval: Contract, comment?: string, varName?: string, scale?: bigint) => import("../Planner").ReturnValue;
export {};
