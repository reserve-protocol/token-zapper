import { Params } from './abi';
import { Multicall } from './multicall';
import { BlockTag } from './provider';
import { type JsonFragmentType } from '@ethersproject/abi';
import { type Provider } from "@ethersproject/providers";
interface CallOverrides {
    blockTag?: BlockTag;
    from?: string;
}
interface Call {
    contract: {
        address: string;
    };
    name: string;
    inputs: readonly JsonFragmentType[];
    outputs: readonly JsonFragmentType[];
    params: Params;
}
interface FailableCall extends Call {
    canFail: boolean;
}
interface CallResult {
    success: boolean;
    returnData: string;
}
declare function all<T>(provider: Provider, multicall: Multicall | null, calls: Call[], overrides?: CallOverrides): Promise<T[]>;
declare function tryAll<T>(provider: Provider, multicall2: Multicall | null, calls: Call[], overrides?: CallOverrides): Promise<(T | null)[]>;
declare function tryEach<T>(provider: Provider, multicall3: Multicall | null, calls: FailableCall[], overrides?: CallOverrides): Promise<(T | null)[]>;
export { Call, CallOverrides, CallResult, all, tryAll, tryEach };
