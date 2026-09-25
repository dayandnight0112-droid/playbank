import React from 'react';
import { Volume2, AlertCircle } from 'lucide-react';

export default function TypingDisplay({
  charStates = [],
  translation = '',
  category = '',
  isLocked = false,
  isCompleted = false,
  onReplayAudio = null
}) {
  return (
    <div
      className="typing-display-card"
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        background: '#FFFFFF',
        border: '3px solid #111111',
        borderRadius: '20px',
        boxShadow: isCompleted
          ? '0 0 25px rgba(16, 185, 129, 0.4), 4px 4px 0px #111111'
          : isLocked
          ? '0 0 20px rgba(239, 68, 68, 0.35), 4px 4px 0px #111111'
          : '4px 4px 0px #111111',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      {/* Category Pill & Speaker Replay Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '999px',
            background: '#F3F4F6',
            border: '1.5px solid #111111',
            color: '#374151'
          }}
        >
          🏷️ {category || 'English'}
        </span>

        {onReplayAudio && (
          <button
            type="button"
            onClick={onReplayAudio}
            title="重新播放发音 (Replay Pronunciation)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '999px',
              border: '1.5px solid #111111',
              background: '#FEF08A',
              color: '#111111',
              fontWeight: 900,
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: '1.5px 1.5px 0px #111111',
              transition: 'transform 0.1s ease'
            }}
          >
            <Volume2 size={14} />
            重播发音
          </button>
        )}
      </div>

      {/* Target Text Character-by-Character Display with Atomic Word Wrapping */}
      {(() => {
        // Group charStates into atomic word units and spaces to prevent words from splitting across lines
        const tokens = [];
        let currentWordChars = [];

        charStates.forEach((item, idx) => {
          if (item.isSpace) {
            if (currentWordChars.length > 0) {
              tokens.push({ isSpace: false, items: currentWordChars });
              currentWordChars = [];
            }
            tokens.push({ isSpace: true, item: { ...item, index: idx } });
          } else {
            currentWordChars.push({ ...item, index: idx });
          }
        });
        if (currentWordChars.length > 0) {
          tokens.push({ isSpace: false, items: currentWordChars });
        }

        return (
          <div
            className="typing-text-container"
            style={{
              fontSize: charStates.length > 25 ? '1.4rem' : charStates.length > 15 ? '1.8rem' : '2.2rem',
              fontWeight: 900,
              lineHeight: 1.6,
              fontFamily: "'Courier New', Courier, monospace",
              letterSpacing: '0.04em',
              minHeight: '64px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              rowGap: '6px',
              wordBreak: 'keep-all',
              padding: '8px 0'
            }}
          >
            {tokens.map((token, tIdx) => {
              if (token.isSpace) {
                const item = token.item;
                const borderBottom = item.status === 'current' ? '3px solid #111111' : 'none';
                return (
                  <span
                    key={`space-${item.index}`}
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      borderBottom,
                      margin: '0 2px'
                    }}
                  >
                    &nbsp;
                  </span>
                );
              }

              return (
                <span
                  key={`word-${tIdx}`}
                  className="typing-word"
                  style={{
                    display: 'inline-flex',
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {token.items.map((item) => {
                    let charColor = '#94A3B8'; // default pending
                    let charBg = 'transparent';
                    let borderBottom = 'none';

                    if (item.status === 'completed') {
                      charColor = '#10B981'; // Vibrant Green
                    } else if (item.status === 'correct') {
                      charColor = '#0284C7'; // Vibrant Blue
                    } else if (item.status === 'wrong') {
                      charColor = '#DC2626'; // Vibrant Red
                      charBg = 'rgba(239, 68, 68, 0.15)';
                    } else if (item.status === 'current') {
                      borderBottom = '3px solid #111111';
                    }

                    return (
                      <span
                        key={item.index}
                        style={{
                          display: 'inline-block',
                          color: charColor,
                          background: charBg,
                          borderBottom,
                          borderRadius: '3px',
                          padding: '0 1px',
                          transition: 'color 0.1s ease, background 0.1s ease',
                          position: 'relative'
                        }}
                      >
                        {item.status === 'wrong' ? item.typedChar || item.expectedChar : item.expectedChar}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
        );
      })()}

      {/* Chinese Translation Hint */}
      {translation && (
        <div style={{ marginTop: '12px', fontSize: '0.95rem', fontWeight: 700, color: '#4B5563' }}>
          {translation}
        </div>
      )}

      {/* Error Locked Warning Banner */}
      {isLocked && (
        <div
          className="typing-error-banner animate-shake"
          style={{
            marginTop: '16px',
            background: '#FEE2E2',
            border: '2px solid #EF4444',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#991B1B',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '2px 2px 0px #EF4444'
          }}
        >
          <AlertCircle size={15} color="#EF4444" />
          <span>字母输入错误！按 <strong>Backspace (退格键)</strong> 删除后继续</span>
        </div>
      )}

      {/* Completed Success Banner */}
      {isCompleted && (
        <div
          style={{
            marginTop: '16px',
            background: '#DCFCE7',
            border: '2px solid #15803D',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#14532D',
            fontSize: '0.825rem',
            fontWeight: 900,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🎉 拼写正确！准备进入下一题...</span>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.25s ease-in-out;
        }
      `}</style>
    </div>
  );
}
