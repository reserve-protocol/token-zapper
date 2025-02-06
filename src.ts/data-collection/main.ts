import { client, connectToDatabase } from './db'
import { MorphoIndexer } from './MorphoIndexer'
import { ethers } from 'ethers'

async function main() {
  await connectToDatabase()
  const indexer = new MorphoIndexer(
    '8543',
    new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER),
    'Morpho'
  )
  await indexer.run()
}

main().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
