import { Address } from "../base/Address";
import { DefaultMap } from "../base/DefaultMap";
export const createDisabledParisTable = () => {
    const disabled = new DefaultMap((_) => new DefaultMap((_) => new Set()));
    const defineDisablePair = (chainId, token0, token1) => {
        disabled.get(chainId).get(Address.from(token0)).add(Address.from(token1));
        disabled.get(chainId).get(Address.from(token1)).add(Address.from(token0));
    };
    const isDisabled = (chainId, inp, out) => {
        return disabled.get(chainId).get(inp.token.address).has(out.address);
    };
    return {
        define: defineDisablePair,
        isDisabled,
    };
};
//# sourceMappingURL=createDisabledParisTable.js.map