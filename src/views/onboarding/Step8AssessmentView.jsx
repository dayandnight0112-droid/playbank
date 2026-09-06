import React, { useState } from 'react';
import { Check } from 'lucide-react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound, playLootSparkleSound } from '../../lib/soundEffects';

/**
 * Step8AssessmentView
 * Duolingo-style Self-Assessment & Real-time Dynamic Reaction Screen.
 * Question: "你的【${subject}】怎么样？"
 * 5 Options with Dynamic Mascot Reactions:
 *  - 需要进步 -> "没关系，我们一起进步！" (stand)
 *  - 会一点点 -> "好呀，我们向上奔跑吧！" (run)
 *  - 普通水平 -> "好呀，我们向上奔跑吧！" (run)
 *  - 很好 -> "哦！你很自信哟~ 加油！" (cheer)
 *  - 超好 -> "哦！你很自信哟~ 加油！" (cheer)
 */
const Step8AssessmentView = ({ onNext, onBack, selectedSubject = null, initialProficiency = null }) => {
  const subjName = selectedSubject?.name || selectedSubject?.displayName || '这门科目';

  const [selectedOpt, setSelectedOpt] = useState(initialProficiency);
  const [mascotVariant, setMascotVariant] = useState(
    initialProficiency?.variant || 'stand'
  );
  const [bubbleText, setBubbleText] = useState(
    initialProficiency?.reactionText || `你的【${subjName}】怎么样？`
  );

  const options = [
    {
      id: 'need_work',
      label: '需要进步',
      sublabel: '基础有些吃力，想重新巩固',
      icon: '🌱',
      variant: 'stand',
      reactionText: '没关系，我们一起进步！🤝',
      sound: 'pop'
    },
    {
      id: 'beginner',
      label: '会一点点',
      sublabel: '掌握部分知识，需要多做练习',
      icon: '🌿',
      variant: 'run',
      reactionText: '好呀，我们向上奔跑吧！🏃💨',
      sound: 'pop'
    },
    {
      id: 'average',
      label: '普通水平',
      sublabel: '跟得上进度，想更上一层楼',
      icon: '🌟',
      variant: 'run',
      reactionText: '好呀，我们向上奔跑吧！🏃💨',
      sound: 'pop'
    },
    {
      id: 'good',
      label: '很好',
      sublabel: '平时表现优异，目标冲刺全对',
      icon: '⭐',
      variant: 'cheer',
      reactionText: '哦！你很自信哟~ 加油！🎉⚡',
      sound: 'sparkle'
    },
    {
      id: 'master',
      label: '超好',
      sublabel: '学霸水准，准备挑战最高难度',
      icon: '👑',
      variant: 'cheer',
      reactionText: '哦！你很自信哟~ 加油！🎉⚡',
      sound: 'sparkle'
    }
  ];

  const handleSelect = (opt) => {
    if (opt.sound === 'sparkle') {
      playLootSparkleSound();
    } else {
      playPunchyPopSound();
    }

    setSelectedOpt(opt);
    setMascotVariant(opt.variant);
    setBubbleText(opt.reactionText);
  };

  const handleContinue = () => {
    if (!selectedOpt) return;
    if (onNext) onNext(selectedOpt);
  };

  return (
    <div
      className="step8-assessment-container"
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
        {/* Top Mascot Prompt: Dynamic Reaction Speech Bubble + PB */}
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
            variant={mascotVariant}
            size={84}
            interactive={true}
          />

          {/* Dynamic Reaction Speech Bubble */}
          <div
            key={bubbleText}
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '20px',
              padding: '12px 18px',
              boxShadow: '0 4px 0 #000000',
              flex: 1,
              animation: 'bubbleReactPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
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
              {bubbleText}
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              {selectedOpt ? 'PB 已收到你的真实水平反馈！' : `评估你的【${subjName}】掌握情况`}
            </p>
          </div>
        </div>

        {/* Scrollable 5 Options List */}
        <div
          className="scrollable-assessment-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 20px calc(115px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
            boxSizing: 'border-box'
          }}
        >
          {options.map((opt) => {
            const isSelected = selectedOpt?.id === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                style={{
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  borderRadius: '18px',
                  padding: '14px 18px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      background: isSelected ? '#FEF3C7' : '#F9FAFB',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #F59E0B' : '1px solid #E5E7EB'
                    }}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isSelected ? '#000000' : '#1F2937'
                      }}
                    >
                      {opt.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isSelected ? '#92400E' : '#6B7280',
                        marginTop: '2px'
                      }}
                    >
                      {opt.sublabel}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #000000' : '2px solid #D1D5DB',
                    background: isSelected ? 'var(--brand-primary, #FFBC00)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3.5} color="#000000" />}
                </div>
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
            disabled={!selectedOpt}
            size="large"
            variant="primary"
            style={{
              width: '100%',
              opacity: selectedOpt ? 1 : 0.45,
              cursor: selectedOpt ? 'pointer' : 'not-allowed'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>

      {/* Micro dynamic animation */}
      <style>{`
        @keyframes bubbleReactPop {
          0% { transform: scale(0.94); }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Step8AssessmentView;
