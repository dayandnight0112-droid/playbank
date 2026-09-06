import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * Step2AgeView
 * Duolingo-style Age Selection Screen.
 * 4 Options:
 *  - 7–9 岁 (小学低年级)
 *  - 10–12 岁 (小学高年级)
 *  - 13–15 岁 (初中)
 *  - 16–17 岁 (高中 / SPM)
 * Features:
 *  - Top progress bar (10%)
 *  - PB Mascot asking the age
 *  - High contrast card selection
 *  - Sticky bottom "继续" button
 */
const Step2AgeView = ({ onNext, onBack, initialAge = null }) => {
  const [selectedAge, setSelectedAge] = useState(initialAge);

  const ageOptions = [
    {
      id: '7-9',
      label: '7 – 9 岁',
      sublabel: '小学低年级 (Standard 1–3)',
      icon: '🎒',
      category: 'primary_lower'
    },
    {
      id: '10-12',
      label: '10 – 12 岁',
      sublabel: '小学高年级 (Standard 4–6)',
      icon: '📚',
      category: 'primary_upper'
    },
    {
      id: '13-15',
      label: '13 – 15 岁',
      sublabel: '初中 (Form 1–3)',
      icon: '🎓',
      category: 'secondary_lower'
    },
    {
      id: '16-17',
      label: '16 – 17 岁',
      sublabel: '高中 / SPM (Form 4–5)',
      icon: '⚡',
      category: 'secondary_upper'
    }
  ];

  const handleSelect = (option) => {
    playPunchyPopSound();
    setSelectedAge(option);
  };

  const handleContinue = () => {
    if (!selectedAge) return;
    if (onNext) onNext(selectedAge);
  };

  return (
    <div
      className="step2-age-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* ============================================================ */}
      {/* Top Header: Back Button + Minimal Progress Bar (10%)          */}
      {/* ============================================================ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #F3F4F6',
          padding: 'max(14px, env(safe-area-inset-top, 14px)) 16px 12px',
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

        {/* Duolingo-style Progress Bar */}
        <div
          style={{
            flex: 1,
            height: '12px',
            background: '#E5E7EB',
            borderRadius: '9999px',
            border: '2px solid #000000',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '12%',
              height: '100%',
              background: 'var(--brand-primary, #FFBC00)',
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </header>

      {/* ============================================================ */}
      {/* Main Content Area                                            */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          padding: '16px 20px calc(100px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mascot Prompt Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '22px',
            marginTop: '8px'
          }}
        >
          <PlayBankMascot
            variant="stand"
            size={88}
            interactive={true}
          />
          {/* Duolingo Speech Bubble */}
          <div
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '18px',
              padding: '12px 18px',
              boxShadow: '0 4px 0 #000000',
              flex: 1
            }}
          >
            {/* Bubble arrow pointing left to Mascot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-10px',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '10px solid #000000'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-7px',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '8px solid #FFFFFF',
                zIndex: 1
              }}
            />
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3
              }}
            >
              选择你的年龄
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              让我为你量身定制学习内容！✨
            </p>
          </div>
        </div>

        {/* 4 Age Selection Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {ageOptions.map((opt) => {
            const isSelected = selectedAge?.id === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                style={{
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 5px 0 #000000' : '0 2px 0 rgba(0,0,0,0.04)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontSize: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      background: isSelected ? '#FEF3C7' : '#F9FAFB',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #F59E0B' : '1px solid #E5E7EB'
                    }}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: 900,
                        color: isSelected ? '#000000' : '#1F2937'
                      }}
                    >
                      {opt.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isSelected ? '#92400E' : '#6B7280',
                        marginTop: '2px'
                      }}
                    >
                      {opt.sublabel}
                    </div>
                  </div>
                </div>

                {/* Selection indicator radio/check */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #000000' : '2px solid #D1D5DB',
                    background: isSelected ? 'var(--brand-primary, #FFBC00)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3.5} color="#000000" />}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ============================================================ */}
      {/* Bottom Sticky Action Bar: "继续" (CONTINUE) Button            */}
      {/* ============================================================ */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 25%, #FFFFFF 100%)',
          padding: '16px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedAge}
            size="large"
            variant="primary"
            style={{
              width: '100%',
              opacity: selectedAge ? 1 : 0.45,
              cursor: selectedAge ? 'pointer' : 'not-allowed'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>
    </div>
  );
};

export default Step2AgeView;
