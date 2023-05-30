import * as curve from "@curvefi/api";
const getPoolOld = curve.default.getPool;
const poolCache = new Map();
curve.default.getPool = (address) => {
    const cached = poolCache.get(address);
    if (cached) {
        return cached;
    }
    const pool = getPoolOld(address);
    poolCache.set(address, pool);
    return pool;
};
//# sourceMappingURL=patch-curve.js.map