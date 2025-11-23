import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for HoudiniIdentityNFT
 *
 * Deploy command:
 * npx hardhat ignition deploy ignition/modules/HoudiniIdentityNFT.ts --network 0g-testnet
 *
 * Verify command (after deployment):
 * npx hardhat verify --network 0g-testnet <DEPLOYED_ADDRESS>
 */
const HoudiniIdentityNFTModule = buildModule("HoudiniIdentityNFTModule", (m) => {
  // Deploy the HoudiniIdentityNFT contract
  const houdiniNFT = m.contract("HoudiniIdentityNFT", []);

  return { houdiniNFT };
});

export default HoudiniIdentityNFTModule;
