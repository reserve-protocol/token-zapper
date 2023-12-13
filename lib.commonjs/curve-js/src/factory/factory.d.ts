import { IDict, IPoolData, ICurve } from "../interfaces";
export declare function getFactoryPoolData(this: ICurve, fromIdx?: number, swapAddress?: string): Promise<IDict<IPoolData>>;
