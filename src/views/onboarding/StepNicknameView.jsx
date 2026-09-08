import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * StepNicknameView
 * Duolingo-style Nickname Input Screen (placed right after GET STARTED).
 * PB Mascot asks:
 * "欢迎来到 Playbank，你叫什么名字？"
 * Features:
 *  - Fixed header + progress bar (~10%)
 *  - PB Mascot with Duolingo speech bubble
 *  - Prominent 3D tactile text input box with character limit
 *  - Sticky bottom "继续" button (disabled if empty)
 */
const StepNicknameView = ({ onNext, onBack, initialNickname = '' }) => {
  const [nickname, setNickname] = useState(initialNickname || '');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount with slight delay for mobile keyboard smoothness
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    playPunchyPopSound();
    if (onNext) onNext(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && nickname.trim()) {
      handleContinue();
    }
  };

  const isValid = nickname.trim().length > 0;

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
          padding: '24px 20px calc(100px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
            marginBottom: '32px'
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

        {/* Nickname Input Field */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
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
              onKeyDown={handleKeyDown}
              placeholder="输入你的名字 / 昵称"
              maxLength={14}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#F9FAFB',
                border: isValid ? '2.5px solid #FFBC00' : '2.5px solid #000000',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827',
                outline: 'none',
                boxShadow: isValid ? '0 4px 0 #FFBC00' : '0 4px 0 #000000',
                transition: 'all 0.15s ease',
                letterSpacing: '0.5px'
              }}
            />

            {/* Clear button if text exists */}
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
                  outline: 'none'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Character counter / hint */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 4px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#9CA3AF'
            }}
          >
            <span>最多 14 个字符</span>
            <span>{nickname.length} / 14</span>
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
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>
    </div>
  );
};

export default StepNicknameView;
