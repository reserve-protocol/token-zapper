import { Address, Universe } from '../src.ts'
import { logger } from '../src.ts/logger.ts'

export const createActionTestCase = (
  getUniverse: () => Universe,
  getSymbol: Map<Address, string>,
  testUser: Address,
  testCase: {
    actionName: string
    qty: number
    input: Address
    output: Address

    maxHops?: number
  }
) => {
  const testName = `${testCase.actionName}: ${getSymbol.get(
    testCase.input
  )!} into ${getSymbol.get(testCase.output)!}`
  it(
    testName,
    async () => {
      expect.assertions(1)
      const universe = getUniverse()
      await universe.initialized
      const input = universe.tokens.get(testCase.input)?.from(testCase.qty)
      const output = universe.tokens.get(testCase.output)
      let result = 'failed'

      try {
        const zap = await universe.searcher.debugZapIntoToken(
          input!,
          output!,
          testUser,
          {
            maxHops: testCase.maxHops,
          }
        )
        logger.info(`Action ${testName}: ${zap.bestZapTx.tx}`)
        result = 'success'
      } catch (e) {
        logger.error(`${testName} = ${e.message}`)
      }
      expect(result).toBe('success')
    },
    10000
  )
}

export const makeIntegrationtestCase = (
  actionName: string,
  qty: number,
  input: Address,
  output: Address,
  maxHops: number = 3
) => ({
  actionName,
  input,
  qty,
  output: output,
  maxHops: maxHops,
})
