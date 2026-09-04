import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const SaveScoreModal = ({ onClose, onRegisterSuccess, currentBP, registerContext }) => {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+60');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !whatsapp || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const fullWhatsapp = `${countryCode} ${whatsapp}`;
    const result = mockDb.registerUser(email, password, fullWhatsapp, currentBP);
    if (result.error) {
      setError(result.error);
    } else {
      onRegisterSuccess(result.user);
    }
  };
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        width: '100%',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '32px 24px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            borderRadius: '50%', 
            margin: '0 auto 16px',
            border: '2px solid var(--brand-primary)',
            background: '#000',
            overflow: 'hidden'
          }}>
            <img src={`${import.meta.env.BASE_URL}playbanklogo.png`} alt="PlayBank Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 className="text-h2" style={{ marginBottom: '8px' }}>
            {registerContext === 'guest_200' ? "You've reached 200 BP!" : 'Register to collect your BP!'}
          </h2>
          <p className="text-body">
            Register now to save your score, unlock the leaderboard, and keep earning rewards.
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={countryCode} 
              onChange={(e) => setCountryCode(e.target.value)}
              className="input-field"
              style={{ width: '110px', padding: '0 12px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="+60">🇲🇾 +60</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+66">🇹🇭 +66</option>
            </select>
            <input 
              type="tel" 
              placeholder="Whatsapp Number" 
              className="input-field"
              style={{ flex: 1 }}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '16px' }}>
            Register &amp; Save My BP
          </button>
          
          <button type="button" onClick={onClose} style={{
            background: 'none', border: 'none', 
            color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: '15px',
            padding: '12px', cursor: 'pointer',
            marginTop: '4px'
          }}>
            Later
          </button>
        </form>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SaveScoreModal;
