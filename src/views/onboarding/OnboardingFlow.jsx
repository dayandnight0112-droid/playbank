import React, { useState } from 'react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import GameIntroView from './GameIntroView';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow
 * Master coordinator for PlayBank Onboarding.
 * Step 2: Clean Welcome Screen.
 * Step 3: Scrollable Duolingo-style Game Introduction.
 */
const OnboardingFlow = ({ onComplete, onOpenLogin }) => {
  // Current step in onboarding: 'welcome' | 'intro' | 'age' | 'celebration'
  const [currentStep, setCurrentStep] = useState('welcome');
  const [speechText, setSpeechText] = useState('一起来冒险吧！🐾');

  // Check if player has existing saved progress
  const hasExistingProgress = !!(
    mockDb.getCurrentSession() ||
    (mockDb.getGuestProfile() && mockDb.getGuestProfile().tutorialComplete)
  );

  const handleStart = () => {
    // Advance to Step 3 (Game Introduction)
    setCurrentStep('intro');
  };

  const handleFinishOnboarding = () => {
    mockDb.setOnboardingComplete(true);
    if (onComplete) onComplete();
  };

  // Step 3: Game Introduction Screen
  if (currentStep === 'intro') {
    return (
      <GameIntroView
        onNext={() => setCurrentStep('age')}
        onBack={() => setCurrentStep('welcome')}
      />
    );
  }

  // Ready for Step 4 (Age Selection)
  if (currentStep === 'age') {
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
          Step 4：年龄选择就绪
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>
          游戏介绍已成功浏览，等待执行 Step 4
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setCurrentStep('intro')}
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
            ← 返回游戏介绍
          </button>
          <button
            onClick={handleFinishOnboarding}
            style={{
              padding: '10px 20px',
              borderRadius: '14px',
              border: '2px solid #000',
              background: 'var(--brand-primary, #FFBC00)',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 3px 0 #000'
            }}
          >
            进入大厅 ▶
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Welcome Screen
  return (
    <div
      className="onboarding-flow-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E1 45%, #FEF3C7 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px calc(28px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Radial Golden Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          height: '560px',
          background: 'radial-gradient(circle, rgba(255, 188, 0, 0.22) 0%, rgba(255, 188, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Header: Official Logo + Slogan */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: '8px'
        }}
      >
        <img
          src="/playbanklogo.png"
          alt="PlayBank Logo"
          style={{
            height: '46px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '10px',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))'
          }}
        />

        {/* Short Slogan Pill: Learn. Play. Level Up. */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '9999px',
            padding: '5px 16px'
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#1F2937',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            Learn. Play. Level Up.
          </span>
        </div>
      </header>

      {/* Center Stage: PlayBank Tiger Mascot (Welcoming Waving Pose) */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0'
        }}
      >
        <PlayBankMascot
          variant="wave"
          size={230}
          speechBubble={speechText}
          interactive={true}
          onClick={() => {
            const bubbles = [
              '一起来冒险吧！🐾',
              '答题升级，冲向巅峰！⚡',
              '挑战 Boss 拿金币！🪙',
              '出发！准备好了吗？🎉'
            ];
            const next = bubbles[(bubbles.indexOf(speechText) + 1) % bubbles.length];
            setSpeechText(next);
          }}
        />
      </main>

      {/* Bottom Action Area: GET STARTED / CONTINUE + 4-letter "已有账户" Button */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* Main CTA: GET STARTED (or CONTINUE for existing players) */}
        <PrimaryButton
          onClick={handleStart}
          size="large"
          variant="primary"
          style={{ width: '100%' }}
        >
          {hasExistingProgress ? 'CONTINUE' : 'GET STARTED'}
        </PrimaryButton>

        {/* 4-character Button: "已有账户" */}
        <button
          type="button"
          className="account-login-btn"
          onClick={() => {
            if (onOpenLogin) onOpenLogin();
          }}
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: 900,
            color: '#000000',
            cursor: 'pointer',
            boxShadow: '0 4px 0 #000000',
            transition: 'transform 0.08s ease, box-shadow 0.08s ease',
            outline: 'none',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(3px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #000000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 0 #000000';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'translateY(3px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #000000';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 0 #000000';
          }}
        >
          已有账户
        </button>
      </footer>
    </div>
  );
};

export default OnboardingFlow;
