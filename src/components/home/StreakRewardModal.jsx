import React, { useState } from 'react';
import { X, Check, Flame, Gift, Sparkles } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { mockDb } from '../../lib/mockDb';
import { playCelebrationSound } from '../../lib/soundEffects';

/**
 * StreakRewardModal
 * 7-Day Streak & Check-in Reward Modal (Step 27):
 * - 7-Day Ladder Progression (+10, +15, +20, +25, +30, +40, +100 BP & Super Chest)
 * - Highlights today's claimable reward
 * - Interactive claim with instant BP update
 * - Celebration feedback on claim
 */
const StreakRewardModal = ({
  isOpen,
  onClose,
  onUpdateBP
}) => {
  const [streakData, setStreakData] = useState(() => mockDb.getStreakState());
  const [celebration, setCelebration] = useState(null);

  if (!isOpen) return null;

  const currentStreak = streakData.currentStreak || 3;
  const hasClaimedToday = !!streakData.hasClaimedToday;
  const activeDayInCycle = ((currentStreak - 1) % 7) + 1;
  const targetClaimDay = hasClaimedToday ? activeDayInCycle : ((currentStreak) % 7) || 1;

  const daysConfig = [
    { day: 1, bp: 10, icon: '🪙', title: 'Day 1' },
    { day: 2, bp: 15, icon: '🪙', title: 'Day 2' },
    { day: 3, bp: 20, icon: '🪙', title: 'Day 3' },
    { day: 4, bp: 25, icon: '💧', title: 'Day 4' },
    { day: 5, bp: 30, icon: '💧', title: 'Day 5' },
    { day: 6, bp: 40, icon: '🪙', title: 'Day 6' },
    { day: 7, bp: 100, icon: '👑', title: 'Day 7 · GRAND CHEST', isMega: true }
  ];

  const handleClaimToday = () => {
    if (hasClaimedToday) return;

    const res = mockDb.claimDailyStreak();
    if (res.success) {
      playCelebrationSound();
      setStreakData(res.state);
      if (onUpdateBP) {
        onUpdateBP(res.newTotalBP);
      }
      setCelebration({
        rewardBP: res.rewardBP,
        isSuper: res.isSuperChest
      });
      setTimeout(() => setCelebration(null), 3000);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 11, 20, 0.82)',
        backdropFilter: 'blur(8px)',
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
          border: '2px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Flame Header Banner */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)',
            padding: '22px 20px 16px',
            textAlign: 'center',
            borderBottom: '2px solid rgba(239, 68, 68, 0.4)'
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
              outline: 'none'
            }}
          >
            <X size={18} />
          </button>

          {/* Current Streak Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 14px',
              borderRadius: '9999px',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: 900,
              color: '#FDE68A',
              letterSpacing: '1px'
            }}
          >
            <Flame size={14} color="#F59E0B" fill="#F59E0B" />
            CURRENT STREAK: {currentStreak} DAYS
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '2px 0 4px 0',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)'
            }}
          >
            🔥 7-DAY STREAK REWARD
          </h2>

          <p style={{ fontSize: '12px', color: '#FEE2E2', margin: 0, opacity: 0.9 }}>
            连续登录 7 天，解锁第 7 天黄金传奇大宝箱！
          </p>
        </div>

        {/* Celebration Toast */}
        {celebration && (
          <div
            style={{
              margin: '10px 20px 0',
              padding: '10px 14px',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 900,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.5)'
            }}
          >
            🎉 今日签到成功！已获得 +{celebration.rewardBP} BankPoint
            {celebration.isSuper && ' 与 👑 黄金传奇大宝箱！'}
          </div>
        )}

        {/* 7 Days Ladder Grid */}
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto'
          }}
        >
          {/* Days 1 to 6 (2x3 Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}
          >
            {daysConfig.slice(0, 6).map((item) => {
              const isClaimed = (streakData.claimedDays || []).includes(item.day);
              const isToday = item.day === targetClaimDay && !hasClaimedToday;

              return (
                <div
                  key={item.day}
                  style={{
                    background: isToday
                      ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.35) 100%)'
                      : 'rgba(30, 41, 59, 0.75)',
                    border: isToday
                      ? '2px solid #EF4444'
                      : isClaimed
                      ? '1.5px solid rgba(255, 255, 255, 0.1)'
                      : '1.5px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '16px',
                    padding: '10px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: isToday ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                    opacity: isClaimed ? 0.65 : 1
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', marginBottom: '2px' }}>
                    {item.title}
                  </span>

                  <span style={{ fontSize: '22px', margin: '4px 0' }}>
                    {item.icon}
                  </span>

                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFBC00' }}>
                    +{item.bp} BP
                  </span>

                  {/* Status indicator */}
                  {isClaimed ? (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#10B981',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Check size={10} /> DONE
                    </span>
                  ) : isToday ? (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        background: '#EF4444',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        marginTop: '4px'
                      }}
                    >
                      TODAY
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>
                      LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day 7: GRAND MEGA CHEST (Full width card) */}
          {(() => {
            const day7 = daysConfig[6];
            const isClaimed7 = (streakData.claimedDays || []).includes(7);
            const isToday7 = targetClaimDay === 7 && !hasClaimedToday;

            return (
              <div
                style={{
                  background: isToday7
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: isToday7
                    ? '2.5px solid #FFBC00'
                    : '2px solid rgba(255, 188, 0, 0.45)',
                  borderRadius: '20px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)'
                    }}
                  >
                    👑
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#FEF08A', letterSpacing: '0.5px' }}>
                      DAY 7 · 黄金终极宝箱
                    </div>
                    <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                      连续 7 天大奖：+100 BP & 稀有宝箱！
                    </div>
                  </div>
                </div>

                <div>
                  {isClaimed7 ? (
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> DONE
                    </span>
                  ) : isToday7 ? (
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', background: '#FFBC00', padding: '3px 10px', borderRadius: '9999px' }}>
                      READY
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>
                      🔒 LOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action Button */}
        <div style={{ padding: '0 20px 20px' }}>
          {hasClaimedToday ? (
            <PrimaryButton onClick={onClose} size="medium" variant="secondary">
              ✓ 今日已签到 · 明日再来
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={handleClaimToday}
              size="medium"
              variant="primary"
              subtitle={`签到可得 +${daysConfig[targetClaimDay - 1]?.bp || 20} BankPoint`}
            >
              🔥 今日立即签到
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakRewardModal;
