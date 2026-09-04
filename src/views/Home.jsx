import React, { useState } from 'react';
import PrimaryButton from '../components/common/PrimaryButton';
import CurrencyBadge from '../components/common/CurrencyBadge';
import AdventureScene from '../components/home/AdventureScene';
import LobbySideAction from '../components/home/LobbySideAction';
import DailyMissionModal from '../components/home/DailyMissionModal';
import StreakRewardModal from '../components/home/StreakRewardModal';
import { getHomeScene } from '../data/homeScenes';

const Home = ({
  currentUser,
  guestProfile,
  userBP = 0,
  playsToday = 0,
  onStartChallenge,
  onGoMarket,
  onGoBattle,
  onUpdateBP
}) => {
  // Player Display Info
  const playerName = currentUser
    ? (currentUser.ic_name || currentUser.email?.split('@')[0] || 'Player')
    : (guestProfile?.guestName || 'Guest 4821');

  const playerLevel = guestProfile?.level || 3;
  const streakDays = guestProfile?.streak || 3;
  const currentChapter = guestProfile?.chapterProgress?.chapter || 1;
  const chapterName = guestProfile?.chapterProgress?.chapterName || 'Training Grounds';
  const currentStage = guestProfile?.chapterProgress?.stage || 3;
  const totalStages = guestProfile?.chapterProgress?.totalStages || 8;
  const homeSceneId = guestProfile?.homeSceneId || 'trainingCamp';
  const activeScene = getHomeScene(homeSceneId);

  const [activeModal, setActiveModal] = useState(null); // 'daily' | 'streak' | 'chest' | 'event' | 'achievements'

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
        background: '#0F172A', // Deep atmospheric gaming background
        padding: '16px 16px calc(80px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* 1. TOP STATUS BAR (HUD - Step 16) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          marginBottom: '14px',
          padding: '2px 4px'
        }}
      >
        {/* Left: Avatar + Player / Guest Name + Lv. 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              position: 'relative',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#1E293B',
              border: '2.5px solid var(--brand-primary, #FFBC00)',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}playbanklogo.png`}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {playerName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span
                style={{
                  background: 'var(--brand-primary, #FFBC00)',
                  color: '#000000',
                  borderRadius: '9999px',
                  padding: '1px 8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '0.3px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Lv.{playerLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Currency & Streaks Badges (🔥 3, 🪙 {userBP}) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CurrencyBadge
            icon="🔥"
            amount={streakDays}
            accentColor="#F87171"
            borderColor="rgba(239, 68, 68, 0.4)"
          />

          <CurrencyBadge
            icon="🪙"
            amount={userBP}
            accentColor="#FBBF24"
            borderColor="rgba(245, 158, 11, 0.45)"
          />
        </div>
      </header>

      {/* 2. MAIN LOBBY STAGE (Archero Information Structure) */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          zIndex: 10,
          margin: '8px 0'
        }}
      >
        {/* Left Action Column (Daily Mission, Streak Reward, Lucky Chest - Step 21) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '12px',
            zIndex: 15,
            width: '56px'
          }}
        >
          {/* 1. 每日任务 (带红点提醒) */}
          <LobbySideAction
            icon="📜"
            label="Daily"
            badgeType="dot"
            badgeColor="#EF4444"
            glowColor="rgba(239, 68, 68, 0.4)"
            onClick={() => setActiveModal('daily')}
          />

          {/* 2. 连胜签到 (显示 Day 3) */}
          <LobbySideAction
            icon="🔥"
            label="Streak"
            badgeType="pill"
            badgeText={`Day ${streakDays}`}
            badgeColor="#F97316"
            glowColor="rgba(249, 115, 22, 0.4)"
            onClick={() => setActiveModal('streak')}
          />

          {/* 3. 幸运宝箱 (显示 READY 状态) */}
          <LobbySideAction
            icon="🎁"
            label="Chest"
            badgeType="pill"
            badgeText="READY"
            badgeColor="#10B981"
            glowColor="rgba(16, 185, 129, 0.45)"
            onClick={() => setActiveModal('chest')}
          />
        </div>

        {/* Center: Main Adventure Scene Stage (Mascot-free! Player's Adventure World) */}
        <AdventureScene
          scene={activeScene}
          chapter={currentChapter}
          chapterName={chapterName}
          stage={currentStage}
          totalStages={totalStages}
          onContinue={onGoBattle || onStartChallenge}
        />

        {/* Right Action Column (Event, Boss Gate, Achievements - Step 22) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '12px',
            zIndex: 15,
            width: '56px'
          }}
        >
          {/* 1. 限时活动 (Event - HOT 标识) */}
          <LobbySideAction
            icon="⚡"
            label="Event"
            badgeType="pill"
            badgeText="HOT"
            badgeColor="#A855F7"
            glowColor="rgba(168, 85, 247, 0.4)"
            onClick={() => setActiveModal('event')}
          />

          {/* 2. 领主封印巨门 (Boss Gate - 显示 LOCKED) */}
          <LobbySideAction
            icon="💀"
            label="Boss"
            badgeType="pill"
            badgeText="LOCKED"
            badgeColor="#EF4444"
            glowColor="rgba(239, 68, 68, 0.35)"
            onClick={() => setActiveModal('boss')}
          />

          {/* 3. 成就勋章 (Achievements - 显示进度 1/12) */}
          <LobbySideAction
            icon="🏆"
            label="Badge"
            badgeType="pill"
            badgeText="1/12"
            badgeColor="#EAB308"
            glowColor="rgba(234, 179, 8, 0.4)"
            onClick={() => setActiveModal('achievements')}
          />
        </div>
      </div>

      {/* Dedicated Daily Missions Modal (Step 26) */}
      <DailyMissionModal
        isOpen={activeModal === 'daily'}
        onClose={() => setActiveModal(null)}
        userBP={userBP}
        onUpdateBP={onUpdateBP}
        onGoBattle={onGoBattle || onStartChallenge}
      />

      {/* Dedicated Streak Reward Modal (Step 27) */}
      <StreakRewardModal
        isOpen={activeModal === 'streak'}
        onClose={() => setActiveModal(null)}
        onUpdateBP={onUpdateBP}
      />

      {/* Dynamic Modal Container for Lobby Side Actions (Steps 28, etc.) */}
      {activeModal && activeModal !== 'daily' && activeModal !== 'streak' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              background: '#1E293B',
              borderRadius: '24px',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              textAlign: 'center'
            }}
          >
            {activeModal === 'chest' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎁</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>Lucky Chest</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0' }}>免费幸运宝箱已就绪（READY），随时可开启！</p>
              </>
            )}
            {activeModal === 'event' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚡</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>Limited Event</h3>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1.5px solid #A855F7', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#F3E8FF', marginBottom: '4px' }}>🔥 阶段狂欢：双倍 BP 掉落</div>
                  <p style={{ fontSize: '12px', color: '#D8B4FE', margin: 0 }}>本周末通关任意主线关卡，可获得 200% BankPoint！</p>
                </div>
              </>
            )}
            {activeModal === 'boss' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>💀</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', margin: '0 0 8px 0' }}>Boss Gate · 封印巨门</h3>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1.5px solid #EF4444', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#FEE2E2', marginBottom: '4px' }}>🔒 状态：当前锁定中</div>
                  <p style={{ fontSize: '12px', color: '#FCA5A5', margin: 0 }}>需通关 Chapter 1「训练营地」全部 8 个 Stage 方可挑战守卫巨兽！</p>
                </div>
              </>
            )}
            {activeModal === 'achievements' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFBC00', margin: '0 0 8px 0' }}>Achievements & Badges</h3>
                <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1.5px solid #FFBC00', borderRadius: '14px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>🎖️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#FEF08A' }}>冒险启程者 (Starter Badge)</div>
                    <div style={{ fontSize: '11px', color: '#CBD5E1' }}>已解锁 · 成功通过新手引导试炼</div>
                  </div>
                </div>
              </>
            )}
            <PrimaryButton onClick={() => setActiveModal(null)} size="medium" variant="primary">
              CONFIRM
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
