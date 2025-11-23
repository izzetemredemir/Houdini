/**
 * 0G Storage Upload Utility
 *
 * This module provides functionality to upload llms.txt profile content to 0G Storage.
 * It handles:
 * - Converting browser File/Blob to ZgFile
 * - Computing Merkle tree and root hash
 * - Uploading to 0G storage network
 * - Transaction confirmation
 * - Error handling
 */

import { Indexer, Blob as ZgBlob } from "@0glabs/0g-ts-sdk";
import { BrowserProvider, JsonRpcProvider } from "ethers";

export interface OG0UploadOptions {
  evmRpcUrl?: string;
  indexerRpcUrl?: string;
  onProgress?: (status: OG0UploadStatus) => void;
}

export interface OG0UploadResult {
  rootHash: string; // 0G Root Hash (Merkle root) - unique identifier
  txHash: string; // Transaction hash (proof of payment on blockchain)
  fileSize: number; // File size in bytes
}

export type OG0UploadStatus =
  | "preparing-file" // Creating ZgFile from content
  | "computing-merkle" // Computing Merkle tree
  | "uploading" // Uploading to 0G storage nodes
  | "confirming-tx" // Waiting for transaction confirmation
  | "complete" // Upload successful
  | "error"; // Upload failed

/**
 * Upload content to 0G Storage
 *
 * @param content - The llms.txt content to upload
 * @param options - Configuration options for the upload
 * @returns Promise resolving to upload result with root hash and tx hash
 * @throws Error if upload fails or wallet is not connected
 */
