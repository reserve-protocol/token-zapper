import curve, { PoolTemplate, getPool } from '../curve-js/src'
import { curve as curveInner } from '../curve-js/src/curve'

import { ethers } from 'ethers'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { DefaultMap } from '../base/DefaultMap'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'
import {
  CurveRouterCall,
  CurveRouterCall__factory,
  ICurveRouter,
  ICurveRouter__factory,
} from '../contracts'
import { Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { BlockCache } from '../base/BlockBasedCache'
import { wrapGasToken } from '../searcher/TradeAction'

export class CurvePool {
  [Symbol.toStringTag] = 'CurvePool'

  public readonly addressesInUse = new Set<Address>()

  public actionToken(index: number) {
    return this.underlyingTokens[index] === this.universe.nativeToken
      ? this.universe.wrappedNativeToken
      : this.underlyingTokens[index]
  }
  public readonly liquidity: () => Promise<number>
  public readonly balances: () => Promise<TokenQuantity[]>
  constructor(
    public readonly universe: Universe,
    readonly address: Address,
    readonly lpToken: Token,
    readonly tokens: Token[],
    readonly underlyingTokens: Token[],
    public readonly meta: PoolTemplate,
    readonly templateName: string
  ) {
    this.addressesInUse.add(address)

    this.balances = universe.createCachedProducer(async () => {
      const qtys = await Promise.all(
        this.underlyingTokens.map(async (token) => {
          return await this.universe.balanceOf(token, this.address)
        })
      )
      return qtys
    })

    this.liquidity = universe.createCachedProducer(async () => {
      const out = await this.balances()
      const prices = await Promise.all(
        out.map((i) => i.price().then((i) => i.asNumber()))
      )

      let sum = 0
      for (let i = 0; i < prices.length; i++) {
        sum += prices[i]
      }
      return sum
    })
  }

  get hasEth() {
    return this.underlyingTokens.some((t) => t.address === Address.ZERO)
  }

  public swapTypeUnderlying(i: number, j: number) {
    if (this.meta.isPlain || (this.meta.isCrypto && !this.meta.isMeta)) {
      return 1
    }

    const poolData = this.meta
    const swaptype =
      (poolData.isCrypto && poolData.isMeta && poolData.isFactory) ||
      (poolData.isLending && poolData.isFactory)
        ? 3
        : this.hasEth && poolData.id !== 'avaxcrypto'
        ? 1
        : 2
    return swaptype
  }
  getTokenIndex(token: Token) {
    let tokens = this.underlyingTokens
    if (this.meta.isPlain) {
      tokens = this.tokens
    }
    const out = tokens.indexOf(token)
    if (out === -1) {
      throw new Error(`Token ${token} not found in CurvePool ${this}`)
    }
    return out
  }
  toString() {
    let out = `CurvePool(${this.address.toString()}, name=${
      this.meta.name
    },tokens=${this.tokens.join(', ')}`
    if (this.underlyingTokens.length > 0) {
      out += `,underlying=${this.underlyingTokens.join(', ')}`
    }
    out += `,isPlain=${this.meta.isPlain}`
    return out + ')'
  }

  get poolType() {
    const nonNgImplementations = [
      '0xa85461afc2deec01bda23b5cd267d51f765fba10',
      '',
    ]
    let ngType = 1

    if (typeof this.meta.data.implementation === 'string') {
      if (!nonNgImplementations.includes(this.meta.data.implementation)) {
        if (this.meta.data.implementation.match(/(ng|ng2|ng-old|ng-old2)$/)) {
          ngType = 10
        }
      }
    }

    let baseType = 1
    if (this.meta.isCrypto) {
      const tokens = this.meta.isPlain ? this.tokens : this.underlyingTokens
      if (tokens.length === 2) {
        baseType = 2
      } else if (tokens.length === 3) {
        baseType = 3
      } else {
      }
    }
    return ngType * baseType
  }
}

const dontLoadPools = new Set(
  [
    '0x95f3672a418230c5664b7154dfce0acfa7eed68d',
    '0x618788357d0ebd8a37e763adab3bc575d54c2c7d',
    '0x48ff31bbbd8ab553ebe7cbd84e1ea3dba8f54957',
    '0xc18cc39da8b11da8c3541c598ee022258f9744da',
    '0x5ac4fcee123dcadfae22bc814c4cc72b96c93f38',
    '0xb9446c4ef5ebe66268da6700d26f96273de3d571',
    '0xba3436fd341f2c8a928452db3c5a3670d1d5cc73',
    '0x413928a25d6ea1a26f2625d633207755f67bf97c',
    '0x0e9b5b092cad6f1c5e6bc7f89ffe1abb5c95f1c2',
    '0x67e0bdbe0a2c5999a60d048f50e794218056b767',
    '0xaa5a67c256e27a5d80712c51971408db3370927d',
    '0xe57180685e3348589e9521aa53af0bcd497e884d',
    '0x9547429c0e2c3a8b88c6833b58fce962734c0e8c',
    '0x5b692073f141c31384fae55856cfb6cbffe91e60',
    '0x87650d7bbfc3a9f10587d7778206671719d9910d',
    '0x1570af3df649fc74872c5b8f280a162a3bdd4eb6',
    '0x19b080fe1ffa0553469d20ca36219f17fcf03859',
    '0xb37d6c07482bc11cd28a1f11f1a6ad7b66dec933',
    '0x2d600bbbcc3f1b6cb9910a70bab59ec9d5f81b9a',
    '0xa4c567c662349bec3d0fb94c4e7f85ba95e208e4',
    '0x63594b2011a0f2616586bf3eef8096d42272f916',
    '0x6ec38b3228251a0c5d491faf66858e2e23d7728b',
    '0x9a22cdb1ca1cdd2371cd5bb5199564c4e89465eb',
    '0x3b21c2868b6028cfb38ff86127ef22e68d16d53b',
    '0x69833361991ed76f9e8dbbcdf9ea1520febfb4a7',
    '0x9d8108ddd8ad1ee89d527c0c9e928cb9d2bba2d3',
    '0x0cfe5c777a7438c9dd8add53ed671cec7a5faee5',
    '0x1c899ded01954d0959e034b62a728e7febe593b0',
    '0x61fa2c947e523f9abfb8d7e2903a5d5218c119a7',
    '0xc1f6110d42781aaccd16d716ca7b814f2aeee18f',
    '0xe9123cbc5d1ea65301d417193c40a72ac8d53501',
    '0xa77d09743f77052950c4eb4e6547e9665299becd',
    '0xbedca4252b27cc12ed7daf393f331886f86cd3ce',
    '0x20955cb69ae1515962177d164dfc9522feef567e',
    '0x1062fd8ed633c1f080754c19317cb3912810b5e5',
    '0x28ca243dc0ac075dd012fcf9375c25d18a844d96',
    '0x1033812efec8716bbae0c19e5678698d25e26edf',
    '0x9d259ca698746586107c234e9e9461d385ca1041',
    '0x6f3388c40a7d063b5e17cc4213b7674b5de44c32',
    '0x52ebce664ac1c3a1a5a0568599493c5d71f4772b',
    '0x9a81f5a6ea7e60632f659f3f4e772ba977d80bd5',
    '0xb657b895b265c38c53fff00166cf7f6a3c70587d',
    '0xceaf7747579696a2f0bb206a14210e3c9e6fb269',
    '0x80aa1a80a30055daa084e599836532f3e58c95e2',
    '0x1e098b32944292969fb58c85bdc85545da397117',
    '0x6e77889ff348a16547caba3ce011cb120ed73bfc',
    '0x2673099769201c08e9a5e63b25fbaf25541a6557',
    '0xc73151dca19fff7a16ae421a9fb35455832d66d3',
    '0x5b3b5df2bf2b6543f78e053bd91c4bdd820929f1',
    '0xaceea24a09209a8e240c2751845f02627a201b5c',
    '0xe6b5cc1b4b47305c58392ce3d359b10282fc36ea',
    '0x9c2c8910f113181783c249d8f6aa41b51cde0f0c',
    '0x0ad66fec8db84f8a3365ada04ab23ce607ac6e24',
    '0x8818a9bb44fbf33502be7c15c500d0c783b73067',
    '0x6788f608cfe5cfcd02e6152ec79505341e0774be',
    '0x8ac64ba8e440ce5c2d08688f4020698b1826152e',
    '0x5c6a6cf9ae657a73b98454d17986af41fc7b44ee',
    '0x04b727c7e246ca70d496ecf52e6b6280f3c8077d',
    '0x1977870a4c18a728c19dd4eb6542451df06e0a4b',
    '0x952ac974ff2f3ee5c05534961b661fe70fd38b8a',
    '0xbcb91e689114b9cc865ad7871845c95241df4105',
    '0x326290a1b0004eee78fa6ed4f1d8f4b2523ab669',
    '0x84c333e94aea4a51a21f6cf0c7f528c50dc7592c',
    '0xfbb481a443382416357fa81f16db5a725dc6cec8',
    '0x26f3f26f46cbee59d1f8860865e13aa39e36a8c0',
    '0xf2dcf6336d8250754b4527f57b275b19c8d5cf88',
    '0x3175f54a354c83e8ade950c14fa3e32fc794c0dc',
    '0x41ea4045de2676727883aa0b4e43d7e32261f559',
    '0x79ce6be6ae0995b1c8ed3e8ae54de0e437dec8c3',
    '0x8461a004b50d321cb22b7d034969ce6803911899',
    '0x68934f60758243eafaf4d2cfed27bf8010bede3a',
    '0xa498b08ca3c109e4ebc7ff01422b6769eaef16ef',
    '0x90ce3285a9cce2d36149f12df2c1e357af304a1d',
    '0x86cf48e9735f84d3311141e8941b2494fb4b8142',
    '0x7f787210c83012fca364ae79ad8fc26641c6fbe5',
    '0xd434eaf67bba1903f61cdd3ede6700cac74a5ff2',
    '0xc78d84ee5d970227f988a2e2dc0a4a945163bcb9',
    '0xfce1b5447a3db7e18352e8ae4bcd780029012383',
    '0xec1f6df37b16432e520942affe28149badc5bc5e',
    '0x5a784386dbe8e9188b7262e85dcaf912bcdda441',
    '0xd0a7a9c7f2c148dc5399d89220345b50d6d13cc0',
    '0x9bfb082f2dd5d63907afa33dbb8f9c0bcd5c2333',
    '0xc170ecb895b28a7eff0109f8c072ae742b1dcb69',
    '0x316d2606ce036ec0e69a11432a870a4ec66ade96',
    '0x450a0975dbf787df053d20fa3b57e5b362960102',
    '0x1a8e46721f754660dc8b2ef623e7408856a63cac',
    '0x92971a40fa0f6dd573a0f996b62de497ecc4ef6c',
    '0xe02d418e3d522611e88ce6070a9037ecf0b16073',
    '0x740f335d454ad0db55f88c02cccd74ed84f72a3f',
    '0x183f03c8ce2a24f388a4059adedd05c902650174',
    '0x61fddd212f02f46fea58ddfe3be92d07b1249bcc',
    '0x44550b7d4c045929ed6f77c466852553a1fcba22',
    '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e',
    '0xc897b98272aa23714464ea2a0bd5180f1b8c0025',
    '0xcf95ac3daecdbf60152a16bda8d8f8db7d175b88',
    '0x904be3ce7249447167051f239c832400ca28de71',
    '0xc22936d5ece78c048d6e7fe5d9f77fb6caa16dbb',
    '0xb4e2f6a10176b0948b31c7ac0df710137a7536a2',
    '0xc4114e1ef346495333fd966f65c2987e758c2189',
    '0x62b78594710474da5f2453a24845e74bbae664f5',
    '0x38cb9756c307ab482b5d3ca9155cb507cf98ac04',
    '0xd0a5ca7b57780240db17bb89773fda8f0efce274',
    '0xc288a9d9671c444d0fdb60d89d8105bdae8c7685',
    '0x96fb2ab514ca569a1486c50339533ca4637b338b',
    '0xc68ffddea3a77b456227b50ebfdcc3c33bc2a8a4',
    '0x62d1d9065b4c78964040b640ab404d86d8f68263',
    '0x365901db5adb4c789801f19d5f1f46c574783ad6',
    '0x751d3feffed0890b76e9b86476cfeeaa1fcda73d',
    '0x6b234f354eda8fae082be20dcf790fd886b42340',
    '0x39567db64f0b25db2c35fc7a4f60c3c5258e4654',
    '0x7d99469fb3a530136ec0ab6981d64bc9ff81ad04',
    '0x840cbf6861137624e60380d5e915619885c5aa95',
    '0x141be5d90c27dc5c9199a57cb828ca3cbd2c2d94',
    '0x9735d6530b0609ba8340ecf61feacd922468c1e1',
    '0x7193d845f8991e27ffdce54e78137de036a6f743',
    '0xd304918b2ef48a1184918e575ced08d3d04c37ad',
    '0xe6bbaf0b55ae430354b87a3f592dd5c8ad7a5e79',
    '0x9a7168ea321121a8faf52147fc596b73e07ab8a3',
    '0x9488317bad789ef9ae5b70d3ef2fc12df717fba2',
    '0x3767ff3d26b7f9fb1870ae7ebfc7e05f585eecfe',
    '0x7dceaf64115ed0e3d5b3e18d0896004eaeb58b4b',
    '0x7dc87e4e57c0ca6060374e0ce2a1cffb69ebc45a',
    '0xfaf83f9d84faf25ed4ecbc1857f6aadc3c1977c3',
    '0x3272c5d11644debb2e9d04c302796ebe8df35457',
    '0x970cf34837aa1ff611410533b69d708cba70739d',
    '0x514747fcaec6a72d1dc5fcc1cbb6dd21fbad5427',
    '0x098b69922a18639457b8490db051b8854d33d2f3',
    '0x0f74dc493f1076247aefd5ba8da677440d3ba8a4',
    '0x1df0bae5add689d6be57ac6fd18b1e4a27b4498b',
    '0x408cbc416dbf4168143b011bf5c297da82ce03ed',
    '0x9db63040dbdee832d0824220fc47361674058ef1',
    '0x18a315d2ac23eb39f0c1b0085edff555d484c58a',
    '0xf5d5305790c1af08e9df44b30a1afe56ccda72df',
    '0xde90ba7bb025f435b2a6f984ef6ea76d7c8bc853',
    '0x5e431f70690475badbb88e16d3a49ed8c4434e09',
    '0x8dec9ce89b1f6ca1a5c546ba72317f6a49828d81',
    '0x06bd8dc3ffc8e8cfaceb9c967a3132e5b944246b',
    '0x7a62acf78407b4d02281c7c856e43fa24086bf92',
    '0x9304bd73ec6aad8236d91e88f67ec1eb80658dba',
    '0x157cb788d3a40203a8f98696e7cdcb717befc796',
    '0xe2cf543c6e59ea683da0c94be5ec1088856daff7',
    '0x632d58ecd622322482d8be083e58f43d2d8f3e8c',
    '0x67526bd70bf857abf2ca19a9f16e900aa27eef08',
    '0xc878dd87d598ece5d4900b5933c6a656227c528d',
    '0xbdb3dfe9cc89739fc47dcad0ef689627eaec7b1a',
    '0x526afb67a479d4e9b0154d4cc1a44d47df91bf3e',
    '0x317412f33a4cb32b32cc8011f3d22accb599c520',
    '0xaa738040e9dbc91368df782579cf1810a74e87fa',
    '0xa8b31c529f610da93985c5eb36bc788cde3a1a2c',
    '0xec3c1b7ec905b618bd414d4de1e75f2581afdace',
    '0x44358617cabc3312b3ebeda4f7d75351bc45b114',
    '0xdf7a6441d8bcea3af7785e70ec46592c4f7527f7',
    '0xd2327abfff1290a08122ec0813a51dd02e7c0536',
    '0x68175aa7fee7e6a4709640ac8c912ec3c50b3af5',
    '0x1bed84bf9181c096cf13ac00f26c0dcdf43aca91',
    '0xb0d7338967dbc155740d1c390270840865b357e7',
    '0x6c0d063ea20fcfe55150fa940c47bc9e7f0c7d14',
    '0x76efd9e76b13ec99ab231a4fc871f8b0839f852c',
    '0xd23e7fcdb8808d47f375b467dcc602ddd75fb3c7',
    '0x8ec1338fe2b4a3310a5ea8f0c3825c4f889dbdb8',
    '0x580f14f3347473cf057dc22385d64cff1339c739',
    '0x881601cc3d9745baa32a836bee329f4430eeabf3',
    '0x26a9fc81f4a61259c519b44bdf3badb978d720fc',
    '0x15d16cd42d4f001bd92277e636e429a831e6cbd4',
    '0xd61748773b8f67a7cd7ed44dd45a6182e16fe95f',
    '0x325bba6f3c1d99812e8059c04cbf95eb94557e06',
    '0x38f3800bc69e2fea2af3335b8e3193ea86f83173',
    '0xeccac93dc63dd92be32f0cc112e709ef1debaf16',
    '0x23c90b0dd38572311f0ad826f0b49740a44f1239',
    '0x9f7896679fc2a5ddc2ffec9b42b155e7999e8a0a',
    '0x6c9fe53cc13b125d6476e5ce2b76983bd5b7a112',
    '0xed24fe718effc6b2fc59eeaa5c5f51dd079ab6ed',
    '0x737bc004136f66ae3f8fd5a1199e81c18388097b',
    '0x08eaf78d40abfa6c341f05692eb48edca425ce04',
    '0x45a8cc73ec100306af64ab2ccb7b12e70ec549a8',
    '0x8df0713b2a047c45a0bef21c3b309bcef91afd34',
    '0x1c65ba665ce39cfe85639227eccf17be2b167058',
    '0xa0d35faead5299bf18efbb5defd1ec6d4ab4ef3b',
    '0x01fe650ef2f8e2982295489ae6adc1413bf6011f',
    '0xd1011b637f979a5d9093df1b32e7736c289024f5',
    '0xaa6a4f8ddcca7d3b9e7ad38c8338a2fcfdb1e713',
    '0x6577b46a566ade492ad551a315c04de3fbe3dbfa',
    '0x323b3a6e7a71c1b8c257606ef0364d61df8aa525',
    '0xf74bec4bcf432a17470e9c4f71542f2677b9af6a',
    '0x07350d8c30d463179de6a58764c21558db66dd9c',
    '0xc38ca214c7a82b1ee977232f045afb6d425cfff0',
    '0x8c1de7a8f8852197b109daf75a6fbb685c013315',
    '0x943b7e761f34866da12c9b84c99888fe2ef607c5',
    '0x649c1b0e70a80210bcfb3c4eb5ddad175b90be4d',
    '0xf70c5c65cf6a28e7a4483f52511e5a29678e4ffd',
    '0x63a1ec86cd45425f1409fabe4c1cf8c5fd32a3b1',
    '0xf8048e871df466bd187078cb38cb914476319d33',
    '0xba866791f98098df41c3187d4d5433be29215c79',
    '0x8e883b9628a0d995ad758597989624ec19f3b971',
    '0x8d7b9c013f7f614cd870fad33e260e7a9a1d9b5b',
    '0xdda1b81690b530de3c48b3593923df0a6c5fe92e',
    '0xb9b19b9d771035c5d95e642bbea28927040b7117',
    '0xea24fbb49d3465770ee1b2bcf674258f9e233c75',
    '0x5d489d45c56e40b971e601ccbc506112a2004da2',
    '0x7b881722f842d229bba234f6b5e1d6f0c9bf054a',
    '0xa089a831dec6dfddfd54659ea42c02083f9352d6',
    '0x7c0aa7653e013c3d50ce57b098acc9e4e8a3cd89',
    '0xefd6746633f658953c10c34f570751377ccd5686',
    '0x7dc1a7298347c2f6270d07a464bd4d6dab2544e8',
    '0xe5513b15ea0449d26781b0ef4f4e5040c9d3459d',
    '0xe547725ffe16b2fc61aa5adab5b2860ffda0008d',
    '0xb6038c73c9d97dd30b869461fd286913e82d7f70',
    '0x7cb5a1fd5b2194c6c56e663eb5ceb91bfbb97c09',
    '0xb4c73d52072dde93b181c037eaaa9b0124d6ebc9',
    '0x602a9abb10582768fd8a9f13ad6316ac2a5a2e2b',
    '0x3f67dc2adba4b1beb6a48c30ab3afb1c1440d35b',
    '0x73b7a9a5ac65d650c9af0ba71e82b2ee99e1b6fe',
    '0x8038c01a0390a8c547446a0b2c18fc9aefecc10c',
    '0xa148bd19e26ff9604f6a608e22bfb7b772d0d1a3',
    '0xbaaa1f5dba42c3389bdbc2c9d2de134f5cd0dc89',
    '0xb1d9b4574077eb6ed75b791c7d090ea1f8c93474',
    '0x0ce863fbb67a6a532323d1f81b8f0fcd5f5099ff',
    '0xa551f34fc641f76f17498840c0abfec608410065',
    '0xd6f6fa524d4c9f7a5cbc8fb9145a70d8d7ed6073',
    '0x7e96ae239b9328acb57af401d1f2b6cf5b4ab8de',
    '0xa1a5a5bdb258a951786285d74efe72882ded7574',
    '0xa0efc8a6c0093360067f728bbb5a035032df6947',
    '0x5500307bcf134e5851fb4d7d8d1dc556dcdb84b4',
    '0x8b0afa4b63a3581b731da9d79774a3eae63b5abd',
    '0x04ecd49246bf5143e43e2305136c46aeb6fad400',
    '0x99af0326ab1c2a68c6712a5622c1aa8e4b35fd57',
    '0xb6d9b32407bfa562d9211acdba2631a46c850956',
    '0x79cb6a84fbec1fe2d66b705a1e7f6482c2993049',
    '0x91d9d17efd378f38a48122ae6ec01b2e83d1ac98',
    '0x162b4deefc73a5277b09bd7a02d25da73d66183d',
    '0x337ca39842c448030196693f3433332ff1cf3e41',
    '0x5fba071ad473265df860271998e45fdb3d3e5812',
    '0x0cf8327b20a159f0cd99214c5305d49e9d8207f0',
    '0x5538e48bfe47749d2540d3cbe83fd50465bcb6c3',
    '0x0d1c65b28190cb88f328d2051c524a5c63d10eb5',
    '0xc58fdb8a50ab921a73535656a7c69387dd863ff6',
    '0x96a3f551c99797998dc33e2d816d567db61ee1c2',
    '0x167de3887edebe5012544373c5871481bd95cc4e',
    '0xbcaa09f2873f87ab4bf3a6fe97991f4bcc959e7e',
    '0x55a8a39bc9694714e2874c1ce77aa1e599461e18',
    '0x21b45b2c1c53fdfe378ed1955e8cc29ae8ce0132',
    '0x48536ec5233297c367fd0b6979b75d9270bb6b15',
    '0x3cfaa1596777cad9f5004f9a0c443d912e262243',
    '0x4e0915c88bc70750d68c481540f081fefaf22273',
    '0x7f2af2c7bfdad063ff01dcec077a216d95a0a944',
    '0x1cdf9650cd7c47dcfe63159924440e7a439b91f4',
    '0x04e7a76a910a499b8bbcac18411ae68454ae348b',
    '0xd9dbf8469bcfa53cbc71874b59f62dbcdbe8656d',
    '0x154b0ecd38078819084e449ea1a657728fd37e43',
    '0x3f1b0278a9ee595635b61817630cc19de792f506',
    '0x6df0d77f0496ce44e72d695943950d8641fca5cf',
    '0x27a8697fbd2ed137d88e74132a5558fa43656175',
    '0xeb0265938c1190ab4e3e1f6583bc956df47c0f93',
    '0xacce4fe9ce2a6fe9af83e7cf321a3ff7675e0ab6',
    '0xd6ac1cb9019137a896343da59dde6d097f710538',
    '0xc1bf385575e5ffc81e476d2346f050f139ee9e38',
    '0xef04f337fcb2ea220b6e8db5edbe2d774837581c',
    '0xd4e2fdc354c5dffb865798ca98c2b9d5382f687c',
    '0x5133da6ba0474368ad0398d953c8d31c1b75b82b',
    '0xe07bde9eb53deffa979dae36882014b758111a78',
    '0xbfca1a72edd92fff61a8c88f61d4e64e99232b4b',
    '0xfd484a99d21ca118f22871134f467b1ca3f842aa',
    '0x19a0ca9a0dc2a5034f47dcc164169cffd7ed2410',
    '0xe661672521c77ca87dbb2eac816d2ccf86197281',
    '0xb4018cb02e264c3fcfe0f21a1f5cfbcaaba9f61f',
    '0x20f3424fec5194522a2621120d1ea7279161e216',
    '0xc12a73c46d49fa0d7433c90291bc8d1a9eae7b23',
    '0xf3456e8061461e144b3f252e69dcd5b6070fdee0',
    '0x6e855d08f2984516c40c4246a385ba4a2edfcd0a',
    '0xb2c248c0b0db7d28dfa0123438b40bb31fb8aa05',
    '0x799d141e83d88996c48b98a4f8eb3d96ab422dd3',
    '0x68caa209c3b0e73cc3e9ccf8d40978b07fbffa96',
    '0x1f6bb2a7a2a84d08bb821b89e38ca651175aedd4',
    '0xf039050dc36fd59ff1117b14bfdff92dfa9de9fc',
    '0xfeb0784f5d0940686143b3a025af731ee6a81197',
    '0x4d19e7fd118fd751fea7c0324d7e7b0a3d05eba4',
    '0xcbd5cc53c5b846671c6434ab301ad4d210c21184',
    '0x611a95bf3cc0ef593f22c4e4d8eb4d6c937e006c',
    '0xec5ffef96c3edede587db2efa3ab4deec414ce8f',
    '0x808db6e464279c6a77a1164e0b34d64bd6fb526e',
    '0xff186c2ed2092c0ab0696292c51ccd2c8d1c0795',
    '0xf4a3cca34470b5ba21e2bb1ed365acf68b4d4598',
    '0x29b2178f5f9fb4f775a2f1a7fea685ffba0fae32',
    '0x9730e45ca84076c0a9df80a4f2058c8379ea3ece',
    '0xe94a145a797622fe38a35036729229fc6b3132cb',
    '0x49eaf5e4ac618c968ddcf588c000302f9bc3312d',
    '0x54888c0859a93e6ff679e4f9705e75bbb9557057',
    '0x72d6658e562739267994bb16b952e543f0f92281',
    '0x68a39b6eb2f9ad3a5e58808cdc4907da260e44c8',
    '0x7878a141103d93cac0d1010c48f999975b347138',
    '0xed46f331f85bad38bd99b60938c700c1a92fd940',
    '0xda5b670ccd418a187a3066674a8002adc9356ad1',
    '0xf7b55c3732ad8b2c2da7c24f30a69f55c54fb717',
    '0x7e46fd8a30869aa9ed55af031067df666efe87da',
    '0x0309a528bba0394dc4a2ce59123c52e317a54604',
    '0xaf25ffe6ba5a8a29665adcfa6d30c5ae56ca0cd3',
    '0x5007c634bd59dd211875346a5d0cfd10dfd1cdc0',
    '0xb2c57d651db0fccc96cabda11191df25e05b88b6',
    '0x6a274de3e2462c7614702474d64d376729831dca',
    '0xf43b15ab692fde1f9c24a9fce700adcc809d5391',
    '0xd8c49617e6a2c7584ddbeab652368ee84954bf5c',
    '0x7472764c28f843ba246f294c44de9456911a3454',
    '0x383ad525211b8a1a9c13532cc021773052b2f4f8',
    '0x17cd2d7c4ddf69897cc00e2943532c27259257c5',
    '0x7e89315262217144bde231c3a08a0361566599c4',
    '0x5d859f3488ab3f1b2f19d06cedd161a7db272494',
    '0xfdad22c8f63b32aca0d273d828875fccda3880e1',
    '0xdd238c928d177d775399d13eecab876486679268',
    '0xbf9702efefe1303a61b7c944b5741b773dd930a7',
    '0x9c6751593a1424108f53e5ad6754940fedaa5bc0',
    '0x7e050cf658777cc1da4a4508e79d71859044b60e',
    '0xfe4a08f22fe65759ba91db2e2cada09b4415b0d7',
    '0x782115c863a05abf8795df377d89aad1aadf4dfa',
    '0xd0a1d2a9350824516ae8729b8311557ba7e55bff',
    '0x5d898fd41875b14c1781fb497aecab8e9b24dfc9',
    '0x5114f86027d4c9a509cba072b8135a171402c6d5',
    '0xddbdcebb989b1ef804338d6c9a902f91c2738936',
    '0x6e314039f4c56000f4ebb3a7854a84cc6225fb92',
    '0xc77103e44914a9e5e30b9f58cd48e990b22fb587',
    '0x2f0e2d1023fd3757aa58be7020b0fc58c6a45187',
    '0x6bfe880ed1d639bf80167b93cc9c56a39c1ba2dc',
    '0x3991d59428a8f9f5c13526d92d58b23da14230a0',
    '0x3081cffcac989cb6f3af01dc5bc309d70f6c2884',
    '0x2af0a09b3421240f32953fffb13d2d2b8d24fbae',
    '0xaf693ade4596d45ac294ceab920df0943afb54d9',
    '0x66a0962628bde82cb3dda560f05264407f187827',
    '0x429ccfcca8ee06d2b41daa6ee0e4f0edbb77dfad',
    '0xc000cabd8d5151cc15a47e5f093835af7b81d404',
    '0xacf9cc3b3e8f4031131cd72e40a0fdaa99d3e209',
    '0xfb9a265b5a1f52d97838ec7274a0b1442efacc87',
    '0x785af85cceb3ba1369925c5b43e90026343fc0bb',
    '0x7c0316c925e12ebfc55e0f325794b43ead425157',
    '0x2448ec833ebaf2958330f91e5fbe4f9c70c9e572',
    '0x1440ae2288345a78e753d0b1d679880031bce653',
    '0x38c60bcca6ae0fdbd34466fe8999be15ee4e699e',
    '0xcc659bbea1e1580e9a9c89d8f268101f67a881e9',
    '0x87ae54ea83b460b3819932595c090c23e03a99b4',
    '0x96421bb962c47fe5cf784161f850f83d77919996',
    '0x58ff1f6b706d01a3f3129eaeb04b90133450ca9a',
    '0x84b209ab30081322f124a0e3c96332f66652f9a9',
    '0x50ac42817a6de2997fa012c444896ab78a7e8dea',
    '0x81db1af4cab88324d9391ef5d39eeb1eeae621d1',
    '0x857110b5f8efd66cc3762abb935315630ac770b5',
    '0x02498de890c66fa387e86e04d75adab9df4802f6',
    '0x0db0a66daf641f812493c556a1e0f97379766276',
    '0x97130cc28e99d13ce1ae41d022268b5cc7409cda',
    '0x294b61367b4b36521291a6cc74f0b6037e4319d6',
    '0x7802edb322e774609154a12813b6988cb74bfcf6',
    '0xb581299623520687b483ccffd04bee52e94b82a6',
    '0x056ef502c1fc5335172bc95ec4cae16c2eb9b5b6',
    '0x4d4140c05dfa65e3e38a7bf1bda6e5b68fbe2b80',
    '0xf514a54693db2f3b4c43f78088d361b3f3a317a9',
    '0xc63dff67fe1b63004ab6c773022ba06847c11335',
    '0xa476bbe03ee08b1b9a15c72f752f22631657bb45',
    '0xc9f39993cf05f7442dd56ac2b87484c051ffdb5a',
    '0x9ed7a47cdee1a197b338706145735b62778979cf',
    '0x71db3764d6841d8b01dc27c0fd4a66a8a34b2be0',
    '0x244c716ed10d9137bf65f1a21d9b88b598dac961',
    '0x703e226526d010734a3ea61c3f2b9c9c10197343',
    '0xb5ae2a6b084f59ff9ef6b2e79302a1878306d58c',
    '0x4b036a6769d5f1abb5a249a489348389c2907334',
    '0xca6cf273ab17073248654363aa00b102540aa5ea',
    '0x8e6a81e03310a32d49d501d5d41ea20cdc204e74',
    '0xecb16535477f9cc6db8d8ea70b36d5020499d91c',
    '0x02d7f419d731f718bdb22a3b03874c600bec3a40',
    '0x1ebe895af819eb97a008269c14422db82246a450',
    '0xc6ca529b988267602c86ae3d54ed3a3c9b48b909',
    '0x880d9f8945bc99ee1c7e835ccb2a367fe22dc30a',
    '0x91c8c77829c909bf2178dfa173c96165d3a8c11a',
    '0xb09fc8bbdcc8dc9d8b3775132c52fcebf1c7dbb3',
    '0x37f56017aa5530ae489802626f3bc59b87eab5ae',
    '0xe7ad3016d46e538c9ca87e5071c561a73ed1c98c',
    '0x9429e06ffd09cf97007791b8bf3845171f1425e8',
    '0x9be7685af8a6184f5889f12892f16452fe73f8fd',
    '0x019f398b084d7702cfb7430aa9d545bf55de037f',
    '0x6962e20fb648611801adee8c24af9f7fce2034a8',
    '0xf99514d6556dee14032ceb3f1cd59b32e61541cc',
    '0xac5f019a302c4c8caac0a7f28183ac62e6e80034',
    '0x8561d7a37a998196cafab7432e3243b413dc187e',
    '0xbfc3d05453dddb38289ea44386a9a4f8226ef2ca',
    '0xa3f78ffb9de17d7a530ee08b4aa13362edd7c76b',
    '0xf3749a2bef435535200c378298b78f34dcac0fc9',
    '0x0b036d098cb2a2cce97cddc6187bcadaeb2f8075',
    '0x1c379572160a80975fa1dad8e491ff485611c8f6',
    '0xc2f5fea5197a3d92736500fd7733fcc7a3bbdf3f',
    '0x08da2b1ea8f2098d44c8690ddadca3d816c7c0d5',
    '0x4d8842511cadcc65125cb9353b9520cc7f424688',
    '0x3fb78e61784c9c637d560ede23ad57ca1294c14a',
    '0x1c4d2495f1b9f325cb72c1af0db29985239c68ad',
    '0xf03bd3cfe85f00bf5819ac20f0870ce8a8d1f0d8',
    '0x9f6664205988c3bf4b12b851c075102714869535',
    '0x7a5b529bf0106990494ab3d7696f14c69c000dd7',
    '0x7a2517768a221b43a639f7f03a88074d9884b398',
    '0xbce4e65b4a68ac2095c7747992250d2075d82edc',
    '0xfd268d70c4446862a0fc024fb731d71f3fc5b6c4',
    '0xf5a95ccde486b5fe98852bb02d8ec80a4b9422bd',
    '0xfd5db7463a3ab53fd211b4af195c5bccc1a03890',
    '0x870754e9cb1555c427dd7b433a55aeaccd7e4e1f',
    '0xc8a7c1c4b748970f57ca59326bcd49f5c9dc43e3',
    '0x67d9eae741944d4402eb0d1cb3bc3a168ec1764c',
    '0xdce8dfa05f9af2c16793f6b8e77597b7b7bf0c50',
    '0x588eab5777e51ece898bb71976715072e6f7843f',
    '0x3b22b869ba3c0a495cead0b8a009b70886d37fac',
    '0x6d8ff88973b15df3e2dc6abb9af29cad8c2b5ef5',
    '0x06d39e95977349431e3d800d49c63b4d472e10fb',
    '0xbb2dc673e1091abca3eadb622b18f6d4634b2cd9',
    '0x8b8dbc5b2a0d07df180b1186f179f1c6a97c8aae',
    '0xf05cfb8b4382c69f3b451c5fb55210b232e0edfa',
    '0x9462f2b3c9beea8afc334cdb1d1382b072e494ea',
    '0x0fafafd3c393ead5f5129cfc7e0e12367088c473',
    '0x7abd51bba7f9f6ae87ac77e1ea1c5783ada56e5c',
    '0x9ca41a2dab3cee15308998868ca644e2e3be5c59',
    '0xcaf8703f8664731ced11f63bb0570e53ab4600a9',
    '0x5d4d6836260c116b959e7e25a1735b6c7c328f47',
    '0x50b0d9171160d6eb8aa39e090da51e7e078e81c4',
    '0x96aae323e111a19b1e0e26f55e8de21f1dd01f26',
    '0xc250b22d15e43d95fbe27b12d98b6098f8493eac',
    '0x9001a452d39a8710d27ed5c2e10431c13f5fba74',
    '0x961226b64ad373275130234145b96d100dc0b655',
    '0xe95e4c2dac312f31dc605533d5a4d0af42579308',
    '0xdb8cc7eced700a4bffde98013760ff31ff9408d8',
    '0x0437ac6109e8a366a1f4816edf312a36952db856',
    '0xf38a67da7a3a12aa12a9981ae6a79c0fdddd71ab',
    '0x4606326b4db89373f5377c316d3b0f6e55bc6a20',
    '0xee98d56f60a5905cbb52348c8719b247dafe60ec',
    '0xde495223f7cd7ee0cde1addbd6836046bbdf3ad3',
    '0xe60986759872393a8360a4a7abeab3a6e0ba7848',
    '0xdadfd00a2bbeb1abc4936b1644a3033e1b653228',
    '0xd7c10449a6d134a9ed37e2922f8474eac6e5c100',
    '0x5a59fd6018186471727faaeae4e57890abc49b08',
    '0x5ec58c7def28e0c2470cb8bd7ab9c4ebed0a86b7',
    '0x67c7f0a63ba70a2dac69477b716551fc921aed00',
    '0x4e43151b78b5fbb16298c1161fcbf7531d5f8d93',
    '0xc9c32cd16bf7efb85ff14e0c8603cc90f6f2ee49',
    '0x83d78bf3f861e898cca47bd076b3839ab5469d70',
    '0x66e335622ad7a6c9c72c98dbfcce684996a20ef9',
    '0x0aace9b6c491d5cd9f80665a2fcc1af09e9ccf00',
    '0x92da88e2e6f96cc7c667cd1367bd090adf3c6053',
    '0xc5481720517e1b170cf1d19ceaabe07c37896eb2',
    '0x875df0ba24ccd867f8217593ee27253280772a97',
    '0xd4cedef74fb8885b8e1de21fba5a2e2f33f21f58',
    '0xc69b00366f07840ff939cc9fdf866c3dccb10804',
    '0x23affc32cbe3c1a2a79376361a2d6f51ca7c9005',
    '0xc0ec468c1b6b94a107b0a83c7a0f6529b388f43a',
    '0x27f715999252a6e4d4794b4c9ff2ce3d6ea8fd9b',
    '0xec0de6a9da9cc464da0011214d586c21f1fbe6d4',
    '0x97ba76a574bc5709b944bb1887691301c72337ca',
    '0x8d35ece39566d65d06c9207c571934dd3c3a3916',
    '0x79e281bc69a03dabccd66858c65ef6724e50aebe',
    '0x0245918fa513e0641509bb519389a49258a2699f',
    '0x400d4c984779a747462e88373c3fe369ef9f5b50',
    '0xfc8c34a3b3cfe1f1dd6dbccec4bc5d3103b80ff0',
    '0x3685646651fccc80e7cce7ee24c5f47ed9b434ac',
    '0x6d09c6513e620778632d36784f5c3b4b2309bd96',
    '0x663ac72a1c3e1c4186cd3dcb184f216291f4878c',
    '0xfcc067efb7be2eebd32615f14fc22195abb68e9b',
    '0x4424b4a37ba0088d8a718b8fc2ab7952c7e695f5',
    '0x06c21b5d004604250a7f9639c4a3c28e73742261',
    '0x7c0d189e1fecb124487226dcba3748bd758f98e4',
    '0xbc90fec043e6df6a084e18df9435ee037c940b2d',
    '0x8e9de7e69424c848972870798286e8bc5ecb295f',
    '0x35dd22fc3ec5a82d207bedd8fa1f658915f97c33',
    '0x0ce6e42edada12c4d862415aea7c82bce93426d5',
    '0xb00ea2bcad321850bc8055e7c311b05d54875cad',
    '0xc1e894613a404a49c4200fce3f7d3f29918d2b93',
    '0x9a6f2ffa30cddbb6156b98ac88a546e81205f6ba',
    '0xfc89b519658967fcbe1f525f1b8f4bf62d9b9018',
    '0xc2d54ffb8a61e146110d2fbdd03b12467fe155ac',
    '0xdd9e687c73a2031a8f5058b596d740f53c1cb220',
    '0x320b564fb9cf36933ec507a846ce230008631fd3',

    '0x1dff955cddd55fba58db3cd658f9e3e3c31851eb',
    '0x595146ed98c81dde9bd23d0c2ab5b807c7fe2d9f',
    '0x6525e7e2e8450741ab97bd3948bfa47878f83ec6',
    '0x039fd59541b3989c7a1e9278431038b3b6ba5f43',
    '0xd3301b7caa76f932816a6fc7ef0b673238e217ad',
    '0xb2e2536821521174a168eda7be78a6c70ea6e5fa',
    '0x58257e4291f95165184b4bea7793a1d6f8e7b627',
    '0x21d158d95c2e150e144c36fc64e3653b8d6c6267',
    '0xbec570d92afb7ffc553bdd9d4b4638121000b10d',
    '0x4149d1038575ce235e03e03b39487a80fd709d31',
    '0x31c325a01861c7dbd331a9270296a31296d797a0',
    '0xd9f907f7f84cbb0af85c7829922fd692339147f9',
    '0x75a1fda374fdb4e47d703d0282e94c87119fa46e',
    '0x13b876c26ad6d21cb87ae459eaf6d7a1b788a113',
    '0x825722af244432319c1e32b6b18aded2d4a014df',
    '0x02dfa5c793a9ce4d767a86259245a162a57f2db4',
    '0xc7a87b0f491c1a043eb5315281163556b7f36f7f',
    '0x1631d0e588d475cee4be0f51b7410daaaabd7034',
    '0x372463c1dfe3a9c269c2c5eb76a86021c637d0f4',
    '0xb49b238ab6106216dc26854ed3a009eac1c419a9',
    '0xdcb11e81c8b8a1e06bf4b50d4f6f3bb31f7478c3',
    '0x6d91a9cf0dea0cd5bcb676eb4b1f11b6dcb44188',
    '0x7f87a8b46a662131b87d29b2316b2d9cbd7e3b02',
    '0x52f05c70d86662204c7222c35000747b177c393a',
    '0xbe084cf7db8fdfd6f17c041f958abccaf8c76603',
    '0x3e3c6c7db23cddef80b694679aaf1bcd9517d0ae',
    '0x6a6283ab6e31c2aec3fa08697a8f806b740660b2',
    '0xaeb6f2abe64ee5ed210e8ae33b1f0f5e4b3e28fc',
    '0x96f34bb82fca57e475e6ad218b0dd0c5c78df423',
    '0x17374bdbcb79ae20cb947640915316d379a7f222',
    '0xf4e7c1e5a21f68df8d6a331affbeebc313ed24d1',
    '0x3cc1b5dce81a810080890fb8adad48f8eaa8c210',
    '0xfc1e8bf3e81383ef07be24c3fd146745719de48d',
    '0x6575ad173801f2d58961b3d7f3628c72346ea84a',
    '0xee0dcaf26aa271ff18bb9b9b282620a7ce79f6ba',
    '0x867fe27fc2462cff8890b54dfd64e6d42a9d1ac8',
    '0xa246ed2954539f2eaa8e1fb72e02637f2a402ab7',
    '0x6868eb3fcefe1684486f601d2dc10bbf0c4eeb8b',
    '0x53dfcf5ca1e1d5311db29f585d56a9a9dcc2441b',
    '0x51bcba35e5fa277592cea83ad14408a0963b86f8',
    '0x4cc9385d9909d2bf529a4c1e847dc4ee01f4927a',
    '0x675993fb30a2d58cd4d29d15f89b4be9ca8765ae',
    '0x6c5acd4c044defe22fec287d1362b1af5ed16f7a',
    '0x593807b540d2584fd16433dc609f869421577173',
    '0x50e29cd32bedf8adf6c58cf0f8f2c64cb98c62ac',
    '0x7ce013171826feb235ed3fd4ba0171e64ac97d2b',
    '0x3d2253fa44c38d9870539dc2856286aa1638467f',
    '0xabf03448f97708f06fb1caa5b58a30247f024d19',
    '0x56e9bac9e21b9390b3344320b33f7abe776ed35f',
    '0xf5ed6024c08fca91f85a20ad364a4f3994f3ecae',
    '0xaf4264916b467e2c9c8acf07acc22b9edddadf33',
    '0x7e650c700b0801e717b352e55a582afd928aa094',
    '0x031af153efbc75a88110cb3b94eafbec847a526f',
    '0x53e4a076b62667e8c8aae13b8edc793e9a5f3fed',
    '0x0d8bc03c14a135783b135d51b256997def69175c',
    '0xbc41efcacbd94241f2c89443e2832b31fbe6eb22',
    '0xe7a59b3b44acacfd8a5ba9259d6913f097946409',
    '0xce756104d10e1fdc60c9c32a84b1bb19712e52ba',
    '0xee3dd0cb1a8175b69e1cd6e354b9dc1629f3e8b5',
    '0x5f5fe47fed55eae627386995198294c39e1d17a5',
    '0x5f2bb3ded5de76644e2a033acedce6e93b4a3efc',
    '0x713060278d13dfdba6c7b58adebaf8b57213c904',
    '0xa7b0e924c2dbb9b4f576cce96ac80657e42c3e42',
    '0xed09ca8275dffb09c632b6ea58c035a851f73616',
    '0xc8781f2193e2cb861c9325677d98297f94a0dfd3',
    '0x9f4a88da14f2b6dbc785c1db3511a53b8f342bde',
    '0xf0c081020b9d06eb1b33e357767c00ccc138be7c',
    '0x679ce2a8b3180f5a00e0dcca26783016799e9a58',
    '0x8083b047e962ca45b210e28ac755fbda3d773c5b',
    '0x5b78b93fa851c357586915c7ba7258b762eb1ba0',
    '0xd05ce4ab1f4fb0c0e1b65ebe3ed7f2dcfc6ccf20',
    '0x97aeb34ac6561146dd9ce191efd5634f6465def4',
    '0x9809f2b973bdb056d24bc2b6571ea1f23db4e861',
    '0xeb07fcd7a8627281845ba3acbed24435802d4b52',
    '0x6f80b9543dd5a0408f162fe2a1675db70a2cb77d',
    '0xbf5d9decccc762fa7b5eb9fac668c803d42d97b6',
    '0x9558b18f021fc3cba1c9b777603829a42244818b',
    '0xee60f4a3487c07b4570ccffef315401c4c5744c8',
    '0x8116e7c29f60fdacf3954891a038f845565ef5a0',
    '0x2ed1d3e7771d64feed7ae8f25b4032c8dd2d0b99',
    '0x50c8f34cea0e65535fc2525b637ccd8a07c90896',
    '0x642562115cf5a5e72ab517e6448ec8b61843dac9',
    '0x48fcffa86fb24bdeb45b5739f7ced24095a7c8e8',
    '0xb3bc1833ac51aacea92acd551fbe1ab7edc59edf',
    '0x85f102be3a76165be9668be0bf36e906a488fd33',
    '0x87872be0c56ef97156f2617b3083d22423fc62e9',
    '0x8b3138df9aa1f60648c65c67d6ff646be305788b',
    '0xb548e49bb6f33a77885836723b73ef9c8dbc047b',
    '0x3dcc3ac50cb42f7e443d7f548dd2c48edaa8f59a',
    '0x172a54ba45783049216f90f85fe5e5f6bc1c08fe',
    '0xf08dbd81fcc712004e6943454c83c52de963cdec',
    '0x9fe520e629a7f0dec773a3199bfe87620e5aea74',
    '0xb2111b55edd1cb5d2c18a6817e21d473fe0e5ba1',
    '0xa23d59fa2505638861525f8cb3005fec7bd37b5b',
    '0xb90a850a0802b9f281babea836292aadd1011972',
    '0x9d0de74de698d1ba7273d09193ec20a1f6cb7d6a',
    '0xec4acc9322fc4dc853e8f72631d2c95556c68ec0',
    '0x3d675a52f5b572eb5c61fc5088203ac9b16bfc70',
    '0x04f0fae3dd0a9904f797deb15c3e523342112811',
    '0x0b049eb31878176b278ef84a66810d311353dc94',
    '0x5239063a86e1e251ee6fb3ab4fb67dea3a8e1fd2',
    '0x930792bd0fb4593063ad2ee12e86d768bd8df7a1',
    '0xb5fc990637f15be6420341845a64101b6bbe365d',
    '0xabe43b60f8337818c21101ab78b5b216789e19dd',
    '0xdab9eeee607f7952680e9433787e4ede244a8515',
    '0x62cec7899a9910e48f0deeab755429887b6e1979',
    '0x00f93fbf00f97170b6cf295dc58888073cb5c2b8',
    '0x982da76f0ccf868b558bd46d7a3b58bc2662d7cc',
    '0x578b27e257050b6011dfdcd69f67696ef24279fc',
    '0xb4698193bcbc49be01fcfc67c144ea4927166355',
    '0x188abea43270791f96dc9209e239f7b79e61203b',
    '0x28b0cf1bafb707f2c6826d10caf6dd901a6540c5',
    '0x8e27f0821873b6f5421b6ca75a4c5e1e83d3e77a',
    '0x6a0861625937cb3629066cc6db88808a590b9c68',
    '0x498ad3352ccfaed237a91f6933a92a7a43917b72',
    '0xd82c2eb10f4895cabed6eda6eeee234bd1a9838b',
    '0xd6b03059c882f63268dd3e1a98d8e3cdee26919c',
    '0xa15e8f7e1e031e4f6f11053c6d320b2a8dc6742c',
    '0x6a52e339a4b8abd15707f882d6adc05875ec5223',
    '0xa98794accdb3996c7ef015a354b6e1add2d2ce3e',
    '0xe82805a9b880e6dc520b6f017537f7781d55217f',
    '0xd511b5c309b2f7256ff7b3d41b029afb96c7a331',
    '0xa77b5d170f3aec2f72ca06490a7b9383a70ae5eb',
    '0x1400e08f1d9f5bc90ae19acd4bf81beabc9e79de',
    '0x9fd7e5b614fa071ff3543b44b68ef7699cec4af5',
    '0x166bddea59c13179796653b8aff13eea1bd81a97',
    '0x613398aecdaf6bcb6edb8e61e5956794d23f7412',
    '0xa500cd4e520682e1b1113e1055d55bacead61122',
    '0xfd46b54fcff753ba058a5e9bbb45dcedc9a71fab',
    '0x3c565d9151073e8e5002b61dc570f43a139cafe7',
    '0x84997fafc913f1613f51bb0e2b5854222900514b',
    '0xf52e248ccfbf189df0c5a4b15e9f72fa10c7fe59',
    '0xf275cadbe0343541ce49a03e385f8b234544cda8',
    '0x08f9dd845d0c91b918bb90cc5b124f3fd3e98f3a',
    '0x1cc1772c8899ad2a35ade9b9978a56254cfc64a0',
    '0x968dee60c67c184f9808510ec92d990e7e6616c2',
    '0xd8a114e127aa5b9f20284fc7a1bdf2bc6853a28d',
    '0x83fc85f144bbec4234e690b6451b105f3d7c60e4',
    '0x37f1d67a5ac27b7c2d0f664e73ccbb82627ac4a5',
    '0xcd0148e3f3350f4b98a48535f63a38fc630e80f1',
    '0x1f98249637bb42edb072dd2a8add44aeb80da218',
    '0x7b42d77bd2fee3c98baa58d559b83ff3bb4702cf',
    '0x50122108f7b3b10ac219d066275087d37e4f4a61',
    '0x110cc323ca53d622469edd217387e2e6b33f1df5',
    '0xffc78332f0da6fbaabdacfe8054ccbc501eed432',
    '0xc71bc7e33510aea215e4776867148fa25c368795',
    '0x0bbe64ea3cf57fdfdfd621f334b3469627a022ad',
    '0x02914596cad247c86e8f7d8464d1b3dbd0cec86e',
    '0x48c6b29893ec0320e1cd10227b8c2f26eb342a83',
    '0xab3435bd2959fd713f7e50389ff374bfee2e3b4b',
    '0x9a64dec8da8ce892ff711d715d9a8fc82e966a44',
    '0xc3fe3eedd7002842f2971183b5e87f89cc1ee848',
    '0xed43cb0dd25a1fa4dbd456f52c9fbb782f20eae1',
    '0x8d6ed9ba971cf08441fc542acecd35f691afa752',
    '0x212a60171e22988492b7c38a1a3553c60f1892be',
    '0x4029f7dcbdf6059ed80da6856526e7510d64fa21',
    '0x386ec09db6f961b9e28b3dab174ad9567e57b90c',
    '0x14756a5ed229265f86990e749285bdd39fe0334f',
    '0x383e6b4437b59fff47b619cba855ca29342a8559',
    '0xaec7db1be1be14af32d00bbf31487a03cb6925ed',
    '0x02ac4107893ba767177d69851dcd87bedc63ab22',
    '0x73069892f6750ccaaababadc54b6b6b36b3a057d',
    '0x6e8d2b6fb24117c675c2fabc524f28cc5d81f18a',
    '0x5105a9e847965421a8c81ca33ea682948694a6f4',
    '0x1005f7406f32a61bd760cfa14accd2737913d546',
    '0x270d74e9cc8dc75ef55d91c0d469e3285e581e77',
    '0x428d03774f976f625380403e0c0ad38980943573',
  ].map(Address.from)
)
const routerAddresses: Record<ChainId, Address> = {
  [ChainIds.Mainnet]: Address.from(
    '0x16C6521Dff6baB339122a0FE25a9116693265353'
  ),
  [ChainIds.Base]: Address.from('0x4f37A9d177470499A2dD084621020b023fcffc1F'),
  [ChainIds.Arbitrum]: Address.from(
    '0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D'
  ),
}

export class CurveSwap extends Action('Curve') {
  public get actionName() {
    return `swap`
  }

  public async liquidity(): Promise<number> {
    return await this.pool.liquidity()
  }

  public toString() {
    return `${
      this.protocol
    }.${this.pool.address.toShortString()}.swap(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
  public get oneUsePrZap() {
    return true
  }
  public get supportsDynamicInput() {
    return true
  }
  public get returnsOutput() {
    return true
  }

  public get addressesInUse() {
    return this.pool.addressesInUse
  }

  get outputSlippage() {
    return 1n
  }

  private routeParams(plan: boolean = false) {
    const route: string[] = []
    const swapParams: number[][] = []

    let inputTokenAddr =
      this.pool.underlyingTokens[this.inputTokenIndex].address.address
    let outputTokenAddr =
      this.pool.underlyingTokens[this.outputTokenIndex].address.address
    if (plan) {
      if (
        this.pool.underlyingTokens[this.inputTokenIndex] ===
        this.universe.nativeToken
      ) {
        route.push(
          this.universe.wrappedNativeToken.address.address,
          this.universe.wrappedNativeToken.address.address
        )
        swapParams.push([0, 0, 8, 0, 0])
        inputTokenAddr = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      }
    }

    type SwapParams = [number, number, number, number, number]
    route.push(inputTokenAddr, this.pool.address.address, outputTokenAddr)
    swapParams.push([
      this.inputTokenIndex,
      this.outputTokenIndex,
      this.pool.swapTypeUnderlying(this.inputTokenIndex, this.outputTokenIndex),
      this.pool.poolType,
      this.pool.underlyingTokens.length,
    ])

    if (plan) {
      if (
        this.pool.underlyingTokens[this.outputTokenIndex] ===
        this.universe.nativeToken
      ) {
        swapParams.push([0, 0, 8, 0, 0])
        route.push(
          this.universe.wrappedNativeToken.address.address,
          this.universe.wrappedNativeToken.address.address
        )
      }
    }

    while (route.length !== 11) {
      route.push(ethers.constants.AddressZero)
    }
    while (swapParams.length !== 5) {
      swapParams.push([0, 0, 0, 0, 0])
    }
    if (route.length !== 11 || swapParams.length !== 5) {
      throw new Error('Invalid route or swap params')
    }
    return {
      route: route as [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ],
      swapParams: swapParams as [
        SwapParams,
        SwapParams,
        SwapParams,
        SwapParams,
        SwapParams
      ],
      // pools: [
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      // ] as [string, string, string, string, string],
    }
  }

  // @notice Performs up to 5 swaps in a single transaction.
  // @dev Routing and swap params must be determined off-chain. This
  //       functionality is designed for gas efficiency over ease-of-use.
  // @param _route Array of [initial token, pool or zap, token, pool or zap, token, ...]
  //               The array is iterated until a pool address of 0x00, then the last
  //               given token is transferred to `_receiver`
  // @param _swap_params Multidimensional array of [i, j, swap_type, pool_type, n_coins] where
  //                     i is the index of input token
  //                     j is the index of output token

  //                     The swap_type should be:
  //                     1. for `exchange`,
  //                     2. for `exchange_underlying`,
  //                     3. for underlying exchange via zap: factory stable metapools with lending base pool `exchange_underlying`
  //                         and factory crypto-meta pools underlying exchange (`exchange` method in zap)
  //                     4. for coin -> LP token "exchange" (actually `add_liquidity`),
  //                     5. for lending pool underlying coin -> LP token "exchange" (actually `add_liquidity`),
  //                     6. for LP token -> coin "exchange" (actually `remove_liquidity_one_coin`)
  //                     7. for LP token -> lending or fake pool underlying coin "exchange" (actually `remove_liquidity_one_coin`)
  //                     8. for ETH <-> WETH, ETH -> stETH or ETH -> frxETH, stETH <-> wstETH, frxETH <-> sfrxETH, ETH -> wBETH, USDe -> sUSDe

  //                     pool_type: 1 - stable, 2 - twocrypto, 3 - tricrypto, 4 - llamma
  //                                 10 - stable-ng, 20 - twocrypto-ng, 30 - tricrypto-ng

  //                     n_coins is the number of coins in pool

  // @param _amount The amount of input token (`_route[0]`) to be sent.
  // @param _min_dy The minimum amount received after the final swap.
  // @param _pools Array of pools for swaps via zap contracts. This parameter is only needed for swap_type = 3.
  // @param _receiver Address to transfer the final output token to.
  // @return Received amount of the final output token.
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const [output] = await this.quote(predicted)
    const lib = this.gen.Contract.createLibrary(this.routerCall)

    const { route, swapParams } = this.routeParams(true)

    const minOut = 0n // output.amount - output.amount / 5n
    // function exchangeNew(
    //     uint256 amountIn,
    //     bytes memory encodedRouterCall
    // ) external returns (uint256) {
    //   (
    //     address[11] memory route,
    //     uint256[5][5] memory swapParams,
    //     uint256 expected,
    //     address router
    // ) = abi.decode(
    //     encodedRouterCall,
    //     (address[11], uint256[5][5], uint256, address)
    // );
    const encodedStaticData = ethers.utils.defaultAbiCoder.encode(
      ['address[11]', 'uint256[5][5]', 'uint256', 'address'],
      [route, swapParams, minOut, this.router.address]
    )

    return [
      planner.add(
        lib.exchangeNew(input, encodedStaticData),
        `Curve: Swap ${predicted.join(', ')} -> ${output} on pool ${
          this.address
        }`,
        `crv_${this.address.toShortString()}_${this.inputToken.join(
          '_'
        )}_${this.outputToken.join('_')}`
      )!,
    ]
  }

  get isTrade() {
    return true
  }

  get dependsOnRpc() {
    return true
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const outputQty = await this.quoteCache.get(amountIn.amount)
    return [outputQty]
  }

  private quoteCache: BlockCache<bigint, TokenQuantity>
  public gasEstimate() {
    return this.gasEstimate_
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurvePool,
    public readonly inputTokenIndex: number,
    public readonly outputTokenIndex: number,
    private readonly gasEstimate_: bigint,
    private readonly router: ICurveRouter,
    private readonly routerCall: CurveRouterCall
  ) {
    super(
      pool.address,
      [pool.actionToken(inputTokenIndex)],
      [pool.actionToken(outputTokenIndex)],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          pool.actionToken(inputTokenIndex),
          Address.from(router.address)
        ),
      ]
    )
    this.quoteCache = this.universe.createCache(
      async (amount: bigint) => {
        const { route, swapParams } = this.routeParams()
        const out = await this.router.callStatic[
          'get_dy(address[11],uint256[5][5],uint256)'
        ](route, swapParams, amount)

        const outputQty = this.outputToken[0].from(out)

        return outputQty
      },
      12000,
      (i) => (i / 100n) * 100n
    )
  }
}

export const loadCurve = async (universe: Universe) => {
  const router = routerAddresses[universe.chainId as ChainId]
  if (router == null) {
    throw new Error(`No router address for chain ${universe.chainId}`)
  }
  const routerInst = ICurveRouter__factory.connect(
    router.address,
    universe.provider
  )

  const loadCurvePools = async (universe: Universe) => {
    // const batcher = new ethers.providers.JsonRpcBatchProvider(p.connection.url)
    await curve.init(universe.provider, () => ({
      gasPrice: universe.gasPrice,
      maxFeePerGas: universe.gasPrice + universe.gasPrice / 10n,
    })) // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically

    await Promise.all([
      curve.fetchFactoryPools(true),
      curve.fetchCryptoFactoryPools(true),
    ])

    const poolsUnfiltered = [
      ...curve.getPoolList(),
      ...curve.getCryptoFactoryPoolList(),
      ...curve.getFactoryPoolList(),
    ]

      .map((id) => {
        try {
          const pool = getPool(id)
          const poolAddress = Address.from(pool.address)
          if (dontLoadPools.has(poolAddress)) {
            return null
          }

          return {
            name: pool.name,
            pool,
            poolAddress,
            underlyingCoinAddresses: pool.underlyingCoinAddresses.map(
              Address.from
            ),
            wrappedCoinAddresses: pool.wrappedCoinAddresses.map(Address.from),
          }
        } catch (e) {
          console.log(e)
          return null
        }
      })
      .filter((i) => i != null)

    const pools = poolsUnfiltered.filter(
      (p) =>
        p.pool.underlyingDecimals.every((i) => i !== 0) &&
        p.pool.wrappedDecimals.every((i) => i !== 0)
    )

    const tokenAddresses = [
      ...new Set(
        pools

          .map(({ pool }) =>
            pool.wrappedCoinAddresses
              .concat(pool.underlyingCoinAddresses)
              .map((a) => Address.from(a))
          )
          .flat()
      ),
    ]
    const badTokens = new Set<string>()
    await Promise.all(
      tokenAddresses.map(async (address) =>
        universe.getToken(address).catch((e) => {
          badTokens.add(address.address.toString())
        })
      )
    )
    const curvePools = await Promise.all(
      pools.map(async ({ name, pool }) => {
        try {
          const tokens = pool.wrappedCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )
          const underlying = pool.underlyingCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )

          const lpToken = await universe.getToken(Address.from(pool.lpToken))

          return new CurvePool(
            universe,
            Address.from(pool.address),
            lpToken,
            tokens,
            underlying,
            pool,
            name
          )
        } catch (e) {
          console.log(e)
          return null!
        }
      })
    )
    return curvePools.filter((i) => i !== null)
  }

  const addLpToken = async (universe: Universe, pool: CurvePool) => {
    const lpToken = await universe.getToken(Address.from(pool.meta.lpToken))

    if (universe.lpTokens.has(lpToken)) {
      return
    }
    const noBal = await universe.approvalsStore.queryBalance(
      pool.underlyingTokens[0],
      pool.address
    )
    if (noBal.isZero) {
      throw new Error(
        `No balance for ${pool.underlyingTokens[0]} in pool ${pool}`
      )
    }
    const p = await universe.fairPrice(noBal)
    if (p == null || p.asNumber() < 1000) {
      throw new Error('Pool is too small')
    }

    const burn = async (qty: TokenQuantity) => {
      try {
        const qtyin = qty.asNumber().toFixed(qty.token.decimals)

        const out = await (pool.meta.isMeta
          ? pool.meta.withdrawWrappedExpected(qtyin)
          : pool.meta.withdrawExpected(qtyin))

        return out.map((amount, i) =>
          (pool.meta.isMeta ? pool.underlyingTokens : pool.tokens)[i].from(
            parseFloat(amount)
          )
        )
      } catch (e) {
        throw e
      }
    }

    const mint = async (poolTokens: TokenQuantity[]) => {
      const out = await pool.meta.depositWrappedExpected(
        poolTokens.map((q) => q.asNumber())
      )
      return lpToken.from(out)
    }

    await universe.defineLPToken(lpToken, burn, mint)
  }

  const pools = await loadCurvePools(universe)
  const routerAddress = Address.from(curve.constants.ALIASES.router)

  const getPoolByLPMap = new Map<Token, CurvePool>()
  const curveGraph = new DefaultMap<
    Token,
    {
      edges: DefaultMap<Token, CurveSwap[]>
      pools: CurvePool[]
    }
  >(() => ({
    edges: new DefaultMap(() => []),
    pools: [],
  }))

  // const interestingTokens = new Set<Token>([
  //   ...universe.commonTokensInfo.tokens.values(),
  //   ...universe.rTokensInfo.tokens,
  //   universe.wrappedNativeToken,
  //   universe.nativeToken,
  // ])

  const poolsAdded = new Set<Address>()

  const routerCallInst = CurveRouterCall__factory.connect(
    universe.config.addresses.curveRouterCall.address,
    universe.provider
  )

  const allowedPoolTypes = [1, 2, 3, 10, 20, 30]

  await Promise.all(
    pools.map(async (pool) => {
      if (poolsAdded.has(pool.address)) {
        return
      }
      poolsAdded.add(pool.address)
      if (
        pool.meta.data.name.toLowerCase().includes('test') ||
        pool.meta.isLending ||
        pool.meta.isFake
      ) {
        return
      }
      try {
        let shouldAddToGraph = true
        // const poolTokens = [
        //   ...new Set([...pool.underlyingTokens, ...pool.tokens]),
        // ]
        // let shouldAddToGraph =
        //   poolTokens.every((t) => interestingTokens.has(t)) ||
        //   poolTokens.filter((t) => interestingTokens.has(t)).length >=
        //     poolTokens.length - 1

        // if (!shouldAddToGraph) {
        //   return
        // }
        try {
          if (allowedPoolTypes.includes(pool.poolType)) {
            await addLpToken(universe, pool)
            getPoolByLPMap.set(pool.lpToken, pool)
          }
        } catch (e) {
          console.log(pool.address.toString())
          // console.log(e)
          shouldAddToGraph = false
          return
        }

        for (let i = 0; i < pool.underlyingTokens.length; i++) {
          const token0 = pool.underlyingTokens[i]
          if (
            (typeof pool.meta.basePool?.length === 'number' &&
              pool.meta.basePool?.length > 0) ||
            pool.meta.isMeta ||
            pool.meta.isMetaFactory
          ) {
            if (i !== 0) {
              continue
            }
          }
          curveGraph.get(token0).pools.push(pool)

          for (let j = i + 1; j < pool.underlyingTokens.length; j++) {
            const token1 = pool.underlyingTokens[j]

            if (!shouldAddToGraph) {
              break
            }
            if (token0 === token1) {
              continue
            }
            const swap01 = wrapGasToken(
              universe,
              new CurveSwap(
                universe,
                pool,
                pool.getTokenIndex(token0),
                pool.getTokenIndex(token1),
                250_000n,
                routerInst,
                routerCallInst
              )
            )

            const swap10 = wrapGasToken(
              universe,
              new CurveSwap(
                universe,
                pool,
                pool.getTokenIndex(token1),
                pool.getTokenIndex(token0),
                250_000n,
                routerInst,
                routerCallInst
              )
            )

            curveGraph
              .get(swap01.inputToken[0])
              .edges.get(swap01.outputToken[0])
              .push(swap01)
            curveGraph
              .get(swap10.inputToken[0])
              .edges.get(swap10.outputToken[0])
              .push(swap10)

            universe.addAction(swap01)
            universe.addAction(swap10)
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  )

  return {
    routerAddress,
    pools,
    getPoolByLPMap,
  }
}

export type CurveApi = Awaited<ReturnType<typeof loadCurve>>
