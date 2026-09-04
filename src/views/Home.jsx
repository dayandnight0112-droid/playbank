import React, { useState } from 'react';
import { Flame, Coins, Bell, Shield, Play } from 'lucide-react';
import PrimaryButton from '../components/common/PrimaryButton';
import CurrencyBadge from '../components/common/CurrencyBadge';
import AdventureScene from '../components/home/AdventureScene';
import LobbySideAction from '../components/home/LobbySideAction';
import { getHomeScene } from '../data/homeScenes';

const Home = ({
  currentUser,
  guestProfile,
  userBP = 0,
  playsToday = 0,
  onStartChallenge,
  onGoMarket,
  onGoBattle
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

        {/* Right Action Column (Event, Boss Gate, Achievement) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '12px',
            zIndex: 15,
            width: '54px'
          }}
        >
          {/* Placeholder for Step 22 Right side icons */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF'
            }}
          >
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span style={{ fontSize: '9px', fontWeight: 800 }}>Event</span>
          </div>

          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF'
            }}
          >
            <span style={{ fontSize: '18px' }}>🔒</span>
            <span style={{ fontSize: '9px', fontWeight: 800 }}>Boss</span>
          </div>

          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF'
            }}
          >
            <span style={{ fontSize: '18px' }}>🏆</span>
            <span style={{ fontSize: '9px', fontWeight: 800 }}>Badge</span>
          </div>
        </div>
      </div>

      {/* Dynamic Modal Container for Lobby Side Actions (Steps 21, 26, 27, 28) */}
      {activeModal && (
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
            {activeModal === 'daily' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📜</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>Daily Mission</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0' }}>每日任务系统（完成练习、累计答题）已就绪。</p>
              </>
            )}
            {activeModal === 'streak' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔥</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>Streak Reward</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0' }}>连续签到进度已记录：第 {streakDays} 天！</p>
              </>
            )}
            {activeModal === 'chest' && (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎁</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>Lucky Chest</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0' }}>免费幸运宝箱已就绪（READY），随时可开启！</p>
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
