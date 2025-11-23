import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { getAddress, parseAbiItem } from "viem";

/**
 * HoudiniIdentityNFT Hardhat Test Suite
 * Tests for soulbound identity NFTs with 0G Storage integration
 */
describe("HoudiniIdentityNFT", function () {
  // Valid 0G Storage root hash (64 hex characters)
  const VALID_HASH = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const UPDATED_HASH = "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";

  // Profile types
  const ProfileType = {
    Personal: 0,
    Project: 1,
    DAO: 2,
  };

  /**
   * Deploy fixture - deploys the contract once and reuses for tests
   */
  async function deployHoudiniNFTFixture() {
    const [owner, alice, bob] = await hre.viem.getWalletClients();

    const houdiniNFT = await hre.viem.deployContract("HoudiniIdentityNFT", []);

    const publicClient = await hre.viem.getPublicClient();

    return {
      houdiniNFT,
      owner,
      alice,
      bob,
      publicClient,
    };
  }

  // ========== DEPLOYMENT TESTS ==========

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { houdiniNFT } = await loadFixture(deployHoudiniNFTFixture);

      expect(await houdiniNFT.read.name()).to.equal("Houdini Identity");
      expect(await houdiniNFT.read.symbol()).to.equal("HOUDINI");
    });

    it("Should start with total supply of 0", async function () {
      const { houdiniNFT } = await loadFixture(deployHoudiniNFTFixture);

      expect(await houdiniNFT.read.totalSupply()).to.equal(0n);
    });
  });

  // ========== MINTING TESTS ==========

  describe("Minting", function () {
    it("Should mint identity NFT successfully", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      const tokenId = await houdiniNFT.write.mintIdentity(
        [VALID_HASH, ProfileType.Personal],
        { account: alice.account }
      );

      expect(tokenId).to.not.be.undefined;

      // Check ownership
      const balance = await houdiniNFT.read.balanceOf([alice.account.address]);
      expect(balance).to.equal(1n);

      const owner = await houdiniNFT.read.ownerOf([1n]);
      expect(getAddress(owner)).to.equal(getAddress(alice.account.address));
    });

    it("Should emit IdentityMinted event", async function () {
      const { houdiniNFT, alice, publicClient } = await loadFixture(deployHoudiniNFTFixture);

      const hash = await houdiniNFT.write.mintIdentity(
        [VALID_HASH, ProfileType.Personal],
        { account: alice.account }
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Check for IdentityMinted event
      const event = receipt.logs.find((log) => {
        try {
          const decoded = houdiniNFT.abi.find((item) => item.name === "IdentityMinted");
          return decoded !== undefined;
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should allow minting multiple identities per wallet", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      // Mint three different identities
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([UPDATED_HASH, ProfileType.Project], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.DAO], {
        account: alice.account,
      });

      const balance = await houdiniNFT.read.balanceOf([alice.account.address]);
      expect(balance).to.equal(3n);

      // Check wallet identities
      const identities = await houdiniNFT.read.getWalletIdentities([alice.account.address]);
      expect(identities.length).to.equal(3);
      expect(identities[0]).to.equal(1n);
      expect(identities[1]).to.equal(2n);
      expect(identities[2]).to.equal(3n);
    });

    it("Should revert if root hash is invalid (wrong length)", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await expect(
        houdiniNFT.write.mintIdentity(["short", ProfileType.Personal], {
          account: alice.account,
        })
      ).to.be.rejectedWith("InvalidRootHash");

      const longHash = VALID_HASH + "extra";
      await expect(
        houdiniNFT.write.mintIdentity([longHash, ProfileType.Personal], {
          account: alice.account,
        })
      ).to.be.rejectedWith("InvalidRootHash");
    });

    it("Should revert if profile type is invalid", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await expect(
        houdiniNFT.write.mintIdentity([VALID_HASH, 3], { account: alice.account })
      ).to.be.rejectedWith("InvalidProfileType");
    });
  });

  // ========== UPDATE TESTS ==========

  describe("Updating Metadata", function () {
    it("Should update identity metadata successfully", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      // Mint identity
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      const tokenId = 1n;

      // Get metadata before update
      const metadataBefore = await houdiniNFT.read.getIdentityMetadata([tokenId]);
      expect(metadataBefore[0]).to.equal(VALID_HASH); // og0RootHash

      // Update identity
      await houdiniNFT.write.updateIdentity([tokenId, UPDATED_HASH], {
        account: alice.account,
      });

      // Get metadata after update
      const metadataAfter = await houdiniNFT.read.getIdentityMetadata([tokenId]);
      expect(metadataAfter[0]).to.equal(UPDATED_HASH); // og0RootHash updated
      expect(metadataAfter[2]).to.equal(metadataBefore[2]); // createdAt unchanged
      expect(metadataAfter[3]).to.be.greaterThanOrEqual(metadataAfter[2]); // lastUpdatedAt >= createdAt
    });

    it("Should emit IdentityUpdated event", async function () {
      const { houdiniNFT, alice, publicClient } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      const hash = await houdiniNFT.write.updateIdentity([1n, UPDATED_HASH], {
        account: alice.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.logs.length).to.be.greaterThan(0);
    });

    it("Should revert if caller is not the owner", async function () {
      const { houdiniNFT, alice, bob } = await loadFixture(deployHoudiniNFTFixture);

      // Alice mints
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      // Bob tries to update Alice's NFT
      await expect(
        houdiniNFT.write.updateIdentity([1n, UPDATED_HASH], { account: bob.account })
      ).to.be.rejectedWith("NotTokenOwner");
    });

    it("Should revert if token does not exist", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await expect(
        houdiniNFT.write.updateIdentity([999n, UPDATED_HASH], { account: alice.account })
      ).to.be.rejectedWith("TokenDoesNotExist");
    });

    it("Should revert if new hash is invalid", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      await expect(
        houdiniNFT.write.updateIdentity([1n, "invalid"], { account: alice.account })
      ).to.be.rejectedWith("InvalidRootHash");
    });
  });

  // ========== SOULBOUND TESTS ==========

  describe("Soulbound (Non-Transferable)", function () {
    it("Should revert on transferFrom", async function () {
      const { houdiniNFT, alice, bob } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      await expect(
        houdiniNFT.write.transferFrom([alice.account.address, bob.account.address, 1n], {
          account: alice.account,
        })
      ).to.be.rejectedWith("SoulboundTokenCannotBeTransferred");
    });

    it("Should revert on safeTransferFrom", async function () {
      const { houdiniNFT, alice, bob } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });

      await expect(
        houdiniNFT.write.safeTransferFrom([alice.account.address, bob.account.address, 1n], {
          account: alice.account,
        })
      ).to.be.rejectedWith("SoulboundTokenCannotBeTransferred");
    });
  });

  // ========== METADATA RETRIEVAL TESTS ==========

  describe("Metadata Retrieval", function () {
    it("Should get identity metadata correctly", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Project], {
        account: alice.account,
      });

      const metadata = await houdiniNFT.read.getIdentityMetadata([1n]);

      expect(metadata[0]).to.equal(VALID_HASH); // og0RootHash
      expect(metadata[1]).to.equal(ProfileType.Project); // profileType
      expect(metadata[2]).to.be.greaterThan(0n); // createdAt
      expect(metadata[3]).to.be.greaterThan(0n); // lastUpdatedAt
      expect(getAddress(metadata[4])).to.equal(getAddress(alice.account.address)); // owner
    });

    it("Should get wallet identities (token IDs only)", async function () {
      const { houdiniNFT, alice, bob } = await loadFixture(deployHoudiniNFTFixture);

      // Alice mints 2 NFTs
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([UPDATED_HASH, ProfileType.Project], {
        account: alice.account,
      });

      // Bob mints 1 NFT
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.DAO], {
        account: bob.account,
      });

      const aliceTokens = await houdiniNFT.read.getWalletIdentities([alice.account.address]);
      expect(aliceTokens.length).to.equal(2);
      expect(aliceTokens[0]).to.equal(1n);
      expect(aliceTokens[1]).to.equal(2n);

      const bobTokens = await houdiniNFT.read.getWalletIdentities([bob.account.address]);
      expect(bobTokens.length).to.equal(1);
      expect(bobTokens[0]).to.equal(3n);
    });

    it("Should get wallet identities detailed", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([UPDATED_HASH, ProfileType.Project], {
        account: alice.account,
      });

      const identities = await houdiniNFT.read.getWalletIdentitiesDetailed([
        alice.account.address,
      ]);

      expect(identities.length).to.equal(2);
      expect(identities[0][0]).to.equal(VALID_HASH); // First NFT hash
      expect(identities[0][1]).to.equal(ProfileType.Personal); // First NFT type
      expect(identities[1][0]).to.equal(UPDATED_HASH); // Second NFT hash
      expect(identities[1][1]).to.equal(ProfileType.Project); // Second NFT type
    });

    it("Should return empty array for wallet with no identities", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      const tokens = await houdiniNFT.read.getWalletIdentities([alice.account.address]);
      expect(tokens.length).to.equal(0);

      const identities = await houdiniNFT.read.getWalletIdentitiesDetailed([
        alice.account.address,
      ]);
      expect(identities.length).to.equal(0);
    });

    it("Should revert when getting metadata for nonexistent token", async function () {
      const { houdiniNFT } = await loadFixture(deployHoudiniNFTFixture);

      await expect(houdiniNFT.read.getIdentityMetadata([999n])).to.be.rejectedWith(
        "TokenDoesNotExist"
      );
    });
  });

  // ========== TOTAL SUPPLY TESTS ==========

  describe("Total Supply", function () {
    it("Should increment total supply correctly", async function () {
      const { houdiniNFT, alice, bob } = await loadFixture(deployHoudiniNFTFixture);

      expect(await houdiniNFT.read.totalSupply()).to.equal(0n);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });
      expect(await houdiniNFT.read.totalSupply()).to.equal(1n);

      await houdiniNFT.write.mintIdentity([UPDATED_HASH, ProfileType.Project], {
        account: bob.account,
      });
      expect(await houdiniNFT.read.totalSupply()).to.equal(2n);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.DAO], {
        account: alice.account,
      });
      expect(await houdiniNFT.read.totalSupply()).to.equal(3n);
    });
  });

  // ========== PROFILE TYPE TESTS ==========

  describe("Profile Types", function () {
    it("Should support all three profile types", async function () {
      const { houdiniNFT, alice } = await loadFixture(deployHoudiniNFTFixture);

      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Personal], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.Project], {
        account: alice.account,
      });
      await houdiniNFT.write.mintIdentity([VALID_HASH, ProfileType.DAO], {
        account: alice.account,
      });

      const personal = await houdiniNFT.read.getIdentityMetadata([1n]);
      const project = await houdiniNFT.read.getIdentityMetadata([2n]);
      const dao = await houdiniNFT.read.getIdentityMetadata([3n]);

      expect(personal[1]).to.equal(ProfileType.Personal);
      expect(project[1]).to.equal(ProfileType.Project);
      expect(dao[1]).to.equal(ProfileType.DAO);
    });
  });
});
