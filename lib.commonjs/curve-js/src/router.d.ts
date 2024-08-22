import { IRoute } from "./interfaces";
export declare const getBestRouteAndOutput: (inputCoin: string, outputCoin: string, amount: number | string) => Promise<{
    route: IRoute;
    output: string;
}>;
