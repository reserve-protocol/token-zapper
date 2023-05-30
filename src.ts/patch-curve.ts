import * as curve from "@curvefi/api"
import { PoolTemplate } from "@curvefi/api/lib/pools";

const getPoolOld = curve.default.getPool;
const poolCache = new Map<string, PoolTemplate>();
curve.default.getPool = (address: string) => {
  const cached = poolCache.get(address);
  if (cached) {
    return cached;
  }
  const pool = getPoolOld(address);
  poolCache.set(address, pool);
  return pool;
}