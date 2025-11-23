import { ethers } from "ethers";

/**
 * Script to generate real encoded calldata for ERC-7730 test vectors
 * This ensures Ledger registry CI validation passes
 */

async function main() {
  console.log("\n🔧 Encoding Test Vector Calldata for HoudiniIdentityNFT\n");

  // Contract ABI for encoding
  const abi = [
    {
      inputs: [
        { internalType: "string", name: "og0RootHash", type: "string" },
        {
          internalType: "enum HoudiniIdentityNFT.ProfileType",
          name: "profileType",
          type: "uint8",
        },
      ],
      name: "mintIdentity",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "tokenId", type: "uint256" },
        { internalType: "string", name: "newOg0RootHash", type: "string" },
      ],
      name: "updateIdentity",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  // Create interface for encoding
  const iface = new ethers.Interface(abi);

  console.log("📝 Test Vector 1: mintIdentity - Personal Identity");
  const data1 = iface.encodeFunctionData("mintIdentity", [
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    0, // ProfileType.Personal
  ]);
  console.log(`   Calldata: ${data1}`);
  console.log(`   Length: ${data1.length} characters`);

  console.log("\n📝 Test Vector 2: mintIdentity - Project Identity");
  const data2 = iface.encodeFunctionData("mintIdentity", [
    "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    1, // ProfileType.Project
  ]);
  console.log(`   Calldata: ${data2}`);
  console.log(`   Length: ${data2.length} characters`);

  console.log("\n📝 Test Vector 3: updateIdentity");
  const data3 = iface.encodeFunctionData("updateIdentity", [
    1, // tokenId
    "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  ]);
  console.log(`   Calldata: ${data3}`);
  console.log(`   Length: ${data3.length} characters`);

  console.log("\n✅ All test vectors encoded successfully!");
  console.log("\n📋 Copy these values to update test JSON files:");
  console.log("\n1. mintIdentity-personal.json:");
  console.log(`   "data": "${data1}"`);
  console.log("\n2. mintIdentity-project.json:");
  console.log(`   "data": "${data2}"`);
  console.log("\n3. updateIdentity.json:");
  console.log(`   "data": "${data3}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
