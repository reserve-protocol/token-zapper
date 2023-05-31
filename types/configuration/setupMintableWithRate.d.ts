import { Universe } from '../Universe';
import { Action } from '../action';
import { ethers } from 'ethers';
import { Token } from '../entities';
/**
 * Small helper to setup a mintable token with a rate provider
 * @param universe
 * @param factory
 * @param wrappedToken
 * @param initRateProvider
 */
export declare const setupMintableWithRate: <R>(universe: Universe, factory: {
    connect: (address: string, provider: ethers.providers.Provider) => R;
}, wrappedToken: Token, initRateProvider: (rate: {
    value: bigint;
}, inst: R) => Promise<{
    fetchRate: () => Promise<bigint>;
    mint: Action;
    burn: Action;
}>) => Promise<void>;
//# sourceMappingURL=setupMintableWithRate.d.ts.map