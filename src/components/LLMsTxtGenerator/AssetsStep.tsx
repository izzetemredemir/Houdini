import React, { useState } from 'react';
import type { ImportantToken, NFTCollection } from '../../types/llmsTxt';

interface AssetsStepProps {
  availableTokens: ImportantToken[];
  selectedTokens: ImportantToken[];
  nftCollections: NFTCollection[];
  onTokensChange: (tokens: ImportantToken[]) => void;
  onNFTCollectionsChange: (collections: NFTCollection[]) => void;
}

export function AssetsStep({
  availableTokens,
  selectedTokens,
  nftCollections,
  onTokensChange,
  onNFTCollectionsChange,
}: AssetsStepProps) {
  const toggleToken = (token: ImportantToken) => {
    const isSelected = selectedTokens.some(
      (t) => t.symbol === token.symbol && t.network === token.network
    );

    if (isSelected) {
      onTokensChange(
        selectedTokens.filter(
          (t) => !(t.symbol === token.symbol && t.network === token.network)
        )
      );
    } else {
      onTokensChange([...selectedTokens, token]);
    }
  };

  const updateTokenNote = (token: ImportantToken, note: string) => {
    const updatedTokens = selectedTokens.map((t) =>
      t.symbol === token.symbol && t.network === token.network
        ? { ...t, note }
        : t
    );
    onTokensChange(updatedTokens);
  };

  const addNFTCollection = () => {
    onNFTCollectionsChange([
      ...nftCollections,
      { name: '', contractAddress: '', useCase: '' },
    ]);
  };

  const updateNFTCollection = (
    index: number,
    field: keyof NFTCollection,
    value: string
  ) => {
    const updated = [...nftCollections];
    updated[index] = { ...updated[index], [field]: value };
    onNFTCollectionsChange(updated);
  };

  const removeNFTCollection = (index: number) => {
    onNFTCollectionsChange(nftCollections.filter((_, i) => i !== index));
  };

  return (
    <div className="assets-step">
      <h3>Important Assets</h3>
      <p className="step-description">
        Select your most important tokens and NFT collections. These help AI understand your portfolio and interests.
      </p>

      {/* Important Tokens Section */}
      <div className="tokens-section">
        <h4>Important Tokens</h4>
        <p className="section-hint">
          Select tokens that are significant to you (governance, treasury, etc.)
        </p>

        {availableTokens.length > 0 ? (
          <div className="tokens-list">
            {availableTokens.map((token, index) => {
              const isSelected = selectedTokens.some(
                (t) => t.symbol === token.symbol && t.network === token.network
              );

              return (
                <div key={`${token.symbol}-${token.network}-${index}`} className="token-item">
                  <button
                    type="button"
                    className={`token-checkbox ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleToken(token)}
                  >
                    <span className="checkbox">
                      {isSelected && <span className="checkmark">✓</span>}
                    </span>
                    <div className="token-info">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-details">
                        {token.name} • {token.network}
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="token-note-input">
                      <input
                        type="text"
                        className="form-input small"
                        placeholder="Add note (e.g., 'Governance weight', 'Treasury token')"
                        value={
                          selectedTokens.find(
                            (t) =>
                              t.symbol === token.symbol && t.network === token.network
                          )?.note || ''
                        }
                        onChange={(e) => updateTokenNote(token, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No tokens found in your portfolio</p>
        )}

        {selectedTokens.length > 0 && (
          <p className="selection-count">
            {selectedTokens.length} token{selectedTokens.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* NFT Collections Section */}
      <div className="nft-section">
        <h4>NFT Collections</h4>
        <p className="section-hint">
          Add important NFT collections (PFP, membership, badges, etc.)
        </p>

        {nftCollections.length > 0 && (
          <div className="nft-list">
            {nftCollections.map((nft, index) => (
              <div key={index} className="nft-item">
                <div className="nft-fields">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Collection name (e.g., 'Bored Ape Yacht Club')"
                    value={nft.name}
                    onChange={(e) =>
                      updateNFTCollection(index, 'name', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contract address (0x...)"
                    value={nft.contractAddress}
                    onChange={(e) =>
                      updateNFTCollection(index, 'contractAddress', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Use case (e.g., 'PFP', 'Membership', 'OG badge')"
                    value={nft.useCase || ''}
                    onChange={(e) =>
                      updateNFTCollection(index, 'useCase', e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeNFTCollection(index)}
                  aria-label="Remove NFT collection"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="add-button" onClick={addNFTCollection}>
          + Add NFT Collection
        </button>
      </div>
    </div>
  );
}
