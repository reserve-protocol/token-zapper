import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token } from '../entities/Token';
import { ApprovalsStore } from '../searcher/ApprovalsStore';
export declare const testConfig: {
    readonly blocktime: 12000;
    readonly blockGasLimit: bigint;
    readonly requoteTolerance: number;
    readonly routerDeadline: number;
    readonly searcherMinRoutesToProduce: number;
    readonly searcherMaxRoutesToProduce: number;
    readonly searchConcurrency: number;
    readonly defaultInternalTradeSlippage: bigint;
    readonly chainId: 1;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly USDC: Address;
            readonly USDT: Address;
            readonly DAI: Address;
            readonly WBTC: Address;
            readonly WETH: Address;
            readonly ERC20GAS: Address;
        };
        readonly rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly facadeAddress: Address;
        readonly oldFacadeAddress: Address;
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly wrappedNative: Address;
        readonly rtokenLens: Address;
        readonly balanceOf: Address;
        readonly curveRouterCall: Address;
        readonly ethBalanceOf: Address;
        readonly uniV3Router: Address;
        readonly curveStableSwapNGHelper: Address;
    };
};
type BaseTestConfigType = typeof testConfig;
export type TestUniverse = Universe<BaseTestConfigType>;
export declare class MockApprovalsStore extends ApprovalsStore {
    constructor();
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
export declare const createForTest: <const Conf extends {
    readonly blocktime: 12000;
    readonly blockGasLimit: bigint;
    readonly requoteTolerance: number;
    readonly routerDeadline: number;
    readonly searcherMinRoutesToProduce: number;
    readonly searcherMaxRoutesToProduce: number;
    readonly searchConcurrency: number;
    readonly defaultInternalTradeSlippage: bigint;
    readonly chainId: 1;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly USDC: Address;
            readonly USDT: Address;
            readonly DAI: Address;
            readonly WBTC: Address;
            readonly WETH: Address;
            readonly ERC20GAS: Address;
        };
        readonly rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly facadeAddress: Address;
        readonly oldFacadeAddress: Address;
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly wrappedNative: Address;
        readonly rtokenLens: Address;
        readonly balanceOf: Address;
        readonly curveRouterCall: Address;
        readonly ethBalanceOf: Address;
        readonly uniV3Router: Address;
        readonly curveStableSwapNGHelper: Address;
    };
}>(c?: Conf) => Promise<Universe<Conf>>;
export {};
