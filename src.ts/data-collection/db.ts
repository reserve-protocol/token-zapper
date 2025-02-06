// db.ts
import { Client } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // Default PostgreSQL port
})

async function connectToDatabase() {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL database!')
  } catch (err) {
    console.error('Error connecting to database:', err)
  }
}

export { client, connectToDatabase }
