/**
 * Identity NFT Types
 *
 * TypeScript types for Identity NFTs and API responses
 */

/**
 * Identity NFT from database
 */
export interface IdentityNFT {
  id: number;
  token_id: number | null;
  transaction_hash: string;
  wallet_address: string;
  profile_type: number;
  og0_root_hash: string;
  storage_record_id: number | null;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  last_updated_at: string | null;
  confirmed_at: string | null;
}

/**
 * Request body for registering a new NFT
 */
export interface RegisterNFTRequest {
  tokenId?: number | null;
  transactionHash: string;
  walletAddress: string;
  profileType: number;
  og0RootHash: string;
  storageRecordId?: number;
  status?: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

/**
 * Request body for updating an NFT
 */
export interface UpdateNFTRequest {
  og0RootHash: string;
  lastUpdatedAt: string;
}

/**
 * Request body for confirming a transaction
 */
export interface ConfirmTransactionRequest {
  transactionHash: string;
  tokenId: number;
  confirmedAt: string;
}

/**
 * Request body for failing a transaction
 */
export interface FailTransactionRequest {
  transactionHash: string;
}

/**
 * API Response for registering an NFT
 */
export interface RegisterNFTResponse {
  success: boolean;
  nft: IdentityNFT;
}

/**
 * API Response for wallet NFTs
 */
export interface WalletNFTsResponse {
  success: boolean;
  nfts: IdentityNFT[];
  count: number;
}

/**
 * API Response for single NFT
 */
export interface GetNFTResponse {
  success: boolean;
  nft: IdentityNFT;
}

/**
 * API Response for updating an NFT
 */
export interface UpdateNFTResponse {
  success: boolean;
  nft: IdentityNFT;
}

/**
 * NFT statistics
 */
export interface NFTStats {
  totalNFTs: number;
}

/**
 * API Response for NFT stats
 */
export interface NFTStatsResponse {
  success: boolean;
  stats: NFTStats;
}

/**
 * Profile type enum (matches backend and smart contract)
 */
export enum NFTProfileType {
  Personal = 0,
  Project = 1,
  DAO = 2,
}

/**
 * Helper to get profile type name
 */
export function getProfileTypeName(type: number): string {
  switch (type) {
    case NFTProfileType.Personal:
      return 'Personal';
    case NFTProfileType.Project:
      return 'Project';
    case NFTProfileType.DAO:
      return 'DAO';
    default:
      return 'Unknown';
  }
}

/**
 * Helper to get profile type color for UI
 */
export function getProfileTypeColor(type: number): string {
  switch (type) {
    case NFTProfileType.Personal:
      return 'blue';
    case NFTProfileType.Project:
      return 'green';
    case NFTProfileType.DAO:
      return 'purple';
    default:
      return 'gray';
  }
}

/**
 * Helper to format timestamp
 */
export function formatNFTTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return timestamp;
  }
}
