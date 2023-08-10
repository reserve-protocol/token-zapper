import { Address } from '../base/Address';
import { Universe } from '../Universe';
export declare const testConfig: {
    chainId: 1;
    nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    addresses: {
        commonTokens: {
            readonly USDC: Address;
            readonly USDT: Address;
            readonly DAI: Address;
            readonly WBTC: Address;
            readonly WETH: Address;
            readonly ERC20GAS: Address;
        };
        rTokenDeployments: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        executorAddress: Address;
        zapperAddress: Address;
    };
};
type BaseTestConfigType = typeof testConfig;
export type TestUniverse = Universe<BaseTestConfigType>;
export declare const createForTest: <const Conf extends {
    chainId: 1;
    nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    addresses: {
        commonTokens: {
            readonly USDC: Address;
            readonly USDT: Address;
            readonly DAI: Address;
            readonly WBTC: Address;
            readonly WETH: Address;
            readonly ERC20GAS: Address;
        };
        rTokenDeployments: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        rTokens: {
            readonly eUSD: Address;
            readonly 'ETH+': Address;
            readonly hyUSD: Address;
            readonly RSD: Address;
            readonly iUSD: Address;
        };
        executorAddress: Address;
        zapperAddress: Address;
    };
}>(c?: Conf) => Promise<Universe<Conf>>;
export {};
//# sourceMappingURL=testEnvironment.d.ts.map