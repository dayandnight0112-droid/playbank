import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Target,
  Trophy,
  XCircle,
  BarChart2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Gamepad2,
  Crown,
  X,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { quizService } from '../lib/quizService';
import { mockDb } from '../lib/mockDb';

/* -------------------------------------------------------------------------- */
/* SVG Badges Components                                                      */
/* -------------------------------------------------------------------------- */

const BadgeShield = ({ type, title, ribbonText, colorScheme, iconSvg }) => {
  const { outerGrad, innerGrad, ribbonGrad, ribbonBorder, ribbonTextCol } = colorScheme;
  const id = `badge_${type}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '74px',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'transform 0.18s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
    >
      <svg width="74" height="88" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}_outer`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={outerGrad[0]} />
            <stop offset="100%" stopColor={outerGrad[1]} />
          </linearGradient>
          <linearGradient id={`${id}_inner`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={innerGrad[0]} />
            <stop offset="100%" stopColor={innerGrad[1]} />
          </linearGradient>
          <linearGradient id={`${id}_ribbon`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ribbonGrad[0]} />
            <stop offset="100%" stopColor={ribbonGrad[1]} />
          </linearGradient>
          <filter id={`${id}_shadow`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Shield Outer Outline */}
        <path
          d="M50 4 L88 20 C88 66 70 94 50 106 C30 94 12 66 12 20 Z"
          fill={`url(#${id}_outer)`}
          stroke="#000000"
          strokeWidth="3.5"
          filter={`url(#${id}_shadow)`}
        />

        {/* Shield Inner Inset */}
        <path
          d="M50 12 L80 25 C80 62 65 86 50 96 C35 86 20 62 20 25 Z"
          fill={`url(#${id}_inner)`}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.6"
        />

        {/* Icon Render */}
        <g transform="translate(50, 48)">{iconSvg}</g>

        {/* Ribbon Banner */}
        <g transform="translate(0, 78)">
          {/* Ribbon Tail Left */}
          <path d="M4 18 L16 8 L16 28 Z" fill={ribbonBorder} stroke="#000" strokeWidth="2" />
          {/* Ribbon Tail Right */}
          <path d="M96 18 L84 8 L84 28 Z" fill={ribbonBorder} stroke="#000" strokeWidth="2" />
          {/* Main Ribbon Body */}
          <rect
            x="8"
            y="8"
            width="84"
            height="22"
            rx="5"
            fill={`url(#${id}_ribbon)`}
            stroke="#000000"
            strokeWidth="2.5"
          />
          {/* Ribbon Text */}
          <text
            x="50"
            y="23"
            textAnchor="middle"
            fill={ribbonTextCol}
            fontSize="7.5"
            fontWeight="900"
            fontFamily="Arial, sans-serif"
            letterSpacing="0.3"
          >
            {ribbonText}
          </text>
        </g>
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Profile Component                                                     */
/* -------------------------------------------------------------------------- */

const Profile = ({ currentUser, guestProfile, userBP = 0, onBack, onLogout }) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [cloudStats, setCloudStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Compute or format stats from actual data
  const effectivePlayerId = currentUser?.id || 'guest';
  const rawHistory = useMemo(() => quizService.getAnswerHistory(effectivePlayerId), [effectivePlayerId]);

  // Load cloud stats on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await quizService.getPlayerSummaryStats(effectivePlayerId);
        if (isMounted && data) {
          setCloudStats(data);
        }
      } catch (err) {
        console.warn('[Profile] Failed to load cloud stats:', err);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    })();
    return () => { isMounted = false; };
  }, [effectivePlayerId]);

  const stats = useMemo(() => {
    let minutes = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let bestScore = 0;
    let sessions = [];

    if (cloudStats) {
      totalCorrect = cloudStats.totalCorrect || 0;
      totalWrong = cloudStats.totalWrong || 0;
      bestScore = cloudStats.bestScore || 0;
      minutes = cloudStats.totalMinutes || 0;
      sessions = cloudStats.recentSessions || [];
    } else {
      totalCorrect = rawHistory.filter((a) => a.is_correct).length;
      totalWrong = rawHistory.filter((a) => !a.is_correct).length;
      const totalMs = rawHistory.reduce((acc, a) => acc + (a.response_time || a.responseTimeMs || 2000), 0);
      minutes = Math.round(totalMs / 60000);
      sessions = quizService.getGameSessions(effectivePlayerId);
      bestScore = sessions.reduce((max, s) => Math.max(max, s.score || 0), userBP || 0);
    }

    const playTimeText = minutes >= 60 ? `${(minutes / 60).toFixed(1)} h` : `${minutes} m`;

    return {
      playTimeText,
      correctCount: totalCorrect,
      wrongCount: totalWrong,
      bestScore: bestScore,
      recentSessions: sessions
    };
  }, [cloudStats, rawHistory, userBP, effectivePlayerId]);

  // Player Name & Code Display
  const displayName = useMemo(() => {
    if (currentUser?.nickname) return currentUser.nickname.toUpperCase();
    if (guestProfile?.guestName) return guestProfile.guestName.toUpperCase();
    if (currentUser?.email) return currentUser.email.split('@')[0].toUpperCase();
    return 'ALEX TAN';
  }, [currentUser, guestProfile]);

  const playerCode = useMemo(() => {
    if (currentUser?.player_code) return currentUser.player_code.toUpperCase();
    if (guestProfile?.player_code) return guestProfile.player_code.toUpperCase();
    return 'PB-082741';
  }, [currentUser, guestProfile]);

  // Mascot Image path
  const mascotImg = `${import.meta.env.BASE_URL}mascot/tiger_welcome.png`;

  return (
    <div
      className="view-content"
      style={{
        padding: 0,
        backgroundColor: '#F8F9FA',
        minHeight: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* -------------------------------------------------------------------- */}
      {/* HEADER SECTION (Vibrant PlayBank Yellow)                            */}
      {/* -------------------------------------------------------------------- */}
      <header
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #FFCE00 0%, #FFB800 100%)',
          padding: '24px 20px 48px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}
      >
        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          {/* Back Button (Image 2 Design: White circle, bold black border & bottom rim) */}
          <button
            onClick={onBack || (() => window.history.back())}
            aria-label="Back to home"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #000000',
              boxShadow: '0 4px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              padding: 0,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #000000';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #000000';
            }}
          >
            <ArrowLeft size={24} color="#000000" strokeWidth={3} />
          </button>

          {/* Top-right: Clean and clear (Mirai logo and Settings gear removed as requested) */}
          <div style={{ width: '46px' }} />
        </div>

        {/* Profile Card Info: Avatar + Name + Player ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar (PlayBank Mascot tiger in circular frame) */}
          <div
            style={{
              width: '102px',
              height: '102px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '3.5px solid #000000',
              boxShadow: '0 4px 0 #000000',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              background: 'radial-gradient(circle, #FFFBEB 40%, #FEF08A 100%)'
            }}
          >
            <img
              src={mascotImg}
              alt="PlayBank Mascot"
              style={{
                width: '115%',
                height: '115%',
                objectFit: 'contain',
                transform: 'translateY(2px)'
              }}
              onError={(e) => {
                e.target.src = `${import.meta.env.BASE_URL}playbanklogo.png`;
              }}
            />
          </div>

          {/* Player Name & ID */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#000000',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.5px',
                wordBreak: 'break-word',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {displayName}
            </h1>
            <div
              style={{
                marginTop: '6px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#5C4300',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ opacity: 0.85 }}>PLAYER ID</span>
              <span style={{ color: '#000000', fontWeight: 900 }}>{playerCode}</span>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* BODY SECTION (Rounded Card Container)                                */}
      {/* -------------------------------------------------------------------- */}
      <main
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          marginTop: '-22px',
          padding: '24px 20px 40px 20px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* BADGES HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} fill="#FFBC00" color="#FFBC00" />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: 0, letterSpacing: '0.5px' }}>
              BADGES
            </h2>
          </div>
          <button
            onClick={() => setShowBadgesModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF2E79',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: 0
            }}
          >
            View All <ChevronRight size={16} strokeWidth={2.8} />
          </button>
        </div>

        {/* BADGES ROW (4 Shields from Image 1) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '26px'
          }}
        >
          {/* Badge 1: Knowledge Star (Yellow / Cap) */}
          <BadgeShield
            type="knowledge"
            title="Knowledge Star"
            ribbonText="KNOWLEDGE STAR"
            colorScheme={{
              outerGrad: ['#FFDE59', '#FF914D'],
              innerGrad: ['#FFF8E1', '#FFE082'],
              ribbonGrad: ['#FFC107', '#FFA000'],
              ribbonBorder: '#C77700',
              ribbonTextCol: '#000000'
            }}
            iconSvg={
              <g transform="translate(-16, -18)">
                {/* Cap */}
                <path d="M16 2 L2 9 L16 16 L30 9 Z" fill="#263238" stroke="#000" strokeWidth="1.5" />
                <path d="M7 12.5 V21 C7 25 25 25 25 21 V12.5" fill="#37474F" stroke="#000" strokeWidth="1.5" />
                {/* Gold Tassel */}
                <path d="M28 10 V20" stroke="#FFD54F" strokeWidth="2" />
                <circle cx="28" cy="21" r="2" fill="#FFD54F" />
                {/* Star Accent */}
                <path
                  d="M16 23 L17.5 27 L22 27 L18.5 30 L20 34 L16 31.5 L12 34 L13.5 30 L10 27 L14.5 27 Z"
                  fill="#FFD700"
                  stroke="#000"
                  strokeWidth="1"
                />
              </g>
            }
          />

          {/* Badge 2: Quiz Master (Pink / Brain) */}
          <BadgeShield
            type="quiz_master"
            title="Quiz Master"
            ribbonText="QUIZ MASTER"
            colorScheme={{
              outerGrad: ['#FF66C4', '#D1007A'],
              innerGrad: ['#FCE4EC', '#F48FB1'],
              ribbonGrad: ['#E91E63', '#C2185B'],
              ribbonBorder: '#880E4F',
              ribbonTextCol: '#FFFFFF'
            }}
            iconSvg={
              <g transform="translate(-16, -16)">
                {/* Brain Silhouette */}
                <path
                  d="M10 8 C6 8 3 12 3 16 C3 20 6 22 8 23 C7 25 8 27 10 28 C12 29 14 28 15 26 C15 28 17 29 19 28 C21 27 22 25 21 23 C23 22 26 20 26 16 C26 12 23 8 19 8 C18 6 15 5 14.5 5 C14 5 11 6 10 8 Z"
                  fill="#FF4081"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                {/* Brain Gyri Highlights */}
                <path d="M9 13 C12 11 14 15 12 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M20 13 C17 11 15 15 17 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14.5 9 V24" stroke="#880E4F" strokeWidth="1.5" />
              </g>
            }
          />

          {/* Badge 3: Consistent Player (Green / Sprout) */}
          <BadgeShield
            type="consistent"
            title="Consistent Player"
            ribbonText="CONSISTENT PLAYER"
            colorScheme={{
              outerGrad: ['#7ED957', '#009743'],
              innerGrad: ['#E8F5E9', '#A5D6A7'],
              ribbonGrad: ['#4CAF50', '#2E7D32'],
              ribbonBorder: '#1B5E20',
              ribbonTextCol: '#FFFFFF'
            }}
            iconSvg={
              <g transform="translate(-15, -16)">
                {/* Sprout Stems */}
                <path d="M15 26 C15 17 10 14 6 13 C6 18 10 24 15 26 Z" fill="#43A047" stroke="#000" strokeWidth="1.5" />
                <path
                  d="M15 26 C15 15 22 10 26 11 C26 17 21 23 15 26 Z"
                  fill="#66BB6A"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <path d="M15 26 V12" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            }
          />

          {/* Badge 4: High Scorer (Blue / Trophy) */}
          <BadgeShield
            type="high_scorer"
            title="High Scorer"
            ribbonText="HIGH SCORER"
            colorScheme={{
              outerGrad: ['#38B6FF', '#004AAD'],
              innerGrad: ['#E1F5FE', '#81D4FA'],
              ribbonGrad: ['#1E88E5', '#1565C0'],
              ribbonBorder: '#0D47A1',
              ribbonTextCol: '#FFFFFF'
            }}
            iconSvg={
              <g transform="translate(-15, -16)">
                {/* Trophy Cup */}
                <path
                  d="M7 6 H23 V14 C23 19 19 22 15 22 C11 22 7 19 7 14 Z"
                  fill="#FFD700"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                {/* Trophy Handles */}
                <path d="M7 9 H4 C3 9 2 11 2 13 C2 15 4 17 7 17" fill="none" stroke="#000" strokeWidth="1.5" />
                <path d="M23 9 H26 C27 9 28 11 28 13 C28 15 26 17 23 17" fill="none" stroke="#000" strokeWidth="1.5" />
                {/* Base */}
                <path d="M12 22 H18 V25 H12 Z" fill="#FFA000" stroke="#000" strokeWidth="1.5" />
                <path d="M9 25 H21 V28 H9 Z" fill="#455A64" stroke="#000" strokeWidth="1.5" />
                {/* Star on Cup */}
                <path
                  d="M15 10 L15.8 12.5 L18.5 12.5 L16.3 14 L17.1 16.5 L15 15 L12.9 16.5 L13.7 14 L11.5 12.5 L14.2 12.5 Z"
                  fill="#FFFFFF"
                />
              </g>
            }
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STATS 2x2 GRID                                                     */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            marginBottom: '28px'
          }}
        >
          {/* Card 1: PLAY TIME */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #F0F0F0',
              borderRadius: '20px',
              padding: '18px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={20} color="#D97706" strokeWidth={2.8} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 900, color: '#6B7280', letterSpacing: '0.4px' }}>
                  PLAY TIME
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#000000', lineHeight: 1 }}>
                {stats.playTimeText}
              </div>
            </div>

            {/* Gamepad Watermark in Bottom Right */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              <Gamepad2 size={44} color="#000000" />
            </div>
          </div>

          {/* Card 2: CORRECT ANSWERS */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #F0F0F0',
              borderRadius: '20px',
              padding: '18px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Target size={20} color="#16A34A" strokeWidth={2.8} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 900, color: '#6B7280', letterSpacing: '0.4px' }}>
                  CORRECT ANSWERS
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#000000', lineHeight: 1 }}>
                {stats.correctCount.toLocaleString()}
              </div>
            </div>

            {/* Bar Chart Watermark in Bottom Right */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              <BarChart2 size={44} color="#000000" />
            </div>
          </div>

          {/* Card 3: BEST SCORE */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #F0F0F0',
              borderRadius: '20px',
              padding: '18px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: '#FCE7F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Trophy size={20} color="#DB2777" strokeWidth={2.8} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 900, color: '#6B7280', letterSpacing: '0.4px' }}>
                  BEST SCORE
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#000000', lineHeight: 1 }}>
                {stats.bestScore.toLocaleString()}
              </div>
            </div>

            {/* Crown Watermark in Bottom Right */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              <Crown size={44} color="#000000" />
            </div>
          </div>

          {/* Card 4: WRONG ANSWERS */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #F0F0F0',
              borderRadius: '20px',
              padding: '18px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: '#FFE4E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <XCircle size={20} color="#E11D48" strokeWidth={2.8} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 900, color: '#6B7280', letterSpacing: '0.4px' }}>
                  WRONG ANSWERS
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#000000', lineHeight: 1 }}>
                {stats.wrongCount.toLocaleString()}
              </div>
            </div>

            {/* X Mark Watermark in Bottom Right */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              <X size={44} color="#000000" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ACTION BUTTON: VIEW GAME HISTORY                                  */}
        {/* ------------------------------------------------------------------ */}
        <button
          onClick={() => setShowHistoryModal(true)}
          style={{
            width: '100%',
            backgroundColor: '#181818',
            color: '#FFBC00',
            padding: '16px 24px',
            borderRadius: '9999px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
            transition: 'transform 0.12s ease, filter 0.12s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <BarChart2 size={22} color="#FFBC00" strokeWidth={2.8} />
          <span style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.8px' }}>VIEW GAME HISTORY</span>
          <ChevronRight size={18} color="#FFBC00" strokeWidth={3} style={{ marginLeft: '4px' }} />
        </button>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* GAME HISTORY MODAL                                                   */}
      {/* -------------------------------------------------------------------- */}
      {showHistoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              border: '3px solid #000000',
              borderBottom: 'none',
              padding: '24px 20px 32px 20px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.25)',
              animation: 'slideUpModal 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '2px solid #F0F0F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={24} color="#000000" strokeWidth={2.8} />
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: 0 }}>Game History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} color="#666" strokeWidth={2.5} />
              </button>
            </div>

            {/* Summary Stats Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#FFFBEB',
                border: '2px solid #FDE68A',
                borderRadius: '16px',
                padding: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400E' }}>累计场次</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                  {stats.recentSessions.length} 局
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>对题率</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A' }}>
                  {stats.correctCount + stats.wrongCount > 0
                    ? Math.round((stats.correctCount / (stats.correctCount + stats.wrongCount)) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#E11D48' }}>累计错题</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#E11D48' }}>
                  {stats.wrongCount} 题
                </div>
              </div>
            </div>

            {/* Accordion List of Game Sessions (以局为单位的手风琴折叠) */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!stats.recentSessions || stats.recentSessions.length === 0) ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    color: '#6B7280',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '16px',
                    border: '1.5px dashed #E5E7EB'
                  }}
                >
                  <Gamepad2 size={40} color="#D1D5DB" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#111' }}>暂无已完成的对局记录</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12.5px' }}>去挑战一局答题，结算后即可在此展开核查每局题目与错题解析！</p>
                </div>
              ) : (
                stats.recentSessions.map((sess, idx) => {
                  const sessKey = sess.id || `sess_${idx}`;
                  const isExpanded = expandedSessionId === sessKey;
                  const roundNum = stats.recentSessions.length - idx;
                  const sessDate = sess.created_at || sess.ended_at || sess.started_at;

                  return (
                    <div
                      key={sessKey}
                      style={{
                        borderRadius: '16px',
                        border: '2px solid #000000',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '3px 3px 0px #000000',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Accordion Header (Click to toggle) */}
                      <div
                        onClick={() => setExpandedSessionId(isExpanded ? null : sessKey)}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isExpanded ? '#FFFDF5' : '#FFFFFF',
                          borderBottom: isExpanded ? '2px solid #000000' : 'none'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000' }}>
                              第 {roundNum} 局 · {sess.chapter_title || 'Sejarah 答题对局'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{sessDate ? new Date(sessDate).toLocaleString() : '近期'}</span>
                            <span>·</span>
                            <span style={{ color: '#16A34A' }}>{sess.correct_count ?? 0} 对</span>
                            <span style={{ color: '#DC2626' }}>{sess.wrong_count ?? 0} 错</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#D97706' }}>
                              {sess.score ?? (sess.correct_count * 10)} 分
                            </div>
                            <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 800 }}>
                              +{sess.earned_bp ?? (sess.correct_count * 10)} BP
                            </div>
                          </div>
                          <div style={{ color: '#000000' }}>
                            {isExpanded ? <ChevronUp size={20} strokeWidth={2.5} /> : <ChevronDown size={20} strokeWidth={2.5} />}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Expanded Content: Questions Breakdown */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: '14px 16px',
                            backgroundColor: '#FAF9F6',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          {sess.questions && sess.questions.length > 0 ? (
                            sess.questions.map((q, qIdx) => {
                              const isQCorrect = Boolean(q.is_correct);

                              return (
                                <div
                                  key={qIdx}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    border: isQCorrect ? '1.5px solid #BBF7D0' : '1.5px solid #FECDD3',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                  }}
                                >
                                  {/* Question Title */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <span style={{ fontWeight: 900, fontSize: '13px', color: isQCorrect ? '#16A34A' : '#DC2626' }}>
                                      {isQCorrect ? '✔️' : '❌'} Q{q.question_no || qIdx + 1}.
                                    </span>
                                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#111827', lineHeight: 1.45 }}>
                                      {q.question_text}
                                    </span>
                                  </div>

                                  {/* Answers Comparison */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                                    {!isQCorrect && (
                                      <div
                                        style={{
                                          padding: '7px 10px',
                                          backgroundColor: '#FEF2F2',
                                          borderRadius: '8px',
                                          border: '1px solid #FCA5A5',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          color: '#B91C1C'
                                        }}
                                      >
                                        ❌ 你的选择: {q.selected_option_text}
                                      </div>
                                    )}

                                    <div
                                      style={{
                                        padding: '7px 10px',
                                        backgroundColor: '#F0FDF4',
                                        borderRadius: '8px',
                                        border: '1px solid #86EFAC',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: '#15803D'
                                      }}
                                    >
                                      ✔️ 正确答案: {q.correct_option_text}
                                    </div>
                                  </div>

                                  {/* Explanation */}
                                  {q.explanation && (
                                    <div
                                      style={{
                                        padding: '7px 10px',
                                        backgroundColor: '#FFFBEB',
                                        borderRadius: '8px',
                                        border: '1px solid #FDE68A',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        color: '#92400E',
                                        lineHeight: 1.4
                                      }}
                                    >
                                      💡 <strong>解析：</strong>{q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#6B7280', fontSize: '12.5px' }}>
                              本局共 {sess.total_questions || 8} 道题目，答对 {sess.correct_count ?? 0} 题，做错 {sess.wrong_count ?? 0} 题，结算得分 {sess.score ?? 0} 分。
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowHistoryModal(false)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '14px',
                backgroundColor: '#000000',
                color: '#FFBC00',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 900,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              关闭历史记录 (Close)
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* BADGES MODAL                                                         */}
      {/* -------------------------------------------------------------------- */}
      {showBadgesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowBadgesModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '3.5px solid #000000',
              boxShadow: '6px 6px 0px #000000',
              padding: '24px 20px',
              animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={24} color="#FFBC00" />
                <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>All Badges</h3>
              </div>
              <button
                onClick={() => setShowBadgesModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} color="#000" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: '#FEF3C7', borderRadius: '14px', border: '1.5px solid #FDE68A' }}>
                <span style={{ fontSize: '28px' }}>🎓</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '14px', color: '#92400E' }}>Knowledge Star</div>
                  <div style={{ fontSize: '12px', color: '#B45309' }}>Complete your first 10 Sejarah quizzes. (Unlocked)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: '#FCE7F3', borderRadius: '14px', border: '1.5px solid #FBCFE8' }}>
                <span style={{ fontSize: '28px' }}>🧠</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '14px', color: '#9D174D' }}>Quiz Master</div>
                  <div style={{ fontSize: '12px', color: '#BE185D' }}>Score 100% accuracy in any full round. (Unlocked)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: '#DCFCE7', borderRadius: '14px', border: '1.5px solid #BBF7D0' }}>
                <span style={{ fontSize: '28px' }}>🌱</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '14px', color: '#166534' }}>Consistent Player</div>
                  <div style={{ fontSize: '12px', color: '#15803D' }}>Log in and answer questions 3 days in a row. (Unlocked)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: '#E0F2FE', borderRadius: '14px', border: '1.5px solid #BAE6FD' }}>
                <span style={{ fontSize: '28px' }}>🏆</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '14px', color: '#075985' }}>High Scorer</div>
                  <div style={{ fontSize: '12px', color: '#0369A1' }}>Accumulate over 500 BP across all games. (Unlocked)</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBadgesModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FFBC00',
                color: '#000000',
                border: '2px solid #000000',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000'
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes slideUpModal {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
