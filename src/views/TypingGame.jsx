import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { typingPlayService } from '../lib/typingPlayService.js';
import { getTypingAgeConfig } from '../data/typingConfig.js';
import { speechService } from '../lib/speechService.js';
import { useTypingEngine } from '../hooks/useTypingEngine.js';
import TypingDisplay from '../components/typing/TypingDisplay.jsx';
import TypingHiddenInput from '../components/typing/TypingHiddenInput.jsx';
import { mockDb } from '../lib/mockDb.js';
import { isSoundEnabled, setSoundEnabled, playPunchyPopSound } from '../lib/soundEffects.js';

function PlayBankMiniLogo() {
  return (
    <div
      style={{
        margin: '0 auto',
        display: 'flex',
        height: '56px',
        width: '56px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '2px solid #111111',
        backgroundColor: '#000000',
        boxShadow: '3px 3px 0px #111111',
        overflow: 'hidden'
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}playbanklogo.png`}
        alt="PlayBank"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

function TrophyHero() {
  return (
    <div
      style={{
        position: 'relative',
        margin: '16px auto 0',
        display: 'flex',
        height: '170px',
        width: '170px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
          animation: 'pulse-glow 2s infinite ease-in-out'
        }}
      />
      <img
        src={`${import.meta.env.BASE_URL}trophy.png`}
        alt="Trophy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
          position: 'relative',
          zIndex: 1
        }}
      />
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#7B7B7B', margin: 0 }}>{label}</p>
      <p style={{ marginTop: '4px', fontSize: '22px', fontWeight: 900, color: '#111111', margin: '4px 0 0 0' }}>{value}</p>
    </div>
  );
}

export default function TypingGame({
  age = 10,
  onComplete,
  onBack,
  currentUser = null,
  guestProfile = null,
  userBP = 0
}) {
  const { width, height } = useWindowSize();
  const ageConfig = getTypingAgeConfig(age);

  const [gameState, setGameState] = useState('loading'); // 'loading' | 'countdown' | 'playing' | 'saving' | 'result'
  const [countdown, setCountdown] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Flying BP claim animation refs
  const bpTextRef = useRef(null);
  const claimBtnRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animVars, setAnimVars] = useState({});

  // Active question
  const currentQuestion = questions[currentIndex] || null;

  // Question Complete Callback
  const handleQuestionComplete = useCallback(() => {
    // Fixed score per question, strictly NO combo
    setScore((prev) => prev + ageConfig.scorePerQuestion);

    setTimeout(() => {
      setCurrentIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx < questions.length) {
          // Play next question pronunciation
          const nextQ = questions[nextIdx];
          if (nextQ && soundOn) {
            speechService.speak(nextQ.text, { rate: ageConfig.speechRate });
          }
          return nextIdx;
        } else {
          // All questions finished! Settle game
          finalizeTypingSession();
          return prevIdx;
        }
      });
    }, 400);
  }, [questions, ageConfig, soundOn]);

  // Typing Engine State Machine
  const {
    userInput,
    isLocked,
    isCompleted,
    errorCount,
    charStates,
    progressPercent,
    handleKeyDown,
    handleMobileInputChange
  } = useTypingEngine({
    targetText: currentQuestion?.text || '',
    onQuestionComplete: handleQuestionComplete,
    soundEnabled: soundOn,
    autoAdvanceDelayMs: 400
  });

  // Track cumulative error count
  useEffect(() => {
    if (errorCount > 0) {
      setTotalErrors((prev) => prev + 1);
    }
  }, [errorCount]);

  // Initial Data Load
  useEffect(() => {
    speechService.unlockAudio();

    let isMounted = true;
    (async () => {
      try {
        const loaded = await typingPlayService.getQuestionsForAge(age, ageConfig.questionCount);
        if (!isMounted) return;
        setQuestions(loaded);
        setGameState('countdown');
      } catch (err) {
        console.error('[TypingGame] Failed to load questions:', err);
      }
    })();

    return () => {
      isMounted = false;
      speechService.stop();
    };
  }, [age, ageConfig.questionCount]);

  // Countdown Logic
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown === 0) {
      setGameState('playing');
      setStartTime(Date.now());
      // Speak first question
      if (questions[0] && soundOn) {
        speechService.speak(questions[0].text, { rate: ageConfig.speechRate });
      }
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, gameState, questions, soundOn, ageConfig.speechRate]);

  // Finalize Session & Award BP
  const finalizeTypingSession = async () => {
    setGameState('saving');
    speechService.stop();

    const duration = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    setTimeTaken(duration);

    const earnedBP = questions.length * ageConfig.scorePerQuestion;

    try {
      // 1. Authoritative local wallet update via mockDb
      if (typeof mockDb.addBP === 'function') {
        mockDb.addBP(earnedBP);
      } else if (typeof mockDb.updateGuestBP === 'function') {
        mockDb.updateGuestBP(earnedBP);
      } else {
        const current = mockDb.getSafeUserBP();
        mockDb.updateGuestProfile({ bankPoint: current + earnedBP });
      }
      const newBalance = mockDb.getSafeUserBP();

      // 2. Dispatch global wallet event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('playbank:wallet-updated', {
            detail: {
              balance_bp: newBalance,
              earned_bp: earnedBP,
              source: 'typing_game'
            }
          })
        );
      }

      // 3. Advance daily missions
      try {
        mockDb.recordQuizForDailyMissions({
          quizCompleted: 1,
          questionsAnswered: questions.length,
          correctAnswers: questions.length
        });
      } catch (e) {
        console.warn('[TypingGame] Daily mission record error:', e);
      }
    } catch (err) {
      console.error('[TypingGame] Error finalizing typing session:', err);
    } finally {
      // Always transition to result screen!
      setGameState('result');
    }
  };

  // Replay Pronunciation Button
  const handleReplayAudio = () => {
    if (currentQuestion) {
      speechService.speak(currentQuestion.text, { rate: ageConfig.speechRate });
    }
  };

  // Sound Toggle Button
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Claim BP Button Click Handler
  const handleClaimClick = () => {
    if (!bpTextRef.current || !claimBtnRef.current || isAnimating) return;
    const startRect = bpTextRef.current.getBoundingClientRect();
    const endRect = claimBtnRef.current.getBoundingClientRect();

    const deltaX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    const deltaY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

    setAnimVars({
      '--start-x': `${startRect.left}px`,
      '--start-y': `${startRect.top}px`,
      '--delta-x': `${deltaX}px`,
      '--delta-y': `${deltaY}px`,
      '--start-w': `${startRect.width}px`
    });
    setIsAnimating(true);
    playPunchyPopSound();

    const earnedBP = questions.length * ageConfig.scorePerQuestion;
    setTimeout(() => {
      if (onComplete) {
        onComplete(earnedBP);
      }
    }, 1200);
  };

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ========================================================
  // RENDER: Loading State
  // ========================================================
  if (gameState === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <RefreshCw size={36} color="#111111" className="animate-spin" />
        <p style={{ marginTop: '16px', fontWeight: 900, fontSize: '1rem', color: '#111111' }}>
          正在准备 Age {age} 英文打字题目...
        </p>
      </div>
    );
  }

  // ========================================================
  // RENDER: 3-2-1 Countdown
  // ========================================================
  if (gameState === 'countdown') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFBC00',
          color: '#111111'
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          English Typing · Age {age}
        </span>
        <h2 key={countdown} style={{ fontSize: '110px', fontWeight: 900, margin: 0, animation: 'pop 0.5s ease-out' }}>
          {countdown > 0 ? countdown : 'GO!'}
        </h2>
        <span style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: 800 }}>
          {ageConfig.questionCount} 题 · 每题 {ageConfig.scorePerQuestion} 分 · 无 Combo
        </span>
        <style>{`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ========================================================
  // RENDER: Saving State
  // ========================================================
  if (gameState === 'saving') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <RefreshCw size={40} color="#FFBC00" className="animate-spin" />
        <h3 style={{ marginTop: '16px', fontWeight: 900, fontSize: '1.2rem', color: '#111111' }}>
          正在保存打字成绩与结算奖励...
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>正在更新你的 Playbank 钱包</p>
      </div>
    );
  }

  // ========================================================
  // RENDER: Result / Completion State
  // ========================================================
  if (gameState === 'result') {
    const earnedBP = questions.length * ageConfig.scorePerQuestion;
    const accuracy = Math.max(70, Math.round(((cleanTotalChars(questions) - totalErrors) / cleanTotalChars(questions)) * 100));

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFBC00',
          padding: '16px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <Confetti width={width} height={height} recycle={false} numberOfPieces={400} colors={['#ffffff', '#000000', '#FFBC00', '#38BDF8', '#10B981']} />

        {/* Top-Left Back to Lobby Button */}
        <button
          type="button"
          onClick={() => {
            if (onComplete) {
              onComplete(earnedBP);
            } else if (onBack) {
              onBack();
            }
          }}
          style={{
            position: 'absolute',
            top: 'max(16px, env(safe-area-inset-top, 16px))',
            left: '16px',
            zIndex: 100,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2.5px solid #000000',
            boxShadow: '0 3.5px 0 #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            transition: 'transform 0.08s ease, box-shadow 0.08s ease'
          }}
          aria-label="Back to Lobby"
          title="返回主页"
        >
          <ArrowLeft size={20} strokeWidth={3} color="#000000" />
        </button>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px', paddingTop: '16px' }}>
          <PlayBankMiniLogo />

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.1, color: '#111111', margin: 0 }}>
              Typing Challenge Clear!
            </h1>
            <p style={{ marginTop: '6px', fontSize: '13px', fontWeight: 700, color: '#4B5563' }}>
              太棒了！你已顺利完成 Age {age} 打字挑战
            </p>
          </div>

          <TrophyHero />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '-18px',
              borderRadius: '24px',
              background: '#FFFFFF',
              border: '2px solid #111111',
              padding: '20px 16px',
              boxShadow: '4px 4px 0px #111111',
              maxWidth: '460px',
              margin: '-18px auto 0'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p
                ref={bpTextRef}
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#F2B400',
                  margin: 0,
                  opacity: isAnimating ? 0 : 1
                }}
              >
                +{earnedBP} BP
              </p>

              <div
                style={{
                  margin: '10px auto 0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  border: '1.5px solid #F4DFA0',
                  background: '#FFF8E1',
                  padding: '4px 12px'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#5D4A00' }}>
                  ★ 挑战达成 · 无 Combo 独立结算
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div
              style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                borderBottom: '1.5px solid #EFEFEF',
                paddingBottom: '16px'
              }}
            >
              <MetricItem label="完成题数" value={`${questions.length} 题`} />
              <MetricItem label="准确率" value={`${accuracy}%`} />
              <MetricItem label="用时" value={formatTime(timeTaken)} />
            </div>

            {/* Garden Mission Notice */}
            <div
              style={{
                marginTop: '12px',
                background: '#F1F8E9',
                border: '2px solid #66BB6A',
                borderRadius: '16px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🌱</span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 900, color: '#1B5E20', margin: 0 }}>
                  每日任务已同步推进！
                </p>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#2E7D32', margin: '2px 0 0 0' }}>
                  +1 对局 · +{questions.length} 英文题目
                </p>
              </div>
            </div>

            {/* Claim BP CTA Button */}
            <button
              ref={claimBtnRef}
              type="button"
              onClick={handleClaimClick}
              disabled={isAnimating}
              style={{
                marginTop: '16px',
                display: 'flex',
                height: '48px',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '999px',
                background: '#111111',
                fontSize: '15px',
                fontWeight: 900,
                color: '#FFBC00',
                border: '2px solid #111111',
                cursor: isAnimating ? 'wait' : 'pointer',
                boxShadow: '3px 3px 0px #111111'
              }}
            >
              领取奖励 (Claim BP!)
            </button>
          </div>
        </div>

        {/* Flying BP Animation */}
        {isAnimating && (
          <div
            style={{
              position: 'fixed',
              top: 'var(--start-y)',
              left: 'var(--start-x)',
              width: 'var(--start-w)',
              textAlign: 'center',
              fontSize: '44px',
              fontWeight: 900,
              color: '#F2B400',
              zIndex: 9999,
              pointerEvents: 'none',
              animation: 'flyAndFade 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              ...animVars
            }}
          >
            +{earnedBP} BP
          </div>
        )}

        <style>{`
          @keyframes flyAndFade {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--delta-x), var(--delta-y)) scale(0.2); opacity: 0; }
          }
          @keyframes pulse-glow {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // ========================================================
  // RENDER: Active Playing State
  // ========================================================
  return (
    <div
      className="typing-game-screen"
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: '#FFFBEB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'max(14px, env(safe-area-inset-top, 14px)) 16px max(24px, env(safe-area-inset-bottom, 24px))',
        boxSizing: 'border-box',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* 1. TOP BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '560px',
          margin: '0 auto 16px'
        }}
      >
        {/* Quit Button */}
        <button
          type="button"
          onClick={() => setShowQuitModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #111111',
            boxShadow: '2px 2px 0px #111111',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} color="#111111" />
        </button>

        {/* Progress Badge */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #111111',
            borderRadius: '999px',
            padding: '6px 16px',
            boxShadow: '2px 2px 0px #111111',
            fontWeight: 900,
            fontSize: '0.85rem',
            color: '#111111'
          }}
        >
          Question {currentIndex + 1} / {questions.length}
        </div>

        {/* Score & Audio Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: '#FFBC00',
              border: '2px solid #111111',
              borderRadius: '999px',
              padding: '6px 12px',
              fontWeight: 900,
              fontSize: '0.85rem',
              color: '#111111',
              boxShadow: '2px 2px 0px #111111'
            }}
          >
            +{ageConfig.scorePerQuestion} BP
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '2px 2px 0px #111111',
              cursor: 'pointer'
            }}
          >
            {soundOn ? <Volume2 size={18} color="#111111" /> : <VolumeX size={18} color="#9CA3AF" />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '8px',
          background: '#E5E7EB',
          borderRadius: '999px',
          margin: '0 auto 20px',
          overflow: 'hidden',
          border: '1.5px solid #111111'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentIndex + (isCompleted ? 1 : 0)) / questions.length) * 100}%`,
            background: '#10B981',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* 2. CENTER: TYPING CORE AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <TypingDisplay
          charStates={charStates}
          translation={currentQuestion?.translation || ''}
          category={currentQuestion?.category || 'Vocabulary'}
          isLocked={isLocked}
          isCompleted={isCompleted}
          onReplayAudio={handleReplayAudio}
        />

        {/* Keep-Focus Invisible Input Controller */}
        <TypingHiddenInput
          value={userInput}
          onChange={handleMobileInputChange}
          onKeyDown={handleKeyDown}
          disabled={isCompleted || gameState !== 'playing'}
        />
      </main>

      {/* 3. BOTTOM TIP & HINT */}
      <footer style={{ textAlign: 'center', marginTop: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF' }}>
          💡 手机端点击屏幕任意位置可随时激活键盘 · 电脑端直接输入
        </p>
      </footer>

      {/* QUIT CONFIRM MODAL */}
      {showQuitModal && (
        <div
          onClick={() => setShowQuitModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              border: '2.5px solid #111111',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '6px 6px 0px #111111',
              textAlign: 'center'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 900, color: '#111111' }}>
              退出打字挑战？
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 20px 0' }}>
              确定退出当前打字练习？本局已积累的 {score} BP 将不会保存。
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid #111111',
                  background: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                继续打字
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuitModal(false);
                  if (onBack) onBack();
                }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: '2px solid #EF4444',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                退出挑战
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cleanTotalChars(questions) {
  return questions.reduce((acc, q) => acc + (q.text || '').length, 0) || 10;
}
