import React, { useState } from 'react';
import { X, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const LoginModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  guestProfile = null,
  guestBP = 0
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [step, setStep] = useState('login_form'); // 'login_form' | 'merge_choice'
  const [pendingUser, setPendingUser] = useState(null);

  if (!isOpen) return null;

  const currentGuestBP = typeof guestBP === 'number' && guestBP > 0
    ? guestBP
    : (guestProfile?.bankPoint || 0);

  const hasGuestLoot = currentGuestBP > 0 || (guestProfile?.badges && guestProfile.badges.length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    const result = mockDb.loginUser(email.trim(), password);
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      if (hasGuestLoot) {
        // Player has guest loot to merge! Present choice
        setPendingUser(result.user);
        setStep('merge_choice');
      } else {
        // No guest loot, direct login
        onLoginSuccess(result.user, { mergedBP: 0 });
        handleClose();
      }
    }
  };

  const handleMerge = () => {
    if (!pendingUser) return;
    const mergeResult = mockDb.mergeGuestToUser(pendingUser.id, {
      bankPoint: currentGuestBP,
      badges: guestProfile?.badges || ['starter_badge']
    });
    onLoginSuccess(mergeResult.user, { mergedBP: mergeResult.mergedBP });
    handleClose();
  };

  const handleRestoreOnly = () => {
    if (!pendingUser) return;
    const restoredUser = mockDb.restoreCloudUserOnly(pendingUser.id);
    onLoginSuccess(restoredUser, { mergedBP: 0 });
    handleClose();
  };

  const handleClose = () => {
    setStep('login_form');
    setPendingUser(null);
    setError(null);
    onClose();
  };

  const handleFillDemoAccount = () => {
    setEmail('hero@playbank.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 11, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(255, 188, 0, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 188, 0, 0.2)',
          padding: '28px 24px',
          position: 'relative',
          color: '#FFFFFF',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94A3B8',
            transition: 'all 0.15s ease'
          }}
        >
          <X size={16} />
        </button>

        {step === 'login_form' ? (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: '#000'
                }}
              >
                <LogIn size={28} />
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '0.5px'
                }}
              >
                PLAYER LOGIN
              </h2>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', marginBottom: 0 }}>
                Log in to restore your cloud progress and BankPoints
              </p>
            </div>

            {/* Current Guest Loot Status */}
            {hasGuestLoot && (
              <div
                style={{
                  background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Sparkles size={20} color="#F59E0B" />
                <div style={{ fontSize: '12px', lineHeight: 1.3 }}>
                  <div style={{ fontWeight: 800, color: '#FDE68A' }}>
                    🎮 当前游客会话: {guestProfile?.guestName || 'Guest 4821'}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '2px' }}>
                    已积累 <span style={{ color: '#10B981', fontWeight: 800 }}>🪙 {currentGuestBP} BP</span>，登录后支持无缝合并！
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#FCA5A5',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#CBD5E1', marginBottom: '6px' }}>
                  Email / Username
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hero@playbank.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#CBD5E1', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Quick autofill demo account tip */}
              <button
                type="button"
                onClick={handleFillDemoAccount}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed rgba(255, 188, 0, 0.4)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  color: '#FCD34D',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 600,
                  transition: 'background 0.15s ease'
                }}
              >
                💡 一键填入测试老玩家账号 (hero@playbank.com / 500 BP)
              </button>

              <button
                type="submit"
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  border: '2px solid #FDE68A',
                  fontWeight: 900,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                  color: '#000000',
                  letterSpacing: '0.5px'
                }}
              >
                LOG IN ▶
              </button>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                Continue as Guest
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Merge Decision Screen */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  color: '#FFFFFF'
                }}
              >
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                MERGE PROGRESS
              </h2>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', marginBottom: 0 }}>
                检测到未绑定的游客战利品，请选择处理方式：
              </p>
            </div>

            {/* Comparison Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              {/* Left: Guest Loot */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '14px',
                  padding: '12px 10px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 800 }}>🎒 游客战利品</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', margin: '4px 0' }}>
                  +{currentGuestBP} BP
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>新手勋章 & 关卡</div>
              </div>

              {/* Plus Sign */}
              <div style={{ color: '#F59E0B', fontWeight: 900, fontSize: '18px' }}>+</div>

              {/* Right: Cloud User */}
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '14px',
                  padding: '12px 10px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 800 }}>☁️ 云端档案</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#60A5FA', margin: '4px 0' }}>
                  {pendingUser?.total_bp || 0} BP
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pendingUser?.ic_name || pendingUser?.email?.split('@')[0]}
                </div>
              </div>
            </div>

            {/* Result Projection Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.06) 100%)',
                border: '1.5px solid #F59E0B',
                borderRadius: '16px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#FDE68A', fontWeight: 800 }}>🌟 合并后总资产</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>云端与游客战利品无缝融合</div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFBC00', letterSpacing: '0.5px' }}>
                🪙 {(pendingUser?.total_bp || 0) + currentGuestBP} BP
              </div>
            </div>

            {/* Decision Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleMerge}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                  border: '2px solid #6EE7B7',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  color: '#FFFFFF',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShieldCheck size={18} />
                合并战利品并进入游戏 (+{currentGuestBP} BP)
              </button>

              <button
                onClick={handleRestoreOnly}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  transition: 'background 0.15s ease'
                }}
              >
                仅恢复云端存档 ({pendingUser?.total_bp || 0} BP)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;

