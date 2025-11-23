import { useEffect, useState } from 'react'
import type { Address } from 'viem'

// Backend API Configuration
const BACKEND_API_BASE = 'http://localhost:7342/api/octav'

export interface OctavToken {
  symbol: string
  name: string
  balance: string
  valueUsd: string
  chain: string
  chainLogo?: string
  tokenLogo?: string
  address?: string
}

export interface ChainData {
  name: string
  key: string
  imgSmall: string
  imgLarge: string
  value: string
  totalCostBasis: string
  totalClosedPnl: string
  totalOpenPnl: string
  assets: OctavToken[]
}

export interface ProtocolData {
  name: string
  key: string
  imgSmall?: string
  imgLarge?: string
  value: string
  chains: Record<string, ChainData>
}

export interface OctavPortfolioRaw {
  address: string
  networth: string
  cashBalance: string
  closedPnl: string
  openPnl: string
  dailyIncome: string
  dailyExpense: string
  fees: string
  feesFiat: string
  lastUpdated: string
  totalCostBasis: string
  conversionRates: Record<string, string>
  assetByProtocols: Record<string, ProtocolData>
  chains: Record<string, any>
}

export interface OctavPortfolio {
  address: string
  networth: number
  cashBalance: number
  closedPnl: string
  openPnl: string
  dailyIncome: number
  dailyExpense: number
  fees: number
  feesFiat: number
  lastUpdated: number
  totalCostBasis: string
  conversionRates: Record<string, number>
  chains: ChainData[]
  protocols: ProtocolData[]
  allTokens: OctavToken[]
}

export interface OctavPortfolioState {
  portfolio: OctavPortfolio | null
  rawData: OctavPortfolioRaw | null
  isLoading: boolean
  error: Error | null
  isCached: boolean
  refresh: () => void
}

const CACHE_KEY = 'octav_portfolio_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (300 seconds)

interface CachedData {
  portfolio: OctavPortfolio
  rawData: OctavPortfolioRaw
  timestamp: number
  address: string
}

function getCachedPortfolio(address: string): { portfolio: OctavPortfolio; rawData: OctavPortfolioRaw } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: CachedData = JSON.parse(cached)
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION
    const isSameAddress = data.address.toLowerCase() === address.toLowerCase()

    if (!isExpired && isSameAddress) {
      return { portfolio: data.portfolio, rawData: data.rawData }
    }
  } catch {
    return null
  }
  return null
}

