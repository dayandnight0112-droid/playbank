import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import OnboardingBackButton from './OnboardingBackButton';
import PlayBankMascot from '../../components/common/PlayBankMascot';
import PrimaryButton from '../../components/common/PrimaryButton';
import { playPunchyPopSound } from '../../lib/soundEffects';

/**
 * Step6AttributionView
 * Duolingo-style Attribution Channel Screen.
 * Layout:
 *  - Top-left 3D circular back button
 *  - PB Mascot scaled down on the upper-left with speech bubble
 *  - 3 Channels: Facebook/Instagram, Google, Hero
 *  - Sticky bottom "继续" button
 */
const Step6AttributionView = ({ onNext, onBack, initialChannel = null }) => {
  const [selectedChannel, setSelectedChannel] = useState(initialChannel);

  const channels = [
    {
      id: 'social',
      title: 'Facebook / Instagram',
      subtitle: '社交媒体推荐与广告',
      badgeColor: '#E0F2FE',
      borderColor: '#38BDF8',
      icon: (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1877F2 0%, #E1306C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          📱
        </div>
      )
    },
    {
      id: 'google',
      title: 'Google',
      subtitle: '网页与学术知识搜索',
      badgeColor: '#FEF3C7',
      borderColor: '#F59E0B',
      icon: (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#FFFFFF',
            border: '1.5px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4285F4',
            fontWeight: 900,
            fontSize: '18px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}
        >
          <span style={{ color: '#4285F4' }}>G</span>
        </div>
      )
    },
    {
      id: 'hero',
      title: 'Hero',
      subtitle: 'Hero 学习社群与平台推荐',
      badgeColor: '#FEE2E2',
      borderColor: '#F87171',
      icon: (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          🦸
        </div>
      )
    }
  ];

  const handleSelect = (ch) => {
    playPunchyPopSound();
    setSelectedChannel(ch);
  };

  const handleContinue = () => {
    if (!selectedChannel) return;
    if (onNext) onNext(selectedChannel);
  };

  return (
    <div
      className="step6-attribution-container"
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
        {/* Top Mascot Prompt: Scaled Down Mascot on Upper Left + Speech Bubble */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: 'max(68px, env(safe-area-inset-top, 68px)) 20px 16px',
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
              padding: '14px 18px',
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
              你是从哪里认识我们的？
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              选择推荐渠道，帮助我们变得更好！🐾
            </p>
          </div>
        </div>

        {/* Scrollable Channel Options List */}
        <div
          className="scrollable-channels-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 20px calc(115px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxSizing: 'border-box'
          }}
        >
          {channels.map((ch) => {
            const isSelected = selectedChannel?.id === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => handleSelect(ch)}
                style={{
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                  borderRadius: '20px',
                  padding: '18px 20px',
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
                  {ch.icon}
                  <div>
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: 900,
                        color: isSelected ? '#000000' : '#1F2937'
                      }}
                    >
                      {ch.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isSelected ? '#92400E' : '#6B7280',
                        marginTop: '2px'
                      }}
                    >
                      {ch.subtitle}
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
            disabled={!selectedChannel}
            size="large"
            variant="primary"
            style={{
              width: '100%',
              opacity: selectedChannel ? 1 : 0.45,
              cursor: selectedChannel ? 'pointer' : 'not-allowed'
            }}
          >
            继续
          </PrimaryButton>
        </div>
      </footer>
    </div>
  );
};

export default Step6AttributionView;
