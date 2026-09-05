import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Clock, Shield, Flame, Check, X, Trophy, RefreshCw, ChevronRight, RotateCcw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useBossBattleEngine } from '../hooks/useBossBattleEngine.js';
import { createBossEncounter } from '../data/bossRegistry.js';
import { BATTLE_PHASES, PLAYER_ANIMATIONS, BOSS_ANIMATIONS, BATTLE_RESULTS } from '../data/battleConstants.js';
import { getSpeedComboTier } from '../data/bossTypes.js';
import { mockDb } from '../lib/mockDb.js';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

/**
 * Standard Boss Battle Prototype View (Step 4)
 * 
 * V1 PRINCIPLES:
 * - 5 Test Questions
 * - Strict pipeline: Correct -> Attack -> Hit -> HP-1 / Wrong -> Attack -> Block -> Show Correct
 * - Anti-repeat click & strict input lock
 * - Timer stability: single-source interval that cleans up on lock/phase change
 * - Reuses existing BP calculation (10 BP * multiplier per correct answer)
 * - Uses placeholder Boss Prototype
 */
const BossBattle = ({
  encounter: customEncounter,
  questions: customQuestions,
  currentUser,
  onComplete,
  onBack
}) => {
  // 1. Prepare 8 Questions for Speed Battle
  const battleQuestions = useMemo(() => {
    const targetCount = customEncounter?.type?.questionCount || 8;
    if (customQuestions && customQuestions.length >= targetCount) {
      return customQuestions.slice(0, targetCount);
    }
    const raw = mockDb.getQuestions();
    const sliced = shuffleArray(raw).slice(0, targetCount);
    // Normalize format: ensure `options` array exists
    return sliced.map(q => {
      const options = q.options || shuffleArray([q.correctAnswer, ...q.incorrectAnswers]);
      const correctIndex = options.indexOf(q.correctAnswer);
      return {
        ...q,
        options,
        correctIndex
      };
    });
  }, [customQuestions, customEncounter]);

  // 2. Prepare Encounter (Defaults to Speed Demon / Chrono Lynx with SPEED Type)
  const encounter = useMemo(() => {
    if (customEncounter) return customEncounter;
    return createBossEncounter('chrono_lynx', 'SPEED');
  }, [customEncounter]);

  // 3. Connect Generic Boss Battle Engine
  const engine = useBossBattleEngine({
    encounter,
    questions: battleQuestions,
    onComplete: (stats) => {
      // Callback handled via Result Modal button click
    }
  });

  const {
    bossType,
    bossId,
    maxBossHP,
    bossHP,
    questionIndex,
    totalQuestions,
    currentQuestion,
    correct,
    wrong,
    skipped,
    combo,
    maxCombo,
    battlePhase,
    playerAnimation,
    bossAnimation,
    battleResult,
    damageFloat,
    lastSelectedOption,
    revealedCorrectIndex,
    submitAnswer,
    handleTimeout,
    resetBattle
  } = engine;

  // Window size for victory confetti celebration
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  // 4. Stable Per-Question Countdown Timer (Configurable from encounter type, e.g. 10s)
  const timeLimit = encounter?.type?.timeLimit || 10;
  const urgentThreshold = encounter?.type?.urgentThreshold || 3;
  const introBanner = encounter?.type?.introBanner || {
    title: 'SPEED BATTLE',
    subtitle: `${totalQuestions} QUESTIONS`,
    warning: "DON'T SLOW DOWN!"
  };

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const isUrgent = timeLeft <= urgentThreshold;
  const timeTakenRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Step 8: Speed Combo Tier Progression (Level 1 ~ 8)
  const comboTier = getSpeedComboTier(combo);

  // Reset timer whenever a new question is activated in QUESTION phase
  useEffect(() => {
    if (battlePhase === BATTLE_PHASES.QUESTION) {
      setTimeLeft(timeLimit);
      startTimeRef.current = Date.now();
      timeTakenRef.current = 0;

      const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    } else {
      // Record elapsed time if locked
      timeTakenRef.current = Math.min(timeLimit, (Date.now() - startTimeRef.current) / 1000);
    }
  }, [battlePhase, questionIndex, timeLimit, handleTimeout]);

  // 5. Existing BP Multiplier Integration
  const multiplier = currentUser?.score_multiplier || 1;
  const scorePerQuestion = 10 * multiplier;
  const earnedBP = correct * scorePerQuestion;

  // 6. User Option Selection Handler
  const handleOptionClick = (optionIndex) => {
    // STRICT ANTI-REPEAT CLICK & PHASE LOCK
    if (battlePhase !== BATTLE_PHASES.QUESTION) return;

    const timeTaken = Math.max(0.1, (Date.now() - startTimeRef.current) / 1000);
    submitAnswer(optionIndex, timeTaken);
  };

  // Option styling helper
  const getOptionStyle = (index) => {
    const isSelected = lastSelectedOption === index;
    const isRevealedCorrect = revealedCorrectIndex === index;
    const isAnswerLocked = battlePhase !== BATTLE_PHASES.QUESTION;

    let bg = '#1E293B';
    let border = 'rgba(255, 255, 255, 0.15)';
    let color = '#FFFFFF';
    let icon = null;

    if (isAnswerLocked) {
      // Determine if current selected option is correct based on question data
      const isSelectedCorrect = typeof currentQuestion?.correctIndex === 'number'
        ? index === currentQuestion.correctIndex
        : currentQuestion?.options
          ? currentQuestion.options[index] === currentQuestion.correctAnswer
          : index === currentQuestion?.correctAnswer;

      // Case 1: Option is the revealed correct answer (on wrong/timeout)
      if (isRevealedCorrect) {
        bg = 'rgba(34, 197, 94, 0.25)';
        border = '#22C55E';
        color = '#4ADE80';
        icon = <Check size={18} color="#22C55E" strokeWidth={3} />;
      }
      // Case 2: Selected option that is CORRECT -> Immediately Green (青色)
      else if (isSelected && isSelectedCorrect) {
        bg = 'rgba(34, 197, 94, 0.25)';
        border = '#22C55E';
        color = '#4ADE80';
        icon = <Check size={18} color="#22C55E" strokeWidth={3} />;
      }
      // Case 3: Selected option that is WRONG -> Red (红色)
      else if (isSelected && !isSelectedCorrect) {
        bg = 'rgba(239, 68, 68, 0.25)';
        border = '#EF4444';
        color = '#F87171';
        icon = <X size={18} color="#EF4444" strokeWidth={3} />;
      }
    }

    return { bg, border, color, icon };
  };

  // Progress timer percentage
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        background: '#0B0F19',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* ============================================================ */}
      {/* 1. TOP COMBAT HUD */}
      {/* ============================================================ */}
      <header
        style={{
          padding: '16px 16px 12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {/* Back button */}
          <button
            onClick={() => onBack && onBack()}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Boss identity banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{encounter.character.artwork.badgeIcon || '🤖'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px' }}>
                {encounter.character.name}
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                {encounter.character.title}
              </span>
            </div>
          </div>

          {/* Question index tracker */}
          <div
            style={{
              background: 'rgba(255, 188, 0, 0.15)',
              border: '1px solid rgba(255, 188, 0, 0.4)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#FFBC00'
            }}
          >
            Q {questionIndex + 1}/{totalQuestions}
          </div>
        </div>

        {/* Boss 5-Segment HP Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
            <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={13} /> BOSS HP
            </span>
            <span style={{ color: '#F1F5F9' }}>{bossHP} / {maxBossHP}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxBossHP}, 1fr)`, gap: '4px', height: '10px' }}>
            {Array.from({ length: maxBossHP }).map((_, idx) => {
              const isFilled = idx < bossHP;
              return (
                <div
                  key={idx}
                  style={{
                    background: isFilled ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isFilled ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Configurable Countdown Timer Progress with Tension State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <Clock size={14} color={isUrgent ? '#EF4444' : '#F59E0B'} style={{ animation: isUrgent ? 'pulse 0.5s infinite' : 'none' }} />
          <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${timerPercent}%`,
                background: isUrgent ? 'linear-gradient(90deg, #DC2626, #EF4444)' : 'linear-gradient(90deg, #F59E0B, #FFBC00)',
                borderRadius: '9999px',
                transition: 'width 1s linear',
                boxShadow: isUrgent ? '0 0 10px rgba(239, 68, 68, 0.8)' : 'none'
              }}
            />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              width: '28px',
              textAlign: 'right',
              color: isUrgent ? '#EF4444' : '#FFFFFF',
              animation: isUrgent ? 'pulse 0.5s infinite' : 'none'
            }}
          >
            {timeLeft}s
          </span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* INTRO DRAMATIC BANNER OVERLAY */}
      {/* ============================================================ */}
      {battlePhase === BATTLE_PHASES.INTRO && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
            padding: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Boss Encounter Avatar */}
          <div
            style={{
              width: '86px',
              height: '86px',
              borderRadius: '24px',
              background: encounter.character.theme.glowColor || 'rgba(6, 182, 212, 0.45)',
              border: '2.5px solid #FFD54F',
              boxShadow: '0 0 35px rgba(255, 188, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              marginBottom: '16px',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {encounter.character.artwork.characterEmoji || encounter.character.artwork.badgeIcon || '😼'}
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
            {encounter.character.name} {encounter.character.title && `· ${encounter.character.title}`}
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1px',
              margin: '0 0 8px 0',
              textShadow: '0 0 20px rgba(255, 188, 0, 0.5)'
            }}
          >
            {introBanner.title}
          </h1>

          <div
            style={{
              background: 'rgba(255, 188, 0, 0.15)',
              border: '1.5px solid #FFBC00',
              color: '#FFBC00',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              padding: '4px 16px',
              borderRadius: '9999px',
              marginBottom: '14px'
            }}
          >
            {introBanner.subtitle}
          </div>

          <div
            style={{
              fontSize: '17px',
              fontWeight: 900,
              color: '#EF4444',
              letterSpacing: '1px',
              textShadow: '0 0 16px rgba(239, 68, 68, 0.7)',
              animation: 'pulseFast 0.8s infinite alternate'
            }}
          >
            {introBanner.warning} ⚡
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. 2D BATTLE ARENA (VISUAL STAGE) */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 20px',
          overflow: 'hidden'
        }}
      >
        {/* Arena Ambient Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Floating Damage / Block Label */}
        {damageFloat && (
          <div
            key={Date.now()}
            style={{
              position: 'absolute',
              top: '22%',
              zIndex: 40,
              fontSize: damageFloat.comboTier?.level >= 5 ? '28px' : damageFloat.isCrit ? '26px' : '22px',
              fontWeight: 900,
              color: damageFloat.isBlock
                ? '#60A5FA'
                : (damageFloat.comboTier?.color || (damageFloat.isCrit ? '#FACC15' : '#EF4444')),
              textShadow: damageFloat.comboTier?.glow && damageFloat.comboTier.glow !== 'none'
                ? `0 4px 12px rgba(0,0,0,0.8), ${damageFloat.comboTier.glow}`
                : '0 4px 12px rgba(0,0,0,0.8), 0 0 20px currentColor',
              animation: 'floatAndFade 0.7s ease-out forwards'
            }}
          >
            {damageFloat.label}
          </div>
        )}

        {/* Step 8: Speed Combo Dynamic Tier Banner */}
        {comboTier && (
          <div
            key={`combo-${combo}`}
            style={{
              marginBottom: '12px',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: comboTier.bg,
              border: `1.5px solid ${comboTier.color}`,
              boxShadow: comboTier.glow,
              color: comboTier.color,
              fontSize: comboTier.level >= 6 ? '14px' : comboTier.level >= 4 ? '13px' : '12px',
              fontWeight: 900,
              letterSpacing: '1px',
              animation: 'comboBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {comboTier.level >= 8 ? '💥' : comboTier.level >= 5 ? '🔥' : comboTier.level >= 4 ? '⚡' : '✨'}
            <span>{comboTier.label}</span>
          </div>
        )}

        {/* Combat Dual Characters Presentation */}
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            padding: '0 10px'
          }}
        >
          {/* Player Sprite Presentation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.14s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: playerAnimation === PLAYER_ANIMATIONS.ATTACK || playerAnimation === PLAYER_ANIMATIONS.CRIT_ATTACK
                ? 'translateX(45px) scale(1.15)'
                : 'translateX(0) scale(1)'
            }}
          >
            {/* Player 2D Avatar Card */}
            <div
              style={{
                width: '82px',
                height: '82px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: '3px solid #FDE68A',
                boxShadow: comboTier?.glow && comboTier.glow !== 'none'
                  ? `0 8px 24px rgba(245, 158, 11, 0.4), ${comboTier.glow}`
                  : '0 8px 24px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '38px',
                position: 'relative',
                transition: 'box-shadow 0.2s ease-out'
              }}
            >
              {playerAnimation === PLAYER_ANIMATIONS.VICTORY ? '👑' : '🧙‍♂️'}

              {/* Combo Badge */}
              {combo >= 2 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: comboTier?.color ? comboTier.color : '#EF4444',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    border: '1.5px solid #FFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: comboTier?.glow || '0 2px 6px rgba(0,0,0,0.4)',
                    animation: 'pulse 1s infinite'
                  }}
                >
                  <Flame size={10} fill="#FFF" /> x{combo}
                </div>
              )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px', color: '#F1F5F9' }}>
              Player
            </span>
          </div>

          {/* VS Clash Particle Divider */}
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#475569', fontStyle: 'italic' }}>
            VS
          </div>

          {/* Boss Sprite Presentation (Placeholder Dummy) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.2s ease-out',
              transform: bossAnimation === BOSS_ANIMATIONS.HIT
                ? 'translateX(18px) scale(0.92)'
                : bossAnimation === BOSS_ANIMATIONS.BLOCK
                  ? 'translateX(-12px) scale(1.08)'
                  : bossAnimation === BOSS_ANIMATIONS.DEFEAT
                    ? 'scale(0.6) rotate(15deg) opacity(0.2)'
                    : bossAnimation === BOSS_ANIMATIONS.ESCAPE
                      ? 'scale(0.5) translateY(-30px) opacity(0.2)'
                      : 'translate(0, 0) scale(1)'
            }}
          >
            {/* Boss 2D Prototype Card */}
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '24px',
                background: bossAnimation === BOSS_ANIMATIONS.HIT
                  ? '#FFFFFF'
                  : bossAnimation === BOSS_ANIMATIONS.BLOCK
                    ? 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)'
                    : 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
                border: bossAnimation === BOSS_ANIMATIONS.BLOCK
                  ? '3px solid #60A5FA'
                  : '3px solid rgba(255, 255, 255, 0.25)',
                boxShadow: bossAnimation === BOSS_ANIMATIONS.BLOCK
                  ? '0 0 28px rgba(59, 130, 246, 0.8)'
                  : '0 8px 24px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                position: 'relative',
                animation: bossAnimation === BOSS_ANIMATIONS.IDLE ? 'floatBob 2.4s ease-in-out infinite' : 'none'
              }}
            >
              {bossAnimation === BOSS_ANIMATIONS.BLOCK ? '🛡️' : (encounter.character.artwork.characterEmoji || '🤖')}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px', color: '#94A3B8' }}>
              {encounter.character.name}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. COMBAT QUESTION & OPTIONS PANEL */}
      {/* ============================================================ */}
      <div
        style={{
          background: '#0F172A',
          borderTop: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '18px 16px 24px',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
          zIndex: 20
        }}
      >
        {/* Question Text Box with snappy refresh animation */}
        <div key={questionIndex} style={{ marginBottom: '16px', minHeight: '52px', animation: 'fadeInQuick 0.15s ease-out' }}>
          <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
            {currentQuestion?.subject || 'SPM Trial'}
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC', margin: 0, lineHeight: 1.4 }}>
            {currentQuestion?.text || 'Loading question...'}
          </h2>
        </div>

        {/* 4 Large Action Options Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          {currentQuestion?.options?.map((opt, idx) => {
            const { bg, border, color, icon } = getOptionStyle(idx);
            const isClickLocked = battlePhase !== BATTLE_PHASES.QUESTION;

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isClickLocked}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: bg,
                  border: `2px solid ${border}`,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  cursor: isClickLocked ? 'default' : 'pointer',
                  transition: 'all 0.10s ease-out',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {/* Option Letter (A, B, C, D) */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 900
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                {/* Option text */}
                <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                  {opt}
                </span>

                {/* Status Icon */}
                {icon && <div>{icon}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESULT SETTLEMENT MODAL (VICTORY / BOSS_ESCAPED) */}
      {/* ============================================================ */}
      {battlePhase === BATTLE_PHASES.RESULT && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          {/* Confetti Celebration on VICTORY (Boss Defeated) */}
          {battleResult === BATTLE_RESULTS.VICTORY && (
            <Confetti
              width={windowWidth || 400}
              height={windowHeight || 800}
              recycle={false}
              numberOfPieces={350}
              colors={['#FFBC00', '#F59E0B', '#EF4444', '#10B981', '#38BDF8', '#FFFFFF']}
              style={{ position: 'fixed', inset: 0, zIndex: 110, pointerEvents: 'none' }}
            />
          )}

          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: '#0F172A',
              border: battleResult === BATTLE_RESULTS.VICTORY
                ? '2px solid rgba(250, 204, 21, 0.5)'
                : '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '28px',
              padding: '28px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: battleResult === BATTLE_RESULTS.VICTORY
                ? '0 20px 60px rgba(245, 158, 11, 0.35), 0 0 40px rgba(0,0,0,0.8)'
                : '0 20px 60px rgba(0,0,0,0.85)',
              position: 'relative',
              zIndex: 120
            }}
          >
            {/* Header Avatar Badge */}
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: battleResult === BATTLE_RESULTS.VICTORY
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
                border: battleResult === BATTLE_RESULTS.VICTORY
                  ? '3px solid #FDE68A'
                  : '3px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '38px',
                boxShadow: battleResult === BATTLE_RESULTS.VICTORY
                  ? '0 0 32px rgba(245, 158, 11, 0.7)'
                  : '0 0 20px rgba(71, 85, 105, 0.5)',
                marginBottom: '14px',
                animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {battleResult === BATTLE_RESULTS.VICTORY ? '👑' : '💨'}
            </div>

            {/* Step 9 Title: BOSS DEFEATED vs BOSS ESCAPED */}
            <h1
              style={{
                fontSize: '25px',
                fontWeight: 900,
                color: battleResult === BATTLE_RESULTS.VICTORY ? '#FDE047' : '#E2E8F0',
                margin: 0,
                letterSpacing: '1px',
                textShadow: battleResult === BATTLE_RESULTS.VICTORY
                  ? '0 0 20px rgba(250, 204, 21, 0.6)'
                  : 'none'
              }}
            >
              {battleResult === BATTLE_RESULTS.VICTORY ? 'BOSS DEFEATED' : 'BOSS ESCAPED'}
            </h1>

            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px', marginBottom: '18px', fontWeight: 600 }}>
              {battleResult === BATTLE_RESULTS.VICTORY
                ? `You knocked out ${encounter.character.name}!`
                : `${encounter.character.name} slipped away before defeat!`}
            </p>

            {/* Earned BP Settlement Display (Always rewarded even on escape) */}
            <div
              style={{
                background: 'rgba(255, 188, 0, 0.12)',
                border: '1.5px solid rgba(255, 188, 0, 0.35)',
                borderRadius: '18px',
                padding: '12px 20px',
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BankPoints Earned
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFBC00', marginTop: '2px' }}>
                +{earnedBP} BP
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', fontWeight: 600 }}>
                {correct} correct × {scorePerQuestion} BP
              </div>
            </div>

            {/* Step 9: Specific Performance Stats Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                width: '100%',
                marginBottom: '20px'
              }}
            >
              {/* Stat 1: Correct / Total */}
              <div style={{ background: '#1E293B', padding: '10px 4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>Score</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#38BDF8', marginTop: '3px' }}>
                  {correct} / {totalQuestions}
                </div>
              </div>

              {/* Stat 2: Accuracy % */}
              <div style={{ background: '#1E293B', padding: '10px 4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>Accuracy</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#4ADE80', marginTop: '3px' }}>
                  {Math.round((correct / totalQuestions) * 100)}%
                </div>
              </div>

              {/* Stat 3: Max Combo */}
              <div style={{ background: '#1E293B', padding: '10px 4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>Max Combo</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#FACC15', marginTop: '3px' }}>
                  x{maxCombo}
                </div>
              </div>
            </div>

            {/* Step 9 Action Buttons */}
            {battleResult === BATTLE_RESULTS.BOSS_ESCAPED ? (
              // BOSS ESCAPED: Return to regular training loop, clear encounter, retain long-term learning history
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <button
                  onClick={() => {
                    if (onComplete) {
                      onComplete({
                        correct,
                        wrong,
                        skipped,
                        maxCombo,
                        bossHP,
                        battleResult,
                        earnedBP
                      });
                    } else if (onBack) {
                      onBack();
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                    transition: 'transform 0.1s active'
                  }}
                >
                  CONTINUE TRAINING <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              // BOSS DEFEATED: Primary Claim & Return Home button
              <button
                onClick={() => {
                  if (onComplete) {
                    onComplete({
                      correct,
                      wrong,
                      skipped,
                      maxCombo,
                      bossHP,
                      battleResult,
                      earnedBP
                    });
                  } else if (onBack) {
                    onBack();
                  }
                }}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                  border: 'none',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)'
                }}
              >
                Claim & Return Home <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS Keyframe Animations for 2D mobile game feeling */}
      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatAndFade {
          0% { opacity: 0; transform: translateY(10px) scale(0.8); }
          20% { opacity: 1; transform: translateY(0px) scale(1.15); }
          70% { opacity: 1; transform: translateY(-12px) scale(1.0); }
          100% { opacity: 0; transform: translateY(-24px) scale(0.85); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes pulseFast {
          0% { transform: scale(0.95); opacity: 0.85; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInQuick {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes comboBounce {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BossBattle;
