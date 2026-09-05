import React, { useState } from 'react';
import { X, Trophy, Check, Lock, Sparkles, Award } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';
import { playLootSparkleSound } from '../../lib/soundEffects';

/**
 * BadgesModal
 * Trophy & Achievements Room Modal (Step 30):
 * - Showcases earned badges (e.g. Starter Badge 冒险启程者)
 * - Badges wall with conditions, progress counters, and BP rewards
 * - Interactive claiming for completed achievements
 * - Trophy counter & celebration toast
 */
const BadgesModal = ({
  isOpen,
  onClose,
  userBP = 0,
  onUpdateBP
}) => {
  const [claimedBadges, setClaimedBadges] = useState(() => {
    try {
      const stored = localStorage.getItem('playbank_unlocked_badges');
      return stored ? JSON.parse(stored) : ['starter']; // Starter badge unlocked in Step 12
    } catch (e) {
      return ['starter'];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  if (!isOpen) return null;

  const badgesList = [
    {
      id: 'starter',
      icon: '🎖️',
      name: 'Starter Pioneer / 冒险启程者',
      desc: '完成新手引导 10 步试炼，迈出冒险第一步',
      progressText: '10 / 10 Completed',
      percentage: 100,
      rewardBP: 50,
      isUnlocked: true,
      canClaim: false
    },
    {
      id: 'first_cleared',
      icon: '⚔️',
      name: 'Stage Conqueror / 首通先锋',
      desc: '顺利推进至 Chapter 1 训练营地 Stage 3',
      progressText: '3 / 3 Stages',
      percentage: 100,
      rewardBP: 30,
      isUnlocked: claimedBadges.includes('first_cleared'),
      canClaim: !claimedBadges.includes('first_cleared')
    },
    {
      id: 'streak_king',
      icon: '🔥',
      name: 'Streak King / 连胜王者',
      desc: '保持连续签到 7 天不间断',
      progressText: '3 / 7 Days',
      percentage: 42,
      rewardBP: 100,
      isUnlocked: claimedBadges.includes('streak_king'),
      canClaim: false
    },
    {
      id: 'centurion',
      icon: '🎯',
      name: 'Centurion / 百题斩杀者',
      desc: '在对战试炼中累计正确回答 100 道题目',
      progressText: '18 / 100 Qs',
      percentage: 18,
      rewardBP: 200,
      isUnlocked: claimedBadges.includes('centurion'),
      canClaim: false
    },
    {
      id: 'coin_tycoon',
      icon: '🪙',
      name: 'Coin Tycoon / 积分大富翁',
      desc: '累计收获拥有超过 500 BankPoint',
      progressText: `${userBP} / 500 BP`,
      percentage: Math.min(100, Math.round((userBP / 500) * 100)),
      rewardBP: 150,
      isUnlocked: claimedBadges.includes('coin_tycoon'),
      canClaim: userBP >= 500 && !claimedBadges.includes('coin_tycoon')
    },
    {
      id: 'boss_slayer',
      icon: '👑',
      name: 'Guardian Slayer / 领主终结者',
      desc: '击破 Chapter 1 远方封印巨门的守护者 Boss',
      progressText: 'Chapter 1 Stage 8 Locked',
      percentage: 0,
      rewardBP: 300,
      isUnlocked: claimedBadges.includes('boss_slayer'),
      canClaim: false
    }
  ];

  const unlockedCount = claimedBadges.length;

  const handleClaimBadge = (badgeId, rewardBP) => {
    const updated = Array.from(new Set([...claimedBadges, badgeId]));
    setClaimedBadges(updated);
    localStorage.setItem('playbank_unlocked_badges', JSON.stringify(updated));

    playLootSparkleSound();

    const newTotal = mockDb.awardBP(rewardBP);
    if (onUpdateBP) {
      onUpdateBP(newTotal);
    }

    setToastMessage(`🎉 成功解锁勋章！已领取 +${rewardBP} BankPoint！`);
    setTimeout(() => setToastMessage(null), 2500);
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
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(255, 188, 0, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 188, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Gold Trophy Header Banner */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #B45309 0%, #78350F 100%)',
            padding: '22px 20px 16px',
            textAlign: 'center',
            borderBottom: '2px solid rgba(255, 188, 0, 0.4)'
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

          {/* Collected Counter Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 14px',
              borderRadius: '9999px',
              marginBottom: '6px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#FEF08A',
              letterSpacing: '1px'
            }}
          >
            <Trophy size={13} color="#FBBF24" />
            UNLOCKED: {unlockedCount} / {badgesList.length} BADGES
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '2px 0 4px 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}
          >
            🏆 TROPHY ROOM
          </h2>

          <p style={{ fontSize: '12px', color: '#FDE68A', margin: 0, opacity: 0.9 }}>
            达成专属冒险成就，获取永久勋章与丰厚 BankPoint！
          </p>
        </div>

        {/* Toast celebration notice */}
        {toastMessage && (
          <div
            style={{
              margin: '10px 20px 0',
              padding: '10px 14px',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 900,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.5)'
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Badges List Wall */}
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto'
          }}
        >
          {badgesList.map((badge) => {
            return (
              <div
                key={badge.id}
                style={{
                  background: badge.isUnlocked
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'
                    : 'rgba(30, 41, 59, 0.5)',
                  border: badge.isUnlocked
                    ? '1.5px solid #F59E0B'
                    : badge.canClaim
                    ? '1.5px solid #10B981'
                    : '1.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: badge.isUnlocked ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none',
                  opacity: badge.isUnlocked || badge.canClaim ? 1 : 0.65
                }}
              >
                {/* Badge Icon Emblem */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: badge.isUnlocked
                      ? 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)'
                      : 'rgba(51, 65, 85, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                    boxShadow: badge.isUnlocked ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none'
                  }}
                >
                  {badge.icon}
                </div>

                {/* Details & Progress */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900, color: badge.isUnlocked ? '#FEF08A' : '#FFFFFF' }}>
                      {badge.name}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFBC00' }}>
                      +{badge.rewardBP} BP
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                    {badge.desc}
                  </p>

                  {/* Progress Bar & Subtext */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '5px',
                        borderRadius: '9999px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${badge.percentage}%`,
                          height: '100%',
                          borderRadius: '9999px',
                          background: badge.isUnlocked
                            ? '#F59E0B'
                            : badge.canClaim
                            ? '#10B981'
                            : 'rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', flexShrink: 0 }}>
                      {badge.progressText}
                    </span>
                  </div>
                </div>

                {/* Action status */}
                <div style={{ flexShrink: 0 }}>
                  {badge.isUnlocked ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '4px 8px',
                        borderRadius: '8px'
                      }}
                    >
                      <Check size={12} /> 已佩戴
                    </span>
                  ) : badge.canClaim ? (
                    <button
                      type="button"
                      onClick={() => handleClaimBadge(badge.id, badge.rewardBP)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      领取
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Lock size={12} /> 未解锁
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dismiss Button */}
        <div style={{ padding: '0 20px 20px' }}>
          <PrimaryButton onClick={onClose} size="medium" variant="primary">
            CONFIRM
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default BadgesModal;
