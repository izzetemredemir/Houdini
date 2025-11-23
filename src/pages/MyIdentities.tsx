/**
 * My Identities Page
 *
 * Displays user's Identity NFTs with profile information
 */

import React from 'react';
import { useAccount } from 'wagmi';
import { useWalletNFTs } from '../hooks/useIdentityNFTsAPI';
import { IdentityNFTCard } from '../components/IdentityNFTCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/MyIdentities.css';

export function MyIdentities() {
  const { address, isConnected } = useAccount();
  const { data: nfts, isLoading, error, refetch } = useWalletNFTs(address);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="my-identities-page">
        <div className="page-header">
          <h1>My Identity NFTs</h1>
          <p className="page-description">
            View and manage your Houdini Identity NFTs
          </p>
        </div>

        <div className="connect-prompt">
          <div className="connect-card">
            <div className="connect-icon">🔐</div>
            <h2>Connect Your Wallet</h2>
            <p>Connect your wallet to view your Identity NFTs</p>
            <div className="connect-button-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="my-identities-page">
        <div className="page-header">
          <h1>My Identity NFTs</h1>
          <p className="page-description">
            View and manage your Houdini Identity NFTs
          </p>
        </div>

        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your Identity NFTs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-identities-page">
        <div className="page-header">
          <h1>My Identity NFTs</h1>
          <p className="page-description">
            View and manage your Houdini Identity NFTs
          </p>
        </div>

        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Failed to Load NFTs</h2>
          <p>{error.message}</p>
          <button onClick={() => refetch()} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!nfts || nfts.length === 0) {
    return (
      <div className="my-identities-page">
        <div className="page-header">
          <h1>My Identity NFTs</h1>
          <p className="page-description">
            View and manage your Houdini Identity NFTs
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Identity NFTs Found</h2>
          <p>You haven't minted any Identity NFTs yet.</p>
          <p className="empty-hint">
            Create your first llms.txt profile and mint an Identity NFT to get started!
          </p>
          <a href="/" className="create-profile-button">
            📝 Create Profile
          </a>
        </div>
      </div>
    );
  }

  // NFTs list
  return (
    <div className="my-identities-page">
      <div className="page-header">
        <h1>My Identity NFTs</h1>
        <p className="page-description">
          You have {nfts.length} Identity NFT{nfts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="identities-controls">
        <button onClick={() => refetch()} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      <div className="identities-grid">
        {nfts.map((nft) => (
          <IdentityNFTCard key={nft.id} nft={nft} />
        ))}
      </div>

      <div className="page-footer">
        <p className="footer-note">
          💡 Identity NFTs are soulbound tokens that represent your on-chain profiles.
          Each NFT points to your llms.txt content stored on 0G decentralized storage.
        </p>
      </div>
    </div>
  );
}
