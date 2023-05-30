"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const curve = tslib_1.__importStar(require("@curvefi/api"));
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