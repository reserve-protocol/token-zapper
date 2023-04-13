/**
 * Helper method to wait for a given amount of time
 * @param ms time to wait in milliseconds
 * @returns void promise that resolves after ms milliseconds
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The return type of the onRetry function
 * @typedef {('RETURN'|'CONTINUE')} ON_RETRY
 * @property {string} RETURN - Return from the retry loop
 * @property {string} CONTINUE - Continue the retry loop

 **/
export type OnRetryFunctionReturn = 'RETURN' | 'CONTINUE'

/**
 * The backoff strategy to use
 * @typedef {('LINEAR'|'EXPONENTIAL'|'CONST')} BACKOFF
 * @property {string} LINEAR - Linear backoff, starts at retryDelay, increase the delay between retries by retryDelay each time.
 * @property {string} EXPONENTIAL - Exponential backoff, starts at retryDelay, double the delay between retries each time.
 * @property {string} CONST - Constant backoff, waits retryDelay between retries.
 *
 */
export type BACKOFF = 'LINEAR' | 'EXPONENTIAL' | 'CONST'

const _defaultConfig = {
  maxRetries: 1,
  retryDelay: 1000,
  timeout: 10000,
  backoff: 'CONST' as BACKOFF,
}
export type RetryLoopConfig = typeof _defaultConfig & {
  onRetry?: (_: unknown) => Promise<OnRetryFunctionReturn>
}
export const defaultConfig: RetryLoopConfig = _defaultConfig

export interface RetryLoopState {
  retries: number
  currentDelay: number
  errors: any[]
}
export class RetryLoopException extends Error {
  constructor(
    public readonly config: RetryLoopConfig,
    public readonly state: RetryLoopState
  ) {
    const allErrorsStr = state.errors.join(', ')
    const errorsStr =
      allErrorsStr.length > 100
        ? `${allErrorsStr.slice(0, 100)}...`
        : allErrorsStr
    super(
      `Retry loop failed after ${state.retries} retries, errors: ${errorsStr}`
    )
  }
  toString() {
    return this.state.errors.join(',')
  }
}

const calcBackoff = (currentDelay: number, config: RetryLoopConfig) => {
  switch (config.backoff) {
    case 'LINEAR':
      return currentDelay + config.retryDelay
    case 'EXPONENTIAL':
      return currentDelay * 2
    case 'CONST':
      return currentDelay
    default:
      throw new Error(`Unknown backoff type: ${config.backoff}`)
  }
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
export const retryLoop = async (
  fn: () => Promise<any>,
  opt?: Partial<RetryLoopConfig>
) => {
  const config = {
    retryDelay: defaultConfig.retryDelay,
    timeout: defaultConfig.timeout,
    maxRetries: defaultConfig.maxRetries,
    backoff: defaultConfig.backoff,
    ...opt,
  }
  const state: RetryLoopState = {
    retries: 0,
    currentDelay: config.retryDelay ?? defaultConfig.retryDelay,
    errors: [],
  }

  validate(state, config)

  const start = Date.now()
  while (true) {
    try {
      const out = await fn()
      return out
    } catch (e: any) {
      if (typeof config.onRetry === 'function') {
        if ((await config.onRetry(e)) === 'RETURN') {
          return
        }
      }
      state.errors.push(e)

      if (Date.now() - start > config.timeout) {
        throw e
      }
      if (state.retries >= config.maxRetries) {
        break
      }

      await wait(state.currentDelay)
      state.currentDelay = calcBackoff(state.currentDelay, config)
      state.retries += 1
    }
  }
  throw new RetryLoopException(config, state)
}

function validate(state: RetryLoopState, config: RetryLoopConfig) {
  let maxTime = state.currentDelay
  for (let i = 0; i < config.maxRetries; i++) {
    maxTime = calcBackoff(maxTime, config)
  }

  if (maxTime > 10000) {
    console.warn(
      `Retry loop configured to run for over ${Math.floor(
        maxTime / 10000
      )}s, this is probably too long.`
    )
  }
}
