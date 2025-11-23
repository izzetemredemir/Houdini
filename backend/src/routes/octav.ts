import { FastifyInstance, FastifyRequest } from 'fastify'

const OCTAV_API_BASE = 'https://api.octav.fi'

interface PortfolioParams {
  address: string
}

// Helper function to extract error message from HTML responses
function extractErrorMessage(html: string): string {
  try {
    // Try to extract from <pre> tag
    const preMatch = html.match(/<pre>(.*?)<\/pre>/s)
    if (preMatch) {
      const text = preMatch[1]
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()

      // Get first meaningful line
      const firstLine = text.split('\n').find(line => line.trim().length > 0)
      return firstLine || text.substring(0, 200)
    }

    // Try to extract from <title>
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    if (titleMatch) {
      return titleMatch[1]
    }

    // Return first 200 chars if nothing else works
    return html.replace(/<[^>]*>/g, '').substring(0, 200)
  } catch {
    return html.substring(0, 200)
  }
}

export async function octavRoutes(fastify: FastifyInstance) {
  const apiKey = process.env.OCTAV_API_KEY

  if (!apiKey) {
    fastify.log.error('OCTAV_API_KEY not configured in environment variables')
    throw new Error('OCTAV_API_KEY is required')
  }

  // GET /api/octav/portfolio/:address
  fastify.get<{ Params: PortfolioParams }>(
    '/portfolio/:address',
    async (request, reply) => {
      const { address } = request.params

      try {
        // Log request details
        fastify.log.info({
          address,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 20) + '...'
        }, 'Fetching portfolio from Octav')

        const url = `${OCTAV_API_BASE}/v1/portfolio?addresses=${address}&includeImages=true`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        // Log response details
        fastify.log.info({
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          headers: Object.fromEntries(response.headers.entries())
        }, 'Octav API response received')

        if (!response.ok) {
          const errorText = await response.text()

          // Extract meaningful error message
          const errorMessage = extractErrorMessage(errorText)

          fastify.log.error({
            status: response.status,
            statusText: response.statusText,
            errorMessage,
            rawError: errorText.substring(0, 500)
          }, 'Octav API returned error')

          return reply.status(response.status).send({
            error: 'Failed to fetch portfolio from Octav API',
            details: errorMessage,
            status: response.status,
            statusText: response.statusText
          })
        }

        const data = await response.json()

        fastify.log.info({
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : []
        }, 'Successfully fetched portfolio')

        return reply.send(data)
      } catch (error) {
        fastify.log.error({
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          type: error instanceof Error ? error.constructor.name : typeof error
        }, 'Exception while fetching portfolio')

        return reply.status(500).send({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof Error ? error.constructor.name : 'UnknownError'
        })
      }
    }
  )

  // GET /api/octav/test
  fastify.get('/test', async () => {
    return {
      message: 'Octav API proxy is working',
      apiKeyConfigured: !!apiKey,
    }
  })
}
