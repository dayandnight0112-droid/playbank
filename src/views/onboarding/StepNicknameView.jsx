import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * StepNicknameView
 * Duolingo-style Nickname Input Screen (Step 2, directly following GET STARTED).
 * PB Mascot asks:
 * "欢迎来到 Playbank，你叫什么名字？"
 * Features:
 *  - Top header with circular 3D back button + Duolingo progress bar (~8%)
 *  - PB Mascot with Duolingo speech bubble
 *  - 3D tactile text input box with focus ring and clear button
 *  - Mobile keyboard safe layout (positioned in upper area)
 *  - Sticky bottom "继续" button with disabled / active state
 */
const StepNicknameView = ({ onNext, onBack, initialNickname = '' }) => {
  const [nickname, setNickname] = useState(initialNickname || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount with slight delay for mobile keyboard smoothness
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const isValid = nickname.trim().length > 0;

  const handleContinue = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    playPunchyPopSound();
    if (onNext) onNext(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleContinue();
    }
  };

  return (
    <div
      className="step-nickname-container"
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
      {/* ============================================================ */}
      {/* Top Header: Back Button + Progress Bar (~8%)                  */}
      {/* ============================================================ */}
      <header
        style={{
          flexShrink: 0,
          background: '#FFFFFF',
          borderBottom: '1px solid #F3F4F6',
          padding: 'max(14px, env(safe-area-inset-top, 14px)) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 20
        }}
      >
        {/* Circular 3D Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#FFFFFF',
            border: '2.5px solid #000000',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 0 #000000',
            outline: 'none',
            flexShrink: 0,
            transition: 'transform 0.08s ease, box-shadow 0.08s ease'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #000000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 3px 0 #000000';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #000000';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 3px 0 #000000';
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} color="#000000" />
        </button>

        {/* Duolingo Progress Bar */}
        <div
          style={{
            flex: 1,
            height: '14px',
            background: '#E5E7EB',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
            border: '1.5px solid #D1D5DB'
          }}
        >
          <div
            style={{
              width: '8%',
              height: '100%',
              background: 'linear-gradient(180deg, #FFBC00 0%, #E5A800 100%)',
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </header>

      {/* ============================================================ */}
      {/* Center Main Stage: Mascot Question + Input Box               */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          padding: 'max(24px, 4vh) 20px calc(100px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto'
        }}
      >
        {/* Mascot Prompt Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            marginBottom: '28px',
            animation: 'bubbleBounce 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* PB Mascot (wave pose) */}
          <div style={{ flexShrink: 0 }}>
            <PlayBankMascot
              variant="wave"
              size={110}
              interactive={true}
            />
          </div>

          {/* Speech Bubble */}
          <div
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '20px',
              padding: '14px 18px',
              boxShadow: '0 4px 0 #000000',
              flex: 1
            }}
          >
            {/* Bubble Tail pointing to Mascot */}
            <div
              style={{
                position: 'absolute',
                left: '-10px',
                top: '50%',
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
                left: '-7px',
                top: '50%',
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
                color: '#000000',
                margin: '0 0 4px',
                lineHeight: 1.35
              }}
            >
              欢迎来到 Playbank，你叫什么名字？
            </h1>
            <p
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#6B7280',
                margin: 0
              }}
            >
              取一个闪亮的冒险家昵称吧！✨
            </p>
          </div>
        </div>

        {/* Nickname Input Field Box */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 14))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的名字 / 昵称"
              maxLength={14}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: isFocused ? '#FFFDF5' : '#F9FAFB',
                border: isFocused
                  ? '2.5px solid #FFBC00'
                  : isValid
                  ? '2.5px solid #000000'
                  : '2.5px solid #D1D5DB',
                borderRadius: '16px',
                padding: '16px 48px 16px 20px',
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827',
                outline: 'none',
                boxShadow: isFocused
                  ? '0 4px 0 #E5A800, 0 0 0 4px rgba(255, 188, 0, 0.2)'
                  : isValid
                  ? '0 4px 0 #000000'
                  : '0 2px 0 #E5E7EB',
                transition: 'all 0.15s ease',
                letterSpacing: '0.5px'
              }}
            />

            {/* Clear Button (✕) */}
            {nickname && (
              <button
                type="button"
                onClick={() => {
                  setNickname('');
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#E5E7EB',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#4B5563',
                  outline: 'none',
                  transition: 'background 0.1s ease'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                ✕
              </button>
            )}
          </div>

          {/* Character counter & Hint */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#9CA3AF'
            }}
          >
            <span>💡 稍后也可以在个人中心随时修改</span>
            <span style={{ color: nickname.length >= 14 ? '#EF4444' : '#9CA3AF' }}>
              {nickname.length} / 14
            </span>
          </div>
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
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px'
          }}
        >
          <PrimaryButton
            onClick={handleContinue}
            disabled={!isValid}
            size="large"
            variant="primary"
            style={{
              width: '100%',
              opacity: isValid ? 1 : 0.45,
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>

      {/* Bubble Entrance Animation Keyframes */}
      <style>{`
        @keyframes bubbleBounce {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StepNicknameView;
