import { Indexer } from './Indexer'
import {
  IAerodromeFactory,
  IAerodromeFactory__factory,
  IPool__factory,
} from '../../contracts'
import { Address } from '../../base/Address'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { PoolCreatedEvent } from '../../contracts/contracts/Aerodrome.sol/IAerodromeFactory'

dotenv.config()

const FACTORIES = [
  '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A',
  '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
]

type AerodromePoolData = {
  //   poolType: string
  poolAddress: string
  token0: string
  token1: string
  //   factory: string
  //   poolFee: number
  //   lpToken: string
}

enum AerodromePoolType {
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
  CL = 'CL',
}

const getPoolType = (poolType: number) => {
  if (poolType === 0) {
    return AerodromePoolType.STABLE
  } else if (poolType === -1) {
    return AerodromePoolType.VOLATILE
  } else {
    return AerodromePoolType.CL
  }
}

class AerodromeIndexer extends Indexer {
  factoryInstances: IAerodromeFactory[]
  constructor(
    chainId: string,
    provider: ethers.providers.JsonRpcProvider,
    protocol: string
  ) {
    super(chainId, provider, protocol)
    this.factoryInstances = FACTORIES.map((factory) =>
      IAerodromeFactory__factory.connect(factory, this.provider)
    )
  }

  async _processBlocks(start: number, end: number): Promise<void> {
    console.log(`Processing blocks ${start} to ${end}`)
    // use ethers to filter events by block range
    for (const factoryInst of this.factoryInstances) {
      const events = await factoryInst.queryFilter(
        factoryInst.filters.PoolCreated(),
        start,
        end
      )
      console.log(`Found ${events.length} events`)
      if (events.length > 0) {
        let eventData = await Promise.all(
          events.map((event) => this.processEvent(event, factoryInst.address))
        )
        await this.saveToDb(eventData)
      }
    }
  }

  async processEvent(
    event: PoolCreatedEvent,
    factory: string
  ): Promise<AerodromePoolData> {
    let pool = IPool__factory.connect(event.args.pool, this.provider)
    let out: AerodromePoolData = {
      //   poolType: event.args.poolType,
      poolAddress: event.args.pool,
      token0: event.args.token0,
      token1: event.args.token1,
      factory: factory,
      poolFee: await pool.fee(),
      //   lpToken: event.args.lpToken,
    }
    return out
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

export { AerodromeIndexer }
