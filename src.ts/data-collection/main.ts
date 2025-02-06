import { client, connectToDatabase } from './db'
import { MainIndexer } from './MainIndexer'
import { ethers } from 'ethers'

async function main() {
  await connectToDatabase()
  const indexer = new MainIndexer(
    '8543',
    new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER),
    'Main'
  )
  await indexer.run()
}

main().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
