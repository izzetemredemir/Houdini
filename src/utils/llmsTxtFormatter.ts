/**
 * Utility functions to format LLMsTxtProfile data into llms.txt text format
 * and parse llms.txt content back into structured data
 */

import type { LLMsTxtProfile, ImportantToken, NFTCollection } from '../types/llmsTxt';

/**
 * Formats a LLMsTxtProfile object into llms.txt text format
 */
export function formatToLLMsTxt(profile: LLMsTxtProfile): string {
  const sections: string[] = [];

  // Header
  sections.push('# LLMs.txt - Web3 Profile\n');

  // Required Information
  sections.push('## Required Information');
  sections.push(`Wallet Address: ${profile.walletAddress}`);
  sections.push(`Profile Type: ${profile.profileType}`);
  sections.push(`Description: ${profile.description}`);
  sections.push(`Networks: ${profile.networks.join(', ')}`);
  sections.push(`Last Updated: ${profile.timestamp}\n`);

  // Identity & Links (only if any fields are present)
  const hasIdentity = profile.ensName || profile.website || profile.projectName ||
                      (profile.socialLinks && Object.keys(profile.socialLinks).length > 0);

  if (hasIdentity) {
    sections.push('## Identity & Links');

    if (profile.ensName) {
      sections.push(`ENS: ${profile.ensName}`);
    }

    if (profile.projectName) {
      sections.push(`Project: ${profile.projectName}`);
    }

    if (profile.website) {
      sections.push(`Website: ${profile.website}`);
    }

    if (profile.socialLinks) {
      const { twitter, farcaster, github, discord, telegram } = profile.socialLinks;

      if (twitter) {
        sections.push(`Twitter: ${twitter.startsWith('@') ? twitter : '@' + twitter}`);
      }
      if (farcaster) {
        sections.push(`Farcaster: ${farcaster.startsWith('@') ? farcaster : '@' + farcaster}`);
      }
      if (github) {
        sections.push(`GitHub: ${github}`);
      }
      if (discord) {
        sections.push(`Discord: ${discord}`);
      }
      if (telegram) {
        sections.push(`Telegram: ${telegram}`);
      }
    }

    sections.push('');
  }

  // Portfolio Activity (high-level summary, no balances)
  if (profile.portfolioActivity) {
    const pa = profile.portfolioActivity;
    sections.push('## Portfolio Activity');

    if (pa.activeNetworks.length > 0) {
      sections.push(`Active on: ${pa.activeNetworks.join(', ')}`);
    }

    if (pa.primaryFocus.length > 0) {
      sections.push(`Primary focus: ${pa.primaryFocus.join(' and ')}`);
    }

    if (pa.portfolioType) {
      sections.push(`Portfolio type: ${pa.portfolioType}`);
    }

    if (pa.selectedAssets.length > 0) {
      sections.push(`Key holdings: ${pa.selectedAssets.join(', ')}`);
    }

    sections.push('');
  }

  // Important Tokens
  if (profile.importantTokens && profile.importantTokens.length > 0) {
    sections.push('## Important Tokens');

    profile.importantTokens.forEach((token: ImportantToken) => {
      const note = token.note ? ` - ${token.note}` : '';
      sections.push(`- ${token.symbol} (${token.network})${note}`);
    });

    sections.push('');
  }

  // NFT Collections
  if (profile.nftCollections && profile.nftCollections.length > 0) {
    sections.push('## NFT Collections');

    profile.nftCollections.forEach((nft: NFTCollection) => {
      const useCase = nft.useCase ? ` - ${nft.useCase}` : '';
      sections.push(`- ${nft.name} (${nft.contractAddress})${useCase}`);
    });

    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Parses llms.txt content back into a LLMsTxtProfile object
 * This is a basic parser - can be enhanced for more robust parsing
 */
export function parseFromLLMsTxt(content: string): Partial<LLMsTxtProfile> {
  const lines = content.split('\n').map(line => line.trim());
  const profile: Partial<LLMsTxtProfile> = {
    importantTokens: [],
    nftCollections: [],
    socialLinks: {},
    portfolioActivity: {
      activeNetworks: [],
      primaryFocus: [],
      portfolioType: '',
      selectedAssets: []
    }
  };

  let currentSection = '';

  for (const line of lines) {
    // Skip empty lines and headers
    if (!line || line.startsWith('#')) {
      if (line.startsWith('##')) {
        currentSection = line.substring(2).trim().toLowerCase();
      }
      continue;
    }

    // Parse key-value pairs
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const lowerKey = key.trim().toLowerCase();

      switch (lowerKey) {
        case 'wallet address':
          profile.walletAddress = value;
          break;
        case 'profile type':
          profile.profileType = value as any;
          break;
        case 'description':
          profile.description = value;
          break;
        case 'networks':
          profile.networks = value.split(',').map(n => n.trim());
          break;
        case 'last updated':
          profile.timestamp = value;
          break;
        case 'ens':
          profile.ensName = value;
          break;
        case 'project':
          profile.projectName = value;
          break;
        case 'website':
          profile.website = value;
          break;
        case 'twitter':
          if (!profile.socialLinks) profile.socialLinks = {};
          profile.socialLinks.twitter = value;
          break;
        case 'farcaster':
          if (!profile.socialLinks) profile.socialLinks = {};
          profile.socialLinks.farcaster = value;
          break;
        case 'github':
          if (!profile.socialLinks) profile.socialLinks = {};
          profile.socialLinks.github = value;
          break;
        case 'discord':
          if (!profile.socialLinks) profile.socialLinks = {};
          profile.socialLinks.discord = value;
          break;
        case 'telegram':
          if (!profile.socialLinks) profile.socialLinks = {};
          profile.socialLinks.telegram = value;
          break;
        case 'active on':
          if (profile.portfolioActivity) {
            profile.portfolioActivity.activeNetworks = value.split(',').map(n => n.trim());
          }
          break;
        case 'primary focus':
          if (profile.portfolioActivity) {
            profile.portfolioActivity.primaryFocus = value.split(' and ').map(n => n.trim());
          }
          break;
        case 'portfolio type':
          if (profile.portfolioActivity) {
            profile.portfolioActivity.portfolioType = value;
          }
          break;
        case 'key holdings':
          if (profile.portfolioActivity) {
            profile.portfolioActivity.selectedAssets = value.split(',').map(n => n.trim());
          }
          break;
      }
    }

    // Parse list items (tokens and NFTs)
    if (line.startsWith('-')) {
      const content = line.substring(1).trim();

      if (currentSection.includes('important tokens')) {
        // Parse token: "SYMBOL (Network) - Note"
        const match = content.match(/^(.+?)\s*\((.+?)\)(?:\s*-\s*(.+))?$/);
        if (match) {
          const [, symbol, network, note] = match;
          profile.importantTokens?.push({
            name: symbol.trim(),
            symbol: symbol.trim(),
            network: network.trim(),
            note: note?.trim()
          });
        }
      } else if (currentSection.includes('nft collections')) {
        // Parse NFT: "Name (Address) - UseCase"
        const match = content.match(/^(.+?)\s*\((.+?)\)(?:\s*-\s*(.+))?$/);
        if (match) {
          const [, name, address, useCase] = match;
          profile.nftCollections?.push({
            name: name.trim(),
            contractAddress: address.trim(),
            useCase: useCase?.trim()
          });
        }
      }
    }
  }

  return profile;
}

/**
 * Downloads llms.txt content as a file
 */
export function downloadLLMsTxt(content: string, filename: string = 'llms.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies content to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