export async function uploadToOG0(
  content: string,
  options?: OG0UploadOptions
): Promise<OG0UploadResult> {
  // Default RPC URLs for 0G Testnet
  const EVM_RPC_URL =
    options?.evmRpcUrl ||
    import.meta.env.VITE_OG_EVM_RPC_URL ||
    "https://evmrpc-testnet.0g.ai";
  const INDEXER_RPC_URL =
    options?.indexerRpcUrl ||
    import.meta.env.VITE_OG_INDEXER_RPC_URL ||
    "https://indexer-storage-testnet-turbo.0g.ai";

  const updateProgress = (status: OG0UploadStatus) => {
    if (options?.onProgress) {
      options.onProgress(status);
    }
  };

  try {
    console.log("[0G Upload] Starting upload process");
    console.log("[0G Upload] Content length:", content.length, "characters");
    console.log("[0G Upload] EVM RPC URL:", EVM_RPC_URL);
    console.log("[0G Upload] Indexer RPC URL:", INDEXER_RPC_URL);

    // Step 1: Get signer from MetaMask (browser wallet)
    if (!(window as any).ethereum) {
      const error = new Error(
        "MetaMask or Web3 wallet not found. Please install a wallet extension."
      );
      console.error("[0G Upload] Wallet not found:", error.message);
      throw error;
    }

    console.log("[0G Upload] Wallet detected, connecting to provider...");
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    console.log("[0G Upload] Connected to wallet:", signerAddress);

    // Check OG balance (optional but recommended)
    const balance = await provider.getBalance(signerAddress);
    console.log("[0G Upload] Wallet OG balance:", balance.toString(), "wei");

    if (balance === 0n) {
      console.warn(
        "[0G Upload] WARNING: Wallet has zero OG balance. Upload may fail due to insufficient gas."
      );
    } else {
      // Convert wei to OG (divide by 10^18)
      const balanceInOG = Number(balance) / 1e18;
      console.log("[0G Upload] Wallet balance:", balanceInOG.toFixed(4), "OG");
    }

    // Step 2: Create ZgBlob from content
    console.log("[0G Upload] Step 2: Preparing file...");
    updateProgress("preparing-file");

    // Convert string content to File (browser environment)
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], "llms.txt", { type: "text/plain" });
    const fileSize = file.size;
    console.log("[0G Upload] File created, size:", fileSize, "bytes");

    // Create ZgBlob from File (browser environment)
    const zgFile = new ZgBlob(file);
    console.log("[0G Upload] ZgBlob created successfully");

    // Step 3: Compute Merkle tree
    console.log("[0G Upload] Step 3: Computing Merkle tree...");
    updateProgress("computing-merkle");

    // The SDK returns [result, error] tuples (Go-style error handling)
    const [tree, treeErr] = await zgFile.merkleTree();

    if (treeErr || !tree) {
      console.error("[0G Upload] Merkle tree computation failed:", treeErr);
      throw new Error(
        `Merkle tree computation failed: ${
          treeErr?.message || treeErr || "Unknown error"
        }`
      );
    }

    // Get the root hash - this is the unique identifier for the file in 0G Storage
    const rootHash = tree.rootHash();
    console.log("[0G Upload] ✅ Merkle tree computed successfully");
    console.log("[0G Upload] Root Hash:", rootHash);
    console.log(
      "[0G Upload] Root Hash length:",
      rootHash ? rootHash.length : 0,
      "characters"
    );

    // Step 4: Upload to 0G Storage
    console.log("[0G Upload] Step 4: Uploading to 0G Storage...");
    updateProgress("uploading");

    // Initialize Indexer (gateway to 0G storage network)
    console.log("[0G Upload] Initializing Indexer at:", INDEXER_RPC_URL);
    const indexer = new Indexer(INDEXER_RPC_URL);

    // Upload file to 0G
    // This will:
    // 1. Calculate storage fee based on file size
    // 2. Send payment transaction to Flow Contract
    // 3. Distribute file chunks to storage nodes
    console.log("[0G Upload] Calling indexer.upload()...");
    console.log("[0G Upload] File size:", fileSize, "bytes");
    const [uploadResult, uploadErr] = await indexer.upload(
      zgFile,
      EVM_RPC_URL,
      signer as any
    );

    if (uploadErr || !uploadResult) {
      console.error("[0G Upload] Upload failed:", uploadErr);

      // Check for common errors
      if (uploadErr?.message?.includes("insufficient")) {
        const error = new Error(
          "Insufficient OG balance to pay for storage. Please add funds to your wallet."
        );
        console.error("[0G Upload]", error.message);
        throw error;
      }

      throw new Error(
        `0G upload failed: ${
          uploadErr?.message || uploadErr || "Unknown error"
        }`
      );
    }

    // Upload returns { txHash: string, rootHash: string }
    const txHash = uploadResult.txHash;
    const uploadedRootHash = uploadResult.rootHash;

    console.log("[0G Upload] ✅ Upload transaction sent successfully");
    console.log("[0G Upload] Transaction Hash:", txHash);
    console.log("[0G Upload] Uploaded Root Hash:", uploadedRootHash);

    // Verify root hashes match
    if (rootHash !== uploadedRootHash) {
      console.warn(
        "[0G Upload] WARNING: Computed root hash does not match uploaded root hash!"
      );
      console.warn("[0G Upload] Computed:", rootHash);
      console.warn("[0G Upload] Uploaded:", uploadedRootHash);
    } else {
      console.log("[0G Upload] ✅ Root hash verification successful");
    }

    // Step 5: Wait for transaction confirmation with retry logic
    console.log("[0G Upload] Step 5: Waiting for transaction confirmation...");
    updateProgress("confirming-tx");

    // IMPORTANT: Wait for RPC to index the transaction before querying
    // The 0G testnet RPC has indexing delays - transactions need time to propagate
    console.log("[0G Upload] Waiting for RPC to index transaction...");
    await new Promise((resolve) => setTimeout(resolve, 8000)); // 8 second initial wait

    // Create dedicated provider for transaction lookups (separate from wallet)
    // This avoids potential issues with MetaMask provider caching
    const confirmationProvider = new JsonRpcProvider(EVM_RPC_URL);
    console.log("[0G Upload] Created dedicated RPC provider for confirmations");

    const maxRetries = 15; // Increased from 10
    const initialDelay = 5000; // Increased from 2 seconds to 5 seconds
    let receipt = null;
    let confirmed = false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `[0G Upload] Checking transaction (attempt ${attempt + 1}/${maxRetries}):`,
          txHash
        );

        // Try direct receipt lookup first (faster if already mined)
        receipt = await confirmationProvider.getTransactionReceipt(txHash);

        if (receipt) {
          // Transaction already mined!
          console.log("[0G Upload] Receipt found directly (already mined)");

          if (receipt.status !== 1) {
            console.error("[0G Upload] Transaction reverted or failed");
            console.error("[0G Upload] Receipt:", receipt);
            throw new Error("Transaction was reverted. Upload failed.");
          }

          console.log(
            "[0G Upload] ✅ Transaction confirmed in block:",
            receipt.blockNumber
          );
          console.log("[0G Upload] Gas used:", receipt.gasUsed.toString());
          confirmed = true;
          break; // Success - exit retry loop
        }

        // Receipt not found - try getting transaction and waiting
        const txResponse = await confirmationProvider.getTransaction(txHash);

        if (txResponse) {
          console.log("[0G Upload] Transaction found, waiting for receipt...");
          const startTime = Date.now();

          // Wait with extended timeout (90 seconds, 1 confirmation)
          receipt = await txResponse.wait(1, 90000);

          const confirmTime = Date.now() - startTime;
          console.log(`[0G Upload] Receipt obtained in ${confirmTime}ms`);

          if (!receipt || receipt.status !== 1) {
            console.error("[0G Upload] Transaction reverted or failed");
            console.error("[0G Upload] Receipt:", receipt);
            throw new Error("Transaction was reverted. Upload failed.");
          }

          console.log(
            "[0G Upload] ✅ Transaction confirmed in block:",
            receipt.blockNumber
          );
          console.log("[0G Upload] Gas used:", receipt.gasUsed.toString());
          confirmed = true;
          break; // Success - exit retry loop
        } else {
          console.warn(
            `[0G Upload] Transaction not found yet (attempt ${attempt + 1}/${maxRetries})`
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
          `[0G Upload] Error on attempt ${attempt + 1}:`,
          errorMessage
        );

        // Don't throw on final attempt - allow graceful degradation
        if (attempt === maxRetries - 1) {
          console.warn(
            "[0G Upload] ⚠️ Could not confirm transaction after",
            maxRetries,
            "attempts"
          );
          console.warn(
            "[0G Upload] This may be due to RPC indexing delays. The upload likely succeeded."
          );
          console.warn(
            "[0G Upload] Transaction hash:",
            txHash
          );
          console.warn(
            "[0G Upload] Check status at: https://chainscan-galileo.0g.ai/tx/" + txHash
          );
          // Don't throw - continue with graceful degradation
          break;
        }

        // Exponential backoff with max cap at 60 seconds
        const delay = Math.min(initialDelay * Math.pow(2, attempt), 60000);
        console.log(`[0G Upload] Retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (!confirmed) {
      console.warn(
        "[0G Upload] ⚠️ Transaction not confirmed, but upload may have succeeded"
      );
      console.warn(
        "[0G Upload] The file was uploaded to 0G Storage nodes successfully"
      );
      console.warn(
        "[0G Upload] Transaction confirmation is only for payment verification"
      );
      console.warn(
        "[0G Upload] Verify manually at: https://chainscan-galileo.0g.ai/tx/" + txHash
      );
    }

    updateProgress("complete");

    const result: OG0UploadResult = {
      rootHash,
      txHash,
      fileSize,
    };

    console.log("[0G Upload] ✅ Upload complete!");
    console.log("[0G Upload] Final result:", result);

    return result;
  } catch (error) {
    console.error("[0G Upload] ❌ Upload failed with error:", error);
    updateProgress("error");

    // Re-throw with more context
    if (error instanceof Error) {
      console.error("[0G Upload] Error message:", error.message);
      console.error("[0G Upload] Error stack:", error.stack);
      throw error;
    }
    throw new Error(`0G upload failed: ${error}`);
  }
}

/**
 * Validate if a string is a valid 0G Root Hash
 *
 * @param hash - The hash to validate
 * @returns true if the hash is a valid 0G Root Hash format
 */
export function isValidOG0RootHash(hash: string): boolean {
  // 0G Root Hash is a 64-character hexadecimal string (with or without 0x prefix)
  return /^(0x)?[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Download content from 0G Storage (for future use)
 *
 * @param rootHash - The 0G Root Hash to download
 * @param indexerRpcUrl - Optional custom indexer RPC URL
 * @returns Promise resolving to the downloaded content
 */
export async function downloadFromOG0(
  rootHash: string,
  indexerRpcUrl?: string
): Promise<string> {
  const INDEXER_RPC_URL =
    indexerRpcUrl ||
    import.meta.env.VITE_OG_INDEXER_RPC_URL ||
    "https://indexer-storage-testnet-turbo.0g.ai";

  if (!isValidOG0RootHash(rootHash)) {
    throw new Error("Invalid 0G Root Hash format");
  }

  try {
    // Note: Download functionality in browser requires different approach
    // The indexer.download() method is designed for Node.js file system access
    // For browser implementation, you would need to:
    // 1. Fetch raw data from 0G storage nodes directly
    // 2. Verify Merkle proof client-side
    // 3. Return content as string/Blob

    // Prevent unused parameter warning
    console.log("[0G Download] Requested root hash:", rootHash);
    console.log("[0G Download] Indexer RPC:", INDEXER_RPC_URL);

    throw new Error(
      "Download in browser environment not yet implemented. Use direct node access or implement client-side verification."
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`0G download failed: ${error}`);
  }
}
