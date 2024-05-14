const ray = 10n ** 27n;
const halfRay = ray / 2n;
export const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
export function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
//# sourceMappingURL=aaveMath.js.map