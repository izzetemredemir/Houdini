/**
 * Storage Records API Routes
 *
 * Handles CRUD operations for 0G Storage records in SQLite database
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createStorageRecord,
  getAllStorageRecords,
  getStorageRecordsByWallet,
  getStorageRecordByRootHash,
  getStorageRecordsCount,
  getStorageRecordsCountByWallet,
  StorageRecord
} from '../db/database.js';

/**
 * Request body for creating a storage record
 */
interface CreateStorageRecordBody {
  walletAddress: string;
  contentHash: string;
  og0RootHash: string;
  og0TxHash: string;
  fileSize: number;
  profileType: number;
  content?: string;
}

/**
 * Query parameters for listing records
 */
interface ListRecordsQuery {
  limit?: string;
  offset?: string;
}

/**
 * Route parameters for wallet-specific queries
 */
interface WalletParams {
  address: string;
}

/**
 * Route parameters for root hash queries
 */
interface RootHashParams {
  rootHash: string;
}

/**
 * Register storage records routes
 */
export default async function storageRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/storage/records
   * Create a new storage record
   */
  fastify.post<{ Body: CreateStorageRecordBody }>(
    '/api/storage/records',
    async (request: FastifyRequest<{ Body: CreateStorageRecordBody }>, reply: FastifyReply) => {
      try {
        const { walletAddress, contentHash, og0RootHash, og0TxHash, fileSize, profileType, content } = request.body;

        // Validate required fields
        if (!walletAddress || !contentHash || !og0RootHash || !og0TxHash || fileSize === undefined || profileType === undefined) {
          return reply.code(400).send({
            error: 'Missing required fields',
            required: ['walletAddress', 'contentHash', 'og0RootHash', 'og0TxHash', 'fileSize', 'profileType']
          });
        }

        console.log('[Storage API] Creating new storage record:', {
          walletAddress,
          og0RootHash,
          og0TxHash
        });

        const record = createStorageRecord({
          wallet_address: walletAddress,
          content_hash: contentHash,
          og0_root_hash: og0RootHash,
          og0_tx_hash: og0TxHash,
          file_size: fileSize,
          profile_type: profileType,
          content: content || null
        });

        console.log('[Storage API] ✅ Record created with ID:', record.id);

        return reply.code(201).send({
          success: true,
          record
        });
      } catch (error) {
        console.error('[Storage API] Error creating record:', error);

        // Handle unique constraint violations
        if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
          return reply.code(409).send({
            error: 'Record already exists',
            message: 'A record with this root hash or transaction hash already exists'
          });
        }

        return reply.code(500).send({
          error: 'Failed to create storage record',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/storage/records
   * Get all storage records with pagination
   */
  fastify.get<{ Querystring: ListRecordsQuery }>(
    '/api/storage/records',
    async (request: FastifyRequest<{ Querystring: ListRecordsQuery }>, reply: FastifyReply) => {
      try {
        const limit = parseInt(request.query.limit || '100', 10);
        const offset = parseInt(request.query.offset || '0', 10);

        console.log('[Storage API] Fetching all records with limit:', limit, 'offset:', offset);

        const records = getAllStorageRecords(limit, offset);
        const total = getStorageRecordsCount();

        console.log('[Storage API] ✅ Found', records.length, 'records (total:', total, ')');

        return reply.send({
          success: true,
          records,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + records.length < total
          }
        });
      } catch (error) {
        console.error('[Storage API] Error fetching records:', error);
        return reply.code(500).send({
          error: 'Failed to fetch storage records',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/storage/records/wallet/:address
   * Get storage records for a specific wallet
   */
  fastify.get<{ Params: WalletParams }>(
    '/api/storage/records/wallet/:address',
    async (request: FastifyRequest<{ Params: WalletParams }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        console.log('[Storage API] Fetching records for wallet:', address);

        const records = getStorageRecordsByWallet(address);
        const count = getStorageRecordsCountByWallet(address);

        console.log('[Storage API] ✅ Found', records.length, 'records for wallet');

        return reply.send({
          success: true,
          records,
          count
        });
      } catch (error) {
        console.error('[Storage API] Error fetching wallet records:', error);
        return reply.code(500).send({
          error: 'Failed to fetch wallet storage records',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/storage/records/hash/:rootHash
   * Get a specific storage record by root hash
   */
  fastify.get<{ Params: RootHashParams }>(
    '/api/storage/records/hash/:rootHash',
    async (request: FastifyRequest<{ Params: RootHashParams }>, reply: FastifyReply) => {
      try {
        const { rootHash } = request.params;

        console.log('[Storage API] Fetching record by root hash:', rootHash);

        const record = getStorageRecordByRootHash(rootHash);

        if (!record) {
          console.log('[Storage API] Record not found');
          return reply.code(404).send({
            error: 'Record not found',
            message: 'No storage record found with this root hash'
          });
        }

        console.log('[Storage API] ✅ Record found:', record.id);

        return reply.send({
          success: true,
          record
        });
      } catch (error) {
        console.error('[Storage API] Error fetching record by hash:', error);
        return reply.code(500).send({
          error: 'Failed to fetch storage record',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/storage/stats
   * Get storage statistics
   */
  fastify.get('/api/storage/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('[Storage API] Fetching storage statistics');

      const totalRecords = getStorageRecordsCount();

      // Get all records to calculate total file size
      const allRecords = getAllStorageRecords(1000, 0);
      const totalFileSize = allRecords.reduce((sum, record) => sum + record.file_size, 0);

      // Get unique wallets count
      const uniqueWallets = new Set(allRecords.map(r => r.wallet_address)).size;

      return reply.send({
        success: true,
        stats: {
          totalRecords,
          totalFileSize,
          uniqueWallets,
          averageFileSize: totalRecords > 0 ? Math.round(totalFileSize / totalRecords) : 0
        }
      });
    } catch (error) {
      console.error('[Storage API] Error fetching stats:', error);
      return reply.code(500).send({
        error: 'Failed to fetch storage statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('[Storage Routes] ✅ Storage records routes registered');
}
