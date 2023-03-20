import { IWrappedNative__factory } from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'

const iWrappedNativeIFace = IWrappedNative__factory.createInterface()

export class DepositAction extends Action {
    async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {

        return new ContractCall(
            parseHexStringIntoBuffer(iWrappedNativeIFace.encodeFunctionData('deposit')),
            this.wrappedToken.address,
            amountsIn.amount,
            'Wrap Native Token'
        )

    }

    async quote(qty: TokenQuantity[]): Promise<TokenQuantity[]> {
        return qty;
    }

    constructor(
        readonly universe: Universe,
        readonly wrappedToken: Token
    ) {
        super(
            wrappedToken.address,
            [universe.nativeToken],
            [wrappedToken],
            InteractionConvention.None,
            DestinationOptions.Callee,
            []
        )
    }
}

export class WithdrawAction extends Action {
    async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {

        return new ContractCall(
            parseHexStringIntoBuffer(iWrappedNativeIFace.encodeFunctionData('withdraw', [amountsIn.amount])),
            this.wrappedToken.address,
            0n,
            'Unwrap Native Token'
        )

    }

    async quote(qty: TokenQuantity[]): Promise<TokenQuantity[]> {
        return qty;
    }

    constructor(
        readonly universe: Universe,
        readonly wrappedToken: Token
    ) {
        super(
            wrappedToken.address,
            [wrappedToken],
            [universe.nativeToken],
            InteractionConvention.None,
            DestinationOptions.Callee,
            []
        )
    }
}
