import React, { useState } from 'react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';

/**
 * OnboardingFlow (Step 2.1 Mascot Animation Showcase & Welcome Screen)
 * Displays PlayBank Tiger Mascot with 2-Frame Run & Cheer Animations + Welcome CTAs.
 */
const OnboardingFlow = ({ onComplete, onOpenLogin }) => {
  // Active animation pose: 'wave' | 'run' | 'cheer' | 'stand'
  const [activePose, setActivePose] = useState('wave');
  const [bubbleText, setBubbleText] = useState('Welcome to PlayBank! 🐾');

  const poses = [
    { id: 'wave', label: '👋 迎宾招手', bubble: '欢迎来到 PlayBank！' },
    { id: 'run', label: '🏃 极速奔跑 (双帧)', bubble: '冲冲冲！一起去冒险！' },
    { id: 'cheer', label: '🎉 胜利欢呼 (双帧)', bubble: '太棒了！冒险就要开始啦！' },
    { id: 'stand', label: '🧍 准备待机', bubble: '随时准备出发！' }
  ];

  const handleSelectPose = (p) => {
    setActivePose(p.id);
    setBubbleText(p.bubble);
  };

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
        background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E1 50%, #FEF3C7 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Subtle Radial Sunburst */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          height: '560px',
          background: 'radial-gradient(circle, rgba(255, 188, 0, 0.22) 0%, rgba(255, 188, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Section: PlayBank Official Logo & Slogan */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <img
          src="/playbanklogo.png"
          alt="PlayBank Logo"
          style={{
            height: '42px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '8px',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '9999px',
            padding: '4px 14px'
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#374151',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            Learn. Play. Level Up.
          </span>
        </div>
      </div>

      {/* Center Section: PlayBank Tiger Mascot with Animation Switcher */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0'
        }}
      >
        <PlayBankMascot
          variant={activePose}
          size={230}
          speechBubble={bubbleText}
          interactive={true}
        />

        {/* Animation Pose Switcher Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '20px',
            maxWidth: '340px'
          }}
        >
          {poses.map((p) => {
            const isSelected = activePose === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPose(p)}
                style={{
                  background: isSelected ? 'var(--brand-primary, #FFBC00)' : '#FFFFFF',
                  color: '#000000',
                  border: `2px solid ${isSelected ? '#000000' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 3px 0 #000000' : '0 2px 4px rgba(0,0,0,0.05)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', fontWeight: 600 }}>
          💡 点击小老虎或上方按钮切换双帧连贯动作
        </span>
      </div>

      {/* Bottom Section: GET STARTED + 4-letter "已有账户" Button */}
      <div
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
        {/* Main CTA Button */}
        <PrimaryButton
          onClick={handleFinishOnboarding}
          size="large"
          variant="primary"
          style={{ width: '100%' }}
        >
          GET STARTED
        </PrimaryButton>

        {/* 4-character Button as requested: "已有账户" */}
        <button
          onClick={() => {
            if (onOpenLogin) onOpenLogin();
          }}
          style={{
            background: 'transparent',
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 900,
            color: '#111827',
            cursor: 'pointer',
            boxShadow: '0 3px 0 #000000',
            transition: 'transform 0.08s ease, box-shadow 0.08s ease',
            outline: 'none',
            letterSpacing: '0.5px'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #000000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 3px 0 #000000';
          }}
        >
          已有账户
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
