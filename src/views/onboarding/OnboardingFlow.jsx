import React, { useState } from 'react';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank first-time user onboarding.
 * Flow: Welcome -> Game Introduction -> Age Selection -> Mascot Transition -> Home
 */
const OnboardingFlow = ({ onComplete, onOpenLogin }) => {
  // Sub-step: 'welcome' | 'intro' | 'age' | 'celebration'
  const [step, setStep] = useState('welcome');

  const handleFinishOnboarding = () => {
    mockDb.setOnboardingComplete(true);
    if (onComplete) onComplete();
  };

  return (
    <div
      className="onboarding-flow-container"
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Container ready for Step 2 Welcome Screen */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', textAlign: 'center', margin: 'auto' }}>
          <img
            src="/playbanklogo.png"
            alt="PlayBank"
            style={{ width: '160px', height: 'auto', marginBottom: '16px' }}
          />
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>
            Learn. Play. Level Up.
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            首次进入引导模块已成功建立 (Step 1 Ready)
          </p>
          <button
            className="onboarding-enter-btn"
            onClick={handleFinishOnboarding}
            style={{
              padding: '14px 28px',
              borderRadius: '16px',
              border: '3px solid #000',
              background: 'var(--brand-primary, #FFBC00)',
              color: '#000',
              fontWeight: 900,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 5px 0 #000'
            }}
          >
            ENTER HOME PAGE ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
