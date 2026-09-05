import React, { useState, useEffect } from 'react';
import { X, Zap, Trophy, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';
import { playLootSparkleSound } from '../../lib/soundEffects';

/**
 * EventCardModal
 * Limited-Time Event & Weekend Double BP Rush Modal (Step 29):
 * - Electric neon theme & live event timer
 * - 3 Event Buffs: 2X Battle BP, Streak Booster, Milestone Extra Drop
 * - Interactive milestone tracking & claimable bonus
 * - One-click CTA into Battle
 */
const EventCardModal = ({
  isOpen,
  onClose,
  onUpdateBP,
  onGoBattle
}) => {
  const [milestoneClaimed, setMilestoneClaimed] = useState(() => {
    return localStorage.getItem('playbank_event_milestone_claimed') === 'true';
  });
  const [battlesDone, setBattlesDone] = useState(() => {
    return parseInt(localStorage.getItem('playbank_event_battles') || '2', 10);
  });
  const [claimToast, setClaimToast] = useState(null);

  if (!isOpen) return null;

  const milestoneTarget = 3;
  const isMilestoneReady = battlesDone >= milestoneTarget && !milestoneClaimed;

  const handleClaimMilestone = () => {
    if (!isMilestoneReady) return;

    localStorage.setItem('playbank_event_milestone_claimed', 'true');
    setMilestoneClaimed(true);

    playLootSparkleSound();

    const newTotal = mockDb.awardBP(50);
    if (onUpdateBP) {
      onUpdateBP(newTotal);
    }

    setClaimToast('🎉 活动阶段大奖 +50 BP 已到账！');
    setTimeout(() => setClaimToast(null), 2500);
  };

  const handleJoinBattle = () => {
    onClose();
    if (onGoBattle) {
      onGoBattle();
    }
  };

  return (
    <div
      onClick={onClose}
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(168, 85, 247, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168, 85, 247, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Electric Violet Banner */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #6B21A8 0%, #4C1D95 100%)',
            padding: '22px 20px 16px',
            textAlign: 'center',
            borderBottom: '2px solid rgba(168, 85, 247, 0.4)'
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
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

          {/* Event Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 14px',
              borderRadius: '9999px',
              marginBottom: '8px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#E9D5FF',
              letterSpacing: '1px'
            }}
          >
            <Clock size={13} color="#C084FC" />
            ENDS IN: 1D 14H 28M
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}
          >
            ⚡ DOUBLE BP RUSH
          </h2>

          <p style={{ fontSize: '12px', color: '#DDD6FE', margin: 0 }}>
            周末狂欢盛典：主线挑战 200% 积分全量掉落！
          </p>
        </div>

        {/* Claim Toast Notice */}
        {claimToast && (
          <div
            style={{
              margin: '10px 20px 0',
              padding: '10px 14px',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 900,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.5)'
            }}
          >
            {claimToast}
          </div>
        )}

        {/* Event Content & Buff Cards */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto'
          }}
        >
          {/* Buff 1: 2X Battle Reward */}
          <div
            style={{
              background: 'rgba(30, 27, 75, 0.7)',
              border: '1.5px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '18px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(124, 58, 237, 0.4)'
              }}
            >
              ⚡
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#F3E8FF', marginBottom: '2px' }}>
                关卡双倍掉落 (2X BP Drops)
              </div>
              <p style={{ fontSize: '11px', color: '#C4B5FD', margin: 0, lineHeight: 1.2 }}>
                活动期间通过任意主线关卡，基础积分结算翻倍！
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#FDE047',
                background: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              200%
            </span>
          </div>

          {/* Buff 2: Streak Bonus */}
          <div
            style={{
              background: 'rgba(30, 27, 75, 0.7)',
              border: '1.5px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '18px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(234, 88, 12, 0.4)'
              }}
            >
              🔥
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#F3E8FF', marginBottom: '2px' }}>
                连胜签到狂欢增益
              </div>
              <p style={{ fontSize: '11px', color: '#C4B5FD', margin: 0, lineHeight: 1.2 }}>
                每日签到额外加赠 +50% BankPoint 与庄园甘露。
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#F97316',
                background: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              BUFF
            </span>
          </div>

          {/* Event Milestone Challenge Box */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(88, 28, 135, 0.4) 0%, rgba(59, 7, 100, 0.6) 100%)',
              border: '2px solid rgba(216, 180, 254, 0.4)',
              borderRadius: '20px',
              padding: '14px 16px',
              marginTop: '4px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={16} color="#FBBF24" />
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#FEF08A' }}>
                  狂欢阶段目标 (Milestone)
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#C4B5FD' }}>
                {Math.min(battlesDone, milestoneTarget)} / {milestoneTarget} 关卡
              </span>
            </div>

            <p style={{ fontSize: '11px', color: '#E9D5FF', margin: '0 0 10px 0' }}>
              活动期间完成 3 次主线关卡挑战，额外获得 <strong style={{ color: '#FFBC00' }}>+50 BP</strong>！
            </p>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '7px',
                borderRadius: '9999px',
                background: 'rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                marginBottom: '10px'
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (battlesDone / milestoneTarget) * 100)}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 100%)'
                }}
              />
            </div>

            {/* Milestone Button */}
            {milestoneClaimed ? (
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  color: '#94A3B8',
                  fontSize: '11px',
                  fontWeight: 900,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Check size={14} /> 阶段大奖已领取
              </div>
            ) : isMilestoneReady ? (
              <button
                type="button"
                onClick={handleClaimMilestone}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                领取阶段奖励 +50 BP 🎁
              </button>
            ) : (
              <div
                style={{
                  fontSize: '11px',
                  color: '#C4B5FD',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                还需完成 {milestoneTarget - battlesDone} 次关卡即可解锁大奖
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA to Battle */}
        <div style={{ padding: '0 20px 20px' }}>
          <PrimaryButton
            onClick={handleJoinBattle}
            size="large"
            variant="primary"
            subtitle="立即参与双倍积分挑战"
          >
            ENTER EVENT BATTLE ⚡
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EventCardModal;
