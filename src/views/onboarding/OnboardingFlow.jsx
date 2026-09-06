import React, { useState } from 'react';
import WelcomeLandingView from './WelcomeLandingView';
import Step2AgeView from './Step2AgeView';
import Step3GreetingView from './Step3GreetingView';
import Step4CommitmentView from './Step4CommitmentView';
import Step6AttributionView from './Step6AttributionView';
import Step7SubjectView from './Step7SubjectView';
import Step8AssessmentView from './Step8AssessmentView';
import Step9MotivationView from './Step9MotivationView';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank 11-step Duolingo-style Onboarding.
 * Step 1: WelcomeLandingView
 * Step 2: Step2AgeView
 * Step 3: Step3GreetingView
 * Step 4: Step4CommitmentView
 * Step 6: Step6AttributionView
 * Step 7: Step7SubjectView
 * Step 8: Step8AssessmentView
 * Step 9: Step9MotivationView ("学好这门科目，你就是这个科目的主宰！")
 * Step 10: Step10DailyGoalView ("来定个每日学习的目标吧！")
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

  const handleFinishOnboarding = () => {
    mockDb.setOnboardingComplete(true);
    if (onComplete) onComplete(userProfileData);
  };

  // Step 10 placeholder (Ready for Daily Goal Setting)
  if (currentStep === 'step10_daily_goal') {
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
        <PlayBankMascot variant="stand" size={180} speechBubble="来定个每日学习的目标吧！🐾" />
        <h2 style={{ fontSize: '22px', fontWeight: 900, marginTop: '20px', marginBottom: '8px' }}>
          第 10 步就绪：设定每日学习目标
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          激励已点燃，等待执行第 10 步（5/10/15/20分钟学习目标选择）
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentStep('step9_motivation')}
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
            ← 返回第 9 步
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

  // Step 9: Mastery Motivation
  if (currentStep === 'step9_motivation') {
    return (
      <Step9MotivationView
        selectedSubject={userProfileData.selectedSubject}
        onNext={() => setCurrentStep('step10_daily_goal')}
        onBack={() => setCurrentStep('step8_assessment')}
      />
    );
  }

  // Step 8: Subject Self-Assessment with Dynamic PB Reactions
  if (currentStep === 'step8_assessment') {
    return (
      <Step8AssessmentView
        selectedSubject={userProfileData.selectedSubject}
        initialProficiency={userProfileData.subjectProficiency}
        onNext={(proficiency) => {
          setUserProfileData(prev => ({ ...prev, subjectProficiency: proficiency }));
          setCurrentStep('step9_motivation');
        }}
        onBack={() => setCurrentStep('step7_subject')}
      />
    );
  }

  // Step 7: Goal Subject Selection
  if (currentStep === 'step7_subject') {
    return (
      <Step7SubjectView
        ageGroup={userProfileData.ageGroup}
        initialSubject={userProfileData.selectedSubject}
        onNext={(subject) => {
          setUserProfileData(prev => ({ ...prev, selectedSubject: subject }));
          setCurrentStep('step8_assessment');
        }}
        onBack={() => setCurrentStep('step6_attribution')}
      />
    );
  }

  // Step 6: Marketing Channel Attribution
  if (currentStep === 'step6_attribution') {
    return (
      <Step6AttributionView
        initialChannel={userProfileData.sourceChannel}
        onNext={(channel) => {
          setUserProfileData(prev => ({ ...prev, sourceChannel: channel }));
          setCurrentStep('step7_subject');
        }}
        onBack={() => setCurrentStep('step4_commitment')}
      />
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
