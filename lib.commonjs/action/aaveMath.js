"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rayDiv = exports.rayMul = void 0;
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
exports.rayMul = rayMul;
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
exports.rayDiv = rayDiv;
//# sourceMappingURL=aaveMath.js.map