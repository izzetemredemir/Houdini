/**
 * SQLite Database Connection and Schema
 *
 * This module handles the SQLite database for storing 0G Storage records.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path (backend/storage.db)
const DB_PATH = path.join(__dirname, '../../storage.db');

console.log('[Database] Initializing SQLite database at:', DB_PATH);

// Initialize database connection
export const db = new Database(DB_PATH, {
  verbose: console.log // Log all SQL queries in development
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export function initializeDatabase() {
  console.log('[Database] Initializing schema...');

  // Storage Records Table
  const createStorageRecordsTable = `
    CREATE TABLE IF NOT EXISTS storage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      og0_root_hash TEXT NOT NULL UNIQUE,
      og0_tx_hash TEXT NOT NULL UNIQUE,
      file_size INTEGER NOT NULL,
      profile_type INTEGER NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createStorageRecordsTable);

  // Create index on wallet_address for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wallet_address
    ON storage_records(wallet_address)
  `);

  // Create index on created_at for sorting
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_created_at
    ON storage_records(created_at DESC)
  `);

  // Identity NFTs Table
  const createIdentityNFTsTable = `
    CREATE TABLE IF NOT EXISTS identity_nfts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_id INTEGER NOT NULL UNIQUE,
      wallet_address TEXT NOT NULL,
      profile_type INTEGER NOT NULL,
      og0_root_hash TEXT NOT NULL,
      storage_record_id INTEGER,
      created_at DATETIME NOT NULL,
      last_updated_at DATETIME,
      FOREIGN KEY (storage_record_id) REFERENCES storage_records(id)
    )
  `;

  db.exec(createIdentityNFTsTable);

  // Create index on wallet_address for NFT queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wallet_nft
    ON identity_nfts(wallet_address)
  `);

  console.log('[Database] ✅ Schema initialized successfully');
}

/**
 * Storage Record Interface
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
 * Identity NFT Interface
 */
export interface IdentityNFT {
  id: number;
  token_id: number;
  wallet_address: string;
  profile_type: number;
  og0_root_hash: string;
  storage_record_id: number | null;
  created_at: string;
  last_updated_at: string | null;
}

/**
 * Create a new storage record
 */
export function createStorageRecord(record: Omit<StorageRecord, 'id' | 'created_at'>): StorageRecord {
  const stmt = db.prepare(`
    INSERT INTO storage_records
    (wallet_address, content_hash, og0_root_hash, og0_tx_hash, file_size, profile_type, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    record.wallet_address,
    record.content_hash,
    record.og0_root_hash,
    record.og0_tx_hash,
    record.file_size,
    record.profile_type,
    record.content
  );

  // Get the created record
  const getStmt = db.prepare('SELECT * FROM storage_records WHERE id = ?');
  return getStmt.get(info.lastInsertRowid) as StorageRecord;
}

/**
 * Get all storage records
 */
export function getAllStorageRecords(limit = 100, offset = 0): StorageRecord[] {
  const stmt = db.prepare(`
    SELECT * FROM storage_records
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as StorageRecord[];
}

/**
 * Get storage records by wallet address
 */
export function getStorageRecordsByWallet(walletAddress: string): StorageRecord[] {
  const stmt = db.prepare(`
    SELECT * FROM storage_records
    WHERE wallet_address = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(walletAddress) as StorageRecord[];
}

/**
 * Get a single storage record by root hash
 */
export function getStorageRecordByRootHash(rootHash: string): StorageRecord | undefined {
  const stmt = db.prepare(`
    SELECT * FROM storage_records
    WHERE og0_root_hash = ?
  `);
  return stmt.get(rootHash) as StorageRecord | undefined;
}

/**
 * Get total count of records
 */
export function getStorageRecordsCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM storage_records');
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Get records count by wallet address
 */
export function getStorageRecordsCountByWallet(walletAddress: string): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM storage_records WHERE wallet_address = ?');
  const result = stmt.get(walletAddress) as { count: number };
  return result.count;
}

/**
 * Delete a storage record by ID
 */
export function deleteStorageRecord(id: number): boolean {
  const stmt = db.prepare('DELETE FROM storage_records WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

/**
 * ===================================
 * Identity NFT Functions
 * ===================================
 */

/**
 * Create a new identity NFT record
 */
export function createIdentityNFT(nft: Omit<IdentityNFT, 'id' | 'last_updated_at'>): IdentityNFT {
  const stmt = db.prepare(`
    INSERT INTO identity_nfts
    (token_id, wallet_address, profile_type, og0_root_hash, storage_record_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    nft.token_id,
    nft.wallet_address,
    nft.profile_type,
    nft.og0_root_hash,
    nft.storage_record_id,
    nft.created_at
  );

  // Get the created NFT record
  const getStmt = db.prepare('SELECT * FROM identity_nfts WHERE id = ?');
  return getStmt.get(info.lastInsertRowid) as IdentityNFT;
}

/**
 * Get all identity NFTs for a wallet address
 */
export function getIdentityNFTsByWallet(walletAddress: string): IdentityNFT[] {
  const stmt = db.prepare(`
    SELECT * FROM identity_nfts
    WHERE wallet_address = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(walletAddress) as IdentityNFT[];
}

/**
 * Get a single identity NFT by token ID
 */
export function getIdentityNFTByTokenId(tokenId: number): IdentityNFT | undefined {
  const stmt = db.prepare(`
    SELECT * FROM identity_nfts
    WHERE token_id = ?
  `);
  return stmt.get(tokenId) as IdentityNFT | undefined;
}

/**
 * Update an identity NFT's root hash (when profile is updated)
 */
export function updateIdentityNFT(tokenId: number, og0RootHash: string, lastUpdatedAt: string): IdentityNFT | undefined {
  const stmt = db.prepare(`
    UPDATE identity_nfts
    SET og0_root_hash = ?, last_updated_at = ?
    WHERE token_id = ?
  `);

  const info = stmt.run(og0RootHash, lastUpdatedAt, tokenId);

  if (info.changes > 0) {
    return getIdentityNFTByTokenId(tokenId);
  }

  return undefined;
}

/**
 * Delete an identity NFT by token ID
 */
export function deleteIdentityNFT(tokenId: number): boolean {
  const stmt = db.prepare('DELETE FROM identity_nfts WHERE token_id = ?');
  const info = stmt.run(tokenId);
  return info.changes > 0;
}

/**
 * Get total count of identity NFTs
 */
export function getIdentityNFTsCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM identity_nfts');
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Get identity NFTs count by wallet address
 */
export function getIdentityNFTsCountByWallet(walletAddress: string): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM identity_nfts WHERE wallet_address = ?');
  const result = stmt.get(walletAddress) as { count: number };
  return result.count;
}

// Initialize the database schema on module load
initializeDatabase();

console.log('[Database] ✅ Database module loaded successfully');
