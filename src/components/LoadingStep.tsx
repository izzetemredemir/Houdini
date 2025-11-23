import React from 'react'
import './LoadingStep.css'

interface LoadingStepProps {
  step: number
  message: string
  totalSteps?: number
}

export function LoadingStep({ step, message, totalSteps = 3 }: LoadingStepProps) {
  return (
    <div className="loading-step">
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <div className="step-info">
        <p className="step-message">{message}</p>
        <div className="progress-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < step ? 'active' : ''}`}
            />
          ))}
        </div>
        <p className="step-counter">Step {step} of {totalSteps}</p>
      </div>
    </div>
  )
}
