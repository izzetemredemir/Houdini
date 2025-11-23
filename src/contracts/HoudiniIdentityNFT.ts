/**
 * HoudiniIdentityNFT Smart Contract
 * Deployed on 0G Testnet
 */

export const HOUDINI_NFT_ADDRESS =
  "0x116938bFd313667f9beFCB762CeD66445b62dC65" as const;

export const HOUDINI_NFT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "og0RootHash",
        type: "string",
      },
      {
        internalType: "enum HoudiniIdentityNFT.ProfileType",
        name: "profileType",
        type: "uint8",
      },
    ],
    name: "mintIdentity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "newOg0RootHash",
        type: "string",
      },
    ],
    name: "updateIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "getWalletIdentitiesDetailed",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "og0RootHash",
            type: "string",
          },
          {
            internalType: "enum HoudiniIdentityNFT.ProfileType",
            name: "profileType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedAt",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct HoudiniIdentityNFT.IdentityMetadata[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getIdentityMetadata",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "og0RootHash",
            type: "string",
          },
          {
            internalType: "enum HoudiniIdentityNFT.ProfileType",
            name: "profileType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedAt",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct HoudiniIdentityNFT.IdentityMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// TypeScript types for contract interaction
export interface IdentityMetadata {
  og0RootHash: string;
  profileType: number; // 0=Personal, 1=Project, 2=DAO
  createdAt: bigint;
  lastUpdatedAt: bigint;
  owner: `0x${string}`;
}

export enum ProfileType {
  Personal = 0,
  Project = 1,
  DAO = 2,
}
