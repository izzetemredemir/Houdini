import { useAccount } from 'wagmi'
import { useOctavPortfolio } from '../hooks/useOctavPortfolio'
import CountUp from 'react-countup'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getDemoMode, MOCK_PORTFOLIO } from '../mocks/demoData'
import './Portfolio.css'

export function Portfolio() {
  const { address, isConnected } = useAccount()
  const { portfolio: realPortfolio, isLoading, error, isCached, refresh } = useOctavPortfolio(address)

  // Use mock data if demo mode is enabled
  const demoMode = getDemoMode()
  const useMockData = demoMode || (!realPortfolio && !isLoading && !error)

  // Transform mock data to match portfolio structure
  const mockPortfolioData = useMockData ? {
    networth: MOCK_PORTFOLIO.summary.netWorth.toString(),
    cashBalance: MOCK_PORTFOLIO.summary.cashBalance.toString(),
    dailyIncome: (MOCK_PORTFOLIO.summary.dailyPnL > 0 ? MOCK_PORTFOLIO.summary.dailyPnL : 0).toString(),
    dailyExpense: (MOCK_PORTFOLIO.summary.dailyPnL < 0 ? Math.abs(MOCK_PORTFOLIO.summary.dailyPnL) : 0).toString(),
    openPnl: MOCK_PORTFOLIO.summary.totalOpenPositions.toString(),
    closedPnl: MOCK_PORTFOLIO.summary.totalClosedPositions.toString(),
    totalCostBasis: '0',
    lastUpdated: Date.now(),
    chains: MOCK_PORTFOLIO.chains.map(chain => ({
      key: chain.chain.toLowerCase().replace(/\s+/g, '-'),
      name: chain.chain,
      imgSmall: '',
      value: chain.totalValue.toString(),
      assets: chain.assets.map(asset => ({
        address: asset.symbol,
        symbol: asset.symbol,
        name: asset.name,
        balance: asset.balance.toString(),
        valueUsd: asset.valueUSD.toString(),
        tokenLogo: ''
      }))
    })),
    allTokens: MOCK_PORTFOLIO.chains.flatMap(chain =>
      chain.assets.map(asset => ({
        address: asset.symbol,
        symbol: asset.symbol,
        name: asset.name,
        balance: asset.balance.toString(),
        valueUsd: asset.valueUSD.toString(),
        tokenLogo: '',
        chain: chain.chain,
        chainLogo: ''
      }))
    ),
    conversionRates: {}
  } : null

  const portfolio = useMockData ? mockPortfolioData : realPortfolio

  if (!isConnected) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-error">
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to view your portfolio</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-loading">
          <div className="loading-spinner"></div>
          <p>Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-error">
          <h2>Error Loading Portfolio</h2>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-error">
          <h2>No Portfolio Data</h2>
          <p>Unable to load portfolio data</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatTokenBalance = (balance: string): string => {
    const num = parseFloat(balance)
    if (isNaN(num)) return '0'
    if (num < 0.01) return num.toExponential(2)
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Prepare chart data
  const chainChartData = portfolio.chains.map((chain, index) => ({
    name: chain.name,
    value: parseFloat(chain.value),
    color: ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444'][index % 6]
  }))

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <div className="header-content">
          <h1>Portfolio Overview</h1>
          <p className="last-updated">Last updated: {formatDate(portfolio.lastUpdated)}</p>
        </div>
        <div className="header-actions">
          {isCached && <span className="cache-badge">📦 Cached Data</span>}
          {demoMode && <span className="demo-badge">Demo Mode</span>}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="refresh-button"
            title="Refresh portfolio data"
          >
            {isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Summary Cards with Animated Counters */}
      <div className="summary-cards">
        <div className="summary-card networth-card animate-slideUp">
          <h3>Total Net Worth</h3>
          <div className="value">
            $<CountUp
              end={parseFloat(portfolio.networth)}
              duration={2}
              decimals={2}
              separator=","
            />
          </div>
        </div>

        <div className="summary-card animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h3>Cash Balance</h3>
          <div className="value">
            $<CountUp
              end={parseFloat(portfolio.cashBalance)}
              duration={2}
              decimals={2}
              separator=","
            />
          </div>
        </div>

        <div className="summary-card animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h3>Daily Income</h3>
          <div className="value positive">
            +$<CountUp
              end={parseFloat(portfolio.dailyIncome)}
              duration={2}
              decimals={2}
              separator=","
            />
          </div>
        </div>

        <div className="summary-card animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <h3>Daily Expense</h3>
          <div className="value negative">
            -$<CountUp
              end={parseFloat(portfolio.dailyExpense)}
              duration={2}
              decimals={2}
              separator=","
            />
          </div>
        </div>
      </div>

      {/* PnL Section */}
      <div className="pnl-section">
        <div className="pnl-card">
          <h3>Open P&L</h3>
          <div className="value">{portfolio.openPnl}</div>
        </div>
        <div className="pnl-card">
          <h3>Closed P&L</h3>
          <div className="value">{portfolio.closedPnl}</div>
        </div>
        <div className="pnl-card">
          <h3>Total Cost Basis</h3>
          <div className="value">{portfolio.totalCostBasis}</div>
        </div>
      </div>

      {/* Chain Distribution Chart */}
      {chainChartData.length > 0 && (
        <div className="chart-section animate-fadeIn">
          <h2>Chain Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chainChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chainChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chains Distribution */}
      {portfolio.chains.length > 0 && (
        <div className="chains-section">
          <h2>Assets by Chain</h2>
          <div className="chains-grid">
            {portfolio.chains.map((chain) => (
              <div key={chain.key} className="chain-card">
                <div className="chain-header">
                  <img
                    src={chain.imgSmall}
                    alt={chain.name}
                    className="chain-logo"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <h3>{chain.name}</h3>
                </div>
                <div className="chain-value">{formatCurrency(chain.value)}</div>

                {chain.assets.length > 0 && (
                  <div className="chain-assets">
                    <h4>Assets ({chain.assets.length})</h4>
                    <div className="assets-list">
                      {chain.assets.slice(0, 5).map((asset, idx) => (
                        <div key={`${asset.address}-${idx}`} className="asset-item">
                          <div className="asset-info">
                            {asset.tokenLogo && (
                              <img
                                src={asset.tokenLogo}
                                alt={asset.symbol}
                                className="token-logo"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            )}
                            <div className="asset-details">
                              <span className="asset-symbol">{asset.symbol}</span>
                              <span className="asset-balance">{formatTokenBalance(asset.balance)}</span>
                            </div>
                          </div>
                          <div className="asset-value">{formatCurrency(asset.valueUsd)}</div>
                        </div>
                      ))}
                      {chain.assets.length > 5 && (
                        <div className="assets-more">
                          +{chain.assets.length - 5} more assets
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tokens Table */}
      {portfolio.allTokens.length > 0 && (
        <div className="tokens-section">
          <h2>All Tokens ({portfolio.allTokens.length})</h2>
          <div className="tokens-table-container">
            <table className="tokens-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Chain</th>
                  <th>Balance</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.allTokens.slice(0, 20).map((token, idx) => (
                  <tr key={`${token.address}-${idx}`}>
                    <td>
                      <div className="token-cell">
                        {token.tokenLogo && (
                          <img
                            src={token.tokenLogo}
                            alt={token.symbol}
                            className="token-logo-small"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-name">{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="chain-cell">
                        {token.chainLogo && (
                          <img
                            src={token.chainLogo}
                            alt={token.chain}
                            className="chain-logo-small"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        <span>{token.chain}</span>
                      </div>
                    </td>
                    <td className="balance-cell">{formatTokenBalance(token.balance)}</td>
                    <td className="value-cell">{formatCurrency(token.valueUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {portfolio.allTokens.length > 20 && (
              <div className="tokens-more">
                Showing top 20 of {portfolio.allTokens.length} tokens
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversion Rates */}
      {Object.keys(portfolio.conversionRates).length > 0 && (
        <div className="rates-section">
          <h2>Conversion Rates</h2>
          <div className="rates-grid">
            {Object.entries(portfolio.conversionRates).map(([currency, rate]) => (
              <div key={currency} className="rate-card">
                <span className="rate-currency">{currency}</span>
                <span className="rate-value">{formatCurrency(rate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {portfolio.allTokens.length === 0 && portfolio.chains.length === 0 && (
        <div className="empty-portfolio">
          <h2>No Assets Found</h2>
          <p>This wallet doesn't have any tracked assets across supported chains.</p>
        </div>
      )}

      {/* Octav Branding */}
      <div className="octav-branding">
        <span>Powered by</span>
        <a href="https://octav.fi" target="_blank" rel="noopener noreferrer">
          <img
            src="https://ethglobal.b-cdn.net/organizations/qk38m/square-logo/default.png"
            alt="Octav"
            className="octav-logo"
          />
          <span>Octav</span>
        </a>
      </div>
    </div>
  )
}
