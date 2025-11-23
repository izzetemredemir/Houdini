/**
 * Utilities for hashing and verifying LLMs.txt profile content
 */

import { keccak256, toBytes } from 'viem';

/**
 * Generate keccak256 hash of llms.txt content
 * This hash is stored on-chain for verification
 *
 * @param content - The llms.txt profile content as a string
 * @returns bytes32 hash in hex format
 */
export function hashLLMsContent(content: string): `0x${string}` {
  // Convert string to bytes
  const contentBytes = toBytes(content);

  // Hash using keccak256
  return keccak256(contentBytes);
}

/**
 * Verify that content matches a given hash
 *
 * @param content - The llms.txt profile content
 * @param expectedHash - The hash to verify against
 * @returns True if content hash matches expected hash
 */
export function verifyContentHash(content: string, expectedHash: `0x${string}`): boolean {
  const actualHash = hashLLMsContent(content);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Format hash for display (truncated with ellipsis)
 *
 * @param hash - The hash to format
 * @returns Shortened hash like "0x1a2b...7890"
 */
export function formatHashForDisplay(hash: `0x${string}`): string {
  if (hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
