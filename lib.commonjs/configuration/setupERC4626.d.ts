import { type EthereumUniverse } from './ethereum';
export declare const setupERC4626: (universe: EthereumUniverse, vaultAddr: string[], wrappedToUnderlyingMapping: Record<string, string>) => Promise<void>;
