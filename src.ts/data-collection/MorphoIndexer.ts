import { Indexer } from './Indexer'
import {
  IAerodromeFactory__factory,
  IMetaMorphoFactory,
  IMetaMorphoFactory__factory,
} from '../contracts'
import { Address } from '../base/Address'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { CreateMetaMorphoEvent } from '../contracts/contracts/IMetaMorphoFactory.sol/IMetaMorphoFactory'
import { client } from './db'
dotenv.config()

const BATCH_SIZE = 1

// // mainnet
// const FACTORIES = [
//   '0x1897A8997241C1cD4bD0698647e4EB7213535c24',
//   '0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101', // old
// ]

// base
const FACTORIES = [
  '0xFf62A7c278C62eD665133147129245053Bbf5918',
  '0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101', // old
]

type MorphoPoolData = {
  vault: string
  asset: string
  name: string
  symbol: string
}

class MorphoIndexer extends Indexer {
  factoryInstances: IMetaMorphoFactory[]
  constructor(
    chainId: string,
    provider: ethers.providers.JsonRpcProvider,
    protocol: string
  ) {
    super(chainId, provider, protocol)
    this.factoryInstances = FACTORIES.map((factory) =>
      IMetaMorphoFactory__factory.connect(factory, this.provider)
    )
  }

  async _processBlocks(start: number, end: number): Promise<void> {
    console.log(`Processing blocks ${start} to ${end}`)
    // use ethers to filter events by block range
    for (const factoryInst of this.factoryInstances) {
      const events = await factoryInst.queryFilter(
        factoryInst.filters.CreateMetaMorpho(),
        start,
        end
      )
      console.log(`Found ${events.length} events`)
      if (events.length > 0) {
        let eventData = await Promise.all(
          events.map((event) => this.processEvent(event))
        )
        await this.saveToDb(eventData)
      }
    }
  }

  async processEvent(event: CreateMetaMorphoEvent): Promise<MorphoPoolData> {
    let out: MorphoPoolData = {
      vault: event.args.metaMorpho,
      asset: event.args.asset,
      name: event.args.name,
      symbol: event.args.symbol,
    }
    return out
  }

  async saveToDb(data: MorphoPoolData[]) {
    console.log(`Saving ${data.length} pools to db`)
    // save to db
    try {
      // Split updates into batches
      for (let i = 0; i < data.length; i++) {
        // Create VALUES part of the query
        const d = data[i]
        const values = `($${1}, $${2}, $${3}, $${4})`

        // Create parameters array
        const params = [d.vault, d.asset, d.name, d.symbol]

        const query = `
            INSERT INTO "morpho_vaults" (vault, asset, name, symbol)
            VALUES ${values}
            ON CONFLICT (vault) DO NOTHING
          `
        console.log(query)
        console.log(params)

        await client.query(query, params)
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}

export { MorphoIndexer }
