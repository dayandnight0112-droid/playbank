import React, { useState } from 'react';
import { Sparkles, Trophy, Star, Flame, Award, Map, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import PrimaryButton from '../components/common/PrimaryButton';
import SaveProgressPromptModal from '../components/SaveProgressPromptModal';
import { mockDb } from '../lib/mockDb';

const TutorialReward = ({ guest, stats = {}, onEnterLobby, onLoginAndSave }) => {
  // 'summary' | 'chest_opened'
  const [stage, setStage] = useState('summary');
  const [chestOpening, setChestOpening] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const earnedBP = stats.earnedBP || 120;
  const maxCombo = stats.maxCombo || 6;
  const chestBonusBP = 50;
  const totalBP = earnedBP + chestBonusBP;

  const handleOpenChest = () => {
    setChestOpening(true);
    setTimeout(() => {
      setChestOpening(false);
      setStage('chest_opened');

      // Persist bonus 50 BP and Starter Badge to guest profile
      const currentGuest = mockDb.getGuestProfile();
      if (currentGuest) {
        mockDb.updateGuestProfile({
          bankPoint: (currentGuest.bankPoint || earnedBP) + chestBonusBP,
          achievements: Array.from(new Set([...(currentGuest.achievements || []), 'starter_badge'])),
          tutorialComplete: true
        });
      }
    }, 700);
  };

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
        background: stage === 'chest_opened'
          ? 'radial-gradient(ellipse at 50% 30%, #FEF3C7 0%, #FFFBEB 50%, #F9FAFB 100%)'
          : 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)',
        padding: '36px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Background Ambience Rays */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 188, 0, 0.22) 0%, rgba(255, 188, 0, 0) 70%)',
          pointerEvents: 'none',
          animation: 'spinSlow 20s linear infinite'
        }}
      />

      {/* Top Banner & Header */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        {stage === 'summary' ? (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#000000',
              color: 'var(--brand-primary, #FFBC00)',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <Trophy size={14} /> NEW RECRUIT VICTORY
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#000000',
              margin: '0 0 12px 0',
              letterSpacing: '-0.5px'
            }}>
              TRAINING COMPLETE
            </h1>

            {/* 3 Animated Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--brand-primary, #FFBC00)',
                    border: '3px solid #000000',
                    boxShadow: '0 4px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `starPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${starIdx * 0.15}s both`
                  }}
                >
                  <Star size={24} color="#000000" fill="#000000" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#10B981',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <Sparkles size={14} /> CHEST UNLOCKED
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#000000',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              首胜宝箱已开启！
            </h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: 0 }}>
              恭喜你获得了启程新手大礼包
            </p>
          </div>
        )}
      </div>

      {/* Centerpiece Display */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '340px' }}>
        {stage === 'summary' ? (
          <div>
            {/* Treasure Chest Hero Visual */}
            <div
              style={{
                width: '130px',
                height: '130px',
                margin: '0 auto 24px',
                borderRadius: '32px',
                background: '#FFFFFF',
                border: '4px solid #000000',
                boxShadow: '0 8px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                position: 'relative',
                animation: chestOpening ? 'shake 0.5s ease-in-out' : 'floatBob 3s ease-in-out infinite'
              }}
            >
              📦
              <div style={{
                position: 'absolute',
                bottom: '-12px',
                background: 'var(--brand-primary, #FFBC00)',
                border: '2px solid #000000',
                borderRadius: '9999px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#000'
              }}>
                TAP TO OPEN
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: '#FFFFFF',
                border: '2.5px solid #000000',
                borderRadius: '16px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '3px 3px 0px #000000'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🪙</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#4B5563' }}>BankPoint 累积</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#D97706' }}>
                  +{earnedBP} BP
                </span>
              </div>

              <div style={{
                background: '#FFFFFF',
                border: '2.5px solid #000000',
                borderRadius: '16px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '3px 3px 0px #000000'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🔥</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#4B5563' }}>最佳连击</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#EF4444' }}>
                  COMBO ×{maxCombo}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Opened Chest Rewards List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Reward 1: +50 Bonus BP */}
            <div style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '20px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '4px 4px 0px #000000',
              animation: 'slideUp 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#FEF3C7',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🪙
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                  +{chestBonusBP} BankPoint
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                  首胜宝箱额外奖励 (累计 {totalBP} BP)
                </div>
              </div>
              <Check size={20} color="#10B981" strokeWidth={3} />
            </div>

            {/* Reward 2: Starter Badge */}
            <div style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '20px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '4px 4px 0px #000000',
              animation: 'slideUp 0.4s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#ECFDF5',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎖️
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                  Starter Badge
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                  解锁专属成就「启程先锋」
                </div>
              </div>
              <Check size={20} color="#10B981" strokeWidth={3} />
            </div>

            {/* Reward 3: Chapter 1 Unlocked */}
            <div style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '20px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '4px 4px 0px #000000',
              animation: 'slideUp 0.5s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#EFF6FF',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🗺️
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#000000' }}>
                  First Chapter Unlocked
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                  Chapter 1: Training Grounds 已开启
                </div>
              </div>
              <Check size={20} color="#10B981" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '340px' }}>
        {stage === 'summary' ? (
          <PrimaryButton
            onClick={handleOpenChest}
            size="large"
            variant="primary"
            subtitle="点击开箱获取新人大礼包"
          >
            OPEN CHEST 🎁
          </PrimaryButton>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PrimaryButton
              onClick={() => setShowSavePrompt(true)}
              size="large"
              variant="primary"
              subtitle="开启 Archero 冒险之旅"
            >
              进入冒险 (ENTER)
            </PrimaryButton>

            <button
              onClick={() => onEnterLobby && onEnterLobby()}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6B7280',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              跳过提示，直接以游客进入 →
            </button>
          </div>
        )}
      </div>

      {/* Step 13: Save Progress Optional Prompt */}
      <SaveProgressPromptModal
        isOpen={showSavePrompt}
        guestBP={totalBP}
        onLoginAndSave={() => {
          setShowSavePrompt(false);
          if (onLoginAndSave) onLoginAndSave();
        }}
        onContinueGuest={() => {
          setShowSavePrompt(false);
          if (onEnterLobby) onEnterLobby();
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes starPop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg) scale(1.05); }
          40% { transform: rotate(8deg) scale(1.08); }
          60% { transform: rotate(-6deg) scale(1.1); }
          80% { transform: rotate(6deg) scale(1.1); }
        }
        @keyframes spinSlow {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TutorialReward;
