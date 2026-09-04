import React from 'react';
import { getWelcomeTheme } from '../data/welcomeThemes';
import PrimaryButton from '../components/common/PrimaryButton';

const WelcomeScreen = ({
  onStart,
  onOpenLogin,
  bgThemeId = 'welcome-bg-01',
  lang = 'zh'
}) => {
  const theme = getWelcomeTheme(bgThemeId);

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
        alignItems: 'center',
        padding: '24px 20px calc(36px + env(safe-area-inset-bottom, 0px))',
        background: theme.baseGradient,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Depth Layer 1: Ambient Sunburst / Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.overlayPattern,
          pointerEvents: 'none'
        }}
      />

      {/* Background Depth Layer 2: Vignette Depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.vignette,
          pointerEvents: 'none'
        }}
      />

      {/* Background Depth Layer 3: Subtle floating star / particle accents */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.4,
          background: `radial-gradient(2px 2px at 20% 30%, ${theme.particleColor}, transparent),
                       radial-gradient(2px 2px at 80% 20%, ${theme.particleColor}, transparent),
                       radial-gradient(3px 3px at 40% 70%, ${theme.particleColor}, transparent),
                       radial-gradient(2px 2px at 70% 60%, ${theme.particleColor}, transparent),
                       radial-gradient(3px 3px at 85% 85%, ${theme.particleColor}, transparent)`
        }}
      />

      {/* Top Bar: Strictly only the small Login CTA in top-right */}
      <header
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <button
          onClick={onOpenLogin}
          style={{
            background: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '9999px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #000000',
            transition: 'transform 0.1s ease',
            outline: 'none',
            letterSpacing: '0.5px'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(1px, 1px)';
            e.currentTarget.style.boxShadow = '1px 1px 0px #000000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '2px 2px 0px #000000';
          }}
        >
          Login
        </button>
      </header>

      {/* Center: PlayBank Emblem Logo & Hero Title */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          marginTop: '-10px'
        }}
      >
        {/* Logo Shield Frame */}
        <div
          style={{
            position: 'relative',
            width: '112px',
            height: '112px',
            borderRadius: '50%',
            background: '#000000',
            border: '4px solid #FFFFFF',
            boxShadow: '0 10px 24px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.4)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            animation: 'floatBob 3.2s ease-in-out infinite'
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}playbanklogo.png`}
            alt="PlayBank"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Game Title with 3D arcade typography */}
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.5px',
            textShadow: '3px 4px 0px #000000, 0 8px 16px rgba(0,0,0,0.35)',
            lineHeight: 1
          }}
        >
          PlayBank
        </h1>

        <div
          style={{
            marginTop: '10px',
            padding: '4px 14px',
            borderRadius: '9999px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}
          >
            Adventure & Learning
          </span>
        </div>
      </main>

      {/* Screen Bottom-Center: The LARGEST CTA on screen (START) */}
      <footer
        style={{
          width: '100%',
          maxWidth: '340px',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <PrimaryButton
          onClick={onStart}
          size="large"
          variant="primary"
          subtitle={lang === 'zh' ? '开始游戏' : 'Start Journey'}
        >
          START
        </PrimaryButton>
      </footer>

      {/* CSS Animation for the floating logo */}
      <style>{`
        @keyframes floatBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
