import { Universe, Address } from '../src.ts'
import { logger } from '../src.ts/logger.ts'

export const createZapTestCase = async (
  type: 'Redeem' | 'Issueance',
  testUser: Address,
  universe: Universe,
  testCaseName: string,
  inputQty: {
    token: Address
    amount: number
  },
  tokenOut: Address
) => {
  expect.assertions(1)
  await universe.initialized
  const input = universe.tokens.get(inputQty.token)?.from(inputQty.amount)
  const output = universe.tokens.get(tokenOut)
  let result = 'failed'

  try {
    const zap =
      type === 'Issueance'
        ? await universe.zap(input!, output!, testUser)
        : await universe.redeem(input!, output!, testUser)
    logger.info(`${type}: ${zap}`)
    result = 'success'
  } catch (e) {
    logger.error(`${testCaseName} = ${e.message}`)
  }
  expect(result).toBe('success')
}
