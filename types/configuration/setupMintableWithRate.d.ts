import { type Provider } from '@ethersproject/abstract-provider';
import { type Universe } from '../Universe';
import { type BaseAction as Action } from '../action/Action';
import { type Token } from '../entities/Token';
/**
 * Small helper to setup a mintable token with a rate provider
 * @param universe
 * @param factory
 * @param wrappedToken
 * @param initRateProvider
 */
export declare const setupMintableWithRate: <R>(universe: Universe<any>, factory: {
    connect: (address: string, provider: Provider) => R;
}, wrappedToken: Token, initRateProvider: (rate: {
    value: bigint;
}, inst: R) => Promise<{
    fetchRate: () => Promise<bigint>;
    mint: Action;
    burn: Action;
}>) => Promise<void>;
//# sourceMappingURL=setupMintableWithRate.d.ts.map