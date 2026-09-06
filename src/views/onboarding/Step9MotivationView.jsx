import React from 'react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';

/**
 * Step9MotivationView
 * Duolingo-style Mastery Motivation Screen.
 * PB celebrates energetically and empowers the player:
 * "学好这门科目，你就是这个科目的主宰！"
 */
const Step9MotivationView = ({ onNext, onBack, selectedSubject = null }) => {
  const subjName = selectedSubject?.name || selectedSubject?.displayName || '这门科目';

  return (
    <div
      className="step9-motivation-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
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

      {/* Ambient Celebration Glow */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(255, 188, 0, 0.28) 0%, rgba(255, 188, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* ============================================================ */}
      {/* Center Stage: Hero Speech Bubble + Cheering PB Mascot        */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          padding: 'max(70px, env(safe-area-inset-top, 70px)) 20px calc(110px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Powerful Motivational Speech Bubble */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '20px 24px',
            boxShadow: '0 6px 0 #000000',
            marginBottom: '28px',
            maxWidth: '330px',
            animation: 'bubbleBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEF3C7',
              border: '1.5px solid #F59E0B',
              borderRadius: '9999px',
              padding: '3px 12px',
              marginBottom: '10px'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#B45309', letterSpacing: '0.8px' }}>
              👑 知识主宰 · 巅峰目标
            </span>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#000000',
              margin: '0 0 6px 0',
              lineHeight: 1.35,
              letterSpacing: '0.2px'
            }}
          >
            学好{subjName ? `【${subjName}】` : '这门科目'}，你就是这个科目的主宰！🔥
          </h1>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6B7280',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            每一次闯关与挑战，都在让你变得不可战胜
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

        {/* Mascot Center Stage: Cheering Celebration Animation */}
        <div style={{ position: 'relative' }}>
          <PlayBankMascot
            variant="cheer"
            size={225}
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

      {/* Animation */}
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

export default Step9MotivationView;
