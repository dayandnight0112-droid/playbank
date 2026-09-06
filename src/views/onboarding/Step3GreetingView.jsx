import React from 'react';
import { ArrowLeft } from 'lucide-react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';

/**
 * Step3GreetingView
 * Duolingo-style Character Introduction Screen.
 * PB waves enthusiastically and introduces himself:
 * "你好呀，我是PB！"
 */
const Step3GreetingView = ({ onNext, onBack }) => {
  return (
    <div
      className="step3-greeting-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* ============================================================ */}
      {/* Top Header: Back Button + Progress Bar (~22%)                 */}
      {/* ============================================================ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #F3F4F6',
          padding: 'max(14px, env(safe-area-inset-top, 14px)) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 0 #000000',
            outline: 'none',
            flexShrink: 0
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={3} color="#000000" />
        </button>

        {/* Duolingo Progress Bar */}
        <div
          style={{
            flex: 1,
            height: '12px',
            background: '#E5E7EB',
            borderRadius: '9999px',
            border: '2px solid #000000',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '22%',
              height: '100%',
              background: 'var(--brand-primary, #FFBC00)',
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </header>

      {/* ============================================================ */}
      {/* Center Stage: PB Waving + Duolingo Speech Bubble             */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          padding: '24px 20px calc(110px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {/* Prominent Speech Bubble Above Mascot */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '16px 28px',
            boxShadow: '0 6px 0 #000000',
            marginBottom: '28px',
            maxWidth: '300px',
            animation: 'bubbleBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#000000',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}
          >
            你好呀，我是PB！👋
          </h1>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6B7280',
              margin: 0
            }}
          >
            你的 PlayBank 专属学习伙伴
          </p>

          {/* Bubble Tail pointing down towards PB */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '12px solid #000000'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid #FFFFFF',
              zIndex: 1
            }}
          />
        </div>

        {/* Mascot Center Stage: Welcoming Waving Animation */}
        <div style={{ position: 'relative' }}>
          <PlayBankMascot
            variant="wave"
            size={220}
            interactive={true}
          />
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
            onClick={onNext}
            size="large"
            variant="primary"
            style={{ width: '100%' }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>

      {/* Pop-in animation */}
      <style>{`
        @keyframes bubbleBounce {
          0% { transform: scale(0.8) translateY(-10px); opacity: 0; }
          70% { transform: scale(1.05) translateY(2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Step3GreetingView;