function setCachedPortfolio(address: string, portfolio: OctavPortfolio, rawData: OctavPortfolioRaw): void {
  try {
    const data: CachedData = {
      portfolio,
      rawData,
      timestamp: Date.now(),
      address: address.toLowerCase(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to cache portfolio:', error)
  }
}

export function useOctavPortfolio(address: Address | undefined): OctavPortfolioState {
  const [state, setState] = useState<Omit<OctavPortfolioState, 'refresh'>>({
    portfolio: null,
    rawData: null,
    isLoading: false,
    error: null,
    isCached: false,
  })
  const [forceRefresh, setForceRefresh] = useState(0)

  useEffect(() => {
    if (!address) {
      return
    }

    // Check cache first (only if not forcing refresh)
    if (forceRefresh === 0) {
      const cached = getCachedPortfolio(address)
      if (cached) {
        console.log('[Octav] 📦 Using cached portfolio data')
        setState({
          portfolio: cached.portfolio,
          rawData: cached.rawData,
          isLoading: false,
          error: null,
          isCached: true,
        })
        return
      }
    } else {
      console.log('[Octav] 🔄 Force refreshing portfolio (bypassing cache)')
    }

    let isMounted = true

    const fetchPortfolio = async () => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        console.log('[Octav] 🌐 Fetching fresh portfolio data from API...')

        // Fetch portfolio data from our backend
        const portfolioResponse = await fetch(
          `${BACKEND_API_BASE}/portfolio/${address}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!portfolioResponse.ok) {
          throw new Error(`Octav API error: ${portfolioResponse.status} ${portfolioResponse.statusText}`)
        }

        const portfolioDataArray = await portfolioResponse.json()
        const rawData: OctavPortfolioRaw = portfolioDataArray[0]

        if (!isMounted) return

        // Process and structure the data
        const portfolio = processOctavData(rawData)

        // Cache the result
        setCachedPortfolio(address, portfolio, rawData)

        console.log('[Octav] ✅ Portfolio data fetched and cached')

        setState({
          portfolio,
          rawData,
          isLoading: false,
          error: null,
          isCached: false,
        })
      } catch (error) {
        if (!isMounted) return

        console.error('[Octav] ❌ Failed to fetch portfolio:', error)

        setState({
          portfolio: null,
          rawData: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to fetch portfolio'),
          isCached: false,
        })
      }
    }

    fetchPortfolio()

    return () => {
      isMounted = false
    }
  }, [address, forceRefresh])

  const refresh = () => {
    console.log('[Octav] 🔄 Manual refresh triggered')
    setForceRefresh(prev => prev + 1)
  }

  return {
    ...state,
    refresh,
  }
}

function processOctavData(rawData: OctavPortfolioRaw): OctavPortfolio {
  // Parse numeric values
  const networth = parseFloat(rawData.networth) || 0
  const cashBalance = parseFloat(rawData.cashBalance) || 0
  const dailyIncome = parseFloat(rawData.dailyIncome) || 0
  const dailyExpense = parseFloat(rawData.dailyExpense) || 0
  const fees = parseFloat(rawData.fees) || 0
  const feesFiat = parseFloat(rawData.feesFiat) || 0
  const lastUpdated = parseInt(rawData.lastUpdated) || Date.now()

  // Parse conversion rates
  const conversionRates: Record<string, number> = {}
  for (const [key, value] of Object.entries(rawData.conversionRates)) {
    conversionRates[key] = parseFloat(value) || 0
  }

  // Extract all chains with assets
  const chainsMap = new Map<string, ChainData>()
  const allTokens: OctavToken[] = []

  // Process protocols
  const protocols: ProtocolData[] = []
  for (const [protocolKey, protocolData] of Object.entries(rawData.assetByProtocols)) {
    protocols.push(protocolData)

    // Extract chains from this protocol
    for (const [chainKey, chainData] of Object.entries(protocolData.chains)) {
      const chainValue = parseFloat(chainData.value) || 0

      // Only process chains with value > 0
      if (chainValue > 0) {
        if (!chainsMap.has(chainKey)) {
          chainsMap.set(chainKey, {
            ...chainData,
            assets: []
          })
        }

        // Extract assets from protocol positions
        if (chainData.protocolPositions) {
          for (const [posKey, position] of Object.entries(chainData.protocolPositions)) {
            if (position.assets && Array.isArray(position.assets)) {
              for (const asset of position.assets) {
                const token: OctavToken = {
                  symbol: asset.symbol || 'Unknown',
                  name: asset.name || 'Unknown Token',
                  balance: asset.balance || '0',
                  valueUsd: asset.balanceUsd || '0',
                  chain: chainData.name,
                  chainLogo: chainData.imgSmall,
                  tokenLogo: asset.imgSmall || asset.imgLarge,
                  address: asset.address
                }

                const chain = chainsMap.get(chainKey)
                if (chain) {
                  chain.assets.push(token)
                }
                allTokens.push(token)
              }
            }
          }
        }
      }
    }
  }

  // Convert chains map to array and sort by value
  const chains = Array.from(chainsMap.values())
    .sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0))

  // Sort tokens by value
  allTokens.sort((a, b) => (parseFloat(b.valueUsd) || 0) - (parseFloat(a.valueUsd) || 0))

  return {
    address: rawData.address,
    networth,
    cashBalance,
    closedPnl: rawData.closedPnl,
    openPnl: rawData.openPnl,
    dailyIncome,
    dailyExpense,
    fees,
    feesFiat,
    lastUpdated,
    totalCostBasis: rawData.totalCostBasis,
    conversionRates,
    chains,
    protocols,
    allTokens
  }
}
