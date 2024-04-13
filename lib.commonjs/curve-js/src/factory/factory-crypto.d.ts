import { IDict, IPoolData, ICurve } from "../interfaces";
export declare function getCryptoFactoryPoolData(this: ICurve, fromIdx?: number, swapAddress?: string): Promise<IDict<IPoolData>>;
