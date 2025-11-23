import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BasicInfoStep } from './BasicInfoStep';
import { NetworksStep } from './NetworksStep';
import { IdentityStep } from './IdentityStep';
import { PortfolioActivityStep } from './PortfolioActivityStep';
import { AssetsStep} from './AssetsStep';
import { EditorStep } from './EditorStep';
import { useLLMsTxtData } from '../../hooks/useLLMsTxtData';
import { formatToLLMsTxt } from '../../utils/llmsTxtFormatter';
import type { ProfileType, LLMsTxtProfile, ImportantToken, NFTCollection, SocialLinks, PortfolioActivity } from '../../types/llmsTxt';
import './LLMsTxtModal.css';

interface LLMsTxtModalProps {
  onClose: () => void;
  onNavigateToIdentities?: () => void;
}

const TOTAL_STEPS = 6;

export function LLMsTxtModal({ onClose, onNavigateToIdentities }: LLMsTxtModalProps) {
  const { address } = useAccount();
  const aggregatedData = useLLMsTxtData(address);

  const [currentStep, setCurrentStep] = useState(1);

  // Form data state
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [portfolioActivity, setPortfolioActivity] = useState<PortfolioActivity | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<ImportantToken[]>([]);
  const [nftCollections, setNFTCollections] = useState<NFTCollection[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');

  // Pre-fill data from aggregated sources
  useEffect(() => {
    if (!aggregatedData.isLoading) {
      console.log('[LLMsTxtModal] Pre-filling data from portfolio:', {
        activeNetworks: aggregatedData.activeNetworks,
        hasPortfolio: aggregatedData.hasPortfolio,
        topTokensCount: aggregatedData.topTokens.length,
        hasPortfolioActivity: !!aggregatedData.portfolioActivity
      });

      // Pre-fill networks
      if (aggregatedData.activeNetworks.length > 0 && selectedNetworks.length === 0) {
        setSelectedNetworks(aggregatedData.activeNetworks);
        console.log('[LLMsTxtModal] Networks pre-filled:', aggregatedData.activeNetworks);
      }

      // Pre-fill portfolio activity
      if (aggregatedData.portfolioActivity && !portfolioActivity) {
        setPortfolioActivity(aggregatedData.portfolioActivity);
        console.log('[LLMsTxtModal] Portfolio activity pre-filled:', aggregatedData.portfolioActivity);
      }
    }
  }, [aggregatedData]);

  // Generate content when moving to editor step
  useEffect(() => {
    if (currentStep === 6 && profileType && description) {
      console.log('[LLMsTxtModal] Generating llms.txt content for step 6');

      const profile: LLMsTxtProfile = {
        walletAddress: address || '',
        profileType,
        description,
        networks: selectedNetworks,
        timestamp: new Date().toISOString(),
        website: website || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        projectName: projectName || undefined,
        portfolioActivity: portfolioActivity || undefined,
        importantTokens: selectedTokens.length > 0 ? selectedTokens : undefined,
        nftCollections: nftCollections.filter(nft => nft.name && nft.contractAddress).length > 0
          ? nftCollections.filter(nft => nft.name && nft.contractAddress)
          : undefined,
      };

      console.log('[LLMsTxtModal] Profile data:', {
        profileType,
        networksCount: selectedNetworks.length,
        hasWebsite: !!website,
        socialLinksCount: Object.keys(socialLinks).length,
        hasPortfolioActivity: !!portfolioActivity,
        tokensCount: selectedTokens.length,
        nftCount: nftCollections.filter(nft => nft.name && nft.contractAddress).length
      });

      const content = formatToLLMsTxt(profile);
      setGeneratedContent(content);
      console.log('[LLMsTxtModal] Content generated, length:', content.length, 'characters');
    }
  }, [currentStep, profileType, description, selectedNetworks, website, socialLinks, projectName, portfolioActivity, selectedTokens, nftCollections, address]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profileType !== null && description.trim().length > 0;
      case 2:
        return selectedNetworks.length > 0;
      case 3:
      case 4:
      case 5:
        return true; // Optional steps
      case 6:
        return true;
      default:
        return false;
    }
  };

  const fillWithDummyData = () => {
    console.log('[LLMsTxtModal] Filling with dummy data');

    // Step 1: Basic Info
    setProfileType('Personal');
    setDescription('Web3 developer and DeFi enthusiast building on 0G Network. Active contributor to decentralized protocols and passionate about blockchain innovation.');
    setProjectName('');

    // Step 2: Networks
    setSelectedNetworks(['0G', 'Ethereum', 'Optimism', 'Polygon']);

    // Step 3: Identity
    setWebsite('https://houdini-web3.example.com');
    setSocialLinks({
      twitter: 'web3builder',
      farcaster: 'defidev',
      github: 'web3developer',
      discord: 'https://discord.gg/houdini-example',
      telegram: 'https://t.me/houdini_dev'
    });

    // Portfolio Activity (dummy data)
    setPortfolioActivity({
      activeNetworks: ['Ethereum', 'Optimism', 'Polygon', '0G'],
      primaryFocus: ['Ethereum', 'Layer 2 Solutions'],
      portfolioType: 'Multi-protocol DeFi participant',
      selectedAssets: ['ETH', 'USDC', 'WBTC', 'ARB', 'OP']
    });

    // Step 4: Assets (more realistic tokens)
    setSelectedTokens([
      {
        name: 'Ethereum',
        symbol: 'ETH',
        network: 'Ethereum',
        note: 'Primary asset and gas token'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        network: 'Ethereum',
        note: 'Stablecoin holdings'
      },
      {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        network: 'Ethereum',
        note: 'Bitcoin exposure on Ethereum'
      },
      {
        name: 'Arbitrum',
        symbol: 'ARB',
        network: 'Arbitrum',
        note: 'Layer 2 governance token'
      },
      {
        name: 'Optimism',
        symbol: 'OP',
        network: 'Optimism',
        note: 'Layer 2 governance token'
      }
    ]);

    // More realistic NFT collections
    setNFTCollections([
      {
        name: 'Bored Ape Yacht Club',
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        useCase: 'PFP'
      },
      {
        name: 'Azuki',
        contractAddress: '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
        useCase: 'PFP and community membership'
      },
      {
        name: 'Pudgy Penguins',
        contractAddress: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8',
        useCase: 'PFP'
      }
    ]);

    console.log('[LLMsTxtModal] Dummy data filled successfully');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Info';
      case 2:
        return 'Networks';
      case 3:
        return 'Identity';
      case 4:
        return 'Portfolio Activity';
      case 5:
        return 'Assets';
      case 6:
        return 'Review & Edit';
      default:
        return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container llms-txt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Generate LLMs.txt Profile</h2>
            <p className="header-subtitle">Create an AI-readable profile for your Web3 identity</p>
            <button
              className="fill-dummy-button"
              onClick={fillWithDummyData}
              title="Fill all fields with sample data"
            >
              🪄 Fill with Dummy Data
            </button>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className="step-progress-bar">
            <div
              className="step-progress-fill"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="step-dots">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`step-dot ${i + 1 === currentStep ? 'active' : ''} ${
                  i + 1 < currentStep ? 'completed' : ''
                }`}
              >
                {i + 1 < currentStep ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <div className="step-title">
            Step {currentStep} of {TOTAL_STEPS}: {getStepTitle()}
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {currentStep === 1 && (
            <BasicInfoStep
              profileType={profileType}
              description={description}
              projectName={projectName}
              onProfileTypeChange={setProfileType}
              onDescriptionChange={setDescription}
              onProjectNameChange={setProjectName}
            />
          )}

          {currentStep === 2 && (
            <NetworksStep
              detectedNetworks={aggregatedData.activeNetworks}
              selectedNetworks={selectedNetworks}
              onNetworksChange={setSelectedNetworks}
            />
          )}

          {currentStep === 3 && (
            <IdentityStep
              website={website}
              socialLinks={socialLinks}
              onWebsiteChange={setWebsite}
              onSocialLinksChange={setSocialLinks}
            />
          )}

          {currentStep === 4 && (
            <PortfolioActivityStep
              portfolioActivity={portfolioActivity}
              isLoading={aggregatedData.isLoading}
            />
          )}

          {currentStep === 5 && (
            <AssetsStep
              availableTokens={aggregatedData.topTokens}
              selectedTokens={selectedTokens}
              nftCollections={nftCollections}
              onTokensChange={setSelectedTokens}
              onNFTCollectionsChange={setNFTCollections}
            />
          )}

          {currentStep === 6 && profileType && (
            <EditorStep
              content={generatedContent}
              profileType={profileType}
              onContentChange={setGeneratedContent}
              onNavigateToIdentities={onNavigateToIdentities}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="modal-footer">
          <div className="footer-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="button secondary"
                onClick={handleBack}
              >
                ← Back
              </button>
            )}

            <div className="spacer" />

            {currentStep < TOTAL_STEPS && (
              <>
                {currentStep > 2 && (
                  <button
                    type="button"
                    className="button ghost"
                    onClick={handleNext}
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  className="button primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next →
                </button>
              </>
            )}

            {currentStep === TOTAL_STEPS && (
              <button
                type="button"
                className="button primary"
                onClick={onClose}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
