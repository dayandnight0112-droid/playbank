import { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const CompleteProfileModal = ({ currentUser, onComplete }) => {
  const [icName, setIcName] = useState('');
  const [icNo, setIcNo] = useState('');
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!icName || !icNo || !age || !school) {
      setError("Please fill in all fields.");
      return;
    }
    
    // Save to MockDB
    const result = mockDb.completeUserProfile(currentUser.id, icName, icNo, parseInt(age), school, referralCode.trim());
    if (result.error) {
      setError(result.error);
    } else {
      onComplete(result.user);
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
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        width: '100%',
        maxWidth: '400px',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        animation: 'popInModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '56px', height: '56px', 
            borderRadius: '50%', 
            margin: '0 auto 16px',
            background: 'var(--brand-primary)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={32} />
          </div>
          <h2 className="text-h2" style={{ marginBottom: '8px' }}>
            Complete Your Profile
          </h2>
          <p className="text-body" style={{ fontSize: '13px' }}>
            You've unlocked the 3X Booster! Please provide your official details to activate your referral features and rewards.
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          
          <div>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Full Name (as per IC)</label>
            <input 
              type="text" 
              placeholder="e.g. Ali Bin Abu" 
              className="input-field"
              value={icName}
              onChange={(e) => setIcName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>IC No.</label>
            <input 
              type="text" 
              placeholder="e.g. 010203-14-5678" 
              className="input-field"
              value={icNo}
              onChange={(e) => setIcNo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Age</label>
            <input 
              type="number" 
              placeholder="e.g. 15" 
              className="input-field"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>School Name</label>
            <input 
              type="text" 
              placeholder="e.g. SMK Seri Kembangan" 
              className="input-field"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>

          <div>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Referral Code (Optional)</label>
            <input 
              type="text" 
              placeholder="If you have a referral code" 
              className="input-field"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              style={{ 
                borderColor: referralCode ? 'var(--brand-primary)' : 'var(--border-color)',
                background: referralCode ? 'rgba(255, 188, 0, 0.05)' : 'var(--card-bg)'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '16px' }}>
            Activate My Account
          </button>
        </form>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popInModal {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CompleteProfileModal;
