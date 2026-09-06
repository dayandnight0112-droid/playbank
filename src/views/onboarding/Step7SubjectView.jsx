import React, { useState } from 'react';
import { Check } from 'lucide-react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * Step7SubjectView
 * Duolingo-style Subject Goal Selection Screen.
 * Dynamically adjusts subject offerings based on the age group selected in Step 2.
 */
const Step7SubjectView = ({ onNext, onBack, ageGroup = null, initialSubject = null }) => {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  // Dynamic subjects based on age category
  const getSubjectsByAge = () => {
    const category = ageGroup?.category || (ageGroup?.id === '13-15' ? 'secondary_lower' : ageGroup?.id === '16-17' ? 'secondary_upper' : 'primary');

    if (category === 'secondary_upper' || ageGroup?.id === '16-17') {
      return [
        {
          id: 'sejarah_spm',
          name: 'Sejarah',
          displayName: 'Sejarah (SPM 必修)',
          tag: 'SPM 核心及格科目',
          icon: '📜',
          color: '#FEF3C7',
          borderColor: '#F59E0B'
        },
        {
          id: 'maths_spm',
          name: 'Mathematics',
          displayName: 'Mathematics (现代数学)',
          tag: '高频闯关学科',
          icon: '📐',
          color: '#EFF6FF',
          borderColor: '#3B82F6'
        },
        {
          id: 'addmaths_spm',
          name: 'Add Maths',
          displayName: 'Add Maths (高级数学)',
          tag: '挑战高分突破',
          icon: '📈',
          color: '#F5F3FF',
          borderColor: '#8B5CF6'
        },
        {
          id: 'science_spm',
          name: 'Science',
          displayName: 'Science / 理科综合',
          tag: '物理·化学·生物',
          icon: '🔬',
          color: '#ECFDF5',
          borderColor: '#10B981'
        },
        {
          id: 'bm_spm',
          name: 'Bahasa Melayu',
          displayName: 'Bahasa Melayu (SPM)',
          tag: '必修官方国文',
          icon: '🇲🇾',
          color: '#FEE2E2',
          borderColor: '#EF4444'
        },
        {
          id: 'english_spm',
          name: 'English',
          displayName: 'English (SPM 1119)',
          tag: 'CEFR 国际进阶',
          icon: '🇬🇧',
          color: '#FDF2F8',
          borderColor: '#EC4899'
        }
      ];
    }

    if (category === 'secondary_lower' || ageGroup?.id === '13-15') {
      return [
        {
          id: 'maths_lower',
          name: 'Mathematics',
          displayName: 'Mathematics (数学)',
          tag: '中学思维建立',
          icon: '📐',
          color: '#EFF6FF',
          borderColor: '#3B82F6'
        },
        {
          id: 'science_lower',
          name: 'Science',
          displayName: 'Science (科学)',
          tag: '实验与原理探索',
          icon: '🔬',
          color: '#ECFDF5',
          borderColor: '#10B981'
        },
        {
          id: 'sejarah_lower',
          name: 'Sejarah',
          displayName: 'Sejarah (历史)',
          tag: '探索文明与历程',
          icon: '📜',
          color: '#FEF3C7',
          borderColor: '#F59E0B'
        },
        {
          id: 'bm_lower',
          name: 'Bahasa Melayu',
          displayName: 'Bahasa Melayu',
          tag: '国文语法与阅读',
          icon: '🇲🇾',
          color: '#FEE2E2',
          borderColor: '#EF4444'
        },
        {
          id: 'english_lower',
          name: 'English',
          displayName: 'English',
          tag: '词汇与语感培养',
          icon: '🇬🇧',
          color: '#FDF2F8',
          borderColor: '#EC4899'
        },
        {
          id: 'geografi_lower',
          name: 'Geografi',
          displayName: 'Geografi (地理)',
          tag: '地球与自然环境',
          icon: '🌍',
          color: '#E0F2FE',
          borderColor: '#0284C7'
        }
      ];
    }

    // Default: Primary School (7-9 or 10-12)
    return [
      {
        id: 'chinese_primary',
        name: '华文',
        displayName: '华文 (Bahasa Cina)',
        tag: '字词积累与阅读',
        icon: '🏮',
        color: '#FEF3C7',
        borderColor: '#F59E0B'
      },
      {
        id: 'maths_primary',
        name: '数学',
        displayName: '数学 (Mathematics)',
        tag: '速算与逻辑趣味',
        icon: '📐',
        color: '#EFF6FF',
        borderColor: '#3B82F6'
      },
      {
        id: 'science_primary',
        name: '科学',
        displayName: '科学 (Science)',
        tag: '自然百科探秘',
        icon: '🔬',
        color: '#ECFDF5',
        borderColor: '#10B981'
      },
      {
        id: 'english_primary',
        name: '英文',
        displayName: '英文 (English)',
        tag: '快乐学单词',
        icon: '🇬🇧',
        color: '#FDF2F8',
        borderColor: '#EC4899'
      },
      {
        id: 'bm_primary',
        name: '国文',
        displayName: '国文 (Bahasa Melayu)',
        tag: '马来语趣味通关',
        icon: '🇲🇾',
        color: '#FEE2E2',
        borderColor: '#EF4444'
      }
    ];
  };

  const subjectList = getSubjectsByAge();

  const handleSelect = (subj) => {
    playPunchyPopSound();
    setSelectedSubject(subj);
  };

  const handleContinue = () => {
    if (!selectedSubject) return;
    if (onNext) onNext(selectedSubject);
  };

  return (
    <div
      className="step7-subject-container"
      style={{
        width: '100%',
        height: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Left Circular 3D Back Button */}
      <OnboardingBackButton onClick={onBack} />

      {/* ============================================================ */}
      {/* Main Content Area                                            */}
      {/* ============================================================ */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Mascot Prompt: PB on Upper Left + Dynamic Speech Bubble */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: 'max(68px, env(safe-area-inset-top, 68px)) 20px 14px',
            boxSizing: 'border-box'
          }}
        >
          <PlayBankMascot
            variant="stand"
            size={84}
            interactive={true}
          />

          {/* Speech Bubble on the right of PB */}
          <div
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              borderRadius: '20px',
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
                fontSize: '17px',
                fontWeight: 900,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3
              }}
            >
              你最想学会什么科目？
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              {ageGroup ? `专为 ${ageGroup.label} 精准匹配` : '选择一门你想重点掌握的科目'} 🎯
            </p>
          </div>
        </div>

        {/* Scrollable Subject Options List */}
        <div
          className="scrollable-subjects-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 20px calc(115px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box'
          }}
        >
          {subjectList.map((subj) => {
            const isSelected = selectedSubject?.id === subj.id;

            return (
              <div
                key={subj.id}
                onClick={() => handleSelect(subj)}
                style={{
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  borderRadius: '18px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 5px 0 #000000' : '0 2px 0 rgba(0,0,0,0.04)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      background: isSelected ? '#FEF3C7' : subj.color,
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #F59E0B' : `1.5px solid ${subj.borderColor}`
                    }}
                  >
                    {subj.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isSelected ? '#000000' : '#1F2937'
                      }}
                    >
                      {subj.displayName}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isSelected ? '#92400E' : '#6B7280',
                        marginTop: '2px'
                      }}
                    >
                      {subj.tag}
                    </div>
                  </div>
                </div>

                {/* Selection Radio / Check Indicator */}
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
            disabled={!selectedSubject}
            size="large"
            variant="primary"
            style={{
              width: '100%',
              opacity: selectedSubject ? 1 : 0.45,
              cursor: selectedSubject ? 'pointer' : 'not-allowed'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>
    </div>
  );
};

export default Step7SubjectView;
