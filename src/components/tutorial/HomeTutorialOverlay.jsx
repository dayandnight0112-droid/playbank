import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayBankMascot from '../common/PlayBankMascot';
import { ArrowDown, ArrowUp, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { playPunchyPopSound, playModalSwooshSound } from '../../lib/soundEffects';

/**
 * HomeTutorialOverlay
 * Phase 2: Independent UI Component & Dynamic Focusing System for PlayBank Lobby Guide.
 * 
 * Key Features:
 * 1. Full-screen Spotlight Mask: Cutout highlight via CSS polygon clip-path, strictly blocking background clicks.
 * 2. Mobile Dynamic Adsorption: Dynamic bounding client rect calculations with ResizeObserver & scroll tracking.
 * 3. Intelligent Mascot Bubble: Evaluates viewport space above/below to never occlude target buttons.
 * 4. Safety Fallback: 2.5s timeout automatically unlocks screen if target is missing, preventing soft-locks.
 */

import {
  HOME_TUTORIAL_STEPS,
  TIMEOUT_SAFETY_MS,
  calculateBubblePlacement,
  generateCutoutClipPath
} from './tutorialConfig';
export { HOME_TUTORIAL_STEPS, TIMEOUT_SAFETY_MS, calculateBubblePlacement, generateCutoutClipPath };

const HomeTutorialOverlay = ({
  tutorialState,
  currentView = 'home',
  userBP = 0,
  isModalOpen = false,
  activeModalType = null,
  onStepAdvance,
  onCloseModal,
  onNavigateToHome,
  onStartGame
}) => {
  const currentStep = tutorialState?.currentStep || 1;
  const isEligible = tutorialState?.eligible && tutorialState?.status !== 'completed';
  const stepConfig = HOME_TUTORIAL_STEPS[currentStep] || HOME_TUTORIAL_STEPS[1];

  const [targetRect, setTargetRect] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const animFrameRef = useRef(null);

  // 1. Target Element Measuring Function
  const measureTarget = useCallback(() => {
    if (!stepConfig) return null;

    // Special case for step 3 when player is already in Marketplace view
    if (currentStep === 3 && currentView === 'marketplace') {
      return 'in_shop_fullview';
    }

    const selector = stepConfig.targetSelector;
    if (!selector) return null;

    const el = document.querySelector(selector);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const padding = 5;
    return {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      bottom: rect.bottom + padding,
      right: rect.right + padding,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }, [stepConfig, currentStep, currentView]);

  // 2. Dynamic tracking via ResizeObserver & Scroll Listeners
  useEffect(() => {
    if (!isEligible) return;

    let mounted = true;
    setIsTimedOut(false);

    const updatePosition = () => {
      if (!mounted) return;
      const measured = measureTarget();
      if (measured) {
        setTargetRect(measured);
        // Clear safety timeout once successfully found
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // Immediate calculation
    updatePosition();

    // Start safety watchdog (2.5 seconds)
    timeoutRef.current = setTimeout(() => {
      if (!measureTarget() && mounted) {
        console.warn(`[HomeTutorialOverlay] Target ${stepConfig.targetSelector} not found within ${TIMEOUT_SAFETY_MS}ms. Unlocking overlay to prevent soft-lock.`);
        setIsTimedOut(true);
      }
    }, TIMEOUT_SAFETY_MS);

    // Continuous tracking listeners
    const handleScrollOrResize = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleScrollOrResize());
      resizeObserver.observe(document.body);
    }

    // Interval fallback check for dynamic animations or modal openings
    const pollInterval = setInterval(updatePosition, 300);

    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearInterval(pollInterval);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isEligible, currentStep, currentView, isModalOpen, activeModalType, measureTarget, stepConfig]);

  // If not eligible or marked completed, do not render overlay
  if (!isEligible) return null;

  // If safety watchdog timed out, do not block the screen
  if (isTimedOut) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '84px',
          right: '16px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1.5px solid #FFBC00',
          borderRadius: '16px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          color: '#FFF',
          fontSize: '12px',
          fontWeight: 800
        }}
      >
        <span style={{ fontSize: '16px' }}>🐯</span>
        <span>新手引导暂停中</span>
        <button
          onClick={() => {
            setIsTimedOut(false);
            const m = measureTarget();
            if (m) setTargetRect(m);
          }}
          style={{
            background: '#FFBC00',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontWeight: 900,
            padding: '3px 8px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          重试
        </button>
      </div>
    );
  }

  // Calculate Speech Bubble Placement
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 667;

  const isInShopMode = currentStep === 3 && currentView === 'marketplace';
  const isTargetInModal = (currentStep === 1 && isModalOpen && activeModalType === 'daily') ||
                          (currentStep === 2 && isModalOpen && activeModalType === 'streak');

  // Intelligent bubble position calculation
  let bubblePlacement = 'below'; // 'above' | 'below'
  let bubbleTop = 0;
  let bubbleLeft = 16;
  const bubbleWidth = Math.min(320, viewportWidth - 32);

  if (targetRect && typeof targetRect === 'object') {
    const spaceAbove = targetRect.top;
    const spaceBelow = viewportHeight - targetRect.bottom;

    // Prefer placing bubble where there is at least 180px available
    if (spaceAbove >= 180 && spaceAbove > spaceBelow) {
      bubblePlacement = 'above';
      bubbleTop = Math.max(16, targetRect.top - 170);
    } else {
      bubblePlacement = 'below';
      bubbleTop = Math.min(viewportHeight - 190, targetRect.bottom + 14);
    }

    // Align horizontally with target center, bounded by screen edges
    const idealLeft = targetRect.centerX - bubbleWidth / 2;
    bubbleLeft = Math.max(16, Math.min(viewportWidth - bubbleWidth - 16, idealLeft));
  }

  // Handle "Next Step" from Modal in Step 1 & Step 2
  const handleNextStepInModal = () => {
    playPunchyPopSound();
    if (onCloseModal) onCloseModal();
    if (onStepAdvance) {
      onStepAdvance(currentStep + 1, 'highlight');
    }
  };

  // Handle "Back to Lobby" in Step 3
  const handleReturnToLobby = () => {
    playModalSwooshSound(true);
    if (onNavigateToHome) onNavigateToHome();
    if (onStepAdvance) {
      onStepAdvance(4, 'highlight');
    }
  };

  // Polygon Cutout Clip-Path
  // The cutout area lets clicks pass through directly to the underlying element!
  const hasCutout = targetRect && typeof targetRect === 'object' && !isInShopMode && !isTargetInModal;
  const clipPathStyle = hasCutout
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${targetRect.left}px ${targetRect.top}px,
        ${targetRect.left}px ${targetRect.bottom}px,
        ${targetRect.right}px ${targetRect.bottom}px,
        ${targetRect.right}px ${targetRect.top}px,
        ${targetRect.left}px ${targetRect.top}px
      )`
    : 'none';

  return (
    <div
      className="home-tutorial-overlay-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* 1. PHYSICAL CLICK BARRIER & DARK SHADOW MASK */}
      {/* Clicks on background are strictly intercepted! */}
      <div
        className="tutorial-shadow-mask"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          background: isInShopMode ? 'rgba(5, 8, 16, 0.45)' : 'rgba(5, 8, 16, 0.74)',
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
          pointerEvents: (isTargetInModal || isInShopMode) ? 'none' : 'auto',
          zIndex: 9991,
          transition: 'clip-path 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease'
        }}
      />

      {/* 2. TARGET HIGHLIGHT SPOTLIGHT BOX & PULSE GLOW */}
      {hasCutout && (
        <div
          className="tutorial-spotlight-box"
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: '16px',
            border: '2.5px solid #FFBC00',
            boxShadow: '0 0 0 4px rgba(255, 188, 0, 0.25), 0 0 24px rgba(255, 188, 0, 0.65)',
            pointerEvents: 'none',
            zIndex: 9992,
            animation: 'spotlightPulse 1.8s ease-in-out infinite'
          }}
        />
      )}

      {/* 3. STEP 3: SPECIAL IN-SHOP (MARKETPLACE) FLOATING BANNER */}
      {isInShopMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '380px',
            zIndex: 9998,
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '2px solid #FFBC00',
            borderRadius: '24px',
            padding: '16px 18px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 188, 0, 0.3)',
            pointerEvents: 'auto',
            animation: 'slideUpBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '52px', height: '52px', flexShrink: 0 }}>
              <PlayBankMascot variant="cheer" size={52} interactive={false} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFBC00', color: '#000', borderRadius: '9999px', padding: '1px 8px', fontSize: '10px', fontWeight: 900, marginBottom: '4px' }}>
                <Sparkles size={11} /> STEP 3/4 · 商店体验
              </div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                {stepConfig.shopTitle}
              </h4>
            </div>
          </div>

          {/* Real-time BP comparison pill badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(255, 188, 0, 0.15)', border: '1px solid rgba(255, 188, 0, 0.4)', borderRadius: '12px', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800 }}>你的当前点数</div>
              <div style={{ fontSize: '14px', color: '#FFBC00', fontWeight: 900 }}>🪙 {userBP} BP</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800 }}>商品兑换所需</div>
              <div style={{ fontSize: '14px', color: '#60A5FA', fontWeight: 900 }}>800 ~ 1,500 BP</div>
            </div>
          </div>

          <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', lineHeight: 1.45, color: '#CBD5E1', fontWeight: 600 }}>
            {stepConfig.shopDescription(userBP)}
          </p>

          <PrimaryButton
            onClick={handleReturnToLobby}
            size="medium"
            variant="primary"
          >
            {stepConfig.returnButtonText}
          </PrimaryButton>
        </div>
      )}

      {/* 4. MODAL OPENED STEP (Step 1 & Step 2 Inside Daily/Streak Modal) */}
      {isTargetInModal && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '360px',
            zIndex: 10005,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            border: '2px solid #FFBC00',
            borderRadius: '24px',
            padding: '16px 18px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 188, 0, 0.4)',
            pointerEvents: 'auto',
            animation: 'slideUpBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              <PlayBankMascot variant={stepConfig.mascotVariant} size={48} interactive={false} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFBC00', color: '#000', borderRadius: '9999px', padding: '1px 8px', fontSize: '10px', fontWeight: 900, marginBottom: '2px' }}>
                STEP {currentStep}/4
              </div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#FFF' }}>
                {stepConfig.modalTitle}
              </h4>
            </div>
          </div>

          <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', lineHeight: 1.45, color: '#E2E8F0', fontWeight: 600 }}>
            {stepConfig.modalDescription}
          </p>

          <PrimaryButton
            onClick={handleNextStepInModal}
            size="medium"
            variant="primary"
          >
            {stepConfig.nextButtonText}
          </PrimaryButton>
        </div>
      )}

      {/* 5. STANDARD TARGET SPEECH BUBBLE WITH DIRECTIONAL ARROW */}
      {hasCutout && !isInShopMode && !isTargetInModal && (
        <div
          className="tutorial-speech-bubble-container"
          style={{
            position: 'fixed',
            top: `${bubbleTop}px`,
            left: `${bubbleLeft}px`,
            width: `${bubbleWidth}px`,
            zIndex: 9995,
            pointerEvents: 'auto',
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Top Arrow (if bubble is below target) */}
          {bubblePlacement === 'below' && (
            <div
              style={{
                position: 'absolute',
                top: '-18px',
                left: Math.max(24, Math.min(bubbleWidth - 36, (targetRect?.centerX || 0) - bubbleLeft - 10)),
                color: '#FFBC00',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'bounceArrowUp 1s ease-in-out infinite'
              }}
            >
              <ArrowUp size={24} strokeWidth={3.5} />
            </div>
          )}

          {/* Bubble Card Body */}
          <div
            style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '22px',
              padding: '14px 16px',
              boxShadow: '0 8px 0px #000000, 0 12px 24px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {/* Mascot Avatar + Step Indicator Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <PlayBankMascot variant={stepConfig.mascotVariant} size={40} interactive={false} />
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#000000' }}>
                  {stepConfig.title}
                </h4>
              </div>

              <span
                style={{
                  background: '#FFBC00',
                  color: '#000000',
                  border: '1.5px solid #000',
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 900
                }}
              >
                {currentStep}/4
              </span>
            </div>

            {/* Description Text */}
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: '#334155', fontWeight: 700 }}>
              {stepConfig.description}
            </p>

            {/* Action Hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
              <span>👆</span>
              <span>请直接点击高亮区域</span>
            </div>
          </div>

          {/* Bottom Arrow (if bubble is above target) */}
          {bubblePlacement === 'above' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: Math.max(24, Math.min(bubbleWidth - 36, (targetRect?.centerX || 0) - bubbleLeft - 10)),
                color: '#FFBC00',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'bounceArrowDown 1s ease-in-out infinite'
              }}
            >
              <ArrowDown size={24} strokeWidth={3.5} />
            </div>
          )}
        </div>
      )}

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes spotlightPulse {
          0%, 100% {
            box-shadow: 0 0 0 3px #FFBC00, 0 0 16px rgba(255, 188, 0, 0.45);
          }
          50% {
            box-shadow: 0 0 0 5px #F59E0B, 0 0 28px rgba(255, 188, 0, 0.85);
          }
        }
        @keyframes bounceArrowDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes bounceArrowUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUpBounce {
          0% { transform: translate(-50%, 40px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HomeTutorialOverlay;
