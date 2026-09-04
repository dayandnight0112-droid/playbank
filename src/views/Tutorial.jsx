import React, { useState, useEffect } from 'react';
import { useTutorialStateMachine, TUTORIAL_TOTAL_STEPS } from '../hooks/useTutorialStateMachine';
import { getTutorialQuestion } from '../data/tutorialQuestions';
import { Sparkles, X, Check, ArrowRight, Flame, AlertCircle } from 'lucide-react';
import PrimaryButton from '../components/common/PrimaryButton';
import MechanismPopup from '../components/common/MechanismPopup';

const Tutorial = ({ guest, onComplete, onExit }) => {
  const machine = useTutorialStateMachine({
    guest,
    onComplete: (earnedBP, maxCombo) => {
      if (onComplete) onComplete(earnedBP, maxCombo);
    },
    onExit
  });

  const {
    currentStep,
    totalSteps,
    phase,
    lastAnswerResult,
    earnedBP,
    currentCombo,
    timeRemaining,
    stepsRemaining,
    handleAnswer,
    nextStep,
    retryQuestion,
    startTimer
  } = machine;

  // Local state for exit retention modal
  const [showExitModal, setShowExitModal] = useState(false);

  // Mechanism Milestone Popups (Step 11)
  const [activePopup, setActivePopup] = useState(null); // 'bankpoint' | 'combo' | 'speed_challenge' | null
  const [hasShownBP, setHasShownBP] = useState(false);
  const [hasShownCombo, setHasShownCombo] = useState(false);
  const [hasShownSpeed, setHasShownSpeed] = useState(false);

  // Selected path from guest
  const selectedPath = guest?.selectedPath || 'chinese';
  const currentQ = getTutorialQuestion(currentStep, selectedPath);

  // Q8 10-Second Challenge Intro & Timer management
  useEffect(() => {
    if (currentStep === 8 && !hasShownSpeed && phase === 'answering') {
      setHasShownSpeed(true);
      setActivePopup('speed_challenge');
    } else if (currentQ.isTimed && phase === 'answering' && hasShownSpeed && !activePopup) {
      startTimer(currentQ.timeLimit || 10, () => {
        handleAnswer(-1, currentQ.correctIndex, 0);
      });
    }
  }, [currentStep, phase, hasShownSpeed, activePopup, currentQ.isTimed, currentQ.correctIndex, currentQ.timeLimit, startTimer, handleAnswer]);

  const handleNextStepClick = () => {
    // Q3 milestone: First BankPoint introduction
    if (currentStep === 3 && !hasShownBP) {
      setHasShownBP(true);
      setActivePopup('bankpoint');
      return;
    }

    // Q5 milestone: Combo x3 introduction
    if (currentStep === 5 && !hasShownCombo) {
      setHasShownCombo(true);
      setActivePopup('combo');
      return;
    }

    nextStep();
  };

  const handlePopupClose = () => {
    const closedType = activePopup;
    setActivePopup(null);
    if (closedType === 'bankpoint' || closedType === 'combo') {
      nextStep();
    } else if (closedType === 'speed_challenge') {
      startTimer(10, () => {
        handleAnswer(-1, currentQ.correctIndex, 0);
      });
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  const onOptionClick = (index) => {
    if (phase !== 'answering') return;
    handleAnswer(index, currentQ.correctIndex, currentQ.rewardBP || 10);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#FFFFFF',
        padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Header: Step Indicator, Combo Counter & Exit */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#000000',
              color: '#FFFFFF',
              borderRadius: '9999px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '0.5px'
            }}>
              STAGE {currentStep} / {totalSteps}
            </span>

            {currentQ.isTimed && phase === 'answering' && (
              <span style={{
                background: timeRemaining <= 3 ? '#EF4444' : '#F59E0B',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}>
                ⏱️ {timeRemaining}s
              </span>
            )}

            {currentCombo >= 2 && (
              <span style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                animation: 'pulse 1.5s infinite'
              }}>
                <Flame size={14} fill="#FFFFFF" /> COMBO ×{currentCombo}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExitModal(true)}
            style={{
              background: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000000'
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: '#E5E7EB',
          borderRadius: '9999px',
          border: '2px solid #000000',
          overflow: 'hidden',
          marginBottom: '28px'
        }}>
          <div style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            height: '100%',
            background: 'var(--brand-primary, #FFBC00)',
            transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        {/* Question Area */}
        <div style={{ padding: '0 4px' }}>
          {/* Category Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={14} color="#D97706" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {currentQ.category || 'TUTORIAL'}
            </span>
          </div>

          {/* Main Question Text */}
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#000000', margin: '0 0 16px 0', lineHeight: 1.25 }}>
            {currentQ.question}
          </h2>

          {/* Q2: Target Shape Visual Card */}
          {currentQ.visual && currentQ.visual.type === 'target_shape' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFBEB',
              border: '3px solid #000000',
              borderRadius: '20px',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000000'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {currentQ.visual.label}
              </span>
              <div style={{ fontSize: '48px', lineHeight: 1 }}>
                {currentQ.visual.target}
              </div>
            </div>
          )}

          {/* Q3: Logic Sequence Row */}
          {currentQ.sequence && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px'
            }}>
              {currentQ.sequence.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    border: item === '?' ? '3px dashed #000000' : '3px solid #000000',
                    background: item === '?' ? 'var(--brand-primary, #FFBC00)' : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#000000',
                    boxShadow: item === '?' ? '3px 3px 0px #000000' : 'none'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Hint */}
          {currentQ.hint && (
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', margin: '0 0 20px 0' }}>
              💡 {currentQ.hint}
            </p>
          )}

          {/* 4 Interactive Option Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = lastAnswerResult?.selectedIndex === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;
              const showFeedback = phase === 'feedback';

              let bg = '#FFFFFF';
              let borderColor = '#000000';
              let shadow = '0 4px 0px #000000';
              let textColor = '#000000';

              if (showFeedback) {
                if (isCorrectAnswer) {
                  bg = '#10B981';
                  textColor = '#FFFFFF';
                  shadow = '0 4px 0px #065F46';
                } else if (isSelected && !lastAnswerResult.isCorrect) {
                  bg = '#EF4444';
                  textColor = '#FFFFFF';
                  shadow = '0 4px 0px #991B1B';
                } else {
                  bg = '#F9FAFB';
                  textColor = '#9CA3AF';
                  borderColor = '#E5E7EB';
                  shadow = 'none';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => onOptionClick(idx)}
                  disabled={showFeedback}
                  style={{
                    position: 'relative',
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: bg,
                    border: `3px solid ${borderColor}`,
                    boxShadow: shadow,
                    color: textColor,
                    cursor: showFeedback ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.1s ease',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: showFeedback && isCorrectAnswer ? 'rgba(255, 255, 255, 0.25)' : '#F3F4F6',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: showFeedback && (isCorrectAnswer || isSelected) ? '#FFFFFF' : '#000000'
                    }}>
                      {optionLetters[idx]}
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 800 }}>
                      {option}
                    </span>
                  </div>

                  {showFeedback && isCorrectAnswer && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={18} strokeWidth={3.5} color="#10B981" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Feedback Sheet (Progressive Disclosure) */}
      {phase === 'feedback' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: lastAnswerResult?.isCorrect ? '#D1FAE5' : '#FEE2E2',
            borderTop: `3px solid ${lastAnswerResult?.isCorrect ? '#10B981' : '#EF4444'}`,
            padding: '20px 24px calc(24px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: lastAnswerResult?.isCorrect ? '#10B981' : '#EF4444',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {lastAnswerResult?.isCorrect ? <Check size={26} strokeWidth={3.5} /> : <X size={26} strokeWidth={3.5} />}
              </div>

              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  margin: 0,
                  color: lastAnswerResult?.isCorrect ? '#065F46' : '#991B1B'
                }}>
                  {lastAnswerResult?.isCorrect ? 'Correct!' : '差一点点！'}
                </h3>
                <span style={{ fontSize: '14px', fontWeight: 800, color: lastAnswerResult?.isCorrect ? '#047857' : '#B91C1C' }}>
                  {lastAnswerResult?.isCorrect ? `+${lastAnswerResult.pointsEarned} BankPoint` : '再试一次即可！'}
                </span>
              </div>
            </div>

            {lastAnswerResult?.combo >= 2 && (
              <div style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                animation: 'bounce 0.4s ease'
              }}>
                🔥 COMBO ×{lastAnswerResult.combo}
              </div>
            )}
          </div>

          <PrimaryButton
            onClick={lastAnswerResult?.isCorrect ? handleNextStepClick : retryQuestion}
            size="large"
            variant={lastAnswerResult?.isCorrect ? 'success' : 'primary'}
            style={{ width: '100%' }}
          >
            {lastAnswerResult?.isCorrect
              ? (currentStep >= totalSteps ? '完成试炼 (FINISH)' : '下一题 (CONTINUE)')
              : '再试一次 (TRY AGAIN)'}
          </PrimaryButton>
        </div>
      )}

      {/* Game Mechanism Milestone Popups (Step 11) */}
      <MechanismPopup
        type={activePopup}
        onClose={handlePopupClose}
      />

      {/* Exit Retention Modal (Step 31) */}
      {showExitModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '340px',
            borderRadius: '24px',
            border: '3px solid #000000',
            padding: '24px',
            boxShadow: '6px 6px 0px #000000',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--brand-primary, #FFBC00)',
              border: '2px solid #000',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <AlertCircle size={26} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: '0 0 6px 0' }}>
              冒险即将开启！
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, margin: '0 0 20px 0', lineHeight: 1.4 }}>
              你只差最后 <strong>{stepsRemaining} 步</strong> 即可解锁首个宝箱与主页冒险大厅。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PrimaryButton
                onClick={() => setShowExitModal(false)}
                size="normal"
                variant="primary"
              >
                继续挑战 (Keep Playing)
              </PrimaryButton>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  if (onExit) onExit();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B7280',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                退出 (Exit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
