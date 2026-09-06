import React, { useState } from 'react';
import WelcomeLandingView from './WelcomeLandingView';
import Step2AgeView from './Step2AgeView';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank 11-step Duolingo-style Onboarding.
 * Step 1: WelcomeLandingView (Hero + Scrollable Game Introduction Cards + "已有账户")
 * Step 2: Step2AgeView (Age selection with Duolingo progress bar)
 * Step 3: PB Mascot Greeting ("你好呀，我是PB！")
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

  // Step 3 placeholder (Ready for Step 3: Mascot Greeting)
  if (currentStep === 'step3_greeting') {
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
        <PlayBankMascot variant="wave" size={200} speechBubble="你好呀，我是PB！🐾" />
        <h2 style={{ fontSize: '22px', fontWeight: 900, marginTop: '20px', marginBottom: '8px' }}>
          第 3 步就绪：PB 挥手打招呼
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          已选择年龄：<strong>{userProfileData.ageGroup?.label}</strong>，等待执行第 3 步
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentStep('step2_age')}
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
            ← 返回年龄选择
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
