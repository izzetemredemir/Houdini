import React from 'react';

interface NetworksStepProps {
  detectedNetworks: string[];
  selectedNetworks: string[];
  onNetworksChange: (networks: string[]) => void;
}

// Common networks users might want to add manually
const COMMON_NETWORKS = [
  '0G',
  'Ethereum',
  'Optimism',
  'Polygon',
  'Arbitrum',
  'Base',
  'Avalanche',
  'BSC',
  'Gnosis',
  'zkSync',
  'Linea',
  'Scroll',
];

export function NetworksStep({
  detectedNetworks,
  selectedNetworks,
  onNetworksChange,
}: NetworksStepProps) {
  const toggleNetwork = (network: string) => {
    if (selectedNetworks.includes(network)) {
      onNetworksChange(selectedNetworks.filter((n) => n !== network));
    } else {
      onNetworksChange([...selectedNetworks, network]);
    }
  };

  // Combine detected and common networks, removing duplicates
  const allNetworks = Array.from(
    new Set([...detectedNetworks, ...COMMON_NETWORKS])
  );

  return (
    <div className="networks-step">
      <h3>Active Networks</h3>
      <p className="step-description">
        Select the blockchain networks where you're active. We've detected some based on your portfolio.
      </p>

      {detectedNetworks.length > 0 && (
        <div className="detected-networks-info">
          <p className="info-badge">
            ✓ {detectedNetworks.length} network{detectedNetworks.length !== 1 ? 's' : ''} detected from your portfolio
          </p>
        </div>
      )}

      <div className="networks-grid">
        {allNetworks.map((network) => {
          const isDetected = detectedNetworks.includes(network);
          const isSelected = selectedNetworks.includes(network);

          return (
            <button
              key={network}
              type="button"
              className={`network-option ${isSelected ? 'selected' : ''} ${
                isDetected ? 'detected' : ''
              }`}
              onClick={() => toggleNetwork(network)}
            >
              <div className="network-checkbox">
                {isSelected && <span className="checkmark">✓</span>}
              </div>
              <div className="network-name">{network}</div>
              {isDetected && (
                <div className="detected-badge">Auto-detected</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedNetworks.length === 0 && (
        <div className="warning-message">
          <p>⚠️ Please select at least one network</p>
        </div>
      )}

      <div className="selected-count">
        {selectedNetworks.length} network{selectedNetworks.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}
