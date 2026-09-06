import React, { useState } from 'react';
import WelcomeLandingView from './WelcomeLandingView';
import Step2AgeView from './Step2AgeView';
import Step3GreetingView from './Step3GreetingView';
import Step4CommitmentView from './Step4CommitmentView';
import Step6AttributionView from './Step6AttributionView';
import Step7SubjectView from './Step7SubjectView';
import Step8AssessmentView from './Step8AssessmentView';
import Step9MotivationView from './Step9MotivationView';
import Step10DailyGoalView from './Step10DailyGoalView';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank 11-step Duolingo-style Onboarding.
 * Step 1: WelcomeLandingView (Hero + Scrollable Game Introduction Cards + "已有账户")
 * Step 2: Step2AgeView (Age selection with independent scrollable options)
 * Step 3: Step3GreetingView (PB Mascot wave: "你好呀，我是PB！")
 * Step 4: Step4CommitmentView (PB Mascot commitment: "很高兴见到你，我会陪你学到中学")
 * Step 6: Step6AttributionView (Source discovery: "你是从哪里认识我们的？")
 * Step 7: Step7SubjectView (Target subject dynamically matched to age)
 * Step 8: Step8AssessmentView (Subject self-assessment with real-time dynamic PB reaction)
 * Step 9: Step9MotivationView (Mastery motivation: "学好这门科目，你就是这个科目的主宰！")
 * Step 10: Step10DailyGoalView (Daily goal setting: 5/10/15/20 min)
 * Step 11: Seamless handoff to Part A Tutorial Game Screen
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
    dailyGoal: { minutes: 10, modeLabel: '正常模式' }
  });

  // Check if player has existing saved progress
  const hasExistingProgress = !!(
    mockDb.getCurrentSession() ||
    (mockDb.getGuestProfile() && mockDb.getGuestProfile().tutorialComplete)
  );

  // Step 10: Daily Learning Goal (Duolingo 1:1)
  // Completing Step 10 triggers Step 11 (Part A Tutorial Game Screen)
  if (currentStep === 'step10_daily_goal') {
    return (
      <Step10DailyGoalView
        initialGoalMinutes={userProfileData.dailyGoal?.minutes || 10}
        onNext={(goal) => {
          const finalData = { ...userProfileData, dailyGoal: goal };
          setUserProfileData(finalData);
          if (onComplete) {
            onComplete(finalData);
          }
        }}
        onBack={() => setCurrentStep('step9_motivation')}
      />
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
