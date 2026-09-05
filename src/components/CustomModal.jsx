import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import PrimaryButton from './common/PrimaryButton';
import { playModalSwooshSound } from '../lib/soundEffects';

const CustomModal = ({ isOpen, onClose, title, message, onConfirm, showCancel = false, confirmText = "OK" }) => {
  useEffect(() => {
    if (isOpen) {
      playModalSwooshSound(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalSwooshSound(true);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 11, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '24px',
        border: '2px solid rgba(255, 188, 0, 0.45)',
        padding: '26px 24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 188, 0, 0.15)',
        position: 'relative',
        animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer',
            color: '#94A3B8', width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {title && (
          <h3 style={{
            fontSize: '20px',
            fontWeight: 900,
            color: '#FFFFFF',
            marginBottom: '10px',
            letterSpacing: '-0.3px'
          }}>
            {title}
          </h3>
        )}
        <p style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: '#CBD5E1',
          marginBottom: '22px'
        }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {showCancel && (
            <button 
              className="btn" 
              onClick={handleClose}
              style={{
                background: '#334155',
                color: '#F8FAFC',
                flex: 1,
                borderRadius: '16px',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Cancel
            </button>
          )}
          <div style={{ flex: 1 }}>
            <PrimaryButton 
              onClick={() => {
                if (onConfirm) onConfirm();
                else handleClose();
              }}
              size="normal"
              variant="primary"
            >
              {confirmText}
            </PrimaryButton>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CustomModal;
