import React from 'react'
import type { OctavPortfolio } from '../hooks/useOctavPortfolio'
import './PortfolioDisplay.css'

interface PortfolioDisplayProps {
  portfolio: OctavPortfolio
  address: string
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  if (value < 0.01 && value > 0) {
    return value.toExponential(2)
  }
  return value.toFixed(4)
}

export function PortfolioDisplay({ portfolio, address }: PortfolioDisplayProps) {
  const hasAssets = portfolio.totalValue > 0

  if (!hasAssets) {
    return (
      <div className="portfolio-display no-portfolio">
        <div className="no-portfolio-icon">💼</div>
        <h2>No Portfolio Found</h2>
        <p className="no-portfolio-description">
          We couldn't find any assets for this wallet address.
        </p>
        <p className="portfolio-address">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
    )
  }

  return (
    <div className="portfolio-display">
      {/* Total Value */}
      <div className="portfolio-total">
        <p className="total-label">Total Portfolio Value</p>
        <h1 className="total-value">{formatCurrency(portfolio.totalValue)}</h1>
        <p className="portfolio-stats">
          {portfolio.tokens.length} tokens · {portfolio.chainDistribution.length} chains
          {portfolio.defiPositions.length > 0 && ` · ${portfolio.defiPositions.length} DeFi positions`}
        </p>
      </div>

      {/* Chain Distribution */}
      {portfolio.chainDistribution.length > 0 && (
        <div className="portfolio-section">
          <h3>Chain Distribution</h3>
          <div className="chain-list">
            {portfolio.chainDistribution.map((chain, index) => (
              <div key={index} className="chain-item">
                <div className="chain-info">
                  <span className="chain-name">{chain.chain}</span>
                  <span className="chain-value">{formatCurrency(chain.valueUsd)}</span>
                </div>
                <div className="chain-bar-container">
                  <div
                    className="chain-bar"
                    style={{ width: `${chain.percentage}%` }}
                  />
                </div>
                <span className="chain-percentage">{chain.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tokens */}
      {portfolio.tokens.length > 0 && (
        <div className="portfolio-section">
          <h3>Top Tokens</h3>
          <div className="token-list">
            {portfolio.tokens.slice(0, 10).map((token, index) => (
              <div key={index} className="token-item">
                <div className="token-icon-container">
                  {token.logoUrl ? (
                    <img src={token.logoUrl} alt={token.symbol} className="token-icon" />
                  ) : (
                    <div className="token-icon-placeholder">
                      {token.symbol[0]}
                    </div>
                  )}
                </div>
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-chain">{token.chain}</span>
                </div>
                <div className="token-balance">
                  <span className="token-amount">{formatNumber(token.balance)}</span>
                  <span className="token-value">{formatCurrency(token.valueUsd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DeFi Positions */}
      {portfolio.defiPositions.length > 0 && (
        <div className="portfolio-section">
          <h3>DeFi Positions</h3>
          <div className="defi-list">
            {portfolio.defiPositions.map((position, index) => (
              <div key={index} className="defi-item">
                <div className="defi-icon">🔷</div>
                <div className="defi-info">
                  <span className="defi-protocol">{position.protocol}</span>
                  <span className="defi-type">{position.type} · {position.chain}</span>
                </div>
                <span className="defi-value">{formatCurrency(position.valueUsd)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
