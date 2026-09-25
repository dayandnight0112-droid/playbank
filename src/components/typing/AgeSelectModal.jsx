import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { getTypingAgeConfig } from '../../data/typingConfig.js';
import { playPunchyPopSound } from '../../lib/soundEffects.js';

const AGES = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function AgeSelectModal({
  isOpen = false,
  onClose,
  onConfirmAge,
  defaultAge = 10,
  gameRound = 1
}) {
  const [selectedAge, setSelectedAge] = useState(() => defaultAge || 10);

  if (!isOpen) return null;

  const ageConfig = getTypingAgeConfig(selectedAge);
  const isMultipleChoiceRound = gameRound % 2 === 1;

  const handleAgeClick = (age) => {
    setSelectedAge(age);
    playPunchyPopSound();
  };

  const handleStart = () => {
    playPunchyPopSound();
    if (onConfirmAge) {
      onConfirmAge(selectedAge);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          border: '3px solid #111111',
          borderRadius: '24px',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '6px 6px 0px #111111',
          position: 'relative',
          boxSizing: 'border-box',
          animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F3F4F6',
            border: '2px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} color="#111111" />
        </button>

        {/* Current Round Badge */}
        <div style={{ marginBottom: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1.5px solid #111111',
              background: isMultipleChoiceRound ? '#FEF08A' : '#E0F2FE',
              color: '#111111',
              fontWeight: 900,
              fontSize: '0.75rem',
              boxShadow: '1.5px 1.5px 0px #111111'
            }}
          >
            {isMultipleChoiceRound ? '🎮' : '⌨️'} 当前：第 {gameRound} 局 ·{' '}
            {isMultipleChoiceRound ? 'English Multiple Choice (选择题)' : 'English Typing (打字练习)'}
          </span>
        </div>

        {/* Modal Title */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111111', margin: '0 0 6px 0' }}>
          请选择你的实际年龄
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 18px 0', lineHeight: 1.4 }}>
          系统将根据你的年龄自动决定题目难度、题目数量和每题得分。
        </p>

        {/* 11 Age Buttons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
            marginBottom: '18px'
          }}
        >
          {AGES.map((age, idx) => {
            const isSelected = selectedAge === age;
            return (
              <button
                key={age}
                type="button"
                onClick={() => handleAgeClick(age)}
                style={{
                  gridColumn: idx === 10 ? 'span 2' : 'span 1', // 11th button centered/extended
                  height: '46px',
                  borderRadius: '12px',
                  border: isSelected ? '2.5px solid #111111' : '1.5px solid #D1D5DB',
                  background: isSelected ? '#FFBC00' : '#F9FAFB',
                  color: isSelected ? '#111111' : '#4B5563',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '2.5px 2.5px 0px #111111' : 'none',
                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                  transition: 'all 0.1s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px'
                }}
              >
                <span>{age}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>岁</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Age Rule Preview Card */}
        <div
          style={{
            background: '#F8FAFC',
            border: '2px solid #111111',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px',
            boxShadow: '2px 2px 0px #111111'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#111111', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{ageConfig.icon}</span>
              <span>{ageConfig.label} ({ageConfig.sublabel.split(' ')[0]})</span>
            </span>

            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1px solid #111111',
                color: '#111111'
              }}
            >
              {ageConfig.difficultyLabel}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginTop: '10px' }}>
            <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111111' }}>{ageConfig.questionCount} 题</div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 700 }}>每局题数</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#15803D' }}>+{ageConfig.scorePerQuestion} 分</div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 700 }}>每题分值</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#F59E0B' }}>{ageConfig.maxScore} 分</div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 700 }}>单局满分</div>
            </div>
          </div>

          <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
            📖 题型: {ageConfig.contentDescription} · {isMultipleChoiceRound ? '保留原有 Combo 机制' : '独立计分无 Combo'}
          </p>
        </div>

        {/* Start Game CTA Button */}
        <button
          type="button"
          onClick={handleStart}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '999px',
            border: '2.5px solid #111111',
            background: '#111111',
            color: '#FFBC00',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s ease'
          }}
        >
          <span>开始挑战 (Start Game)</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes modalPop {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
