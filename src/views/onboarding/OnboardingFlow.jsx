import React, { useState } from 'react';
import WelcomeLandingView from './WelcomeLandingView';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank 11-step Duolingo-style Onboarding.
 * Step 1: WelcomeLandingView (Hero + Scrollable Game Introduction Cards + "已有账户")
 * Steps 2-10: Guided questionnaire with PB mascot
 * Step 11: Part A Tutorial Game trial
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

  const handleStart = () => {
    // Step 1 completed -> Proceed to Step 2 (Age Selection)
    setCurrentStep('step2_age');
  };

  const handleFinishOnboarding = () => {
    mockDb.setOnboardingComplete(true);
    if (onComplete) onComplete(userProfileData);
  };

  // Step 2 placeholder (Ready for Step 2 instruction)
  if (currentStep === 'step2_age') {
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
        <PlayBankMascot variant="stand" size={180} speechBubble="How old are you? 🐾" />
        <h2 style={{ fontSize: '22px', fontWeight: 900, marginTop: '20px', marginBottom: '8px' }}>
          第 2 步：年龄选择就绪
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          第 1 步（欢迎页与游戏介绍一体化）已顺利完成，等待执行第 2 步
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentStep('welcome')}
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
            ← 返回欢迎页
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

  // Step 1: Duolingo-style unified Welcome Landing View
  return (
    <WelcomeLandingView
      onStart={handleStart}
      onOpenLogin={onOpenLogin}
      hasExistingProgress={hasExistingProgress}
    />
  );
};

export default OnboardingFlow;
