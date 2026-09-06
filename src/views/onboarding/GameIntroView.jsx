import React, { useRef, useState, useEffect } from 'react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { ArrowLeft, Sparkles, Coins, Trophy, BookOpen } from 'lucide-react';

/**
 * GameIntroView
 * Step 3: Duolingo-style scrollable game introduction featuring:
 * 1. Learn through games (explore questions & subjects)
 * 2. Earn BankPoint (2-frame running tiger loop with coins)
 * 3. Grow stronger (2-frame cheering celebration tiger loop with badges/boss)
 */
const GameIntroView = ({ onNext, onBack }) => {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);

  // Update progress as user scrolls through sections
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollFraction = scrollTop / (scrollHeight - clientHeight || 1);
    // Section index roughly 0, 1, or 2
    const currentIdx = Math.min(2, Math.max(0, Math.round(scrollFraction * 2)));
    setActiveSection(currentIdx);
  };

  // Progress percentage calculation: Step 3 occupies roughly 25% to 50%
  const progressPercent = Math.round(25 + activeSection * 12);

  const sections = [
    {
      id: 'learn',
      badge: '📚 DISCOVER & PLAY',
      badgeColor: '#10B981',
      badgeBg: '#ECFDF5',
      title: 'Learn through games',
      description: '回答不同科目的趣味题目，在快乐闯关中探索知识。',
      mascotVariant: 'wave',
      mascotBubble: '做题就像玩游戏！🎯',
      visualExtra: (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#B45309' }}>
            🏮 华文
          </span>
          <span style={{ background: '#EFF6FF', border: '1.5px solid #3B82F6', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#1D4ED8' }}>
            📐 数学
          </span>
          <span style={{ background: '#F5F3FF', border: '1.5px solid #8B5CF6', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#6D28D9' }}>
            🔬 科学
          </span>
        </div>
      )
    },
    {
      id: 'earn',
      badge: '🪙 EARN POINTS',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
      title: 'Earn BankPoint',
      description: '学习和完成挑战可以获得 BankPoint，未来可用于兑换丰富奖品与建设家园。',
      mascotVariant: 'run',
      mascotBubble: '冲刺！赚取 BP 积分！💨',
      visualExtra: (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFBC00', border: '2px solid #000', borderRadius: '9999px', padding: '6px 16px', marginTop: '12px', boxShadow: '0 3px 0 #000' }}>
          <Coins size={18} color="#000" />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>+10 BankPoint per win</span>
        </div>
      )
    },
    {
      id: 'grow',
      badge: '👑 LEVEL UP',
      badgeColor: '#DC2626',
      badgeBg: '#FEE2E2',
      title: 'Grow stronger',
      description: '解锁专属勋章、挑战 Boss 守护兽，建立属于自己的学习成长记录。',
      mascotVariant: 'cheer',
      mascotBubble: '战力飙升！我是冠军！🏆',
      visualExtra: (
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #000', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 0 #000' }}>
            <span style={{ fontSize: '16px' }}>🎖️</span>
            <span style={{ fontSize: '12px', fontWeight: 900 }}>启程勋章</span>
          </div>
          <div style={{ background: '#FFFFFF', border: '2px solid #000', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 0 #000' }}>
            <span style={{ fontSize: '16px' }}>💀</span>
            <span style={{ fontSize: '12px', fontWeight: 900 }}>Boss Gate</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div
      className="game-intro-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header: Back Arrow + Duolingo Minimal Progress Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1.5px solid #F3F4F6',
          padding: 'max(16px, env(safe-area-inset-top, 16px)) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 0 #000000',
            outline: 'none',
            flexShrink: 0
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={3} color="#000000" />
        </button>

        {/* Minimal Progress Bar (Step 9) */}
        <div
          style={{
            flex: 1,
            height: '10px',
            background: '#E5E7EB',
            borderRadius: '9999px',
            border: '2px solid #000000',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--brand-primary, #FFBC00)',
              borderRadius: '9999px',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </header>

      {/* Scrollable Body: Duolingo-style Vertical Scroll Experience */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px calc(110px + env(safe-area-inset-bottom, 0px))',
          scrollBehavior: 'smooth',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
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
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Step Category Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: sec.badgeBg,
                border: `1.5px solid ${sec.badgeColor}`,
                borderRadius: '9999px',
                padding: '4px 14px',
                marginBottom: '16px'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: sec.badgeColor,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {sec.badge}
              </span>
            </div>

            {/* Mascot with Custom Animated Variant */}
            <div style={{ margin: '8px 0 16px' }}>
              <PlayBankMascot
                variant={sec.mascotVariant}
                size={180}
                speechBubble={sec.mascotBubble}
                interactive={true}
              />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#000000',
                margin: '0 0 10px 0',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}
            >
              {sec.title}
            </h2>

            {/* Description (Concise, single sentence) */}
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#4B5563',
                lineHeight: 1.5,
                margin: '0 0 12px 0',
                maxWidth: '280px'
              }}
            >
              {sec.description}
            </p>

            {/* Extra Visual Badges */}
            {sec.visualExtra}
          </div>
        ))}

        {/* Bottom subtle scroll hint */}
        <div style={{ textAlign: 'center', padding: '8px 0 0', color: '#9CA3AF', fontSize: '12px', fontWeight: 700 }}>
          👇 向下滑动探索全部特色，准备就绪即可点击继续
        </div>
      </div>

      {/* Bottom Sticky Action Bar: High Contrast CONTINUE Button */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 25%, #FFFFFF 100%)',
          padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <PrimaryButton
            onClick={onNext}
            size="large"
            variant="primary"
            style={{ width: '100%' }}
          >
            CONTINUE
          </PrimaryButton>
        </div>
      </footer>
    </div>
  );
};

export default GameIntroView;
