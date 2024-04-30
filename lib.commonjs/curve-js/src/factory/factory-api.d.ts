import { ICurve, IDict, IPoolData, IPoolDataFromApi } from "../interfaces";
export declare const lowerCasePoolDataAddresses: (poolsData: IPoolDataFromApi[]) => IPoolDataFromApi[];
export declare function getFactoryPoolsDataFromApi(this: ICurve, isCrypto: boolean): Promise<IDict<IPoolData>>;
