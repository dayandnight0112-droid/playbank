import React from 'react';
import { X } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, title, message, onConfirm, showCancel = false, confirmText = "OK" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        width: '100%',
        maxWidth: '400px',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        animation: 'popIn 0.2s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        {title && <h3 className="text-h3" style={{ marginBottom: '12px' }}>{title}</h3>}
        <p className="text-body" style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {showCancel && (
            <button 
              className="btn" 
              onClick={onClose}
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', flex: 1 }}
            >
              Cancel
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            style={{ flex: 1 }}
          >
            {confirmText}
          </button>
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
