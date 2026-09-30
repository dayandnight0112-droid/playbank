import React, { useState } from 'react';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { playTapSound } from '../../lib/soundEffects';

const EnergyBadge = ({
  energy = 5,
  maxEnergy = 5,
  isPaid = false,
  isFull = true,
  formattedCountdown = '00:00',
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e) => {
    playTapSound();
    if (onClick) {
      onClick(e);
    } else {
      setShowTooltip(prev => !prev);
    }
  };

  const isLow = energy === 0;
  const accentColor = isLow ? '#EF4444' : (isPaid ? '#F59E0B' : '#10B981');
  const borderColor = isLow ? 'rgba(239, 68, 68, 0.6)' : (isPaid ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)');

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          background: 'rgba(30, 41, 59, 0.92)',
          border: `2px solid ${borderColor}`,
          borderRadius: '9999px',
          padding: '4px 10px 4px 7px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backdropFilter: 'blur(8px)',
          boxShadow: isLow ? '0 0 10px rgba(239, 68, 68, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none',
          transition: 'all 0.15s ease'
        }}
        title="游玩次数"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: accentColor,
          color: '#000'
        }}>
          <Zap size={12} strokeWidth={3} fill="#000" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 900,
            color: accentColor,
            lineHeight: 1
          }}>
            {energy}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: 1
          }}>
            /{maxEnergy}
          </span>
        </div>

        {/* 倒计时微标签（未满额时显示） */}
        {!isFull && (
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#94A3B8',
            marginLeft: '2px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {formattedCountdown}
          </span>
        )}
      </button>

      {/* 悬停/点击信息浮层 */}
      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 9999,
            backgroundColor: '#0F172A',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 14px',
            width: '210px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5)',
            color: '#FFF',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>⚡ 游玩次数池</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: isPaid ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
              color: isPaid ? '#FBBF24' : '#94A3B8'
            }}>
              {isPaid ? 'VIP 10次' : '免费 5次'}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.4, marginBottom: '8px' }}>
            {isFull ? (
              <span>当前已满额，每开启一局挑战扣除 1 次。</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FCD34D' }}>
                <Clock size={13} />
                <span>下一次恢复：<strong>{formattedCountdown}</strong></span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3, marginBottom: isPaid ? 0 : '8px' }}>
            规则：每 1 小时恢复 1 次，上限停止，离线照常恢复。
          </div>

          {!isPaid && onClick && (
            <button
              type="button"
              onClick={onClick}
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: '#FFBC00',
                border: 'none',
                color: '#000',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>升级 10 次上限 + 3× BP</span>
              <ChevronRight size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnergyBadge;
