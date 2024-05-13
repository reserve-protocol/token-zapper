const ray = 10n ** 27n;
const halfRay = ray / 2n;
export const rayMul = (a: bigint, b: bigint) => {
  return (halfRay + a * b) / ray;
};
export function rayDiv(a: bigint, b: bigint): bigint {
  const halfB = b / 2n;
  return (halfB + a * ray) / b;
}
