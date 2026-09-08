import React from 'react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';

/**
 * Step11ReadyPromptView
 * Duolingo-style Pre-Game Cheering & Transition Screen.
 * PlayBank Mascot cheers enthusiastically before handing off to Part A Tutorial Game:
 * "准备好！我们一起进入游戏了哟~"
 * Features:
 *  - Top-left 3D circular back button to return to Step 10
 *  - High-energy cheering mascot animation (variant="cheer")
 *  - Duolingo speech bubble with drop shadow
 *  - Tactile 3D CTA button to launch the game
 */
const Step11ReadyPromptView = ({ onStartGame, onBack }) => {
  return (
    <div
      className="step11-ready-prompt-container"
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
      {/* Center Stage: PB Cheering + Duolingo Speech Bubble           */}
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
        {/* Prominent Speech Bubble Above PB Mascot */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '18px 24px',
            boxShadow: '0 6px 0 #000000',
            marginBottom: '26px',
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
            准备好！我们一起进入游戏了哟~ 🎉
          </h1>
          <p
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#6B7280',
              margin: 0
            }}
          >
            完成新手挑战，赢取你的专属启动金币！🪙
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

        {/* Mascot Center Stage: Cheering / Jumping Celebration Pose */}
        <div style={{ position: 'relative' }}>
          <PlayBankMascot
            variant="cheer"
            size={220}
            interactive={true}
          />
        </div>
      </main>

      {/* ============================================================ */}
      {/* Bottom Sticky Action Bar: "准备好了，出发！🚀" Button           */}
      {/* ============================================================ */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 25%, #FFFFFF 100%)',
          padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px'
          }}
        >
          <PrimaryButton
            onClick={onStartGame}
            size="large"
            variant="primary"
            style={{ width: '100%' }}
          >
            准备好了，出发！🚀
          </PrimaryButton>
        </div>
      </footer>

      {/* Bubble Entrance Animation Keyframes */}
      <style>{`
        @keyframes bubbleBounce {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(12px);
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

export default Step11ReadyPromptView;
