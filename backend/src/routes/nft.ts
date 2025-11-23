/**
 * Identity NFT API Routes
 *
 * Handles CRUD operations for Identity NFTs in SQLite database
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createIdentityNFT,
  getIdentityNFTsByWallet,
  getIdentityNFTByTokenId,
  getIdentityNFTByTxHash,
  updateIdentityNFT,
  confirmIdentityNFTTransaction,
  failIdentityNFTTransaction,
  getIdentityNFTsCount,
  getIdentityNFTsCountByWallet,
  IdentityNFT
} from '../db/database.js';

/**
 * Request body for registering a new NFT
 */
interface RegisterNFTBody {
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
interface UpdateNFTBody {
  og0RootHash: string;
  lastUpdatedAt: string;
}

/**
 * Request body for confirming a transaction
 */
interface ConfirmTransactionBody {
  transactionHash: string;
  tokenId: number;
  confirmedAt: string;
}

/**
 * Request body for failing a transaction
 */
interface FailTransactionBody {
  transactionHash: string;
}

/**
 * Route parameters for wallet queries
 */
interface WalletParams {
  address: string;
}

/**
 * Route parameters for token ID queries
 */
interface TokenIdParams {
  tokenId: string;
}

/**
 * Register identity NFT routes
 */
export default async function nftRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/nft/register
   * Register a new identity NFT (after minting on-chain)
   */
  fastify.post<{ Body: RegisterNFTBody }>(
    '/api/nft/register',
    async (request: FastifyRequest<{ Body: RegisterNFTBody }>, reply: FastifyReply) => {
      try {
        const { tokenId, transactionHash, walletAddress, profileType, og0RootHash, storageRecordId, status, createdAt } = request.body;

        // Validate required fields
        if (!transactionHash || !walletAddress || profileType === undefined || !og0RootHash || !createdAt) {
          return reply.code(400).send({
            error: 'Missing required fields',
            required: ['transactionHash', 'walletAddress', 'profileType', 'og0RootHash', 'createdAt']
          });
        }

        console.log('[NFT API] Registering new identity NFT:', {
          tokenId: tokenId || 'pending',
          transactionHash,
          walletAddress,
          profileType,
          og0RootHash,
          status: status || 'pending'
        });

        const nft = createIdentityNFT({
          token_id: tokenId ?? null,
          transaction_hash: transactionHash,
          wallet_address: walletAddress,
          profile_type: profileType,
          og0_root_hash: og0RootHash,
          storage_record_id: storageRecordId || null,
          status: status || 'pending',
          created_at: createdAt
        });

        console.log('[NFT API] ✅ NFT registered with ID:', nft.id, 'Status:', nft.status);

        return reply.code(201).send({
          success: true,
          nft
        });
      } catch (error) {
        console.error('[NFT API] Error registering NFT:', error);

        // Handle unique constraint violations
        if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
          return reply.code(409).send({
            error: 'NFT already exists',
            message: 'An NFT with this transaction hash or token ID already exists'
          });
        }

        return reply.code(500).send({
          error: 'Failed to register identity NFT',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/nft/wallet/:address
   * Get all identity NFTs for a specific wallet
   */
  fastify.get<{ Params: WalletParams }>(
    '/api/nft/wallet/:address',
    async (request: FastifyRequest<{ Params: WalletParams }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        console.log('[NFT API] Fetching NFTs for wallet:', address);

        const nfts = getIdentityNFTsByWallet(address);
        const count = getIdentityNFTsCountByWallet(address);

        console.log('[NFT API] ✅ Found', nfts.length, 'NFTs for wallet');

        return reply.send({
          success: true,
          nfts,
          count
        });
      } catch (error) {
        console.error('[NFT API] Error fetching wallet NFTs:', error);
        return reply.code(500).send({
          error: 'Failed to fetch wallet NFTs',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/nft/:tokenId
   * Get a specific identity NFT by token ID
   */
  fastify.get<{ Params: TokenIdParams }>(
    '/api/nft/:tokenId',
    async (request: FastifyRequest<{ Params: TokenIdParams }>, reply: FastifyReply) => {
      try {
        const tokenId = parseInt(request.params.tokenId, 10);

        if (isNaN(tokenId)) {
          return reply.code(400).send({
            error: 'Invalid token ID',
            message: 'Token ID must be a valid number'
          });
        }

        console.log('[NFT API] Fetching NFT by token ID:', tokenId);

        const nft = getIdentityNFTByTokenId(tokenId);

        if (!nft) {
          console.log('[NFT API] NFT not found');
          return reply.code(404).send({
            error: 'NFT not found',
            message: 'No identity NFT found with this token ID'
          });
        }

        console.log('[NFT API] ✅ NFT found:', nft.id);

        return reply.send({
          success: true,
          nft
        });
      } catch (error) {
        console.error('[NFT API] Error fetching NFT by token ID:', error);
        return reply.code(500).send({
          error: 'Failed to fetch identity NFT',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * PUT /api/nft/:tokenId
   * Update an identity NFT's root hash (when profile is updated on-chain)
   */
  fastify.put<{ Params: TokenIdParams; Body: UpdateNFTBody }>(
    '/api/nft/:tokenId',
    async (request: FastifyRequest<{ Params: TokenIdParams; Body: UpdateNFTBody }>, reply: FastifyReply) => {
      try {
        const tokenId = parseInt(request.params.tokenId, 10);
        const { og0RootHash, lastUpdatedAt } = request.body;

        if (isNaN(tokenId)) {
          return reply.code(400).send({
            error: 'Invalid token ID',
            message: 'Token ID must be a valid number'
          });
        }

        if (!og0RootHash || !lastUpdatedAt) {
          return reply.code(400).send({
            error: 'Missing required fields',
            required: ['og0RootHash', 'lastUpdatedAt']
          });
        }

        console.log('[NFT API] Updating NFT:', tokenId, 'with new root hash:', og0RootHash);

        const updatedNFT = updateIdentityNFT(tokenId, og0RootHash, lastUpdatedAt);

        if (!updatedNFT) {
          console.log('[NFT API] NFT not found for update');
          return reply.code(404).send({
            error: 'NFT not found',
            message: 'No identity NFT found with this token ID'
          });
        }

        console.log('[NFT API] ✅ NFT updated successfully');

        return reply.send({
          success: true,
          nft: updatedNFT
        });
      } catch (error) {
        console.error('[NFT API] Error updating NFT:', error);
        return reply.code(500).send({
          error: 'Failed to update identity NFT',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * PATCH /api/nft/confirm-transaction
   * Confirm a pending transaction and update token ID
   */
  fastify.patch<{ Body: ConfirmTransactionBody }>(
    '/api/nft/confirm-transaction',
    async (request: FastifyRequest<{ Body: ConfirmTransactionBody }>, reply: FastifyReply) => {
      try {
        const { transactionHash, tokenId, confirmedAt } = request.body;

        // Validate required fields
        if (!transactionHash || tokenId === undefined || !confirmedAt) {
          return reply.code(400).send({
            error: 'Missing required fields',
            required: ['transactionHash', 'tokenId', 'confirmedAt']
          });
        }

        console.log('[NFT API] Confirming transaction:', transactionHash, 'with token ID:', tokenId);

        const updatedNFT = confirmIdentityNFTTransaction(transactionHash, tokenId, confirmedAt);

        if (!updatedNFT) {
          console.log('[NFT API] NFT not found for confirmation');
          return reply.code(404).send({
            error: 'NFT not found',
            message: 'No identity NFT found with this transaction hash'
          });
        }

        console.log('[NFT API] ✅ Transaction confirmed successfully');

        return reply.send({
          success: true,
          nft: updatedNFT
        });
      } catch (error) {
        console.error('[NFT API] Error confirming transaction:', error);
        return reply.code(500).send({
          error: 'Failed to confirm transaction',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * PATCH /api/nft/fail-transaction
   * Mark a pending transaction as failed
   */
  fastify.patch<{ Body: FailTransactionBody }>(
    '/api/nft/fail-transaction',
    async (request: FastifyRequest<{ Body: FailTransactionBody }>, reply: FastifyReply) => {
      try {
        const { transactionHash } = request.body;

        // Validate required fields
        if (!transactionHash) {
          return reply.code(400).send({
            error: 'Missing required fields',
            required: ['transactionHash']
          });
        }

        console.log('[NFT API] Marking transaction as failed:', transactionHash);

        const updatedNFT = failIdentityNFTTransaction(transactionHash);

        if (!updatedNFT) {
          console.log('[NFT API] NFT not found for failure');
          return reply.code(404).send({
            error: 'NFT not found',
            message: 'No identity NFT found with this transaction hash'
          });
        }

        console.log('[NFT API] ✅ Transaction marked as failed');

        return reply.send({
          success: true,
          nft: updatedNFT
        });
      } catch (error) {
        console.error('[NFT API] Error failing transaction:', error);
        return reply.code(500).send({
          error: 'Failed to mark transaction as failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/nft/stats
   * Get identity NFT statistics
   */
  fastify.get('/api/nft/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('[NFT API] Fetching NFT statistics');

      const totalNFTs = getIdentityNFTsCount();

      // Profile type distribution
      const allNFTs = getIdentityNFTsByWallet(''); // Get all NFTs
      const profileTypeCount = {
        personal: 0,
        project: 0,
        dao: 0
      };

      // This is a simple implementation - in production you'd want a more efficient query
      // For now, we'll skip this to avoid complex queries

      return reply.send({
        success: true,
        stats: {
          totalNFTs
        }
      });
    } catch (error) {
      console.error('[NFT API] Error fetching stats:', error);
      return reply.code(500).send({
        error: 'Failed to fetch NFT statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('[NFT Routes] ✅ Identity NFT routes registered');
}
