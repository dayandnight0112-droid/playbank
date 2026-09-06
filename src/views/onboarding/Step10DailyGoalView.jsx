import React, { useState } from 'react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * Step10DailyGoalView
 * Duolingo-style Daily Learning Goal Setting Screen.
 * 1:1 match with reference design:
 *  - Top-left 3D circular back button
 *  - PB Mascot on the upper-left with speech bubble: "来定个每日学习的目标吧！"
 *  - 4 Options (Duration on left, Mode tag on right):
 *    1. 每天 5 分钟  | 休闲模式
 *    2. 每天 10 分钟 | 正常模式 (Default)
 *    3. 每天 15 分钟 | 好学模式
 *    4. 每天 20 分钟 | 密集模式
 *  - Sticky bottom "继续" button
 */
const Step10DailyGoalView = ({ onNext, onBack, initialGoalMinutes = 10 }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(initialGoalMinutes);

  const goalOptions = [
    {
      minutes: 5,
      durationLabel: '每天 5 分钟',
      modeLabel: '休闲模式',
      paceHint: '轻松保持每日学习连胜 🔥'
    },
    {
      minutes: 10,
      durationLabel: '每天 10 分钟',
      modeLabel: '正常模式',
      paceHint: '按这个节奏首周就能赢取丰厚 BP 🪙'
    },
    {
      minutes: 15,
      durationLabel: '每天 15 分钟',
      modeLabel: '好学模式',
      paceHint: '持续深化掌握核心知识点 📚'
    },
    {
      minutes: 20,
      durationLabel: '每天 20 分钟',
      modeLabel: '密集模式',
      paceHint: '全力备战冲刺，极速攀登排行榜 ⚡'
    }
  ];

  const currentOption = goalOptions.find(opt => opt.minutes === selectedMinutes) || goalOptions[1];

  const handleSelect = (minutes) => {
    playPunchyPopSound();
    setSelectedMinutes(minutes);
  };

  const handleContinue = () => {
    if (onNext) onNext(currentOption);
  };

  return (
    <div
      className="step10-daily-goal-container"
      style={{
        width: '100%',
        height: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Left Circular 3D Back Button */}
      <OnboardingBackButton onClick={onBack} />

      {/* ============================================================ */}
      {/* Main Content Area                                            */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Mascot Prompt: Upper-Left PB + Duolingo Speech Bubble */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: 'max(68px, env(safe-area-inset-top, 68px)) 20px 14px',
            boxSizing: 'border-box'
          }}
        >
          <PlayBankMascot
            variant="stand"
            size={84}
            interactive={true}
          />

          {/* Speech Bubble on the right of PB */}
          <div
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '20px',
              padding: '12px 18px',
              boxShadow: '0 4px 0 #000000',
              flex: 1
            }}
          >
            {/* Bubble arrow pointing left to Mascot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-10px',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '10px solid #000000'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-7px',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '8px solid #FFFFFF',
                zIndex: 1
              }}
            />
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3
              }}
            >
              来定个每日学习的目标吧！
            </h1>
            <p
              key={currentOption.paceHint}
              style={{
                margin: '3px 0 0 0',
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: 600,
                animation: 'fadeHint 0.2s ease-in-out'
              }}
            >
              {currentOption.paceHint}
            </p>
          </div>
        </div>

        {/* Scrollable 4 Goal Cards List (Duolingo 1:1 Layout) */}
        <div
          className="scrollable-goals-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 20px calc(115px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxSizing: 'border-box'
          }}
        >
          {goalOptions.map((opt) => {
            const isSelected = selectedMinutes === opt.minutes;

            return (
              <div
                key={opt.minutes}
                onClick={() => handleSelect(opt.minutes)}
                style={{
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  borderRadius: '18px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 5px 0 #000000' : '0 2px 0 rgba(0,0,0,0.04)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                  flexShrink: 0
                }}
              >
                {/* Left Side: Duration */}
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: isSelected ? '#000000' : '#1F2937',
                    letterSpacing: '0.2px'
                  }}
                >
                  {opt.durationLabel}
                </span>

                {/* Right Side: Mode Tag */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isSelected ? '#B45309' : '#6B7280',
                    background: isSelected ? '#FEF3C7' : 'transparent',
                    padding: isSelected ? '4px 10px' : '0',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.modeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* ============================================================ */}
      {/* Bottom Sticky Action Bar: "继续" (CONTINUE) Button            */}
      {/* ============================================================ */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 25%, #FFFFFF 100%)',
          padding: '16px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <PrimaryButton
            onClick={handleContinue}
            size="large"
            variant="primary"
            style={{ width: '100%' }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>

      {/* Micro animation for hint update */}
      <style>{`
        @keyframes fadeHint {
          0% { opacity: 0; transform: translateY(-3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Step10DailyGoalView;
