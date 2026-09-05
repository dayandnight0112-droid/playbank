import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, X, AlertTriangle, Sparkles } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

/**
 * ExitRetentionModal
 * Soft Exit & Progress Retention Modal (Step 31):
 * - Triggered when guest attempts to exit, reset, or leave the game
 * - Summarizes player's accumulated BP, Chapter stage, and Streak
 * - Empowers player: "Save Progress & Login" vs "Keep Playing as Guest"
 * - Zero penalty, non-aggressive, game-centric retention
 */
const ExitRetentionModal = ({
  isOpen,
  onClose,
  onSaveAndLogin,
  onConfirmExit,
  guestProfile,
  userBP = 0
}) => {
  if (!isOpen) return null;

  const guestName = guestProfile?.guestName || 'Guest 4821';
  const chapter = guestProfile?.chapterProgress?.chapter || 1;
  const stage = guestProfile?.chapterProgress?.stage || 3;
  const streak = guestProfile?.streak || 3;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(5, 11, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          padding: '24px 20px 20px',
          textAlign: 'center'
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Floating Shield Emblem */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '12px',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
          }}
        >
          🛡️
        </div>

        {/* Warning Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.6)',
            padding: '3px 12px',
            borderRadius: '9999px',
            marginBottom: '8px',
            fontSize: '11px',
            fontWeight: 900,
            color: '#FCA5A5',
            letterSpacing: '0.8px'
          }}
        >
          <AlertTriangle size={12} color="#EF4444" />
          UNSAVED GUEST PROGRESS
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px'
          }}
        >
          冒险战绩尚未云端保存！
        </h2>

        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: 1.4 }}>
          当前您以 <strong style={{ color: '#FEF08A' }}>{guestName}</strong> 游玩。若直接离开或清理浏览器，以下战利品将无法同步：
        </p>

        {/* Current Achievements Snapshot Card */}
        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '14px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🪙</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>BankPoint</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFBC00' }}>{userBP} BP</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>⚔️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>关卡进度</div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>Stage {stage} / 8</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🔥</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>连续签到</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#F97316' }}>{streak} Days</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🎖️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>专属勋章</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#10B981' }}>已佩戴</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Primary: Save & Login */}
          <PrimaryButton
            onClick={onSaveAndLogin}
            size="large"
            variant="primary"
            subtitle="免费绑定账号 · 永久云端保存"
          >
            🛡️ 保存进度并登录
          </PrimaryButton>

          {/* Secondary: Keep Playing as Guest */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            暂不保存 · 继续以游客畅玩
          </button>

          {/* Tertiary: Exit Anyway */}
          {onConfirmExit && (
            <button
              type="button"
              onClick={onConfirmExit}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px',
                marginTop: '2px'
              }}
            >
              仍要离开 (稍后再玩)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExitRetentionModal;
