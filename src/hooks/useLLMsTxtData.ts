/**
 * Custom hook to aggregate Octav portfolio data for LLMs.txt generation
 */

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useOctavPortfolio } from './useOctavPortfolio';
import type { ImportantToken, PortfolioActivity } from '../types/llmsTxt';

export interface LLMsTxtAggregatedData {
  // Wallet info
  walletAddress: string;

  // Network data
  activeNetworks: string[];

  // Portfolio activity (high-level summary)
  portfolioActivity: PortfolioActivity | null;

  // Token data
  topTokens: ImportantToken[];
  allTokens: ImportantToken[];

  // Loading states
  isLoading: boolean;
  hasPortfolio: boolean;
}

export function useLLMsTxtData(address: Address | undefined): LLMsTxtAggregatedData {
  const octavPortfolio = useOctavPortfolio(address);

  const aggregatedData = useMemo(() => {
    const walletAddress = address || '';

    console.log('[LLMsTxtData] Aggregating portfolio data for:', walletAddress);

    // Extract active networks from portfolio
    const activeNetworks: string[] = [];
    const chainsByValue: { name: string; value: number }[] = [];

    if (octavPortfolio.portfolio?.chains) {
      octavPortfolio.portfolio.chains.forEach(chain => {
        const value = parseFloat(chain.value);
        if (value > 0) {
          activeNetworks.push(chain.name);
          chainsByValue.push({ name: chain.name, value });
        }
      });
      console.log('[LLMsTxtData] Active networks detected:', activeNetworks);
    }

    // Calculate primary focus (top 2-3 networks by value)
    const primaryFocus = chainsByValue
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(chain => chain.name);

    // Extract all tokens from portfolio (WITHOUT values in notes)
    const allTokens: ImportantToken[] = [];
    if (octavPortfolio.portfolio?.allTokens) {
      octavPortfolio.portfolio.allTokens.forEach(token => {
        const valueUsd = parseFloat(token.valueUsd);

        // Only include tokens with value > $1
        if (valueUsd > 1) {
          allTokens.push({
            name: token.name,
            symbol: token.symbol,
            network: token.chain,
            note: '' // No value information
          });
        }
      });
      console.log('[LLMsTxtData] Tokens extracted:', allTokens.length, 'tokens with value > $1');
    }

    // Get top 10 tokens by value
    const topTokens = allTokens.slice(0, 10);

    // Calculate portfolio type based on diversity
    let portfolioType = 'Web3 participant';
    if (activeNetworks.length >= 3) {
      portfolioType = 'Multi-chain participant';
    } else if (octavPortfolio.portfolio?.protocols && octavPortfolio.portfolio.protocols.length > 0) {
      portfolioType = 'DeFi protocol participant';
    }
    if (allTokens.length > 10) {
      portfolioType = 'Multi-protocol ' + portfolioType.toLowerCase();
    }

    // Create portfolio activity summary
    const portfolioActivity: PortfolioActivity | null = activeNetworks.length > 0 ? {
      activeNetworks,
      primaryFocus,
      portfolioType,
      selectedAssets: topTokens.map(t => t.symbol)
    } : null;

    return {
      walletAddress,
      activeNetworks,
      portfolioActivity,
      topTokens,
      allTokens,
      isLoading: octavPortfolio.isLoading,
      hasPortfolio: !!octavPortfolio.portfolio,
    };
  }, [address, octavPortfolio]);

  return aggregatedData;
}
