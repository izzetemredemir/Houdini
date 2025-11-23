# Houdini

> AI-Readable Profile Standard for Web3 on 0G Network

Houdini enables wallets and projects to introduce themselves to artificial intelligence in an accurate and controlled manner through standardized profile files stored on the 0G Network.

## Vision

The goal is to create a **standard profile format** (similar to `llms.txt`) that allows any LLM or AI agent to understand a wallet's or project's "official story" by simply providing an address. Users connect their wallet to **0G Network**, choose which information to share, and the system generates an AI-readable profile containing:

- Identity credentials (website, social links)
- Important assets and holdings (via Octav API)
- Active blockchain networks
- Project links and metadata
- Summarized onchain and offchain data

Profiles are stored on **0G Storage** - a decentralized storage network that provides Merkle-proof verification and content addressing, enabling any AI agent to retrieve a single, authoritative source of truth for any wallet or project.

## Current Implementation

### Phase 1: Foundation (✅ Complete)

- **Wallet Connection & Onboarding**: Multi-step flow powered by RainbowKit (0G testnet)
- **Multi-Chain Portfolio Aggregation**: Real-time asset data via Octav API
  - Net worth, cash balance, daily P&L
  - Assets grouped by chain with logos and values
  - Complete token list with balances in USD
  - Open/closed position metrics
- **User Preference Management**: Local storage for privacy choices
- **CORS-Free Backend Proxy**: Fastify server for seamless API integration

### Phase 2: Profile Generation (✅ Complete)

- **LLMs.txt Generator**: 5-step wizard for creating AI-readable profiles
  - Profile type selection (Personal, Project, DAO/Community)
  - Active network selection (0G)
  - Website and social link integration
  - Important token and NFT selection
  - Editable text preview
- **0G Storage Integration**: Direct upload to 0G Storage network
  - Merkle tree computation for content verification
  - Content-addressed storage with root hash
  - Transaction confirmation on 0G blockchain

### Phase 3: On-Chain Identity NFTs (✅ Complete)

- **HoudiniIdentityNFT Contract**: Soulbound identity NFTs on 0G Network
  - **Contract Address**: `0x116938bFd313667f9beFCB762CeD66445b62dC65` (0G Testnet)
  - **Soulbound**: NFTs cannot be transferred, permanently bound to wallet
  - **Updatable Metadata**: Profile updates change NFT metadata (og0RootHash)
  - **Multiple Identities**: Users can mint separate NFTs for Personal, Project, and DAO profiles
  - **On-Chain Storage**: All metadata stored in contract
  - **Automatic Management**: Frontend automatically detects existing NFTs and offers update instead of duplicate minting

## Tech Stack

### Frontend

- **React** 19.2.0 - UI framework
- **TypeScript** 5.9.3 - Type safety
- **Vite** 7.2.4 - Build tool with HMR
- **Wagmi** 3.0.1 - Ethereum React hooks
- **RainbowKit** 2.2.9 - Wallet connection UI
- **Viem** 2.39.3 - Ethereum utilities
- **TanStack Query** 5.90.10 - Data fetching & caching

### Backend

- **Fastify** 5.2.0 - High-performance Node.js server
- **TypeScript** 5.7.2
- **@fastify/cors** 10.0.1 - CORS handling
- **tsx** - TypeScript execution
- **dotenv** - Environment management

### Storage

- **0G Storage** - Decentralized storage network on 0G blockchain
- **0G SDK** - JavaScript client for 0G Storage interactions
- **Merkle Tree** - Content verification via cryptographic proofs

### Smart Contracts

- **Solidity** 0.8.28 - Smart contract language
- **Hardhat** 3.0.15 - Development environment and testing framework
- **OpenZeppelin** 5.4.0 - Secure contract libraries (ERC721, Ownable)
- **HoudiniIdentityNFT** - Custom soulbound NFT for on-chain identities

### External APIs

- **ENS** - Ethereum Name Service
- **Octav API** - Portfolio aggregation
- **WalletConnect** - Wallet connections

## Prerequisites

