import { Address } from '../../src.ts/base/Address'
import {createForTest} from '../../src.ts/configuration/testEnvironment'

describe('searcher/pricing', () => {
    it('It can correctly price tokens', async () => {
        const universe = await createForTest()
        const fUSDC = await universe.getToken(
            Address.from('0x465a5a630482f3abD6d3b84B39B29b07214d19e5')
        )
        const fDAI = await universe.getToken(
            Address.from('0xe2bA8693cE7474900A045757fe0efCa900F6530b')
        )

        const saUSDT = await universe.getToken(
            Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
        )
        const cUSDT = await universe.getToken(
            Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
        )
        const saUSDC = await universe.getToken(
            Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986')
        )
        const cUSDC = await universe.getToken(
            Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563')
        )

        const eUSD = await universe.getToken(
            Address.from('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'),
        )
        const ETHPlus = await universe.getToken(
            Address.from('0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'),
        )

        expect("" + await universe.fairPrice(fUSDC.one)).toBe("0.002014 USD")
        expect("" + await universe.fairPrice(fDAI.one)).toBe("0.02014569 USD")
        expect("" + await universe.fairPrice(saUSDT.one)).toBe("1.110924 USD")
        expect("" + await universe.fairPrice(cUSDT.one)).toBe("0.02223 USD")
        expect("" + await universe.fairPrice(saUSDC.one)).toBe("1.085883 USD")
        expect("" + await universe.fairPrice(cUSDC.one)).toBe("0.022799 USD")

        expect("" + await universe.fairPrice(eUSD.one)).toBe("1.000026 USD")
        expect("" + await universe.fairPrice(ETHPlus.one)).toBe("1749.99999998 USD")
        expect("" + await universe.fairPrice(universe.commonTokens.WETH.one)).toBe("1750.0 USD")
        expect("" + await universe.fairPrice(universe.commonTokens.USDC.one)).toBe("1.001 USD")
        expect("" + await universe.fairPrice(universe.commonTokens.USDT.one)).toBe("1.0 USD")
        expect("" + await universe.fairPrice(universe.commonTokens.DAI.one)).toBe("0.999 USD")
        expect("" + await universe.fairPrice(universe.commonTokens.WBTC.one)).toBe("29000.0 USD")
    })
})
