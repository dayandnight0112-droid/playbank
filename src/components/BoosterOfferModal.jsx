import React, { useState } from 'react';
import { Zap, X, ShieldCheck } from 'lucide-react';

const BoosterOfferModal = ({ onClose, onUnlock, isFirstTimeOffer = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnlock = () => {
    setIsProcessing(true);
    // Simulate payment process delay
    setTimeout(() => {
      setIsProcessing(false);
      onUnlock(isFirstTimeOffer);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '20px'
    }}>
      <div className="modal-spring" style={{
        backgroundColor: '#FFF', borderRadius: '32px', border: '4px solid #000',
        padding: '32px 24px', width: '100%', maxWidth: '380px',
        boxShadow: '10px 10px 0px #000', position: 'relative', textAlign: 'center'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isProcessing}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#F5F5F5', border: '2px solid #000', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.5 : 1
          }}
        >
          <X size={20} strokeWidth={3} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '24px',
            backgroundColor: '#000', color: '#FFBC00', boxShadow: '4px 4px 0px #FFBC00'
          }}>
            <Zap size={48} fill="#FFBC00" />
          </div>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#000', lineHeight: 1.1, marginBottom: '12px' }}>
          Supercharge<br/>Your BP!
        </h2>
        
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#555', marginBottom: '24px', padding: '0 10px' }}>
          Get 3X more BP for every correct answer you submit. Level up instantly!
        </p>

        <div style={{ 
          backgroundColor: '#FFF5CC', border: '2px solid #FFD54F', borderRadius: '16px', 
          padding: '16px', marginBottom: '24px' 
        }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#8A6D00', textTransform: 'uppercase', letterSpacing: '1px' }}>
            One-time Unlock
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#000', marginTop: '4px' }}>
            RM20
          </div>
          {isFirstTimeOffer && (
            <div style={{
              marginTop: '12px', padding: '12px', borderRadius: '12px',
              backgroundColor: '#FFF0F0', border: '2px solid #FF4D4F',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#D9363E', textTransform: 'uppercase', marginBottom: '4px' }}>
                🔥 Limited Offer
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#CF1322', lineHeight: 1.3 }}>
                Unlock NOW and we will multiply your <span style={{ textDecoration: 'underline' }}>CURRENTly accumulated BP</span> by 3X instantly!
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleUnlock}
          disabled={isProcessing}
          style={{
            width: '100%', padding: '18px', borderRadius: '9999px',
            backgroundColor: '#FFBC00', border: '3px solid #000',
            fontSize: '18px', fontWeight: 900, color: '#000',
            cursor: isProcessing ? 'wait' : 'pointer',
            boxShadow: '4px 4px 0px #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'transform 0.1s ease',
            transform: isProcessing ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          {isProcessing ? 'Processing Payment...' : 'Unlock 3X Booster'}
        </button>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#888' }}>
          <ShieldCheck size={14} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Secure 1-Click Mock Payment</span>
        </div>
        
      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(255, 77, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
      `}</style>
    </div>
  );
};

export default BoosterOfferModal;
