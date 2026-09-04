import React, { useState, useEffect } from 'react';
import { X, Check, Gift, Sparkles, Clock } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { mockDb, getTimeUntilMalaysiaMidnight } from '../../lib/mockDb';

/**
 * DailyMissionModal
 * Archero-style Daily Mission & Quests Modal (Step 26):
 * - 3 Core Daily Quests with real-time progression & progress bars
 * - Real-time Malaysia midnight countdown
 * - Interactive Claim button with instant BP + Water rewards
 * - Satisfying celebration burst feedback
 */
const DailyMissionModal = ({
  isOpen,
  onClose,
  userBP = 0,
  onUpdateBP,
  onGoBattle
}) => {
  const [missionsState, setMissionsState] = useState(() => mockDb.getDailyMissions());
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMalaysiaMidnight().formatted);
  const [claimedNotice, setClaimedNotice] = useState(null);

  // Live countdown timer to Malaysia midnight (00:00 MYT)
  useEffect(() => {
    if (!isOpen) return;

    // Refresh missions in case date crossed midnight
    setMissionsState(mockDb.getDailyMissions());

    const timer = setInterval(() => {
      const countdown = getTimeUntilMalaysiaMidnight();
      setTimeLeft(countdown.formatted);
      if (countdown.diffMs <= 1000) {
        setMissionsState(mockDb.getDailyMissions());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const missionsList = [
    {
      key: 'completeQuiz',
      title: 'Daily Battle / 每日出征',
      description: '完成 1 次关卡试炼挑战 (Complete 1 Battle)',
      target: 1,
      rewardBP: 20,
      rewardWater: 1,
      icon: '⚔️'
    },
    {
      key: 'correctAnswers',
      title: 'Sharp Mind / 连环神准',
      description: '在对战中累计答对 5 题 (5 Correct Answers)',
      target: 5,
      rewardBP: 30,
      rewardWater: 1,
      icon: '🎯'
    },
    {
      key: 'answerQuestions',
      title: 'Perseverance / 知识猎手',
      description: '单日累计答满 10 道题目 (Answer 10 Questions)',
      target: 10,
      rewardBP: 50,
      rewardWater: 2,
      icon: '🔥'
    }
  ];

  // Calculate total completed & claimed
  let completedCount = 0;
  missionsList.forEach((m) => {
    const data = missionsState?.missions?.[m.key];
    if (data?.claimed) completedCount++;
  });

  const handleClaim = (missionKey, rewardBP, rewardWater) => {
    const data = missionsState?.missions?.[missionKey];
    if (!data || data.claimed || data.progress < data.target) return;

    // Mark as claimed in mockDb
    mockDb.claimMissionReward(missionKey);
    const updatedMissions = mockDb.getDailyMissions();
    setMissionsState(updatedMissions);

    // Award BP
    const newTotalBP = mockDb.awardBP(rewardBP);
    if (onUpdateBP) {
      onUpdateBP(newTotalBP);
    }

    // Trigger celebration toast
    setClaimedNotice(`+${rewardBP} BP & +${rewardWater} 💧 claimed!`);
    setTimeout(() => {
      setClaimedNotice(null);
    }, 2500);
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
          maxWidth: '400px',
          maxHeight: '90vh',
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
        {/* Top Gold Banner & Header */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #B45309 0%, #78350F 100%)',
            padding: '20px 20px 16px',
            textAlign: 'center',
            borderBottom: '2px solid rgba(255, 188, 0, 0.3)'
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

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '4px 12px',
              borderRadius: '9999px',
              marginBottom: '6px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#FEF08A',
              letterSpacing: '1px'
            }}
          >
            <Clock size={13} />
            RESETS IN {timeLeft}
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '2px 0 6px 0',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}
          >
            📜 DAILY MISSIONS
          </h2>

          <p style={{ fontSize: '12px', color: '#FDE68A', margin: 0, opacity: 0.9 }}>
            完成每日目标，获得大量 BankPoint 与庄园甘露！
          </p>
        </div>

        {/* Overall Activity Progress Pill */}
        <div
          style={{
            padding: '12px 20px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>
            Daily Activity
          </span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFBC00' }}>
            {completedCount} / 3 Completed
          </span>
        </div>

        {/* Notice Toast */}
        {claimedNotice && (
          <div
            style={{
              margin: '8px 20px 0',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 900,
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              animation: 'popIn 0.2s ease-out'
            }}
          >
            🎉 {claimedNotice}
          </div>
        )}

        {/* Missions List */}
        <div
          style={{
            padding: '14px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto'
          }}
        >
          {missionsList.map((m) => {
            const data = missionsState?.missions?.[m.key] || {
              progress: 0,
              target: m.target,
              claimed: false
            };
            const currentProgress = Math.min(data.progress || 0, m.target);
            const isFinished = currentProgress >= m.target;
            const isClaimed = !!data.claimed;
            const percentage = Math.round((currentProgress / m.target) * 100);

            return (
              <div
                key={m.key}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: isClaimed
                    ? '1.5px solid rgba(255, 255, 255, 0.08)'
                    : isFinished
                    ? '1.5px solid #10B981'
                    : '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '18px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: isClaimed ? 0.65 : 1,
                  boxShadow: isFinished && !isClaimed ? '0 0 14px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {/* Mission Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isClaimed
                      ? 'rgba(71, 85, 105, 0.3)'
                      : 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}
                >
                  {m.icon}
                </div>

                {/* Mission Details & Progress */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>
                      {m.title}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: isFinished ? '#10B981' : '#94A3B8' }}>
                      {currentProgress} / {m.target}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '11px',
                      color: '#94A3B8',
                      margin: '0 0 6px 0',
                      lineHeight: 1.2
                    }}
                  >
                    {m.description}
                  </p>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '9999px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        borderRadius: '9999px',
                        background: isFinished
                          ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                          : 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Action CTA Button */}
                <div style={{ flexShrink: 0 }}>
                  {isClaimed ? (
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        background: 'rgba(71, 85, 105, 0.4)',
                        color: '#94A3B8',
                        fontSize: '11px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={14} /> DONE
                    </div>
                  ) : isFinished ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(m.key, m.rewardBP, m.rewardWater)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        outline: 'none',
                        userSelect: 'none'
                      }}
                    >
                      <span>CLAIM</span>
                      <span style={{ fontSize: '10px', color: '#FEF08A' }}>+{m.rewardBP} BP</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onGoBattle) onGoBattle();
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: 'rgba(255, 188, 0, 0.15)',
                        border: '1.5px solid rgba(255, 188, 0, 0.4)',
                        color: '#FFBC00',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        outline: 'none'
                      }}
                    >
                      <span>GO ▶</span>
                      <span style={{ fontSize: '10px', color: '#CBD5E1' }}>+{m.rewardBP} BP</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Dismiss Button */}
        <div style={{ padding: '0 20px 20px' }}>
          <PrimaryButton onClick={onClose} size="medium" variant="primary">
            CONFIRM
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default DailyMissionModal;
