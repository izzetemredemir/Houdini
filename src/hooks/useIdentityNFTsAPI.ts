/**
 * Identity NFT API Hook
 *
 * React hooks for interacting with the Identity NFT backend API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';
import type {
  IdentityNFT,
  RegisterNFTRequest,
  RegisterNFTResponse,
  WalletNFTsResponse,
  GetNFTResponse,
  UpdateNFTRequest,
  UpdateNFTResponse,
  ConfirmTransactionRequest,
  FailTransactionRequest,
} from '../types/identityNFT';

// Backend API Configuration
const BACKEND_API_BASE = 'http://localhost:7342/api/nft';

/**
 * Fetch all NFTs for a wallet address
 */
async function fetchWalletNFTs(address: Address): Promise<IdentityNFT[]> {
  const response = await fetch(`${BACKEND_API_BASE}/wallet/${address}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch NFTs: ${response.status} ${response.statusText}`);
  }

  const data: WalletNFTsResponse = await response.json();
  return data.nfts;
}

/**
 * Fetch a single NFT by token ID
 */
async function fetchNFTByTokenId(tokenId: number): Promise<IdentityNFT> {
  const response = await fetch(`${BACKEND_API_BASE}/${tokenId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch NFT: ${response.status} ${response.statusText}`);
  }

  const data: GetNFTResponse = await response.json();
  return data.nft;
}

/**
 * Register a new NFT in the database
 */
async function registerNFT(request: RegisterNFTRequest): Promise<IdentityNFT> {
  const response = await fetch(`${BACKEND_API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to register NFT: ${response.status}`);
  }

  const data: RegisterNFTResponse = await response.json();
  return data.nft;
}

/**
 * Update an NFT's root hash
 */
async function updateNFT(tokenId: number, request: UpdateNFTRequest): Promise<IdentityNFT> {
  const response = await fetch(`${BACKEND_API_BASE}/${tokenId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update NFT: ${response.status}`);
  }

  const data: UpdateNFTResponse = await response.json();
  return data.nft;
}

/**
 * Confirm a pending transaction
 */
async function confirmTransaction(request: ConfirmTransactionRequest): Promise<IdentityNFT> {
  const response = await fetch(`${BACKEND_API_BASE}/confirm-transaction`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to confirm transaction: ${response.status}`);
  }

  const data: UpdateNFTResponse = await response.json();
  return data.nft;
}

/**
 * Fail a pending transaction
 */
async function failTransaction(request: FailTransactionRequest): Promise<IdentityNFT> {
  const response = await fetch(`${BACKEND_API_BASE}/fail-transaction`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to mark transaction as failed: ${response.status}`);
  }

  const data: UpdateNFTResponse = await response.json();
  return data.nft;
}

/**
 * Hook to fetch all NFTs for a wallet
 */
export function useWalletNFTs(address: Address | undefined) {
  return useQuery({
    queryKey: ['identity-nfts', address],
    queryFn: () => fetchWalletNFTs(address!),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch a single NFT by token ID
 */
export function useNFTByTokenId(tokenId: number | undefined) {
  return useQuery({
    queryKey: ['identity-nft', tokenId],
    queryFn: () => fetchNFTByTokenId(tokenId!),
    enabled: !!tokenId,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to register a new NFT
 */
export function useRegisterNFT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerNFT,
    onSuccess: (nft) => {
      // Invalidate wallet NFTs query to refetch
      queryClient.invalidateQueries({ queryKey: ['identity-nfts', nft.wallet_address] });
      console.log('[NFT API] ✅ NFT registered successfully:', nft.token_id);
    },
    onError: (error) => {
      console.error('[NFT API] ❌ Failed to register NFT:', error);
    },
  });
}

/**
 * Hook to update an NFT
 */
export function useUpdateNFT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tokenId, request }: { tokenId: number; request: UpdateNFTRequest }) =>
      updateNFT(tokenId, request),
    onSuccess: (nft) => {
      // Invalidate both single NFT and wallet NFTs queries
      queryClient.invalidateQueries({ queryKey: ['identity-nft', nft.token_id] });
      queryClient.invalidateQueries({ queryKey: ['identity-nfts', nft.wallet_address] });
      console.log('[NFT API] ✅ NFT updated successfully:', nft.token_id);
    },
    onError: (error) => {
      console.error('[NFT API] ❌ Failed to update NFT:', error);
    },
  });
}

/**
 * Hook to confirm a pending transaction
 */
export function useConfirmTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmTransaction,
    onSuccess: (nft) => {
      // Invalidate wallet NFTs queries to refetch with updated status
      queryClient.invalidateQueries({ queryKey: ['identity-nfts', nft.wallet_address] });
      if (nft.token_id) {
        queryClient.invalidateQueries({ queryKey: ['identity-nft', nft.token_id] });
      }
      console.log('[NFT API] ✅ Transaction confirmed successfully:', nft.transaction_hash, '-> Token ID:', nft.token_id);
    },
    onError: (error) => {
      console.error('[NFT API] ❌ Failed to confirm transaction:', error);
    },
  });
}

/**
 * Hook to fail a pending transaction
 */
export function useFailTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: failTransaction,
    onSuccess: (nft) => {
      // Invalidate wallet NFTs queries to refetch with updated status
      queryClient.invalidateQueries({ queryKey: ['identity-nfts', nft.wallet_address] });
      console.log('[NFT API] ✅ Transaction marked as failed:', nft.transaction_hash);
    },
    onError: (error) => {
      console.error('[NFT API] ❌ Failed to mark transaction as failed:', error);
    },
  });
}
