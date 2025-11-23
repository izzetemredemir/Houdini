// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HoudiniIdentityNFT
 * @dev Soulbound (non-transferable) NFT for on-chain Web3 identities
 * @notice Each NFT represents an AI-readable profile stored on 0G Storage
 *
 * Features:
 * - Soulbound: NFTs cannot be transferred after minting
 * - Multiple identities per wallet: Users can create unlimited identity NFTs
 * - Updatable metadata: Profile updates change NFT metadata (og0RootHash)
 * - On-chain storage: All metadata stored in contract (no IPFS/external storage)
 */
contract HoudiniIdentityNFT is ERC721, Ownable {

    // ========== TYPES ==========

    /// @notice Profile type enumeration
    enum ProfileType {
        Personal,    // 0: Individual identity
        Project,     // 1: Project/protocol identity
        DAO          // 2: DAO or community identity
    }

    /// @notice Identity metadata stored on-chain
    struct IdentityMetadata {
        string og0RootHash;      // 0G Storage root hash (64-char hex) - points to llms.txt
        ProfileType profileType; // Type of identity (Personal/Project/DAO)
        uint256 createdAt;       // Timestamp when NFT was minted
        uint256 lastUpdatedAt;   // Timestamp of last metadata update
        address owner;           // Owner wallet address
    }

    // ========== STATE VARIABLES ==========

    /// @dev Token ID counter for minting
    uint256 private _nextTokenId;

    /// @dev Mapping from token ID to identity metadata
    mapping(uint256 => IdentityMetadata) private _identities;

    /// @dev Mapping from owner address to array of owned token IDs
    mapping(address => uint256[]) private _ownerTokens;

    // ========== EVENTS ==========

    /// @notice Emitted when a new identity NFT is minted
    event IdentityMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string og0RootHash,
        ProfileType profileType
    );

    /// @notice Emitted when identity metadata is updated
    event IdentityUpdated(
        uint256 indexed tokenId,
        string newOg0RootHash,
        uint256 updatedAt
    );

    // ========== ERRORS ==========

    error TokenDoesNotExist(uint256 tokenId);
    error NotTokenOwner(uint256 tokenId, address caller);
    error SoulboundTokenCannotBeTransferred();
    error InvalidRootHash();
    error InvalidProfileType();

    // ========== CONSTRUCTOR ==========

    constructor() ERC721("Houdini Identity", "HOUDINI") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs at 1
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Mint a new identity NFT
     * @param og0RootHash The 0G Storage root hash of the llms.txt profile
     * @param profileType The type of identity (0=Personal, 1=Project, 2=DAO)
     * @return tokenId The ID of the newly minted NFT
     */
    function mintIdentity(
        string calldata og0RootHash,
        ProfileType profileType
    ) external returns (uint256) {
        // Validation
        if (bytes(og0RootHash).length != 64) revert InvalidRootHash();
        if (uint8(profileType) > 2) revert InvalidProfileType();

        // Get next token ID
        uint256 tokenId = _nextTokenId++;

        // Mint NFT to caller
        _safeMint(msg.sender, tokenId);

        // Store metadata
        _identities[tokenId] = IdentityMetadata({
            og0RootHash: og0RootHash,
            profileType: profileType,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            owner: msg.sender
        });

        // Track token ownership
        _ownerTokens[msg.sender].push(tokenId);

        emit IdentityMinted(tokenId, msg.sender, og0RootHash, profileType);

        return tokenId;
    }

    /**
     * @notice Update the metadata of an existing identity NFT
     * @dev Only the NFT owner can update
     * @param tokenId The ID of the NFT to update
     * @param newOg0RootHash The new 0G Storage root hash
     */
    function updateIdentity(
        uint256 tokenId,
        string calldata newOg0RootHash
    ) external {
        // Check token exists
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);

        // Check caller is owner
        if (ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner(tokenId, msg.sender);
        }

        // Validate new hash
        if (bytes(newOg0RootHash).length != 64) revert InvalidRootHash();

        // Update metadata
        _identities[tokenId].og0RootHash = newOg0RootHash;
        _identities[tokenId].lastUpdatedAt = block.timestamp;

        emit IdentityUpdated(tokenId, newOg0RootHash, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the metadata of an identity NFT
     * @param tokenId The ID of the NFT
     * @return metadata The identity metadata
     */
    function getIdentityMetadata(uint256 tokenId)
        external
        view
        returns (IdentityMetadata memory)
    {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        return _identities[tokenId];
    }

    /**
     * @notice Get all identity NFTs owned by a wallet
     * @param wallet The wallet address
     * @return tokenIds Array of token IDs owned by the wallet
     */
    function getWalletIdentities(address wallet)
        external
        view
        returns (uint256[] memory)
    {
        return _ownerTokens[wallet];
    }

    /**
     * @notice Get the total number of identity NFTs minted
     * @return count The total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @notice Get detailed metadata for all identities owned by a wallet
     * @param wallet The wallet address
     * @return identities Array of identity metadata structs
     */
    function getWalletIdentitiesDetailed(address wallet)
        external
        view
        returns (IdentityMetadata[] memory)
    {
        uint256[] memory tokenIds = _ownerTokens[wallet];
        IdentityMetadata[] memory identities = new IdentityMetadata[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            identities[i] = _identities[tokenIds[i]];
        }

        return identities;
    }

    // ========== SOULBOUND OVERRIDES ==========

    /**
     * @dev Override transferFrom to make NFT soulbound (non-transferable)
     */
    function transferFrom(
        address /* from */,
        address /* to */,
        uint256 /* tokenId */
    ) public pure override {
        revert SoulboundTokenCannotBeTransferred();
    }

    /**
     * @dev Override safeTransferFrom to make NFT soulbound (non-transferable)
     */
    function safeTransferFrom(
        address /* from */,
        address /* to */,
        uint256 /* tokenId */,
        bytes memory /* data */
    ) public pure override {
        revert SoulboundTokenCannotBeTransferred();
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Override _update to prevent transfers while allowing minting
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        // Prevent transfers (from != address(0))
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenCannotBeTransferred();
        }

        return super._update(to, tokenId, auth);
    }
}
