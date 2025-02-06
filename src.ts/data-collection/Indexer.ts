import { ethers } from 'ethers'
import fs from 'fs'
import { client } from './db'

interface IIndexer {
  lastBlock: number

  processBlocks(start: number, end: number): Promise<void>
}

type BlockEvents = {
  start: number
  end: number
  events: LogEvent[]
}

type LogEvent = {
  name: string
  data: any
}

const BLOCK_STEP = 10000

class Indexer implements IIndexer {
  lastBlock: number = 0
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
    this.lastBlock = this.loadLastBlock()
  }

  async run() {
    while (true) {
      const start = this.loadLastBlock()
      let end = start + BLOCK_STEP
      if (end > 26001983) {
        end = 26001983
      }
      await this.processBlocks(start, end)
      this.saveLastBlock(end)
    }
  }

  async processBlocks(start: number, end: number): Promise<void> {
    throw new Error('Method not implemented.')
  }

  saveLastBlock(block: number) {
    // write to file by chain id
    fs.writeFileSync(
      `./src.ts/data-collection/data/base/lastBlock.${this.chainId}.${this.protocol}.txt`,
      block.toString()
    )
    this.lastBlock = block
  }

  loadLastBlock(): number {
    // read from file, if no file, return 0
    if (
      !fs.existsSync(
        `./src.ts/data-collection/data/base/lastBlock.${this.chainId}.${this.protocol}.txt`
      )
    ) {
      return 0
    }
    return parseInt(
      fs.readFileSync(
        `./src.ts/data-collection/data/base/lastBlock.${this.chainId}.${this.protocol}.txt`,
        'utf8'
      )
    )
  }
}

export { Indexer }
