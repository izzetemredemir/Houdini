/**
 * React hook for uploading profiles to 0G Storage
 * Simplified to focus on decentralized storage without smart contracts
 */

import { useState } from "react";
import { useAccount } from "wagmi";
import { hashLLMsContent } from "../utils/profileHash";
import {
  uploadToOG0,
  type OG0UploadOptions,
  type OG0UploadStatus,
} from "../utils/og0Upload";
import { createStorageRecord } from "../api/storageRecords";

export interface RegisterProfileResult {
  contentHash: `0x${string}`;
  og0RootHash: string;
  og0TxHash: string; // 0G upload transaction hash
  fileSize: number;
  storageRecordId?: number; // Database record ID (if saved)
}

/**
 * Hook for uploading profiles to 0G Storage
 */
export function useProfileRegistry() {
  const { address } = useAccount();
  const [uploadStatus, setUploadStatus] = useState<OG0UploadStatus | "idle">(
    "idle"
  );
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<RegisterProfileResult | null>(null);

  /**
   * Upload a profile to 0G Storage
   *
   * This function:
   * 1. Hashes the llms.txt content for verification
   * 2. Uploads content to 0G Storage network
   * 3. Returns the root hash and transaction details
   *
   * @param content - The llms.txt profile content
   * @param profileType - Profile type (0=Personal, 1=Project, 2=DAO) - stored in content
   * @param og0Options - Optional 0G upload configuration
   */
  const registerProfile = async (
    content: string,
    profileType: number,
    og0Options?: OG0UploadOptions
  ): Promise<RegisterProfileResult> => {
    try {
      console.log("[0G Upload] Starting profile upload to 0G Storage");
      console.log("[0G Upload] Profile type:", profileType);
      console.log("[0G Upload] Content length:", content.length, "characters");

      setError(null);
      setUploadStatus("idle");

      // Step 1: Hash content for verification
      console.log("[0G Upload] Step 1: Hashing content...");
      const contentHash = hashLLMsContent(content);
      console.log("[0G Upload] Content hash computed:", contentHash);

      // Step 2: Upload to 0G Storage
      console.log("[0G Upload] Step 2: Uploading to 0G Storage...");
      const og0Result = await uploadToOG0(content, {
        ...og0Options,
        onProgress: (status) => {
          console.log("[0G Upload] Status changed to:", status);
          setUploadStatus(status);
          if (og0Options?.onProgress) {
            og0Options.onProgress(status);
          }
        },
      });

      console.log("[0G Upload] ✅ Upload successful:", {
        rootHash: og0Result.rootHash,
        txHash: og0Result.txHash,
        fileSize: og0Result.fileSize,
      });

      const uploadResult: RegisterProfileResult = {
        contentHash,
        og0RootHash: og0Result.rootHash,
        og0TxHash: og0Result.txHash,
        fileSize: og0Result.fileSize,
      };

      // Step 3: Save to backend database
      if (address) {
        try {
          console.log("[0G Upload] Step 3: Saving record to database...");
          const dbResponse = await createStorageRecord({
            walletAddress: address,
            contentHash: contentHash,
            og0RootHash: og0Result.rootHash,
            og0TxHash: og0Result.txHash,
            fileSize: og0Result.fileSize,
            profileType: profileType,
            content: content,
          });
          uploadResult.storageRecordId = dbResponse.record.id;
          console.log("[0G Upload] ✅ Record saved to database with ID:", dbResponse.record.id);
        } catch (dbError) {
          // Don't fail the whole upload if database save fails
          console.error("[0G Upload] ⚠️ Failed to save to database:", dbError);
          console.error(
            "[0G Upload] Upload was successful, but database record failed"
          );
        }
      } else {
        console.warn(
          "[0G Upload] ⚠️ No wallet address, skipping database save"
        );
      }

      setResult(uploadResult);
      setUploadStatus("idle");

      console.log("[0G Upload] ✅ Registration complete!");
      return uploadResult;
    } catch (err) {
      console.error("[0G Upload] ❌ Upload failed:", err);
      const error =
        err instanceof Error ? err : new Error("Failed to upload profile");
      console.error("[0G Upload] Error message:", error.message);
      setError(error);
      setUploadStatus("idle");
      throw error;
    }
  };

  return {
    registerProfile,
    uploadStatus,
    error,
    result,
    isUploading: uploadStatus !== "idle",
  };
}
