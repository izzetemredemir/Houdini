import React from 'react';
import type { ProfileType } from '../../types/llmsTxt';

interface BasicInfoStepProps {
  profileType: ProfileType | null;
  description: string;
  projectName: string;
  onProfileTypeChange: (type: ProfileType) => void;
  onDescriptionChange: (description: string) => void;
  onProjectNameChange: (name: string) => void;
}

export function BasicInfoStep({
  profileType,
  description,
  projectName,
  onProfileTypeChange,
  onDescriptionChange,
  onProjectNameChange,
}: BasicInfoStepProps) {
  const profileTypes: ProfileType[] = ['Personal', 'Project', 'DAO or Community'];
  const maxDescriptionLength = 280;
  const remainingChars = maxDescriptionLength - description.length;

  return (
    <div className="basic-info-step">
      <h3>Basic Profile Information</h3>
      <p className="step-description">
        Let's start with the fundamentals of your Web3 profile.
      </p>

      {/* Profile Type Selector */}
      <div className="form-group">
        <label className="form-label">
          Profile Type <span className="required">*</span>
        </label>
        <div className="profile-type-selector">
          {profileTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`profile-type-option ${
                profileType === type ? 'selected' : ''
              }`}
              onClick={() => onProfileTypeChange(type)}
            >
              <div className="option-icon">
                {type === 'Personal' && '👤'}
                {type === 'Project' && '🚀'}
                {type === 'DAO or Community' && '🏛️'}
              </div>
              <div className="option-label">{type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Name (conditional) */}
      {(profileType === 'Project' || profileType === 'DAO or Community') && (
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">
            {profileType === 'Project' ? 'Project Name' : 'Organization Name'}
          </label>
          <input
            id="project-name"
            type="text"
            className="form-input"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder={`Enter ${profileType === 'Project' ? 'project' : 'organization'} name...`}
          />
        </div>
      )}

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Profile Description <span className="required">*</span>
        </label>
        <p className="field-hint">
          Who are you or what does this address represent? This is how AI will understand your profile.
        </p>
        <textarea
          id="description"
          className="form-textarea"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="E.g., DeFi enthusiast and protocol contributor focused on building decentralized infrastructure..."
          rows={4}
          maxLength={maxDescriptionLength}
        />
        <div className="char-counter">
          <span className={remainingChars < 20 ? 'warning' : ''}>
            {remainingChars} characters remaining
          </span>
        </div>
      </div>

      {/* Help Text */}
      <div className="help-text">
        <p>
          <strong>Tip:</strong> A good description should be concise but informative.
          Think about what an AI agent would need to know to understand your role in Web3.
        </p>
      </div>
    </div>
  );
}
