import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, BookOpen, Compass, Trophy } from 'lucide-react';
import PrimaryButton from '../components/common/PrimaryButton';

const PATHS = [
  {
    id: 'chinese',
    title: '中文',
    englishTitle: 'Chinese',
    desc: '汉字认知、词语辨析与趣味理解',
    tag: '基础推荐',
    color: '#10B981',
    lightBg: '#ECFDF5',
    iconEmoji: '🏮',
    accentIcon: BookOpen
  },
  {
    id: 'english',
    title: 'English',
    englishTitle: '英语',
    desc: 'Vocabulary, grammar & quest reading',
    tag: 'Essential',
    color: '#3B82F6',
    lightBg: '#EFF6FF',
    iconEmoji: '🧭',
    accentIcon: Compass
  },
  {
    id: 'mixed',
    title: '综合挑战',
    englishTitle: 'Mixed Challenge',
    desc: '双语转换、逻辑推演与全科历练',
    tag: '全能冒险',
    color: '#8B5CF6',
    lightBg: '#F5F3FF',
    iconEmoji: '⚡',
    accentIcon: Trophy
  }
];

const ChoosePath = ({ onSelectPath, onBack }) => {
  // Default to chinese or null
  const [selected, setSelected] = useState('chinese');

  const handleConfirm = () => {
    if (selected && onSelectPath) {
      onSelectPath(selected);
    }
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
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)',
        padding: '20px 20px calc(28px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Bar: Back button & Duolingo-style mini step bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          {onBack && (
            <button
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
                boxShadow: '2px 2px 0px #000000',
                outline: 'none'
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Setup Progress Bar */}
          <div style={{
            flex: 1,
            height: '10px',
            background: '#E5E7EB',
            borderRadius: '9999px',
            border: '2px solid #000000',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '40%',
              height: '100%',
              background: 'var(--brand-primary, #FFBC00)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div style={{ textAlign: 'left', marginBottom: '24px', paddingLeft: '4px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={16} color="#D97706" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase' }}>
              STEP 1: CHOOSE YOUR PATH
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#000000', margin: 0, lineHeight: 1.2 }}>
            你想从哪里开始？
          </h1>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', marginTop: '6px' }}>
            选择你专属的冒险发展方向，后续随时可以切换
          </p>
        </div>

        {/* 3 Path Cards (Duolingo Style) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {PATHS.map((path) => {
            const isSelected = selected === path.id;

            return (
              <div
                key={path.id}
                onClick={() => setSelected(path.id)}
                style={{
                  position: 'relative',
                  background: isSelected ? '#FFFFFF' : '#FFFFFF',
                  borderRadius: '20px',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  boxShadow: isSelected ? '0 6px 0px #000000' : '0 3px 0px #D1D5DB',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  WebkitTapHighlightColor: 'transparent',
                  overflow: 'hidden'
                }}
              >
                {/* Active Highlight Ribbon background */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '6px',
                    background: 'var(--brand-primary, #FFBC00)'
                  }} />
                )}

                {/* Left Mini Scene Graphic / Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: isSelected ? path.lightBg : '#F3F4F6',
                  border: `2px solid ${isSelected ? '#000000' : '#E5E7EB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  flexShrink: 0,
                  boxShadow: isSelected ? '2px 2px 0px #000000' : 'none'
                }}>
                  {path.iconEmoji}
                </div>

                {/* Middle Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                      {path.title}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>
                      ({path.englishTitle})
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6B7280',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {path.desc}
                  </p>
                </div>

                {/* Right Selection Radio / Checkmark */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#000000' : '#D1D5DB'}`,
                  background: isSelected ? 'var(--brand-primary, #FFBC00)' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isSelected && <Check size={16} strokeWidth={3.5} color="#000000" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Area */}
      <div style={{ marginTop: '20px' }}>
        <PrimaryButton
          onClick={handleConfirm}
          disabled={!selected}
          size="large"
          variant="primary"
          subtitle="下一步：新手教学"
        >
          CONFIRM PATH
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ChoosePath;
