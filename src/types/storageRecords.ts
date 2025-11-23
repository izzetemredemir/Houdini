/**
 * Storage Records Types
 *
 * TypeScript types for 0G Storage records and API responses
 */

/**
 * Storage Record from database
 */
export interface StorageRecord {
  id: number;
  wallet_address: string;
  content_hash: string;
  og0_root_hash: string;
  og0_tx_hash: string;
  file_size: number;
  profile_type: number;
  content: string | null;
  created_at: string;
}

/**
 * Request body for creating a new storage record
 */
export interface CreateStorageRecordRequest {
  walletAddress: string;
  contentHash: string;
  og0RootHash: string;
  og0TxHash: string;
  fileSize: number;
  profileType: number;
  content?: string;
}

/**
 * API Response for creating a record
 */
export interface CreateStorageRecordResponse {
  success: boolean;
  record: StorageRecord;
}

/**
 * API Response for listing records
 */
export interface ListStorageRecordsResponse {
  success: boolean;
  records: StorageRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * API Response for wallet-specific records
 */
export interface WalletStorageRecordsResponse {
  success: boolean;
  records: StorageRecord[];
  count: number;
}

/**
 * API Response for single record by hash
 */
export interface GetStorageRecordResponse {
  success: boolean;
  record: StorageRecord;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalRecords: number;
  totalFileSize: number;
  uniqueWallets: number;
  averageFileSize: number;
}

/**
 * API Response for storage stats
 */
export interface StorageStatsResponse {
  success: boolean;
  stats: StorageStats;
}

/**
 * Profile type enum matching backend
 */
export enum ProfileTypeEnum {
  Personal = 0,
  Project = 1,
  DAO = 2,
}

/**
 * Helper to get profile type name
 */
export function getProfileTypeName(type: number): string {
  switch (type) {
    case ProfileTypeEnum.Personal:
      return 'Personal';
    case ProfileTypeEnum.Project:
      return 'Project';
    case ProfileTypeEnum.DAO:
      return 'DAO';
    default:
      return 'Unknown';
  }
}
