import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import CountUp from 'react-countup'
import { MultiStepOnboarding } from './components/MultiStepOnboarding'
import { Portfolio } from './pages/Portfolio'
import { StorageRecords } from './pages/StorageRecords'
import { MyIdentities } from './pages/MyIdentities'
import { LLMsTxtModal } from './components/LLMsTxtGenerator/LLMsTxtModal'
import { getUserProfile, getDisplayInfo } from './utils/userProfile'
import { MOCK_GLOBAL_STATS, getDemoMode, toggleDemoMode } from './mocks/demoData'
import './App.css'

type Page = 'home' | 'portfolio' | 'storage' | 'identities'

function App() {
  const { isConnected, address } = useAccount()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [displayInfo, setDisplayInfo] = useState<{ name: string; avatar: string | null } | null>(null)
  const [showLLMsTxtGenerator, setShowLLMsTxtGenerator] = useState(false)
  const [demoMode, setDemoMode] = useState(getDemoMode())

  const handleToggleDemoMode = () => {
    const newMode = toggleDemoMode()
    setDemoMode(newMode)
    // Reload the page to apply demo mode changes
    window.location.reload()
  }

  // Check if onboarding was already completed for this address
  useEffect(() => {
    if (address) {
      const userProfile = getUserProfile(address)
      if (userProfile) {
        setOnboardingCompleted(true)
        setShowOnboarding(false)
        setDisplayInfo(getDisplayInfo(address))
      }
    }
  }, [address])

  // Show onboarding modal when wallet connects
  useEffect(() => {
    if (isConnected && address && !onboardingCompleted) {
      setShowOnboarding(true)
    }
  }, [isConnected, address, onboardingCompleted])

  const handleOnboardingComplete = () => {
    if (address) {
      setDisplayInfo(getDisplayInfo(address))
    }
    setOnboardingCompleted(true)
    setShowOnboarding(false)
  }

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
          <img
            src="https://ethglobal.b-cdn.net/organizations/g8xu4/square-logo/default.png"
            alt="0G Logo"
            className="og-logo"
          />
          <h2>Houdini</h2>
        </div>
        <div className="navbar-menu">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentPage === 'portfolio' ? 'active' : ''}`}
            onClick={() => setCurrentPage('portfolio')}
          >
            Portfolio
          </button>
          <button
            className={`nav-link ${currentPage === 'storage' ? 'active' : ''}`}
            onClick={() => setCurrentPage('storage')}
          >
            Storage Records
          </button>
          <button
            className={`nav-link ${currentPage === 'identities' ? 'active' : ''}`}
            onClick={() => setCurrentPage('identities')}
          >
            My Identities
          </button>
          <button
            className={`demo-toggle ${demoMode ? 'active' : ''}`}
            onClick={handleToggleDemoMode}
            title={demoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
          >
            {demoMode ? '🎭 Demo ON' : '🎭 Demo'}
          </button>
          <div className="navbar-connect">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'home' && (
        <div className="home-page">
          {/* Hero Section */}
          <section className="hero-section animate-fadeIn">
            <div className="hero-gradient"></div>
            <div className="hero-content">
              <h1 className="hero-title animate-slideUp">
                AI-Readable Profiles for Web3
              </h1>
              <p className="hero-subtitle animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Create standardized llms.txt profiles stored on 0G Network.<br />
                Make your identity readable for AI agents.
              </p>
              <div className="hero-buttons animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <ConnectButton />
                {isConnected && (
                  <button className="secondary-cta" onClick={() => setCurrentPage('portfolio')}>
                    View Portfolio
                  </button>
                )}
              </div>

              {/* Code Preview */}
              <div className="code-preview animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <div className="code-header">
                  <span className="code-title">llms.txt</span>
                  <span className="code-badge">Standard Format</span>
                </div>
                <pre className="code-content">
{`# Houdini Profile

> Web3 Developer & DeFi Enthusiast

## Networks
- 0G Network (Primary)
- Ethereum, Base, Polygon

## Social
- GitHub: @houdini
- Twitter: @houdini_web3

