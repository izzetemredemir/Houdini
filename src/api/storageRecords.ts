/**
 * Storage Records API Client
 *
 * API client for interacting with the backend storage records endpoints
 */

import type {
  CreateStorageRecordRequest,
  CreateStorageRecordResponse,
  ListStorageRecordsResponse,
  WalletStorageRecordsResponse,
  GetStorageRecordResponse,
  StorageStatsResponse,
} from '../types/storageRecords';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7342';

/**
 * Create a new storage record in the database
 */
export async function createStorageRecord(
  data: CreateStorageRecordRequest
): Promise<CreateStorageRecordResponse> {
  console.log('[Storage API Client] Creating storage record:', {
    walletAddress: data.walletAddress,
    og0RootHash: data.og0RootHash,
  });

  const response = await fetch(`${API_BASE_URL}/api/storage/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Storage API Client] Failed to create record:', error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Storage API Client] ✅ Record created successfully:', result.record.id);
  return result;
}

/**
 * Get all storage records with pagination
 */
export async function getAllStorageRecords(
  limit = 100,
  offset = 0
): Promise<ListStorageRecordsResponse> {
  console.log('[Storage API Client] Fetching all records with limit:', limit, 'offset:', offset);

  const response = await fetch(
    `${API_BASE_URL}/api/storage/records?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Storage API Client] Failed to fetch records:', error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Storage API Client] ✅ Fetched', result.records.length, 'records');
  return result;
}

/**
 * Get storage records for a specific wallet
 */
export async function getStorageRecordsByWallet(
  walletAddress: string
): Promise<WalletStorageRecordsResponse> {
  console.log('[Storage API Client] Fetching records for wallet:', walletAddress);

  const response = await fetch(
    `${API_BASE_URL}/api/storage/records/wallet/${walletAddress}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Storage API Client] Failed to fetch wallet records:', error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Storage API Client] ✅ Found', result.count, 'records for wallet');
  return result;
}

/**
 * Get a specific storage record by root hash
 */
export async function getStorageRecordByHash(
  rootHash: string
): Promise<GetStorageRecordResponse> {
  console.log('[Storage API Client] Fetching record by hash:', rootHash);

  const response = await fetch(`${API_BASE_URL}/api/storage/records/hash/${rootHash}`);

  if (!response.ok) {
    if (response.status === 404) {
      console.log('[Storage API Client] Record not found');
      throw new Error('Record not found');
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Storage API Client] Failed to fetch record:', error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Storage API Client] ✅ Record found:', result.record.id);
  return result;
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<StorageStatsResponse> {
  console.log('[Storage API Client] Fetching storage statistics');

  const response = await fetch(`${API_BASE_URL}/api/storage/stats`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Storage API Client] Failed to fetch stats:', error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Storage API Client] ✅ Stats retrieved:', result.stats);
  return result;
}
