import { BigNumber } from 'ethers';
const typeToInt = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    '+': 0,
    '-': 1,
    '*': 2,
    '/': 3,
};
export const op = (out, a, op, b) => {
    return ((typeToInt[out] << 6) |
        (typeToInt[a] << 4) |
        (typeToInt[b] << 2) |
        typeToInt[op]);
};
export const encodeOps = (...ops) => {
    if (ops.length > 31)
        throw new Error('We support at most 31 operations in evalExpression');
    const entries = new Array(32).fill(0);
    for (let o = 0; o < 32; o++) {
        entries[31 - o] = ops[o] ?? 0;
    }
    const out = BigNumber.from(entries);
    return out;
};
const ONE = 10n ** 18n;
export const fixedPointMul = (planner, a, b, expressionEval, comment, varName, scale = ONE) => {
    const input0 = planner.add(expressionEval.evalExpression(a, // a
    b, // b
    scale, // c
    0, // d unused
    encodeOps(op('a', 'b', '*', 'a'), // a = f0 * input
    op('a', 'a', '/', 'c') // a = a / 1e18
    )), comment, varName);
    return input0;
};
//# sourceMappingURL=encodeOps.js.map