Stored on 0G with Merkle-proof verification ✓`}
                </pre>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="features-section">
            <div className="features-grid">
              <div className="feature-card animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <div className="feature-icon">🌐</div>
                <h3>Decentralized Storage</h3>
                <p>Your profiles are stored on 0G Network, ensuring permanence and censorship resistance.</p>
              </div>
              <div className="feature-card animate-slideUp" style={{ animationDelay: '0.5s' }}>
                <div className="feature-icon">🤖</div>
                <h3>AI-Compatible</h3>
                <p>Standardized llms.txt format makes your identity readable by AI agents and LLMs.</p>
              </div>
              <div className="feature-card animate-slideUp" style={{ animationDelay: '0.6s' }}>
                <div className="feature-icon">✓</div>
                <h3>Verifiable Identity</h3>
                <p>Merkle-proof verification ensures your profile hasn't been tampered with.</p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="how-it-works-section">
            <h2 className="section-title animate-slideUp">How It Works</h2>
            <div className="steps-grid">
              <div className="step animate-slideUp" style={{ animationDelay: '0.7s' }}>
                <div className="step-number">1</div>
                <h3>Connect Wallet</h3>
                <p>Connect your Web3 wallet to get started</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step animate-slideUp" style={{ animationDelay: '0.8s' }}>
                <div className="step-number">2</div>
                <h3>Create Profile</h3>
                <p>Generate your llms.txt identity in 5 simple steps</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step animate-slideUp" style={{ animationDelay: '0.9s' }}>
                <div className="step-number">3</div>
                <h3>Upload to 0G</h3>
                <p>Store your profile on decentralized storage</p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card animate-scaleIn" style={{ animationDelay: '1s' }}>
                <div className="stat-number">
                  <CountUp end={MOCK_GLOBAL_STATS.totalProfiles} duration={2.5} separator="," />
                </div>
                <div className="stat-label">Profiles Created</div>
              </div>
              <div className="stat-card animate-scaleIn" style={{ animationDelay: '1.1s' }}>
                <div className="stat-number">
                  <CountUp end={MOCK_GLOBAL_STATS.totalStorageSize} duration={2.5} />
                  <span className="stat-unit">TB</span>
                </div>
                <div className="stat-label">On 0G Storage</div>
              </div>
              <div className="stat-card animate-scaleIn" style={{ animationDelay: '1.2s' }}>
                <div className="stat-number">
                  <CountUp end={MOCK_GLOBAL_STATS.totalChains} duration={2.5} />
                  <span className="stat-unit">+</span>
                </div>
                <div className="stat-label">Supported Chains</div>
              </div>
              <div className="stat-card animate-scaleIn" style={{ animationDelay: '1.3s' }}>
                <div className="stat-number">
                  <CountUp end={MOCK_GLOBAL_STATS.aiAgentsConnected} duration={2.5} />
                </div>
                <div className="stat-label">AI Agents Connected</div>
              </div>
            </div>
          </section>

          {/* Quick Actions (if connected) */}
          {isConnected && onboardingCompleted && (
            <section className="quick-actions animate-fadeIn">
              <h2 className="section-title">Quick Actions</h2>
              <div className="action-buttons">
                <button className="portfolio-button" onClick={() => setCurrentPage('portfolio')}>
                  📊 View Portfolio
                </button>
                <button className="llms-txt-button" onClick={() => setShowLLMsTxtGenerator(true)}>
                  ✨ Generate Profile
                </button>
                <button className="identities-button" onClick={() => setCurrentPage('identities')}>
                  🎭 My Identities
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {currentPage === 'portfolio' && <Portfolio />}

      {currentPage === 'storage' && <StorageRecords />}

      {currentPage === 'identities' && <MyIdentities />}

      {showOnboarding && (
        <MultiStepOnboarding onComplete={handleOnboardingComplete} />
      )}

      {showLLMsTxtGenerator && (
        <LLMsTxtModal
          onClose={() => setShowLLMsTxtGenerator(false)}
          onNavigateToIdentities={() => {
            setShowLLMsTxtGenerator(false);
            setCurrentPage('identities');
          }}
        />
      )}
    </div>
  )
}

export default App
