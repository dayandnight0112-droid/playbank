import { useState } from 'react';
import { X, Zap, AlertTriangle, LogIn, Mail, ArrowRight } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import { playerAuthService } from '../lib/playerAuthService';

const isDuplicateEmailError = (errMsg) => {
  if (!errMsg) return false;
  const lower = String(errMsg).toLowerCase();
  return (
    lower.includes('already registered') ||
    lower.includes('already exists') ||
    lower.includes('email_exists') ||
    lower.includes('already in use') ||
    lower.includes('duplicate') ||
    lower.includes('user already registered')
  );
};

const SaveScoreModal = ({ onClose, onRegisterSuccess, currentBP, registerContext, onChooseLoginOldAccount }) => {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+60');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2: Duplicate Email Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !whatsapp || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const fullWhatsapp = `${countryCode} ${whatsapp}`;

    // Step 4.4: Upgrade current anonymous player session to permanent registered user in Supabase
    let hasDuplicateError = false;
    try {
      const upgradeRes = await playerAuthService.upgradeGuestToRegistered({
        email,
        password,
        nickname: email.split('@')[0],
        metadata: { whatsapp: fullWhatsapp }
      });
      if (upgradeRes.error) {
        console.warn('[SaveScoreModal] Supabase account upgrade info:', upgradeRes.error);
        if (isDuplicateEmailError(upgradeRes.error)) {
          hasDuplicateError = true;
        }
      }
    } catch (err) {
      console.warn('[SaveScoreModal] Account upgrade fallback:', err);
      if (isDuplicateEmailError(err.message)) {
        hasDuplicateError = true;
      }
    }

    const result = mockDb.registerUser(email, password, fullWhatsapp, currentBP);
    setIsSubmitting(false);

    // Step 2: If email is already registered, trigger Duplicate Email Choice Modal
    if (hasDuplicateError || (result.error && isDuplicateEmailError(result.error))) {
      setDuplicateEmail(email);
      setShowDuplicateModal(true);
      return;
    }

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

      {/* Step 2: 重复 Email 选择弹窗 */}
      {showDuplicateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '380px',
              borderRadius: '24px',
              border: '3px solid #000000',
              boxShadow: '0 10px 0 #000000',
              padding: '24px 20px',
              position: 'relative',
              textAlign: 'center',
              animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#FEF08A',
                border: '2.5px solid #000000',
                boxShadow: '0 2px 0 #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertTriangle size={28} color="#D97706" strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#000000', margin: '0 0 6px 0' }}>
              这个 Email 已经注册
            </h3>
            
            {/* Subtitle */}
            <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              我们发现 <strong>{duplicateEmail}</strong> 已经绑定另一个 PlayBank 账号。
            </p>

            {/* Choices Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {/* Option 1: 登录旧账号 */}
              <button
                type="button"
                onClick={() => {
                  if (onChooseLoginOldAccount) {
                    onChooseLoginOldAccount(duplicateEmail);
                  } else {
                    console.log('[Step 2] User selected: 登录旧账号');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '2.5px solid #000000',
                  borderRadius: '16px',
                  boxShadow: '0 3px 0 #000000',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#E0F2FE',
                    border: '1.5px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <LogIn size={18} color="#0369A1" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                    登录旧账号
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', lineHeight: 1.3 }}>
                    登录后将使用你原来的 PlayBank 账号。当前游客账号不会合并，并会被标记为“空玩家”。
                  </div>
                </div>
              </button>

              {/* Option 2: 更换 Email */}
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setEmail('');
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#FFCE00',
                  border: '2.5px solid #000000',
                  borderRadius: '16px',
                  boxShadow: '0 3px 0 #000000',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Mail size={18} color="#000000" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                    更换 Email
                  </div>
                  <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px', lineHeight: 1.3 }}>
                    保留当前 Guest、Player Code 和所有记录，使用其他 Email 完成注册。
                  </div>
                </div>
              </button>
            </div>

            {/* Option 3: 暂时不要 */}
            <button
              type="button"
              onClick={() => {
                setShowDuplicateModal(false);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              暂时不要（继续以 Guest 游玩）
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SaveScoreModal;
