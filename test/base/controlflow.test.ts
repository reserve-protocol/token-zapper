import {
  wait,
  OnRetryFunctionReturn,
  RetryLoopConfig,
  defaultConfig,
  RetryLoopException,
  retryLoop,
} from '../../src.ts/base/controlflow'

describe('controlflow', () => {
  describe('wait', () => {
    it('waits for the specified duration', async () => {
      const start = Date.now()
      await wait(100)
      const end = Date.now()
      const duration = end - start
      expect(duration).toBeGreaterThanOrEqual(100)
      expect(duration).toBeLessThanOrEqual(120)
    })
  })

  describe('retryLoop', () => {
    const successFn = async () => 'success'
    const errorFn = async () => {
      throw new Error('failure')
    }

    it('resolves with the successful result', async () => {
      const result = await retryLoop(successFn)
      expect(result).toEqual('success')
    })

    it('throws RetryLoopException after maxRetries', async () => {
      expect.assertions(2)
      try {
        await retryLoop(errorFn, { maxRetries: 2, retryDelay: 1 })
      } catch (e: any) {
        expect(e).toBeInstanceOf(RetryLoopException)
        expect(e.state.retries).toEqual(2)
      }
    })

    it('returns early when onRetry returns RETURN', async () => {
      const onRetry = async (): Promise<OnRetryFunctionReturn> =>
        Promise.resolve('RETURN')

      const result = await retryLoop(errorFn, {
        maxRetries: 2,
        retryDelay: 10,
        onRetry,
      })
      expect(result).toBeUndefined()
    })

    it('handles different backoff types', async () => {
      expect.assertions(6)

      const linearConfig: RetryLoopConfig = {
        ...defaultConfig,
        backoff: 'LINEAR',
        retryDelay: 10,
        maxRetries: 3,
      }

      try {
        await retryLoop(errorFn, linearConfig)
      } catch (e: any) {
        expect(e).toBeInstanceOf(RetryLoopException)
        expect(e.state.currentDelay).toEqual(40)
      }

      const exponentialConfig: RetryLoopConfig = {
        ...defaultConfig,
        backoff: 'EXPONENTIAL',
        retryDelay: 10,
        maxRetries: 3,
      }

      try {
        await retryLoop(errorFn, exponentialConfig)
      } catch (e: any) {
        expect(e).toBeInstanceOf(RetryLoopException)
        expect(e.state.currentDelay).toEqual(80)
      }

      const constConfig: RetryLoopConfig = {
        ...defaultConfig,
        backoff: 'CONST',
        retryDelay: 10,
        maxRetries: 3,
      }

      try {
        await retryLoop(errorFn, constConfig)
      } catch (e: any) {
        expect(e).toBeInstanceOf(RetryLoopException)
        expect(e.state.currentDelay).toEqual(10)
      }
    })
  })
})
