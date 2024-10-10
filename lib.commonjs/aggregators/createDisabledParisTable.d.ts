import { TokenQuantity, Token } from "../entities/Token";
export declare const createDisabledParisTable: () => {
    define: (chainId: number, token0: string, token1: string) => void;
    isDisabled: (chainId: number, inp: TokenQuantity, out: Token) => boolean;
};
