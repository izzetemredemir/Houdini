# Houdini

> Bringing the llms.txt standard on-chain via 0G Storage, making wallets readable for AI

## What is Houdini?

Houdini serves as the definitive LLMS.txt storage for wallets, designed to give on-chain AI agents easy access to structured identity and portfolio data. Instead of forcing AI models to guess context from raw transaction hashes, we utilize **Octav.fi** to retrieve accurate portfolio information and combine it with user-verified inputs. This data is formatted into an llms.txt file—the standard for AI readability—and securely stored on **0G**. By creating an Identity NFT that links to this file, Houdini ensures that any AI-powered dApp or DAO can instantly access prepared, reliable knowledge about a user's on-chain history.

<img width="1600" height="920" alt="image" src="https://github.com/user-attachments/assets/48994f32-9a7a-4956-8b40-6ec29499eb5e" />
<img width="1600" height="910" alt="image" src="https://github.com/user-attachments/assets/888cabb8-c552-4eee-9f0c-d48dc400d216" />

## Key Features

- **AI-Readable Profiles**: Generate standardized llms.txt format profiles for wallets
- **Decentralized Storage**: Profiles stored on **0G Storage** with Merkle-proof verification
- **Portfolio Aggregation**: Real-time multi-chain asset data via **Octav API**
- **Soulbound Identity NFTs**: Non-transferable on-chain identity linked to 0G-stored profiles
- **Ledger Clear Signing**: Enhanced security via **ERC-7730** standard for hardware wallet users
- **Multiple Identity Types**: Separate profiles for Personal, Project, and DAO identities

## Core Technologies

### 🗄️ 0G Storage
Decentralized storage network providing:
- Merkle-tree based content verification
- Content-addressed storage with root hash
- Permanent, retrievable profile data
- Transaction confirmation on 0G blockchain
- **Deployed Contract**: [`0x116938bFd313667f9beFCB762CeD66445b62dC65`](https://chainscan-galileo.0g.ai/address/0x116938bfd313667f9befcb762ced66445b62dc65) (0G Testnet)

**Example Storage Transactions:**
- [0x080571...65ad7](https://chainscan-galileo.0g.ai/tx/0x080571e73b1ce4ecf30316bc79b9c24371f0d818ca48ab40a096ea0815165ad7)
- [0x4f7fa0...aad30a](https://chainscan-galileo.0g.ai/tx/0x4f7fa0cb3835f225078ba341fe8a2ed07c56a38cb7345a374b32f2ee19aad30a)
- [0xf78c05...2985f4](https://chainscan-galileo.0g.ai/tx/0xf78c0558f2c8f01a7c6e901503c2c30adc0dcb5767226c946ff0e8f9892985f4)
- [0x207d3e...a18211b](https://chainscan-galileo.0g.ai/tx/0x207d3e7dd5765ec7921521659cc9f8d7e1c3b067fa2267c46741d91bda18211b)

### 📊 Octav API
Portfolio aggregation service that provides:
- Multi-chain asset tracking
- Real-time net worth calculation
- Token balances and USD values
- Daily P&L metrics
- NFT collection data

### 🔐 Ledger Clear Signing (ERC-7730)
Security enhancement for hardware wallet users - enables human-readable transaction details on Ledger device screens instead of blind signing.

**Status**: ERC-7730 metadata created, submitted to Ledger registry
**Registry PR**: https://github.com/LedgerHQ/clear-signing-erc7730-registry/pull/1978

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Wagmi, RainbowKit, Viem
**Backend**: Fastify, TypeScript, CORS proxy for Octav API
**Storage**: 0G Storage SDK, Merkle Tree verification
**Contracts**: Solidity 0.8.28, Hardhat, OpenZeppelin (ERC721)
**External APIs**: Octav, ENS, WalletConnect

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- 0G Testnet wallet with OG tokens ([Faucet](https://faucet.0g.ai))
- Octav API key ([Get one](https://docs.octav.fi))
- WalletConnect Project ID ([Dashboard](https://cloud.walletconnect.com))

### Installation

```bash
# Clone and install
git clone <repository-url>
cd arjantin
npm install
cd backend && npm install && cd ..
```

### Configuration

**Root `.env`:**
```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**`backend/.env`:**
```env
OCTAV_API_KEY=your_octav_api_key
PORT=7342
```

### Run Development Server

```bash
# Start both frontend and backend
npm run dev:all
```

- Frontend: `http://localhost:5175`
- Backend: `http://localhost:7342`

## How It Works

1. **Connect Wallet**: Use RainbowKit to connect to 0G Testnet
2. **Aggregate Portfolio**: Octav API fetches multi-chain asset data
3. **Create Profile**: 5-step wizard generates llms.txt format profile
4. **Upload to 0G**: Profile stored on 0G Storage with Merkle verification
5. **Mint Identity NFT**: Soulbound NFT links on-chain identity to stored profile
6. **AI Access**: Any AI agent can retrieve profile using the NFT's root hash

## 0G Network Details

- **Chain ID**: 16602
- **RPC**: https://evmrpc-testnet.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai
- **Storage Indexer**: https://indexer-storage-testnet-turbo.0g.ai
- **Faucet**: https://faucet.0g.ai

## Smart Contract

**HoudiniIdentityNFT** (0G Testnet)
**Contract**: [`0x116938bFd313667f9beFCB762CeD66445b62dC65`](https://chainscan-galileo.0g.ai/address/0x116938bfd313667f9befcb762ced66445b62dc65)

Features:
- Soulbound (non-transferable)
- Multiple identity types (Personal/Project/DAO)
- Updatable metadata (0G root hash)
- On-chain storage

## Project Structure

```
arjantin/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   └── utils/              # 0G Storage & utilities
├── backend/                # Fastify API server
│   └── src/routes/         # Octav proxy endpoints
├── hardhat/                # Smart contracts
│   ├── contracts/          # Solidity files
│   └── test/               # Contract tests
└── erc7730/                # Ledger Clear Signing metadata
```

## Development Status

✅ **Phase 1-4 Complete**:
- Wallet connection & onboarding
- Portfolio aggregation via Octav
- LLMs.txt profile generator
- 0G Storage integration
- Soulbound Identity NFTs

⏳ **Phase 5 (In Progress)**:
- ERC-7730 metadata created
- Submitted to Ledger registry ([PR #1978](https://github.com/LedgerHQ/clear-signing-erc7730-registry/pull/1978))

## Links

- [0G Network Docs](https://docs.0g.ai)
- [Octav API Docs](https://docs.octav.fi)
- [ERC-7730 Standard](https://ethereum-magicians.org/t/erc-7730-readable-transaction-formats/19691)
- [Ledger Developer Portal](https://developers.ledger.com)
- [RainbowKit](https://www.rainbowkit.com)

---

Built for the Web3 AI ecosystem
