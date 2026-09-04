import React from 'react';
import { Cloud, ShieldCheck, ArrowRight, X } from 'lucide-react';
import PrimaryButton from './common/PrimaryButton';

const SaveProgressPromptModal = ({
  isOpen,
  guestBP = 170,
  onLoginAndSave,
  onContinueGuest
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '350px',
          borderRadius: '28px',
          border: '3px solid #000000',
          boxShadow: '0 10px 0px #000000',
          padding: '28px 22px 24px',
          textAlign: 'center',
          position: 'relative',
          animation: 'springPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Close Button (Acts as Continue as Guest) */}
        <button
          onClick={onContinueGuest}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F3F4F6',
            border: '2px solid #000000',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '1px 1px 0px #000000'
          }}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Cloud Save Icon Emblem */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: '#EFF6FF',
            border: '3px solid #000000',
            boxShadow: '0 4px 0px #000000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <Cloud size={40} color="#2563EB" strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#000000',
            margin: '0 0 6px 0',
            lineHeight: 1.2
          }}
        >
          保存你的冒险进度
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#4B5563',
            margin: '0 0 18px 0',
            lineHeight: 1.4
          }}
        >
          登录后可以在其他设备继续游戏，积分与进度永不丢失
        </p>

        {/* Highlight Card */}
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
              待保存积分
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
              🪙 {guestBP} BP
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#D1D5DB' }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
              已解锁章节
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
              Chapter 1
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PrimaryButton
            onClick={onLoginAndSave}
            size="normal"
            variant="primary"
            style={{ width: '100%' }}
          >
            Login & Save (登录保存)
          </PrimaryButton>

          <button
            onClick={onContinueGuest}
            style={{
              background: 'transparent',
              border: '2px solid #E5E7EB',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Continue as Guest (以游客继续)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveProgressPromptModal;
