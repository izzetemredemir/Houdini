/**
 * Identity NFT Card Component
 *
 * Displays a single Identity NFT with its metadata
 */

import React, { useState } from 'react';
import type { IdentityNFT } from '../types/identityNFT';
import {
  getProfileTypeName,
  getProfileTypeColor,
  formatNFTTimestamp,
} from '../types/identityNFT';
import { downloadFromOG0 } from '../utils/og0Upload';
import '../styles/IdentityNFTCard.css';

interface IdentityNFTCardProps {
  nft: IdentityNFT;
}

export function IdentityNFTCard({ nft }: IdentityNFTCardProps) {
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [profileContent, setProfileContent] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileTypeName = getProfileTypeName(nft.profile_type);
  const profileTypeColor = getProfileTypeColor(nft.profile_type);

  const formatHash = (hash: string, chars = 10) => {
    if (hash.length <= chars * 2) return hash;
    return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
  };

  const handleViewProfile = async () => {
    if (profileContent) {
      setIsViewingProfile(true);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      // Download content from 0G Storage
      const content = await downloadFromOG0(nft.og0_root_hash);
      setProfileContent(content);
      setIsViewingProfile(true);
    } catch (error) {
      console.error('Failed to load profile content:', error);
      setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCloseModal = () => {
    setIsViewingProfile(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <>
      <div className={`identity-nft-card profile-type-${profileTypeColor}`}>
        {/* Card Header */}
        <div className="nft-card-header">
          <div className="nft-icon">
            {nft.profile_type === 0 && '👤'}
            {nft.profile_type === 1 && '🚀'}
            {nft.profile_type === 2 && '🏛️'}
          </div>
          <span className={`profile-type-badge badge-${profileTypeColor}`}>
            {profileTypeName}
          </span>
        </div>

        {/* Card Body */}
        <div className="nft-card-body">
          <div className="nft-detail">
            <span className="detail-label">Token ID</span>
            <span className="detail-value">#{nft.token_id}</span>
          </div>

          <div className="nft-detail">
            <span className="detail-label">Created</span>
            <span className="detail-value">{formatNFTTimestamp(nft.created_at)}</span>
          </div>

          {nft.last_updated_at && (
            <div className="nft-detail">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">{formatNFTTimestamp(nft.last_updated_at)}</span>
            </div>
          )}

          <div className="nft-detail">
            <span className="detail-label">Root Hash</span>
            <span className="detail-value hash-value" title={nft.og0_root_hash}>
              <code>{formatHash(nft.og0_root_hash, 6)}</code>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(nft.og0_root_hash)}
                title="Copy to clipboard"
              >
                📋
              </button>
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="nft-card-actions">
          <button
            className="action-button primary"
            onClick={handleViewProfile}
            disabled={isLoadingProfile}
          >
            {isLoadingProfile ? '⏳ Loading...' : '👁️ View Profile'}
          </button>

          <a
            href={`https://chainscan-galileo.0g.ai/address/${nft.wallet_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button secondary"
            title="View on 0G Explorer"
          >
            🔗 Explorer
          </a>
        </div>

        {profileError && (
          <div className="nft-error">
            <small>❌ {profileError}</small>
          </div>
        )}
      </div>

      {/* Profile Content Modal */}
      {isViewingProfile && profileContent && (
        <div className="profile-modal-overlay" onClick={handleCloseModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <h3>{profileTypeName} Profile</h3>
                <p className="profile-modal-subtitle">Token ID #{nft.token_id}</p>
              </div>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-meta">
                <div className="meta-item">
                  <strong>Root Hash:</strong>
                  <code className="full-hash">{nft.og0_root_hash}</code>
                  <button
                    className="copy-icon"
                    onClick={() => copyToClipboard(nft.og0_root_hash)}
                  >
                    📋
                  </button>
                </div>
                <div className="meta-item">
                  <strong>Created:</strong>
                  <span>{formatNFTTimestamp(nft.created_at)}</span>
                </div>
                {nft.last_updated_at && (
                  <div className="meta-item">
                    <strong>Updated:</strong>
                    <span>{formatNFTTimestamp(nft.last_updated_at)}</span>
                  </div>
                )}
              </div>

              <div className="profile-content-wrapper">
                <h4>llms.txt Content:</h4>
                <pre className="profile-content">{profileContent}</pre>
              </div>

              <div className="profile-modal-actions">
                <button
                  className="download-button"
                  onClick={() => {
                    const blob = new Blob([profileContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `identity-${nft.token_id}-llms.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  💾 Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
