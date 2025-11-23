import React from 'react';
import type { PortfolioActivity } from '../../types/llmsTxt';

interface PortfolioActivityStepProps {
  portfolioActivity: PortfolioActivity | null;
  isLoading?: boolean;
}

export function PortfolioActivityStep({
  portfolioActivity,
  isLoading = false
}: PortfolioActivityStepProps) {
  if (isLoading) {
    return (
      <div className="step-container">
        <div className="step-description">
          <p>Loading your portfolio data...</p>
        </div>
      </div>
    );
  }

  if (!portfolioActivity) {
    return (
      <div className="step-container">
        <div className="step-description">
          <h3>Portfolio Activity</h3>
          <p>Portfolio data not found. You can skip this step.</p>
        </div>
        <div className="info-box">
          <p>💡 Your portfolio information is automatically retrieved from Octav API.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-description">
        <h3>Portfolio Activity</h3>
        <p>
          Information automatically generated from your portfolio data.
          This information will be included in your LLMs.txt profile.
        </p>
      </div>

      <div className="info-box">
        <p>
          ℹ️ <strong>Privacy Note:</strong> Token amounts and values are not included.
          Only which networks and tokens you are active on will be shown.
        </p>
      </div>

      <div className="portfolio-activity-grid">
        {/* Active Networks */}
        {portfolioActivity.activeNetworks.length > 0 && (
          <div className="portfolio-card">
            <div className="portfolio-card-header">
              <span className="portfolio-icon">🌐</span>
              <h4>Active Networks</h4>
            </div>
            <div className="portfolio-card-content">
              <div className="network-tags">
                {portfolioActivity.activeNetworks.map((network, idx) => (
                  <span key={idx} className="network-tag">
                    {network}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Focus */}
        {portfolioActivity.primaryFocus.length > 0 && (
          <div className="portfolio-card">
            <div className="portfolio-card-header">
              <span className="portfolio-icon">🎯</span>
              <h4>Primary Focus</h4>
            </div>
            <div className="portfolio-card-content">
              <p className="portfolio-value">
                {portfolioActivity.primaryFocus.join(' and ')}
              </p>
              <p className="portfolio-hint">Networks with highest value</p>
            </div>
          </div>
        )}

        {/* Portfolio Type */}
        {portfolioActivity.portfolioType && (
          <div className="portfolio-card">
            <div className="portfolio-card-header">
              <span className="portfolio-icon">📊</span>
              <h4>Portfolio Type</h4>
            </div>
            <div className="portfolio-card-content">
              <p className="portfolio-value">{portfolioActivity.portfolioType}</p>
              <p className="portfolio-hint">Automatically calculated profile type</p>
            </div>
          </div>
        )}

        {/* Key Holdings */}
        {portfolioActivity.selectedAssets.length > 0 && (
          <div className="portfolio-card full-width">
            <div className="portfolio-card-header">
              <span className="portfolio-icon">💎</span>
              <h4>Key Holdings</h4>
            </div>
            <div className="portfolio-card-content">
              <div className="asset-tags">
                {portfolioActivity.selectedAssets.map((asset, idx) => (
                  <span key={idx} className="asset-tag">
                    {asset}
                  </span>
                ))}
              </div>
              <p className="portfolio-hint">Token symbols (no amount information)</p>
            </div>
          </div>
        )}
      </div>

      <div className="step-footer-note">
        <p>
          This information has been automatically generated from your wallet address's on-chain activity.
        </p>
      </div>
    </div>
  );
}
