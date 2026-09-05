import React from 'react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * AdventureScene
 * The central hero stage info overlay of PlayBank Lobby.
 * Floats gracefully over the full-bleed Adventure Scene background.
 */
const AdventureScene = ({
  scene,
  chapter = 1,
  chapterName = 'Training Grounds',
  stage = 3,
  totalStages = 8,
  onContinue
}) => {
  const isBossNear = stage >= totalStages - 1;

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '16px 4px 6px',
        userSelect: 'none',
        zIndex: 10
      }}
    >

      {/* Chapter Badge, Title & Progress Overlay (Overlaid on the bottom-center of the Adventure World) */}
      <div
        style={{
          position: 'relative',
          zIndex: 12,
          textAlign: 'center',
          marginBottom: '14px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Chapter Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(180deg, rgba(255, 188, 0, 0.25) 0%, rgba(180, 83, 9, 0.35) 100%)',
            border: '1.5px solid rgba(255, 188, 0, 0.65)',
            padding: '3px 14px',
            borderRadius: '9999px',
            marginBottom: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}
        >
          <span style={{ fontSize: '11px', color: '#FFBC00', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            ⚔ CHAPTER {chapter}
          </span>
        </div>

        {/* Chapter Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
            textShadow: '0 3px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)'
          }}
        >
          {chapterName}
        </h2>

        {/* Stage Progress Bar & Counter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1.5px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            padding: '6px 16px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            width: '100%',
            maxWidth: '220px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.5px' }}>
              PROGRESS
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFBC00' }}>
              {stage} / {totalStages}
            </span>
          </div>

          {/* Segmented Stage Dots / Bar */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            {Array.from({ length: totalStages }).map((_, idx) => {
              const isPassed = idx < stage;
              const isCurrent = idx === stage - 1;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: '100%',
                    borderRadius: '2px',
                    background: isPassed
                      ? isCurrent
                        ? '#FFBC00'
                        : '#10B981'
                      : 'rgba(255, 255, 255, 0.15)',
                    boxShadow: isCurrent ? '0 0 6px #FFBC00' : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Boss Gate Warning (if close to final stage) */}
        {isBossNear && (
          <div
            style={{
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(220, 38, 38, 0.25)',
              border: '1.5px solid rgba(239, 68, 68, 0.8)',
              borderRadius: '8px',
              padding: '3px 10px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <span style={{ fontSize: '12px' }}>⚠</span>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#FCA5A5', letterSpacing: '0.8px' }}>
              BOSS GATE NEAR
            </span>
          </div>
        )}
      </div>

      {/* Main Action CTA Button (Huge Archero-Style CONTINUE) */}
      <div
        style={{
          width: '100%',
          maxWidth: '240px',
          position: 'relative',
          zIndex: 12
        }}
      >
        <PrimaryButton
          onClick={onContinue}
          size="large"
          variant="primary"
          subtitle={`Stage ${stage}/${totalStages} · 启程`}
        >
          CONTINUE ▶
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AdventureScene;
