import { type Address } from '../../base/Address';
import { type Token } from '../Token';
import { type DestinationOptions, Action, type InteractionConvention } from '../../action/Action';
import { type SwapDirection } from './TwoTokenPoolTypes';
export declare abstract class UniBase extends Action {
    readonly direction: SwapDirection;
    readonly destination: DestinationOptions;
    readonly interactionConvention: InteractionConvention;
    readonly zeroForOne: boolean;
    readonly output: Token;
    readonly input: Token;
    constructor(basePool: {
        address: Address;
        token0: Token;
        token1: Token;
    }, direction: SwapDirection, destination: DestinationOptions, interactionConvention: InteractionConvention);
}
