"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedPointMul = exports.encodeOps = exports.op = void 0;
const ethers_1 = require("ethers");
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
const op = (out, a, op, b) => {
    return ((typeToInt[out] << 6) |
        (typeToInt[a] << 4) |
        (typeToInt[b] << 2) |
        typeToInt[op]);
};
exports.op = op;
const encodeOps = (...ops) => {
    if (ops.length > 31)
        throw new Error('We support at most 31 operations in evalExpression');
    const entries = new Array(32).fill(0);
    for (let o = 0; o < 32; o++) {
        entries[31 - o] = ops[o] ?? 0;
    }
    const out = ethers_1.BigNumber.from(entries);
    return out;
};
exports.encodeOps = encodeOps;
const ONE = 10n ** 18n;
const fixedPointMul = (planner, a, b, expressionEval, comment, varName, scale = ONE) => {
    const input0 = planner.add(expressionEval.evalExpression(a, // a
    b, // b
    scale, // c
    0, // d unused
    (0, exports.encodeOps)((0, exports.op)('a', 'b', '*', 'a'), // a = f0 * input
    (0, exports.op)('a', 'a', '/', 'c') // a = a / 1e18
    )), comment, varName);
    return input0;
};
exports.fixedPointMul = fixedPointMul;
//# sourceMappingURL=encodeOps.js.map