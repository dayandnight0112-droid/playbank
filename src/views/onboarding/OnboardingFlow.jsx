import React, { useState } from 'react';
import WelcomeLandingView from './WelcomeLandingView';
import Step2AgeView from './Step2AgeView';
import Step3GreetingView from './Step3GreetingView';
import Step4CommitmentView from './Step4CommitmentView';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank 11-step Duolingo-style Onboarding.
 * Step 1: WelcomeLandingView
 * Step 2: Step2AgeView
 * Step 3: Step3GreetingView
 * Step 4: Step4CommitmentView ("很高兴见到你，我会陪你学到中学")
 * Step 6: Step6AttributionView ("你是从哪里认识我们的？")
 */
const OnboardingFlow = ({ onComplete, onOpenLogin }) => {
  // Current step state in onboarding flow
  const [currentStep, setCurrentStep] = useState('welcome');
  // Collected onboarding answers for Step 2 - Step 10
  const [userProfileData, setUserProfileData] = useState({
    ageGroup: null,       // '7-9' | '10-12' | '13-15' | '16-17'
    sourceChannel: null,  // 'Facebook/Instagram' | 'Google' | 'Hero'
    selectedSubject: null,// e.g. '华文' | '数学' | ...
    subjectProficiency: null, // 'need_work' | 'beginner' | 'average' | 'good' | 'master'
    dailyGoalMinutes: 10  // 5 | 10 | 15 | 20
  });

  // Check if player has existing saved progress
  const hasExistingProgress = !!(
    mockDb.getCurrentSession() ||
    (mockDb.getGuestProfile() && mockDb.getGuestProfile().tutorialComplete)
  );

  const handleFinishOnboarding = () => {
    mockDb.setOnboardingComplete(true);
    if (onComplete) onComplete(userProfileData);
  };

  // Step 6 placeholder (Ready for Source Attribution)
  if (currentStep === 'step6_attribution') {
    return (
      <div
        className="onboarding-flow-container"
        style={{
          width: '100%',
          minHeight: '100dvh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <PlayBankMascot variant="stand" size={180} speechBubble="你是从哪里认识我们的？🐾" />
        <h2 style={{ fontSize: '22px', fontWeight: 900, marginTop: '20px', marginBottom: '8px' }}>
          第 6 步就绪：渠道来源选择
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          第 4 步（陪伴承诺）已顺利完成，等待执行第 6 步
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentStep('step4_commitment')}
            style={{
              padding: '10px 20px',
              borderRadius: '14px',
              border: '2px solid #000',
              background: '#F3F4F6',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← 返回第 4 步
          </button>
          <PrimaryButton
            onClick={handleFinishOnboarding}
            size="medium"
            variant="primary"
          >
            继续 ▶
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // Step 4: PB Mascot Commitment
  if (currentStep === 'step4_commitment') {
    return (
      <Step4CommitmentView
        onNext={() => setCurrentStep('step6_attribution')}
        onBack={() => setCurrentStep('step3_greeting')}
      />
    );
  }

  // Step 3: PB Mascot Greeting
  if (currentStep === 'step3_greeting') {
    return (
      <Step3GreetingView
        onNext={() => setCurrentStep('step4_commitment')}
        onBack={() => setCurrentStep('step2_age')}
      />
    );
  }

  // Step 2: Age Selection Screen
  if (currentStep === 'step2_age') {
    return (
      <Step2AgeView
        initialAge={userProfileData.ageGroup}
        onNext={(ageOption) => {
          setUserProfileData(prev => ({ ...prev, ageGroup: ageOption }));
          setCurrentStep('step3_greeting');
        }}
        onBack={() => setCurrentStep('welcome')}
      />
    );
  }

  // Step 1: Duolingo-style unified Welcome Landing View
  return (
    <WelcomeLandingView
      onStart={() => setCurrentStep('step2_age')}
      onOpenLogin={onOpenLogin}
      hasExistingProgress={hasExistingProgress}
    />
  );
};

export default OnboardingFlow;
