import React from 'react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';

/**
 * Step4CommitmentView
 * Duolingo-style Mascot Commitment Screen.
 * PB stands proudly and promises:
 * "很高兴见到你，我会陪你学到中学"
 * Features:
 *  - Circular 3D tactile back button in top-left
 *  - Speech bubble above PB
 *  - Sticky bottom "继续" button
 */
const Step4CommitmentView = ({ onNext, onBack }) => {
  return (
    <div
      className="step4-commitment-container"
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

      {/* ============================================================ */}
      {/* Center Stage: PB Standing Confidently + Duolingo Speech Bubble */}
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
          textAlign: 'center'
        }}
      >
        {/* Speech Bubble Above PB Mascot */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '18px 24px',
            boxShadow: '0 6px 0 #000000',
            marginBottom: '28px',
            maxWidth: '320px',
            animation: 'bubbleBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
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
            很高兴见到你，我会陪你学到中学！🎒✨
          </h1>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6B7280',
              margin: 0
            }}
          >
            从启蒙突破到名校冲刺，一路相伴
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

        {/* Mascot Center Stage: Confident Standing Pose */}
        <div style={{ position: 'relative' }}>
          <PlayBankMascot
            variant="stand"
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

export default Step4CommitmentView;
