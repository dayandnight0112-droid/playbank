import { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    const result = mockDb.loginUser(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      onLoginSuccess(result.user);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '380px',
        borderRadius: '24px',
        border: '3px solid #000000',
        padding: '28px 24px',
        boxShadow: '6px 6px 0px #000000',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F3F4F6',
            border: '2px solid #000',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--brand-primary, #FFBC00)',
            border: '2px solid #000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#000', margin: 0 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            Log in to restore your progress and BankPoints
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '2px solid #EF4444',
            borderRadius: '12px',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#B91C1C',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
              Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. player@playbank.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid #000',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid #000',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              background: 'var(--brand-primary, #FFBC00)',
              border: '3px solid #000',
              fontWeight: 900,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000',
              color: '#000'
            }}
          >
            Log In
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
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
    </div>
  );
};

export default LoginModal;
