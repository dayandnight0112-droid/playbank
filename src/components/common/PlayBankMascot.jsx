import React, { useState, useEffect } from 'react';
import { playPunchyPopSound, playLootSparkleSound } from '../../lib/soundEffects';

/**
 * PlayBankMascot
 * The Official PlayBank Tiger Mascot with 2-Frame Sprite Loops & Micro-Interactions.
 * Variants:
 *  - 'wave': Welcoming friendly pose with breathing float & paw wave.
 *  - 'run': 2-frame athletic sprint loop (tiger_run_1 <-> tiger_run_2).
 *  - 'cheer': 2-frame jumping celebration loop (tiger_stand <-> tiger_cheer).
 *  - 'stand': Neutral alert posture.
 */
const PlayBankMascot = ({
  variant = 'wave', // 'wave' | 'run' | 'cheer' | 'stand'
  size = 220,
  speechBubble = null,
  interactive = true,
  onClick = null,
  style = {}
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  // Preload all mascot assets to prevent frame switching flicker
  useEffect(() => {
    const images = [
      '/mascot/tiger_wave.png',
      '/mascot/tiger_run_1.png',
      '/mascot/tiger_run_2.png',
      '/mascot/tiger_stand.png',
      '/mascot/tiger_cheer.png'
    ];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Frame toggle timer for multi-frame animations
  useEffect(() => {
    let timer = null;

    if (variant === 'run') {
      // Fast dynamic sprint cycle (~160ms per frame)
      timer = setInterval(() => {
        setFrameIndex(prev => (prev === 0 ? 1 : 0));
      }, 160);
    } else if (variant === 'cheer') {
      // Joyful bouncy celebration cycle (~320ms per frame)
      timer = setInterval(() => {
        setFrameIndex(prev => (prev === 0 ? 1 : 0));
      }, 320);
    } else {
      setFrameIndex(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [variant]);

  // Determine active frame image and motion transformation
  let currentSrc = '/mascot/tiger_wave.png';
  let animationClass = 'mascot-float';

  if (variant === 'run') {
    currentSrc = frameIndex === 0 ? '/mascot/tiger_run_1.png' : '/mascot/tiger_run_2.png';
    animationClass = frameIndex === 0 ? 'mascot-run-a' : 'mascot-run-b';
  } else if (variant === 'cheer') {
    currentSrc = frameIndex === 0 ? '/mascot/tiger_stand.png' : '/mascot/tiger_cheer.png';
    animationClass = frameIndex === 0 ? 'mascot-cheer-down' : 'mascot-cheer-up';
  } else if (variant === 'stand') {
    currentSrc = '/mascot/tiger_stand.png';
    animationClass = 'mascot-idle';
  } else {
    // 'wave'
    currentSrc = '/mascot/tiger_wave.png';
    animationClass = 'mascot-wave';
  }

  const handleMascotClick = (e) => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);

    if (variant === 'cheer') {
      playLootSparkleSound();
    } else {
      playPunchyPopSound();
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`playbank-mascot-container ${animationClass}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: interactive ? 'pointer' : 'default',
        transform: isTapped ? 'scale(1.12)' : isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style
      }}
      onClick={interactive ? handleMascotClick : undefined}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Speech Bubble Overlay (if provided) */}
      {speechBubble && (
        <div
          style={{
            position: 'absolute',
            top: '-28px',
            background: '#FFFFFF',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 900,
            color: '#000000',
            boxShadow: '3px 3px 0px #000000',
            whiteSpace: 'nowrap',
            zIndex: 10,
            animation: 'bubblePop 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {speechBubble}
          <div
            style={{
              position: 'absolute',
              bottom: '-7px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #000000'
            }}
          />
        </div>
      )}

      {/* Mascot Main Image Render */}
      <img
        src={currentSrc}
        alt="PlayBank Tiger Mascot"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          filter: isHovered ? 'drop-shadow(0 10px 20px rgba(255, 188, 0, 0.45))' : 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.15))',
          transition: 'filter 0.2s ease'
        }}
      />

      {/* Ground Shadow Accent */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          width: variant === 'run' ? '70%' : variant === 'cheer' && frameIndex === 1 ? '45%' : '60%',
          height: '10px',
          background: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '50%',
          zIndex: -1,
          transition: 'width 0.2s ease, opacity 0.2s ease',
          opacity: variant === 'cheer' && frameIndex === 1 ? 0.35 : 0.8
        }}
      />

      {/* Keyframe Styles */}
      <style>{`
        @keyframes mascotWaveBob {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1.8deg);
          }
        }
        @keyframes mascotRunA {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-6px) rotate(-1deg);
          }
        }
        @keyframes mascotRunB {
          0%, 100% {
            transform: translateY(-4px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        @keyframes mascotCheerJump {
          0%, 100% {
            transform: translateY(-16px) scale(1.04);
          }
          50% {
            transform: translateY(-20px) scale(1.06);
          }
        }
        @keyframes bubblePop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .mascot-wave {
          animation: mascotWaveBob 2.4s ease-in-out infinite;
        }
        .mascot-run-a {
          animation: mascotRunA 0.32s ease-in-out infinite;
        }
        .mascot-run-b {
          animation: mascotRunB 0.32s ease-in-out infinite;
        }
        .mascot-cheer-up {
          animation: mascotCheerJump 0.32s ease-in-out infinite;
        }
        .mascot-cheer-down {
          transform: translateY(0px) scale(0.98);
          transition: transform 0.1s ease;
        }
      `}</style>
    </div>
  );
};

export default PlayBankMascot;
