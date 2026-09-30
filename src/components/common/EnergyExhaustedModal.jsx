import React, { useState, useEffect } from 'react';
import { Zap, Clock, X, Sparkles, ChevronRight } from 'lucide-react';
import { energyService } from '../../lib/energyService';
import { playModalSwooshSound, playTapSound } from '../../lib/soundEffects';

const EnergyExhaustedModal = ({
  isOpen,
  onClose,
  playerId = 'guest',
  onOpenParentPurchase
}) => {
  const [countdown, setCountdown] = useState('00:00');
  const [energyState, setEnergyState] = useState(() => energyService.getEnergyState(playerId));

  useEffect(() => {
    if (!isOpen) return;
    playModalSwooshSound(true);

    const update = () => {
      const state = energyService.getEnergyState(playerId);
      setEnergyState(state);
      setCountdown(state.formattedCountdown);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen, playerId]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalSwooshSound(false);
    onClose();
  };

  const handleUpgradeClick = () => {
    playTapSound();
    onClose();
    if (onOpenParentPurchase) {
      onOpenParentPurchase();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(5px)',
      padding: '20px'
    }}>
      <div
        className="modal-spring"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          border: '4px solid #000000',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '8px 8px 0px #000000',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: '2px solid #000',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Warning Icon Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            backgroundColor: '#FEE2E2',
            border: '3px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 4px 0px #EF4444'
          }}>
            <Zap size={38} strokeWidth={2.5} color="#DC2626" fill="#FCA5A5" />
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
          游玩次数已用完
        </h2>

        <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', marginBottom: '18px' }}>
          小冒险家，当前储存的游玩次数为 0 次。<br />
          请休息一下，等待体力恢复哦！
        </p>

        {/* Countdown Box */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '2px solid #E2E8F0',
          borderRadius: '18px',
          padding: '14px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#64748B', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
            <Clock size={16} strokeWidth={2.5} color="#6366F1" />
            <span>下一次恢复 1 次倒计时</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>
            {countdown}
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', fontWeight: 600 }}>
            规则：每经过 1 小时自动恢复 1 次，离线也照常计算
          </div>
        </div>

        {/* Upgrade Callout */}
        {!energyState.isPaid && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Sparkles size={16} color="#D97706" />
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#92400E' }}>
                家长一次性购买专属权益
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
              • 储存上限由 5 次扩增至 <strong>10 次</strong>，能连续挑战更多局！<br />
              • 永久享有答题所得 <strong>3× BP 积分</strong>！
            </div>
            <button
              type="button"
              onClick={handleUpgradeClick}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: '#F59E0B',
                border: '2px solid #000',
                color: '#000',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #000'
              }}
            >
              <span>请家长开通 10 次上限</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Secondary Back Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: '#F1F5F9',
            border: '2px solid #CBD5E1',
            color: '#475569',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          我知道了，稍后再来
        </button>
      </div>
    </div>
  );
};

export default EnergyExhaustedModal;
