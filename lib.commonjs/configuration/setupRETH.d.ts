import { type EthereumUniverse } from './ethereum';
export declare const setupRETH: (universe: EthereumUniverse, config: {
    reth: string;
    router: string;
}) => Promise<void>;
