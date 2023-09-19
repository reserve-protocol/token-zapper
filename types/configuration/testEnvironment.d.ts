import { Address } from '../base/Address';
import { Universe } from '../Universe';
import { Token } from '../entities/Token';
import { ApprovalsStore } from '../searcher/ApprovalsStore';
export declare const testConfig: {
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
        readonly rTokenDeployments: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
    };
};
type BaseTestConfigType = typeof testConfig;
export type TestUniverse = Universe<BaseTestConfigType>;
export declare class MockApprovalsStore extends ApprovalsStore {
    constructor();
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
export declare const createForTest: <const Conf extends {
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
        readonly rTokenDeployments: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
    };
}>(c?: Conf) => Promise<Universe<Conf>>;
export {};
//# sourceMappingURL=testEnvironment.d.ts.map