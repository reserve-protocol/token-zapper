import { ethers } from 'ethers'
import { client } from './db'

interface IIndexer {
  processBlocks(start: number, end: number): Promise<void>
}

const MAX_BLOCKS = 10000

class Indexer implements IIndexer {
  chainId: string
  provider: ethers.providers.JsonRpcProvider
  protocol: string

  constructor(
    chainId: string,
    provider: ethers.providers.JsonRpcProvider,
    protocol: string
  ) {
    this.chainId = chainId
    this.provider = provider
    this.protocol = protocol
  }

  async processBlocks(start: number, end: number): Promise<void> {
    try {
      const lastBlock = await this.loadLastBlock()
      if (end - lastBlock > MAX_BLOCKS) {
        console.log(
          `[** catching up **] ${this.protocol} Indexer processing blocks ${start} to ${end}`
        )
        start = lastBlock
        end = lastBlock + MAX_BLOCKS
      } else {
        console.log(
          `${this.protocol} Indexer processing blocks ${start} to ${end}`
        )
      }
      await this._processBlocks(start, end)
    } catch (error) {
      console.error(error)
    }
    await this.saveLastBlock(end)
  }

  async _processBlocks(start: number, end: number): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async saveLastBlock(block: number) {
    // write to file by chain id
    const query = `UPDATE "indexer_blocks" SET last_block = ${block} WHERE chain_id = ${this.chainId} AND indexer = '${this.protocol}'`
    await client.query(query)
  }

  async loadLastBlock(): Promise<number> {
    // read from file, if no file, return 0
    const query = `SELECT last_block FROM "indexer_blocks" WHERE chain_id = ${this.chainId} AND indexer = '${this.protocol}'`
    const result = await client.query(query)
    if (result.rows.length === 0) {
      await client.query(
        `INSERT INTO "indexer_blocks" (chain_id, indexer, last_block) VALUES (${this.chainId}, '${this.protocol}', 0)`
      )
      return 0
    }
    return Number(result.rows[0].last_block)
  }
}

export { Indexer }
