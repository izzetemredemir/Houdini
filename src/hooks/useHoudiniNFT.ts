/**
 * React hook for interacting with HoudiniIdentityNFT contract
 * Manages minting and updating of soulbound identity NFTs
 */

import { useAccount, useWriteContract, useReadContract } from "wagmi";
import {
  HOUDINI_NFT_ADDRESS,
  HOUDINI_NFT_ABI,
  type IdentityMetadata,
} from "../contracts/HoudiniIdentityNFT";

export function useHoudiniNFT() {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  // Check if contract is properly configured
  const isContractConfigured = HOUDINI_NFT_ADDRESS !== "";

  // Fetch all NFTs owned by the connected wallet
  const { data: userNFTs, refetch: refetchNFTs } = useReadContract({
    address: HOUDINI_NFT_ADDRESS,
    abi: HOUDINI_NFT_ABI,
    functionName: "getWalletIdentitiesDetailed",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractConfigured,
    },
  });

  /**
   * Mint a new identity NFT
   * @param og0RootHash - The 64-character 0G Storage root hash
   * @param profileType - Profile type (0=Personal, 1=Project, 2=DAO)
   * @returns Transaction hash
   */
  const mintIdentity = async (
    og0RootHash: string,
    profileType: number
  ): Promise<`0x${string}`> => {
    if (!isContractConfigured) {
      throw new Error("NFT contract not configured");
    }

    if (!address) {
      throw new Error("Wallet not connected");
    }

    console.log("[useHoudiniNFT] Minting NFT...");
    console.log("[useHoudiniNFT] Root hash:", og0RootHash);
    console.log("[useHoudiniNFT] Profile type:", profileType);

    const hash = await writeContractAsync({
      address: HOUDINI_NFT_ADDRESS,
      abi: HOUDINI_NFT_ABI,
      functionName: "mintIdentity",
      args: [og0RootHash, profileType],
      gas: 1000000n, // 1M gas limit for NFT minting
    });

    console.log("[useHoudiniNFT] ✅ Mint transaction sent:", hash);

    // Refetch NFTs after minting
    setTimeout(() => refetchNFTs(), 2000);

    return hash;
  };

  /**
   * Update an existing identity NFT
   * @param tokenId - The NFT token ID to update
   * @param newOg0RootHash - The new 64-character 0G Storage root hash
   * @returns Transaction hash
   */
  const updateIdentity = async (
    tokenId: bigint,
    newOg0RootHash: string
  ): Promise<`0x${string}`> => {
    if (!isContractConfigured) {
      throw new Error("NFT contract not configured");
    }

    if (!address) {
      throw new Error("Wallet not connected");
    }

    console.log("[useHoudiniNFT] Updating NFT...");
    console.log("[useHoudiniNFT] Token ID:", tokenId);
    console.log("[useHoudiniNFT] New root hash:", newOg0RootHash);

    const hash = await writeContractAsync({
      address: HOUDINI_NFT_ADDRESS,
      abi: HOUDINI_NFT_ABI,
      functionName: "updateIdentity",
      args: [tokenId, newOg0RootHash],
      gas: 600000n, // 600k gas limit for NFT updates
    });

    console.log("[useHoudiniNFT] ✅ Update transaction sent:", hash);

    // Refetch NFTs after updating
    setTimeout(() => refetchNFTs(), 2000);

    return hash;
  };

  /**
   * Find an NFT by profile type
   * @param profileType - Profile type to search for (0=Personal, 1=Project, 2=DAO)
   * @returns NFT metadata with tokenId, or undefined if not found
   */
  const findNFTByType = (
    profileType: number
  ): (IdentityMetadata & { tokenId: bigint }) | undefined => {
    if (!userNFTs || userNFTs.length === 0) return undefined;

    const nftIndex = userNFTs.findIndex(
      (nft) => Number(nft.profileType) === profileType
    );

    if (nftIndex === -1) return undefined;

    return {
      ...userNFTs[nftIndex],
      tokenId: BigInt(nftIndex + 1), // Token IDs start at 1
    };
  };

  return {
    // Write functions
    mintIdentity,
    updateIdentity,

    // Read functions
    userNFTs: userNFTs as IdentityMetadata[] | undefined,
    findNFTByType,
    refetchNFTs,

    // Status
    isWritePending,
    isContractConfigured,
  };
}
