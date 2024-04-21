/**
 * Helper method to wait for a given amount of time
 * @param ms time to wait in milliseconds
 * @returns void promise that resolves after ms milliseconds
 */
export declare const wait: (ms: number) => Promise<unknown>;
/**
 * The return type of the onRetry function
 * @typedef {('RETURN'|'CONTINUE')} ON_RETRY
 * @property {string} RETURN - Return from the retry loop
 * @property {string} CONTINUE - Continue the retry loop

 **/
export type OnRetryFunctionReturn = 'RETURN' | 'CONTINUE';
/**
 * The backoff strategy to use
 * @typedef {('LINEAR'|'EXPONENTIAL'|'CONST')} BACKOFF
 * @property {string} LINEAR - Linear backoff, starts at retryDelay, increase the delay between retries by retryDelay each time.
 * @property {string} EXPONENTIAL - Exponential backoff, starts at retryDelay, double the delay between retries each time.
 * @property {string} CONST - Constant backoff, waits retryDelay between retries.
 *
 */
export type BACKOFF = 'LINEAR' | 'EXPONENTIAL' | 'CONST';
declare const _defaultConfig: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    backoff: BACKOFF;
};
export type RetryLoopConfig = typeof _defaultConfig & {
    onRetry?: (_: unknown) => Promise<OnRetryFunctionReturn>;
};
export declare const defaultConfig: RetryLoopConfig;
export interface RetryLoopState {
    retries: number;
    currentDelay: number;
    errors: any[];
}
export declare class RetryLoopException extends Error {
    readonly config: RetryLoopConfig;
    readonly state: RetryLoopState;
    constructor(config: RetryLoopConfig, state: RetryLoopState);
    toString(): string;
}
/**
 * Helper function to retry a function until it succeeds or the max retries is reached.
 * @param fn The function to retry
 * @param opt The retry options
 *
 * @example
 * const fn = async () => {
 *   const res = await fetch('https://api.example.com')
 *   if (res.status !== 200) {
 *     throw new Error(res.status)
 *   }
 *   return res.json()
 * }
 *
 * retryLoop(fn, {
 *  retryDelay: 500,
 *  backoff: 'EXPONENTIAL',
 *  maxRetries: 4,
 *  onRetry: async (e: Error) => {
 *   if (e.message === 429) {
 *     return 'CONTINUE'
 *   }
 *   return 'RETURN'
 * })
 *
 * @returns
 */
export declare const retryLoop: (fn: () => Promise<any>, opt?: Partial<RetryLoopConfig>) => Promise<any>;
export {};
//# sourceMappingURL=controlflow.d.ts.map