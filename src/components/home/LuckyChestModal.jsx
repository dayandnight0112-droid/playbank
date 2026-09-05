import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Check, Lock } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';
import { playLootSparkleSound, playPunchyPopSound } from '../../lib/soundEffects';

/**
 * LuckyChestModal
 * Archero-style 4-Hour Free Lucky Chest (Step 28):
 * - Live 4-hour cooldown timer or READY state
 * - Weighted probability drops (20~100 BP, Water, Double scrolls)
 * - 3D tactile chest animation (Idle, Shake, Burst, Reveal)
 * - Instant balance credit & celebration feedback
 */
const LuckyChestModal = ({
  isOpen,
  onClose,
  onUpdateBP,
  onGoBattle
}) => {
  const [chestState, setChestState] = useState(() => mockDb.getLuckyChestState());
  const [animationStage, setAnimationStage] = useState('idle'); // 'idle' | 'shaking' | 'revealed'
  const [rewardResult, setRewardResult] = useState(null);

  // Cooldown countdown timer loop
  useEffect(() => {
    if (!isOpen) return;

    setChestState(mockDb.getLuckyChestState());

    const timer = setInterval(() => {
      const current = mockDb.getLuckyChestState();
      setChestState(current);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isReady = chestState.isReady;

  const handleOpenChest = () => {
    if (!isReady || animationStage !== 'idle') return;

    // Trigger shaking animation
    setAnimationStage('shaking');

    setTimeout(() => {
      const res = mockDb.openLuckyChest();
      if (res.success) {
        playLootSparkleSound();
        setRewardResult(res);
        setAnimationStage('revealed');
        setChestState(res.nextState);
        if (onUpdateBP) {
          onUpdateBP(res.newTotalBP);
        }
      } else {
        setAnimationStage('idle');
      }
    }, 1200);
  };

  const handleClose = () => {
    setAnimationStage('idle');
    setRewardResult(null);
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 11, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes chestFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes chestShake {
          0%, 100% { transform: rotate(0deg) scale(1.05); }
          20% { transform: rotate(-8deg) scale(1.08); }
          40% { transform: rotate(8deg) scale(1.1); }
          60% { transform: rotate(-8deg) scale(1.12); }
          80% { transform: rotate(8deg) scale(1.14); }
        }
        @keyframes rewardPop {
          0% { transform: scale(0.6) translateY(20px); opacity: 0; }
          70% { transform: scale(1.08) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes sunburstRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          padding: '24px 20px 20px',
          textAlign: 'center'
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Header Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isReady
              ? 'rgba(16, 185, 129, 0.25)'
              : 'rgba(255, 255, 255, 0.1)',
            border: isReady
              ? '1px solid rgba(16, 185, 129, 0.6)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            padding: '3px 14px',
            borderRadius: '9999px',
            marginBottom: '8px',
            fontSize: '11px',
            fontWeight: 900,
            color: isReady ? '#34D399' : '#94A3B8',
            letterSpacing: '1px'
          }}
        >
          {isReady ? '✨ CHEST READY TO OPEN' : '🔒 ON COOLDOWN'}
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
            textShadow: '0 2px 10px rgba(0,0,0,0.6)'
          }}
        >
          🎁 LUCKY CHEST
        </h2>

        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0' }}>
          每 4 小时可免费开启一次，随机掉落 20~100 BP 与道具！
        </p>

        {/* Center Stage Animation Box */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          {/* Animated Sunburst Backdrop */}
          {(isReady || animationStage === 'revealed') && (
            <div
              style={{
                position: 'absolute',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: animationStage === 'revealed'
                  ? 'radial-gradient(circle, rgba(255, 188, 0, 0.35) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
                animation: 'sunburstRotate 12s linear infinite',
                pointerEvents: 'none'
              }}
            />
          )}

          {/* 1. Revealed State Display */}
          {animationStage === 'revealed' && rewardResult && (
            <div
              style={{
                animation: 'rewardPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: rewardResult.tier === 'epic' ? '#FBBF24' : rewardResult.tier === 'rare' ? '#60A5FA' : '#34D399',
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: '2px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {rewardResult.tier === 'epic' ? '👑 EPIC DROP!' : rewardResult.tier === 'rare' ? '✨ RARE DROP!' : '🌟 COMMON DROP!'}
              </div>

              {/* Main BP Reward Badge */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
                  border: '2px solid #FFBC00',
                  borderRadius: '20px',
                  padding: '12px 24px',
                  boxShadow: '0 8px 24px rgba(255, 188, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '36px' }}>🪙</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#FEF08A' }}>
                    +{rewardResult.rewardBP} BP
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    BankPoint 积分
                  </div>
                </div>
              </div>

              {/* Secondary Rewards */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#93C5FD',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '9999px'
                  }}
                >
                  +{rewardResult.rewardWater} 💧 甘露
                </span>
                {rewardResult.specialItem && (
                  <span
                    style={{
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '1px solid rgba(234, 179, 8, 0.5)',
                      color: '#FDE047',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}
                  >
                    📜 双倍卷轴
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 2. Ready & Shaking State Chest Graphic */}
          {animationStage !== 'revealed' && isReady && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: animationStage === 'shaking'
                  ? 'chestShake 0.4s ease-in-out infinite'
                  : 'chestFloat 3s ease-in-out infinite',
                zIndex: 5
              }}
            >
              <div
                style={{
                  fontSize: '90px',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))'
                }}
              >
                🎁
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#34D399',
                  letterSpacing: '1px'
                }}
              >
                {animationStage === 'shaking' ? 'OPENING...' : 'TAP BELOW TO UNLOCK!'}
              </div>
            </div>
          )}

          {/* 3. Cooldown State Chest Graphic */}
          {animationStage !== 'revealed' && !isReady && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 5,
                opacity: 0.8
              }}
            >
              <div
                style={{
                  position: 'relative',
                  fontSize: '80px',
                  lineHeight: 1,
                  filter: 'grayscale(0.4) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))'
                }}
              >
                🎁
                <div
                  style={{
                    position: 'absolute',
                    top: '25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.75)',
                    padding: '4px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    display: 'flex'
                  }}
                >
                  <Lock size={20} color="#F87171" />
                </div>
              </div>

              {/* Cooldown Timer Pill */}
              <div
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#F87171'
                }}
              >
                <Clock size={14} />
                {chestState.remainingFormatted}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Controls */}
        <div style={{ width: '100%' }}>
          {animationStage === 'revealed' ? (
            <PrimaryButton
              onClick={handleClose}
              size="medium"
              variant="primary"
            >
              COLLECT REWARDS / 收入行囊
            </PrimaryButton>
          ) : isReady ? (
            <PrimaryButton
              onClick={handleOpenChest}
              size="large"
              variant="primary"
              disabled={animationStage === 'shaking'}
              subtitle="100% 概率必得 BP 奖励"
            >
              {animationStage === 'shaking' ? 'OPENING... 💥' : 'OPEN CHEST (FREE) 🎁'}
            </PrimaryButton>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PrimaryButton
                onClick={() => {
                  handleClose();
                  if (onGoBattle) onGoBattle();
                }}
                size="medium"
                variant="primary"
                subtitle="去关卡对战赢取更多 BP"
              >
                ⚔️ GO BATTLE / 挑战关卡
              </PrimaryButton>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                Close / 稍后再来
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyChestModal;
