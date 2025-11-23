import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { octavRoutes } from './routes/octav.js'
import storageRoutes from './routes/storage.js'
import nftRoutes from './routes/nft.js'
import './db/database.js' // Initialize database

// Load environment variables
dotenv.config()

const fastify = Fastify({
  logger: true,
})

// Register CORS plugin
await fastify.register(cors, {
  origin: ['http://localhost:5175', 'http://localhost:5173'], // Frontend URLs
  credentials: true,
})

// Register routes
await fastify.register(octavRoutes, { prefix: '/api/octav' })
await fastify.register(storageRoutes)
await fastify.register(nftRoutes)

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '7342', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Backend server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
