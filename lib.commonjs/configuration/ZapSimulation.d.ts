import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper';
import { providers } from 'ethers';
import { Config } from '../configuration/ChainConfiguration';
export interface SimulateParams {
    to: string;
    from: string;
    data: string;
    value: bigint;
    setup: {
        userBalanceAndApprovalRequirements: bigint;
        inputTokenAddress: string;
    };
}
export type SimulateZapOutput = Pick<ZapperOutputStructOutput, 'dust' | 'amountOut' | 'gasUsed'>;
export declare const decodeSimulationFunctionOutput: (data: string) => SimulateZapOutput;
export type SimulateZapTransactionFunction = (params: SimulateParams) => Promise<string>;
/**
 *
 * @param provider an ethers provider
 * @param input The input of the zap transaction & setup
 * @returns The output of the zap transaction, assuming that the from user has
 *         the required balance and approval setup beforehand. This is only meant as a
 *         solution for example purposes. For UIs this would not be a good solution
 *         as it requires the user to have the correct balance and approval setup beforehand
 *         to correctly preview the result.
 * @note It will obviously revert if approvals or balances are not setup correctly
 */
export declare const createSimulateZapTransactionUsingProvider: (provider: providers.JsonRpcProvider) => SimulateZapTransactionFunction;
export declare const simulateZapTransactionUsingProviderDecodeResult: (provider: providers.JsonRpcProvider, input: SimulateParams) => Promise<SimulateZapOutput>;
export declare const createSimulatorThatUsesOneOfReservesCallManyProxies: (chainId: number) => SimulateZapTransactionFunction;
export declare const makeCustomRouterSimulator: (url: string, whales: Record<string, string>, addreses?: Config['addresses']) => SimulateZapTransactionFunction;
