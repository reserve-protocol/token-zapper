import { Indexer } from './Indexer'
import { IAerodromeFactory__factory } from '../contracts'
import { Address } from '../base/Address'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'

dotenv.config()

const FACTORIES = [
  '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A',
  '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
]

class AerodromeIndexer extends Indexer {
  factory: Address
  provider: ethers.providers.JsonRpcProvider
  constructor(chainId: string, provider: ethers.providers.JsonRpcProvider) {
    super(chainId)
    this.factory = Address.from(FACTORIES[0])
    this.provider = provider
  }

  async processBlocks(start: number, end: number): Promise<void> {
    console.log(`Processing blocks ${start} to ${end}`)
    // use ethers to filter events by block range
    const factoryInst = IAerodromeFactory__factory.connect(
      this.factory.address,
      this.provider
    )
    const events = await factoryInst.queryFilter(
      factoryInst.filters.PoolCreated(),
      start,
      end
    )
    console.log(`Found ${events.length} events`)
  }
}

async function main() {
  const indexer = new AerodromeIndexer(
    '8543',
    new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER)
  )
  await indexer.run()
}

main().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
