import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { PortfolioDisplay } from './PortfolioDisplay'
import { LoadingStep } from './LoadingStep'
import { useOctavPortfolio } from '../hooks/useOctavPortfolio'
import { saveUserProfile, getUserProfile } from '../utils/userProfile'
import './MultiStepOnboarding.css'

interface MultiStepOnboardingProps {
  onComplete: () => void
}

type OnboardingStep = 'portfolio' | 'complete'

export function MultiStepOnboarding({ onComplete }: MultiStepOnboardingProps) {
  const { address } = useAccount()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('portfolio')
  const { portfolio, isLoading, error } = useOctavPortfolio(
    currentStep === 'portfolio' ? address : undefined
  )

  const handlePortfolioComplete = () => {
    // Save portfolio data to user profile
    if (address) {
      const existingProfile = getUserProfile(address)
      if (existingProfile) {
        saveUserProfile(address, {
          ...existingProfile,
          portfolioValue: portfolio?.totalValue,
          portfolioData: portfolio || undefined,
        })
      }
    }

    setCurrentStep('complete')
    onComplete()
  }

  const handleSkipPortfolio = () => {
    handlePortfolioComplete()
  }

  return (
    <div className="multi-step-onboarding">
      {/* Step Content */}
      {currentStep === 'portfolio' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h1>Your Portfolio</h1>
              <p className="modal-subtitle">Powered by Octav API</p>
            </div>

            <div className="modal-content">
              {isLoading && (
                <LoadingStep step={1} message="Fetching your portfolio from Octav..." totalSteps={1} />
              )}

              {error && (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h2>Unable to Load Portfolio</h2>
                  <p className="error-message">
                    {error.message}
                  </p>
                  <button onClick={handleSkipPortfolio} className="continue-button">
                    Skip for Now
                  </button>
                </div>
              )}

              {!isLoading && !error && portfolio && address && (
                <>
                  <PortfolioDisplay portfolio={portfolio} address={address} />
                  <button onClick={handlePortfolioComplete} className="continue-button">
                    Continue to App
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer">
              {!isLoading && !error && (
                <button onClick={handleSkipPortfolio} className="skip-button">
                  Skip Portfolio
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
