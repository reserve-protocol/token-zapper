import { Indexer } from './Indexer'
import { MorphoIndexer } from './MorphoIndexer'
import { ethers } from 'ethers'

const BLOCK_STEP = 10000

class MainIndexer extends Indexer {
  indexers: Indexer[]

  constructor(
    chainId: string,
    provider: ethers.providers.JsonRpcProvider,
    protocol: string
  ) {
    super(chainId, provider, protocol)
    this.indexers = []
    this.indexers.push(new MorphoIndexer(chainId, provider, 'Morpho'))
  }

  async run() {
    while (true) {
      const currentBlock = await this.provider.getBlockNumber()
      const start = await this.loadLastBlock()
      let end = start + BLOCK_STEP
      if (end > currentBlock) {
        end = currentBlock
      }
      await this.processBlocks(start, end)
      if (end === currentBlock) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  async _processBlocks(start: number, end: number): Promise<void> {
    await Promise.all(
      this.indexers.map((indexer) => indexer.processBlocks(start, end))
    )
  }
}

export { MainIndexer }
