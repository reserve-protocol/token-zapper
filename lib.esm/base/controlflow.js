/**
 * Helper method to wait for a given amount of time
 * @param ms time to wait in milliseconds
 * @returns void promise that resolves after ms milliseconds
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const _defaultConfig = {
    maxRetries: 1,
    retryDelay: 1000,
    timeout: 10000,
    backoff: 'CONST',
};
export const defaultConfig = _defaultConfig;
export class RetryLoopException extends Error {
    config;
    state;
    constructor(config, state) {
        const allErrorsStr = state.errors.join(', ');
        const errorsStr = allErrorsStr.length > 100
            ? `${allErrorsStr.slice(0, 100)}...`
            : allErrorsStr;
        super(`Retry loop failed after ${state.retries} retries, errors: ${errorsStr}`);
        this.config = config;
        this.state = state;
    }
    toString() {
        return this.state.errors.join(',');
    }
}
/**
 * calculate the next delay based on the backoff strategy
 *
 * @param currentDelay
 * @param config
 * @returns
 * @throws Error if the backoff strategy is unknown
 */
const calcBackoff = (currentDelay, config) => {
    switch (config.backoff) {
        case 'LINEAR':
            return currentDelay + config.retryDelay;
        case 'EXPONENTIAL':
            return currentDelay * 2;
        case 'CONST':
            return currentDelay;
        default:
            throw new Error(`Unknown backoff type: ${config.backoff}`);
    }
};
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
export const retryLoop = async (fn, opt) => {
    const config = {
        retryDelay: defaultConfig.retryDelay,
        timeout: defaultConfig.timeout,
        maxRetries: defaultConfig.maxRetries,
        backoff: defaultConfig.backoff,
        ...opt,
    };
    const state = {
        retries: 0,
        currentDelay: config.retryDelay ?? defaultConfig.retryDelay,
        errors: [],
    };
    validate(state, config);
    const start = Date.now();
    while (true) {
        try {
            const out = await fn();
            return out;
        }
        catch (e) {
            if (typeof config.onRetry === 'function') {
                if ((await config.onRetry(e)) === 'RETURN') {
                    return;
                }
            }
            state.errors.push(e);
            if (Date.now() - start > config.timeout) {
                throw e;
            }
            if (state.retries >= config.maxRetries) {
                break;
            }
            await wait(state.currentDelay);
            state.currentDelay = calcBackoff(state.currentDelay, config);
            state.retries += 1;
        }
    }
    throw new RetryLoopException(config, state);
};
function validate(state, config) {
    let maxTime = state.currentDelay;
    for (let i = 0; i < config.maxRetries; i++) {
        maxTime = calcBackoff(maxTime, config);
    }
    if (maxTime > 10000) {
        console.warn(`Retry loop configured to run for over ${Math.floor(maxTime / 10000)}s, this is probably too long.`);
    }
}
//# sourceMappingURL=controlflow.js.map