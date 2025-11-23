/**
 * Mock data for demo mode
 * Use this for impressive hackathon presentations
 */

export interface MockPortfolioData {
  summary: {
    netWorth: number;
    dailyPnL: number;
    dailyPnLPercentage: number;
    cashBalance: number;
    totalOpenPositions: number;
    totalClosedPositions: number;
  };
  chains: Array<{
    chain: string;
    chainLogo: string;
    totalValue: number;
    assets: Array<{
      symbol: string;
      name: string;
      balance: number;
      valueUSD: number;
      logo?: string;
    }>;
  }>;
}

export interface MockIdentity {
  id: string;
  profileType: 'personal' | 'project' | 'dao';
  contentHash: string;
  og0RootHash: string;
  og0TxHash: string;
  timestamp: number;
  fileSize: number;
  name: string;
  description: string;
}

export interface MockStorageRecord {
  rootHash: string;
  txHash: string;
  timestamp: number;
  fileSize: number;
  status: 'confirmed' | 'pending';
}

// Rich portfolio mock data
export const MOCK_PORTFOLIO: MockPortfolioData = {
  summary: {
    netWorth: 47532.89,
    dailyPnL: 2847.32,
    dailyPnLPercentage: 6.37,
    cashBalance: 12450.50,
    totalOpenPositions: 8,
    totalClosedPositions: 24,
  },
  chains: [
    {
      chain: '0G Network',
      chainLogo: '🌐',
      totalValue: 15842.30,
      assets: [
        {
          symbol: 'OG',
          name: '0G Network',
          balance: 5420.5,
          valueUSD: 10842.30,
          logo: '🌐',
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: 5000,
          valueUSD: 5000,
        },
      ],
    },
    {
      chain: 'Ethereum',
      chainLogo: '⟠',
      totalValue: 18234.12,
      assets: [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 5.234,
          valueUSD: 15234.12,
        },
        {
          symbol: 'USDT',
          name: 'Tether',
          balance: 3000,
          valueUSD: 3000,
        },
      ],
    },
    {
      chain: 'Base',
      chainLogo: '🔵',
      totalValue: 8456.47,
      assets: [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 2.901,
          valueUSD: 8456.47,
        },
      ],
    },
    {
      chain: 'Polygon',
      chainLogo: '🟣',
      totalValue: 5000,
      assets: [
        {
          symbol: 'MATIC',
          name: 'Polygon',
          balance: 8234.5,
          valueUSD: 3250,
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: 1750,
          valueUSD: 1750,
        },
      ],
    },
  ],
};

// Mock identities/NFTs
export const MOCK_IDENTITIES: MockIdentity[] = [
  {
    id: '1',
    profileType: 'personal',
    contentHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    og0RootHash: 'abc123def456789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh',
    og0TxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    fileSize: 2048,
    name: 'Web3 Developer',
    description: 'Full-stack blockchain developer specializing in DeFi and NFTs',
  },
  {
    id: '2',
    profileType: 'project',
    contentHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    og0RootHash: 'def456789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh123456',
    og0TxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    fileSize: 3584,
    name: 'Houdini Protocol',
    description: 'AI-readable profiles for Web3 on 0G Network',
  },
  {
    id: '3',
    profileType: 'dao',
    contentHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    og0RootHash: '789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh123456789def',
    og0TxHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    fileSize: 4096,
    name: '0G Builders DAO',
    description: 'Community of builders on 0G Network',
  },
];

// Mock storage records
export const MOCK_STORAGE_RECORDS: MockStorageRecord[] = [
  {
    rootHash: 'abc123def456789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    fileSize: 2048,
    status: 'confirmed',
  },
  {
    rootHash: 'def456789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh123456',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    fileSize: 3584,
    status: 'confirmed',
  },
  {
    rootHash: '789ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh123456789def',
    txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    fileSize: 4096,
    status: 'confirmed',
  },
  {
    rootHash: 'ghijklmnop0123456789qrstuvwxyz01234567890abcdefgh123456789def456',
    txHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    fileSize: 1536,
    status: 'confirmed',
  },
  {
    rootHash: 'klmnop0123456789qrstuvwxyz01234567890abcdefgh123456789def456789ghi',
    txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
    fileSize: 2560,
    status: 'confirmed',
  },
];

// Global stats for home page
export const MOCK_GLOBAL_STATS = {
  totalProfiles: 1247,
  totalStorageSize: 523, // TB
  totalChains: 12,
  aiAgentsConnected: 89,
};

// Demo mode management
const DEMO_MODE_KEY = 'houdini_demo_mode';

export const getDemoMode = (): boolean => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

export const setDemoMode = (enabled: boolean): void => {
  localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
};

export const toggleDemoMode = (): boolean => {
  const currentMode = getDemoMode();
  const newMode = !currentMode;
  setDemoMode(newMode);
  return newMode;
};