- **Node.js** 18+ and npm
- **0G Testnet Wallet** with OG tokens for storage fees
- **API Keys**:
  - Octav API key ([get one here](https://docs.octav.fi))
  - WalletConnect Project ID ([dashboard](https://cloud.walletconnect.com))

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd arjantin

# Install dependencies (root and backend)
npm install
cd backend && npm install && cd ..
```

## Configuration

Create `.env` files in the appropriate directories:

### Root `.env`

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### `backend/.env`

```env
OCTAV_API_KEY=your_octav_api_key
PORT=7342
```

## Development

### Quick Start (Recommended)

Run the full stack with a single command:

```bash
npm run dev:all
```

This starts:

- 🎨 **Frontend** at `http://localhost:5175` (cyan output)
- ⚡ **Backend** at `http://localhost:7342` (magenta output)

### Individual Services

**Frontend only:**

```bash
npm run dev
# or
npm run dev:frontend
```

**Backend only:**

```bash
npm run dev:backend
# or
cd backend && npm run dev
```

### Build & Preview

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
arjantin/
├── src/                          # React frontend (Vite)
│   ├── components/               # React components
│   │   ├── MultiStepOnboarding.tsx        # Initial wallet onboarding
│   │   ├── PortfolioDisplay.tsx           # Portfolio viewer
│   │   └── LLMsTxtGenerator/              # 5-step profile generator
│   ├── contracts/                # Smart contract ABIs
│   │   └── HoudiniIdentityNFT.ts # NFT contract interface
│   ├── hooks/
│   │   ├── useProfileRegistry.ts # 0G Storage upload hook
│   │   └── useHoudiniNFT.ts      # NFT minting/updating hook
│   ├── utils/
│   │   ├── og0Upload.ts          # 0G Storage upload utilities
│   │   └── profileHash.ts        # Content hashing (keccak256)
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── public/                       # Static assets
├── backend/                      # Fastify API server
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   └── routes/               # API route handlers
│   └── package.json
├── hardhat/                      # Smart contract development
│   ├── contracts/                # Solidity contracts
│   │   └── HoudiniIdentityNFT.sol # Soulbound identity NFT
│   ├── ignition/modules/         # Deployment scripts
│   ├── test/                     # Contract tests
│   ├── hardhat.config.ts         # Hardhat configuration
│   └── package.json
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── CLAUDE.md                     # Claude Code instructions
└── package.json                  # Root dependencies & scripts
```

## API Endpoints

### Backend (Port 7342)

- `GET /api/octav/portfolio/:address` - Fetch wallet portfolio data
  - **Response**: Net worth, assets, tokens, P&L metrics
- `GET /health` - Health check endpoint

## Features in Detail

### Wallet Connection

- Multi-wallet support via RainbowKit
- Network: 0G Testnet only (Chain ID: 16602)
- Automatic chain detection

### Portfolio Viewer

- Real-time multi-chain asset aggregation
- Net worth calculation with daily changes
- Assets grouped by blockchain
- Token-level detail with USD values
- P&L tracking (open/closed positions)

### User Preferences

- Local storage for privacy choices
- Portfolio and profile preferences
- Persisted across sessions

### LLMs.txt Profile Generator

- 5-step wizard interface
- Profile type selection (Personal, Project, DAO/Community)
- Automatic data aggregation from portfolio
- Active network detection (0G)
- Token and NFT collection selection
- Editable text preview

### 0G Storage Integration

- Direct upload to 0G Storage network
- Merkle tree computation for content verification
- Content hash generation (keccak256)
- Root hash for content addressing
- Transaction tracking on 0G blockchain
- Storage fee payment in OG tokens

**How 0G Storage Works:**

1. **Content Preparation**: Profile text is converted to a blob
2. **Merkle Tree Computation**: File is split into chunks, Merkle tree is computed
3. **Root Hash Generation**: 64-character hex hash uniquely identifies the content
4. **Network Upload**: Content is uploaded to 0G Storage nodes
5. **Payment Transaction**: User signs transaction to pay for storage
6. **Verification**: Content can be retrieved and verified using the root hash

**Data Retrieval:**

Profiles can be retrieved from 0G Storage using the root hash:

```javascript
import { downloadFromOG0 } from './utils/og0Upload';

const content = await downloadFromOG0(rootHash);
```

### Identity NFTs (HoudiniIdentityNFT)

After uploading a profile to 0G Storage, users can mint a soulbound NFT that permanently links their on-chain identity to the stored profile.

**Key Features:**

- **Soulbound (Non-Transferable)**: NFTs cannot be transferred after minting, permanently bound to the wallet
- **Multiple Identity Types**: Separate NFTs for Personal (0), Project (1), and DAO (2) profiles
- **Updatable Metadata**: When a profile is updated on 0G Storage, the NFT metadata (og0RootHash) can be updated
- **On-Chain Metadata**: All profile data stored directly in the contract (no IPFS)
- **Smart Detection**: Frontend automatically detects if you already have an NFT for a profile type and offers to update instead of creating a duplicate

**How It Works:**

1. Upload your profile to 0G Storage (generates a 64-char root hash)
2. Click "Generate On-chain Identity NFT" in the profile editor
3. Wallet prompts you to sign the minting transaction
4. NFT is minted with your profile's root hash stored on-chain
5. Future updates to the same profile type will update the existing NFT instead of minting a new one

**Contract Details:**

```typescript
// Deployed on 0G Testnet
Contract Address: 0x116938bFd313667f9beFCB762CeD66445b62dC65

// Example: Mint a Personal identity NFT
import { useHoudiniNFT } from './hooks/useHoudiniNFT';

const { mintIdentity } = useHoudiniNFT();
const txHash = await mintIdentity(og0RootHash, 0); // 0 = Personal

// Example: Update existing NFT
const { updateIdentity } = useHoudiniNFT();
const txHash = await updateIdentity(tokenId, newRootHash);
```

### Ledger Clear Signing (ERC-7730)

**Security Enhancement for Hardware Wallet Users**

Houdini supports **Ledger Clear Signing** via ERC-7730 standard, enabling users to see human-readable transaction details on their Ledger device screen.

**Without Clear Signing:**
```
Ledger Screen:
⚠️ Blind Signing
Data: 0x23b872dd000000...
[Unknown Transaction]
```

**With Clear Signing (ERC-7730):**
```
Ledger Screen:
✅ Mint Identity NFT
0G Storage Hash: abc123...def456
Profile Type: Personal Identity
[Approve] [Reject]
```

**Implementation Status:**
- ✅ ERC-7730 metadata files created (`/erc7730/`)
- ✅ Test vectors for validation
- ⏳ Pending Ledger registry submission
- ⏳ Awaiting Ledger team review (2-7 days)

**Supported Wallets (once approved):**
- Ledger Live (native support)
- MetaMask + Ledger hardware wallet
- Rabby + Ledger hardware wallet
- Rainbow wallet with Ledger

**For Developers:**
See `/erc7730/SUBMISSION_GUIDE.md` for Ledger registry submission instructions.

## 0G Network Details

### 0G Testnet Configuration

- **Chain ID**: 16602 (0x40d8)
- **RPC URL**: https://evmrpc-testnet.0g.ai
- **Currency**: OG (for gas and storage fees)
- **Block Explorer**: https://chainscan-galileo.0g.ai
- **Storage Indexer**: https://indexer-storage-testnet-turbo.0g.ai

### Getting 0G Testnet Tokens

1. Visit the [0G Faucet](https://faucet.0g.ai)
2. Connect your wallet
3. Request test OG tokens
4. Use tokens for storage fees when uploading profiles

## Roadmap

### Phase 1: Foundation (✅ Complete)

- ✅ Wallet connection infrastructure
- ✅ ENS profile resolution
- ✅ Portfolio data aggregation
- ✅ User preference system

### Phase 2: Profile Generation (✅ Complete)

- ✅ LLM-readable profile file format (llms.txt-style)
- ✅ User-controlled data selection interface
- ✅ Profile preview and editing
- ✅ Profile metadata schema

### Phase 3: Decentralized Storage (✅ Complete)

- ✅ 0G Storage integration
- ✅ Content addressing and retrieval
- ✅ Merkle proof verification
- ✅ Root hash generation

### Phase 4: On-Chain Identity NFTs (✅ Complete)

- ✅ HoudiniIdentityNFT smart contract development
- ✅ Soulbound (non-transferable) NFT implementation
- ✅ Multiple identity types (Personal, Project, DAO)
- ✅ Updatable metadata linked to 0G Storage
- ✅ Contract deployment on 0G Testnet
- ✅ Frontend integration with automatic NFT detection
- ✅ Comprehensive test coverage

### Phase 5: Ledger Clear Signing (⏳ In Progress)

- ✅ ERC-7730 metadata file creation for HoudiniIdentityNFT
- ✅ Test transaction vectors for validation
- ✅ Submission guide and documentation
- ⏳ Submit to Ledger registry (Pull Request)
- ⏳ Ledger team review and approval (2-7 days)
- [ ] Clear Signing live in Ledger Live and compatible wallets

### Phase 6: Production Deployment (Future)

- [ ] Deploy to 0G mainnet (when available)
- [ ] Enable additional storage providers
- [ ] Launch public beta on 0G testnet
- [ ] Create profile discovery interface

### Phase 7: AI Integration (Future)

- [ ] LLM consumption API endpoints
- [ ] Agent-friendly profile format
- [ ] Semantic search capabilities
- [ ] Profile recommendation system
- [ ] Cross-chain profile aggregation

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

[Add license information]

## Links

- [0G Network Documentation](https://docs.0g.ai)
- [Octav Documentation](https://docs.octav.fi)
- [ENS Documentation](https://docs.ens.domains)
- [RainbowKit](https://www.rainbowkit.com)
- [Wagmi](https://wagmi.sh)

---

Built with ❤️ for the Web3 AI ecosystem
