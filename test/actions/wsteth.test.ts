import { Address } from '../../src.ts/base/Address'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('actions/WStETH', () => {
  it('Correctly mints and burns', async () => {
    const universe = await createForTest()

    const stETH = await universe.getToken(
      Address.from('0xae7ab96520de3a18e5e111b5eaab095312d7fe84')
    )
    const wstETH = await universe.getToken(
      Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0')
    )

    const { mint, burn } = universe.wrappedTokens.get(wstETH)!

    const wrappedOut = (await mint.quote([stETH.from('1.0')]))[0]
    expect(wrappedOut.formatWithSymbol()).toBe('0.893700000024782301 wstETH')

    const unwrappedOut = (await burn.quote([wrappedOut]))[0]
    expect(unwrappedOut.formatWithSymbol()).toBe('0.999999999999999999 stETH')
  })
})
