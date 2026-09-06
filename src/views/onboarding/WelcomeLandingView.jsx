import React, { useState, useRef } from 'react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { ChevronDown, Coins, Sparkles, Trophy, BookOpen } from 'lucide-react';

/**
 * WelcomeLandingView (Step 1)
 * Duolingo-style unified landing page featuring:
 * 1. Hero fold: Logo, PB running tiger mascot, slogan, GET STARTED and 已有账户
 * 2. Scrollable features:
 *    - Learn through games
 *    - Earn BankPoint
 *    - Grow stronger
 * 3. Bottom CTA repeat for smooth conversion after scrolling
 */
const WelcomeLandingView = ({ onStart, onOpenLogin, hasExistingProgress = false }) => {
  const [speechText, setSpeechText] = useState('一起来冒险吧！🐾');
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bubbleOptions = [
    '一起来冒险吧！🐾',
    '答题升级，冲向巅峰！⚡',
    '挑战 Boss 拿金币！🪙',
    '准备好开启学习之旅了吗？🎉'
  ];

  const handleMascotTap = () => {
    const nextIdx = (bubbleOptions.indexOf(speechText) + 1) % bubbleOptions.length;
    setSpeechText(bubbleOptions[nextIdx]);
  };

  return (
    <div
      className="welcome-landing-wrapper"
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF9E6 35%, #FFFDF5 100%)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative'
      }}
    >
      {/* ============================================================ */}
      {/* FOLD 1: Hero Section (Full Viewport)                          */}
      {/* ============================================================ */}
      <section
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Ambient Radial Golden Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255, 188, 0, 0.25) 0%, rgba(255, 188, 0, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Top: Official Logo & Slogan */}
        <header
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: '8px'
          }}
        >
          <img
            src="/playbanklogo.png"
            alt="PlayBank Logo"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '10px',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))'
            }}
          />

          {/* Slogan Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '9999px',
              padding: '5px 16px'
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#1F2937',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              Learn. Play. Level Up.
            </span>
          </div>
        </header>

        {/* Center: PB Tiger Mascot with Running Animation */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto 0'
          }}
        >
          <PlayBankMascot
            variant="run"
            size={225}
            speechBubble={speechText}
            interactive={true}
            onClick={handleMascotTap}
          />
        </main>

        {/* Bottom Hero Action Area */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '340px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Main CTA: GET STARTED */}
          <PrimaryButton
            onClick={onStart}
            size="large"
            variant="primary"
            style={{ width: '100%' }}
          >
            {hasExistingProgress ? 'CONTINUE' : 'GET STARTED'}
          </PrimaryButton>

          {/* 4-character Button: '已有账户' */}
          <button
            type="button"
            className="account-login-btn"
            onClick={onOpenLogin}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '16px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 900,
              color: '#000000',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #000000',
              transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              outline: 'none',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #000000';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 0 #000000';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #000000';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 0 #000000';
            }}
          >
            已有账户
          </button>

          {/* Scroll Down Guide Hint */}
          <button
            type="button"
            onClick={scrollToFeatures}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6B7280',
              fontSize: '12px',
              fontWeight: 700,
              marginTop: '4px',
              padding: '4px 8px',
              outline: 'none'
            }}
          >
            <span>向下了解更多</span>
            <ChevronDown size={14} className="bounce-subtle" />
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOLD 2: Scrollable Game Introduction Cards (Duolingo Style)   */}
      {/* ============================================================ */}
      <section
        ref={featuresRef}
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '24px 20px calc(48px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Section Divider / Title */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEF3C7',
              border: '1.5px solid #F59E0B',
              borderRadius: '9999px',
              padding: '4px 14px',
              marginBottom: '10px'
            }}
          >
            <Sparkles size={13} color="#D97706" />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#B45309', letterSpacing: '1px' }}>
              HOW PLAYBANK WORKS
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>
            三大核心玩法
          </h2>
        </div>

        {/* Feature Card 1: Learn through games */}
        <div
          style={{
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '28px 20px',
            boxShadow: '0 6px 0 #000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              borderRadius: '9999px',
              padding: '4px 14px',
              marginBottom: '14px'
            }}
          >
            <BookOpen size={12} color="#10B981" />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#10B981', letterSpacing: '1px' }}>
              DISCOVER & PLAY
            </span>
          </div>

          <PlayBankMascot
            variant="wave"
            size={170}
            speechBubble="做题就像玩游戏！🎯"
            interactive={true}
          />

          <h3
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#000000',
              margin: '12px 0 8px 0'
            }}
          >
            Learn through games
          </h3>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 14px 0',
              maxWidth: '300px'
            }}
          >
            回答不同科目的趣味题目，在快乐闯关中探索知识。
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#B45309' }}>
              🏮 华文
            </span>
            <span style={{ background: '#EFF6FF', border: '1.5px solid #3B82F6', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#1D4ED8' }}>
              📐 数学
            </span>
            <span style={{ background: '#F5F3FF', border: '1.5px solid #8B5CF6', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#6D28D9' }}>
              🔬 科学
            </span>
            <span style={{ background: '#FDF2F8', border: '1.5px solid #EC4899', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#BE185D' }}>
              🇬🇧 英文
            </span>
          </div>
        </div>

        {/* Feature Card 2: Earn BankPoint */}
        <div
          style={{
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '28px 20px',
            boxShadow: '0 6px 0 #000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEF3C7',
              border: '1.5px solid #D97706',
              borderRadius: '9999px',
              padding: '4px 14px',
              marginBottom: '14px'
            }}
          >
            <Coins size={12} color="#D97706" />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#D97706', letterSpacing: '1px' }}>
              EARN REWARDS
            </span>
          </div>

          <PlayBankMascot
            variant="run"
            size={170}
            speechBubble="冲刺！赚取 BP 积分！💨"
            interactive={true}
          />

          <h3
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#000000',
              margin: '12px 0 8px 0'
            }}
          >
            Earn BankPoint
          </h3>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 14px 0',
              maxWidth: '300px'
            }}
          >
            学习和完成挑战可以获得 BankPoint，未来可用于兑换丰富奖品与建设家园。
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--brand-primary, #FFBC00)',
              border: '2px solid #000000',
              borderRadius: '9999px',
              padding: '6px 18px',
              boxShadow: '0 3px 0 #000000'
            }}
          >
            <Coins size={18} color="#000" />
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>
              +10 BP 每题通关
            </span>
          </div>
        </div>

        {/* Feature Card 3: Grow stronger */}
        <div
          style={{
            background: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '24px',
            padding: '28px 20px',
            boxShadow: '0 6px 0 #000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEE2E2',
              border: '1.5px solid #DC2626',
              borderRadius: '9999px',
              padding: '4px 14px',
              marginBottom: '14px'
            }}
          >
            <Trophy size={12} color="#DC2626" />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#DC2626', letterSpacing: '1px' }}>
              LEVEL UP
            </span>
          </div>

          <PlayBankMascot
            variant="cheer"
            size={170}
            speechBubble="战力飙升！我是冠军！🏆"
            interactive={true}
          />

          <h3
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#000000',
              margin: '12px 0 8px 0'
            }}
          >
            Grow stronger
          </h3>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 14px 0',
              maxWidth: '300px'
            }}
          >
            解锁专属勋章、挑战 Boss 守护兽，建立属于自己的学习成长记录。
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '2px solid #000',
                borderRadius: '12px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 0 #000'
              }}
            >
              <span style={{ fontSize: '16px' }}>🎖️</span>
              <span style={{ fontSize: '12px', fontWeight: 900 }}>启程勋章</span>
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '2px solid #000',
                borderRadius: '12px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 0 #000'
              }}
            >
              <span style={{ fontSize: '16px' }}>💀</span>
              <span style={{ fontSize: '12px', fontWeight: 900 }}>Boss Gate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating subtle animation keyframe */}
      <style>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .bounce-subtle {
          animation: bounceSubtle 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeLandingView;
