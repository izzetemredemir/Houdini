import React from 'react';
import type { SocialLinks } from '../../types/llmsTxt';

interface IdentityStepProps {
  website: string;
  socialLinks: SocialLinks;
  onWebsiteChange: (website: string) => void;
  onSocialLinksChange: (links: SocialLinks) => void;
}

export function IdentityStep({
  website,
  socialLinks,
  onWebsiteChange,
  onSocialLinksChange,
}: IdentityStepProps) {
  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    onSocialLinksChange({
      ...socialLinks,
      [platform]: value,
    });
  };

  return (
    <div className="identity-step">
      <h3>Identity & Social Links</h3>
      <p className="step-description">
        Add your Web3 identity and social presence for your 0G profile.
      </p>

      {/* Website */}
      <div className="form-group">
        <label className="form-label" htmlFor="website">
          Website
        </label>
        <input
          id="website"
          type="url"
          className="form-input"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="social-links-section">
        <h4>Social Links</h4>

        {/* Twitter */}
        <div className="form-group">
          <label className="form-label" htmlFor="twitter">
            <span className="social-icon">𝕏</span> Twitter / X
          </label>
          <div className="input-with-prefix">
            <span className="input-prefix">@</span>
            <input
              id="twitter"
              type="text"
              className="form-input with-prefix"
              value={socialLinks.twitter || ''}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              placeholder="username"
            />
          </div>
        </div>

        {/* Farcaster */}
        <div className="form-group">
          <label className="form-label" htmlFor="farcaster">
            <span className="social-icon">🟣</span> Farcaster
          </label>
          <div className="input-with-prefix">
            <span className="input-prefix">@</span>
            <input
              id="farcaster"
              type="text"
              className="form-input with-prefix"
              value={socialLinks.farcaster || ''}
              onChange={(e) => handleSocialChange('farcaster', e.target.value)}
              placeholder="username"
            />
          </div>
        </div>

        {/* GitHub */}
        <div className="form-group">
          <label className="form-label" htmlFor="github">
            <span className="social-icon">💻</span> GitHub
          </label>
          <input
            id="github"
            type="text"
            className="form-input"
            value={socialLinks.github || ''}
            onChange={(e) => handleSocialChange('github', e.target.value)}
            placeholder="username"
          />
        </div>

        {/* Discord */}
        <div className="form-group">
          <label className="form-label" htmlFor="discord">
            <span className="social-icon">💬</span> Discord
          </label>
          <input
            id="discord"
            type="url"
            className="form-input"
            value={socialLinks.discord || ''}
            onChange={(e) => handleSocialChange('discord', e.target.value)}
            placeholder="https://discord.gg/invite"
          />
        </div>

        {/* Telegram */}
        <div className="form-group">
          <label className="form-label" htmlFor="telegram">
            <span className="social-icon">✈️</span> Telegram
          </label>
          <input
            id="telegram"
            type="url"
            className="form-input"
            value={socialLinks.telegram || ''}
            onChange={(e) => handleSocialChange('telegram', e.target.value)}
            placeholder="https://t.me/username"
          />
        </div>
      </div>
    </div>
  );
}
