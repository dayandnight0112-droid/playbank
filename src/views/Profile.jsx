import { useState } from 'react';
import {
  Bell, Settings, Camera, Pencil, School, ChevronRight, Trophy, Star, Flame, Zap, Package, Users, History, BookOpen, Microscope, Ruler, Target, ShoppingBag, LogOut, Lock, Copy, Share2, X
} from 'lucide-react';
import { useDragScroll } from '../hooks/useDragScroll';
import CustomModal from '../components/CustomModal';
import { mockDb } from '../lib/mockDb';

function IconCircle({ children, style = {} }) {
  return (
    <div style={{ display: 'flex', height: '56px', width: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#FFBC00', color: '#000', ...style }}>
      {children}
    </div>
  );
}

function StatItem({ icon, value, label, badge, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E8E8E8', cursor: onClick ? 'pointer' : 'default' }}
    >
      <IconCircle>{icon}</IconCircle>
      <p style={{ marginTop: '12px', fontSize: '18px', fontWeight: 900, lineHeight: 1, color: '#000' }}>{value}</p>
      <p style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: '#6B7280', textAlign: 'center' }}>{label}</p>
      {badge && (
        <div style={{ marginTop: '8px', borderRadius: '9999px', backgroundColor: '#D9F8D8', padding: '4px 12px', fontSize: '12px', fontWeight: 900, color: '#188A25' }}>
          {badge}
        </div>
      )}
    </div>
  );
}

function ProgressSubjectCard({ icon, title, percent }) {
  return (
    <div style={{ width: '150px', flexShrink: 0, borderRadius: '16px', border: '3px solid #000', backgroundColor: '#FFF', padding: '16px', boxShadow: '4px 4px 0px #000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ color: '#000', marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '14px', fontWeight: 900, color: '#000', lineHeight: 1 }}>{title}</p>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', marginTop: '4px' }}>Form 4</p>
      
      <div style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ height: '8px', flex: 1, borderRadius: '9999px', backgroundColor: '#EDEDED', border: '1px solid #000', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#FFBC00', width: `${percent}%`, borderRight: '1px solid #000' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 900, color: '#000' }}>{percent}%</span>
      </div>
    </div>
  );
}

const Profile = ({ currentUser, userBP, onLogout, onRegister, onRequestBooster }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [sysAlert, setSysAlert] = useState(null);
  
  const formatBP = (bp) => Number(bp).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const progressDragScroll = useDragScroll();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password.");
      return;
    }
    const result = mockDb.loginUser(loginEmail, loginPassword);
    if (result.error) {
      setLoginError(result.error);
    } else {
      window.location.reload();
    }
  };
  
  const handleCopyReferral = () => {
    if (currentUser?.referral_code) {
      navigator.clipboard.writeText(currentUser.referral_code);
      setSysAlert({ title: 'Success', message: 'Referral code copied to clipboard!' });
    }
  };

  const referrals = currentUser ? mockDb.getReferralList(currentUser.id) : [];

  if (!currentUser) {
    return (
      <div className="view-content flex-center flex-column" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F5F5F5' }}>
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Guest Profile</h2>
        <p style={{ marginBottom: '24px' }}>You are playing as a guest. Register to unlock your full profile and save your progress permanently.</p>
        <button className="btn btn-primary" onClick={onRegister} style={{ width: '100%', marginBottom: '12px', padding: '16px' }}>Register Now</button>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="btn"
          style={{ width: '100%', padding: '16px', background: '#000', color: '#FFF', border: 'none', cursor: 'pointer' }}
        >
          Log In
        </button>

        {/* Login Modal */}
        {showLoginModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }}>
            <div className="modal-spring" style={{
              backgroundColor: '#FFF', border: '4px solid #000',
              borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '360px',
              boxShadow: '8px 8px 0px #000'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000' }}>Welcome Back</h2>
                <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {loginError && <div style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{loginError}</div>}
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', fontSize: '15px', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Password</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', fontSize: '15px', fontWeight: 700 }} />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '16px' }}>Log In</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="view-content" style={{ padding: 0, backgroundColor: '#F5F5F5', overflowY: 'auto' }}>
      {/* Header */}
      <section style={{ position: 'relative', borderBottomLeftRadius: '46px', borderBottomRightRadius: '46px', backgroundColor: '#FFBC00', padding: '32px 24px 96px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--brand-primary)', backgroundColor: '#000', overflow: 'hidden' }}>
              <img src={`${import.meta.env.BASE_URL}playbanklogo.png`} alt="PlayBank" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 style={{ fontSize: '29px', fontWeight: 900, color: '#000' }}>PlayBank</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={28} strokeWidth={2.7} />
              <div style={{ position: 'absolute', right: '-8px', top: '-12px', display: 'flex', height: '24px', width: '24px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#FFF', fontSize: '13px', fontWeight: 900, color: '#000' }}>
                3
              </div>
            </div>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Settings 
                size={28} 
                strokeWidth={2.7}
                onClick={() => setShowSettings(!showSettings)} 
                style={{ cursor: 'pointer' }}
              />
              
              {showSettings && (
                <div style={{ 
                  position: 'absolute', top: '44px', right: '0', 
                  backgroundColor: '#FFF', borderRadius: '16px', 
                  boxShadow: '4px 4px 0px #000000', 
                  border: '3px solid #000', padding: '12px',
                  zIndex: 50, minWidth: '200px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <button 
                    onClick={() => { setShowPasswordModal(true); setShowSettings(false); }}
                    style={{ 
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', 
                      background: '#FFF5CC', border: '2px solid #000', padding: '12px', 
                      fontSize: '14px', fontWeight: 900, color: '#000', 
                      cursor: 'pointer', borderRadius: '8px',
                      boxShadow: '2px 2px 0px #000', whiteSpace: 'nowrap'
                    }}
                  >
                    <Settings size={18} strokeWidth={2.5} />
                    Change Password
                  </button>
                  <button 
                    onClick={onLogout}
                    style={{ 
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', 
                      background: '#FFEBEB', border: '2px solid #000', padding: '12px', 
                      fontSize: '14px', fontWeight: 900, color: '#E55353', 
                      cursor: 'pointer', borderRadius: '8px',
                      boxShadow: '2px 2px 0px #000'
                    }}
                  >
                    <LogOut size={18} strokeWidth={2.5} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ display: 'flex', height: '138px', width: '138px', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%', border: '8px solid #FFF', backgroundColor: '#FFF5CC' }}>
              <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: '#FFF5CC' }}>
                <div style={{ fontSize: '90px', marginBottom: '-10px' }}>👦</div>
              </div>
            </div>
            <button style={{ position: 'absolute', bottom: '4px', right: 0, display: 'flex', height: '48px', width: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '4px solid #FFF', backgroundColor: '#000', color: '#FFF', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <Camera size={22} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1, color: '#000', wordBreak: 'break-word' }}>
                {currentUser?.ic_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'User')}
              </h2>
              <button style={{ display: 'flex', flexShrink: 0, height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#FFF5CC', border: 'none', cursor: 'pointer' }}>
                <Pencil size={18} />
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '12px', borderRadius: '9999px', backgroundColor: '#FFF5CC', padding: '8px 20px', fontSize: '16px', fontWeight: 900, color: '#000' }}>
              {currentUser?.age ? `Age ${currentUser.age}` : 'Student'}
              <Pencil size={16} />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 900, color: '#000' }}>
              <School size={22} />
              {currentUser?.school || 'School Info Needed'}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ marginTop: '-64px', padding: '0 20px 120px 20px' }}>

        <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: '28px', backgroundColor: '#FFF', padding: '20px 0', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
          <StatItem icon={<span style={{ fontSize: '22px', fontWeight: 900 }}>BP</span>} value={formatBP(userBP)} label="Balance" />
          
          <StatItem 
            icon={currentUser.score_multiplier === 3 ? <Users size={30} color="#000" /> : <Lock size={26} color="#888" />} 
            value={currentUser.score_multiplier === 3 ? referrals.length : "Locked"} 
            label="Referred Friends" 
            onClick={() => {
              if (currentUser.score_multiplier === 3) {
                setShowReferralModal(true);
              } else {
                setSysAlert({ title: 'Locked Feature', message: 'Please upgrade to 3X Booster to unlock the referral feature!' });
                if (onRequestBooster) onRequestBooster();
              }
            }}
          />
          
          <StatItem icon={<Flame size={34} fill="#FFBC00" color="#000" strokeWidth={2.5} />} value="7" label="Streak" />
        </div>

        {/* Booster */}
        {currentUser.score_multiplier === 3 ? (
          <>
            {/* Referral Info Card (Only available when paid) */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '24px', backgroundColor: '#000', padding: '20px', boxShadow: '0 10px 28px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={28} color="#FFBC00" />
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>Your Referral Code</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#FFBC00', fontWeight: 'bold' }}>Earn up to 3 Levels!</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, backgroundColor: '#FFF', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: '#000', letterSpacing: '2px' }}>
                    {currentUser?.referral_code || 'N/A'}
                  </span>
                </div>
                <button 
                  onClick={handleCopyReferral}
                  style={{ width: '64px', backgroundColor: '#FFBC00', borderRadius: '16px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Copy size={24} color="#000" />
                </button>
                <button style={{ width: '64px', backgroundColor: '#333', borderRadius: '16px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Share2 size={24} color="#FFF" />
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '24px', backgroundColor: '#FFF5CC', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', height: '64px', width: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', backgroundColor: '#000', fontSize: '28px', fontWeight: 900, color: '#FFBC00', flexShrink: 0 }}>
                3X
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#000' }}>3X BP Booster Active!</p>
                <p style={{ marginTop: '4px', fontSize: '15px', fontWeight: 600, lineHeight: 1.4, color: '#374151' }}>
                  You're earning 3X more BP in every challenge!
                </p>
              </div>
            </div>
          </>
        ) : (
          <div 
            onClick={() => { if (onRequestBooster) onRequestBooster(); }}
            style={{ 
              marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '24px', 
              backgroundColor: '#F5F5F5', border: '2px dashed #CCC', padding: '20px', cursor: 'pointer',
              transition: 'transform 0.2s', transform: 'scale(1)'
            }}
          >
            <div style={{ display: 'flex', height: '64px', width: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', backgroundColor: '#E0E0E0', flexShrink: 0 }}>
              <Lock size={28} color="#888" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#000' }}>Unlock Referral & 3X BP</p>
              <p style={{ marginTop: '4px', fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: '#666' }}>
                Activate your account to invite friends and earn up to 30 BP per answer!
              </p>
            </div>
            <ChevronRight size={24} color="#888" />
          </div>
        )}

        {/* Progress */}
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '25px', fontWeight: 900, color: '#000' }}>My Progress</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 900, color: '#000', background: 'none', border: 'none', cursor: 'pointer' }}>
            View All <ChevronRight size={20} color="#000" />
          </button>
        </div>
        <div 
          {...progressDragScroll}
          style={{ 
            marginTop: '16px', display: 'flex', gap: '16px', 
            overflowX: 'auto', paddingBottom: '16px', 
            scrollSnapType: 'x mandatory',
            ...progressDragScroll.style 
          }}
        >
          <div style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ProgressSubjectCard icon={<BookOpen size={42} />} title="Sejarah" percent={72} />
          </div>
          <div style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ProgressSubjectCard icon={<Microscope size={42} />} title="Sains" percent={65} />
          </div>
          <div style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ProgressSubjectCard icon={<Ruler size={42} />} title="Matematik" percent={58} />
          </div>
        </div>
      </section>

      {/* Referral Modal */}
      {showReferralModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div className="modal-spring" style={{
            backgroundColor: '#FFF', border: '4px solid #000',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '360px',
            boxShadow: '8px 8px 0px #000', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000' }}>My Referrals</h2>
              <button onClick={() => setShowReferralModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {referrals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <Users size={48} color="#CCC" style={{ marginBottom: '16px' }} />
                  <p style={{ fontWeight: 600 }}>No successful referrals yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Share your code to start earning!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {referrals.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '16px', border: '2px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '16px', fontWeight: 900, color: '#000' }}>{r.name}</span>
                          {r.sub_referrals_count > 0 && (
                            <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Invited {r.sub_referrals_count} friends</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '16px', fontWeight: 900, color: '#188A25' }}>+{formatBP(r.contributed_bp)} BP</span>
                        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Contributed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowReferralModal(false)}
              style={{ marginTop: '20px', width: '100%', padding: '14px', borderRadius: '12px', border: '3px solid #000', backgroundColor: '#FFBC00', fontSize: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div className="modal-spring" style={{
            backgroundColor: '#FFF', border: '4px solid #000',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '360px',
            boxShadow: '8px 8px 0px #000'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000', marginBottom: '20px' }}>Change Password</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Current Password</label>
                <input type="password" placeholder="Enter current password" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', fontSize: '15px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>New Password</label>
                <input type="password" placeholder="Enter new password" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', fontSize: '15px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', fontSize: '15px', fontWeight: 700 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowPasswordModal(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '3px solid #000', backgroundColor: '#F3F4F6', fontSize: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowPasswordModal(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '3px solid #000', backgroundColor: '#FFBC00', fontSize: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Alert Modal */}
      <CustomModal 
        isOpen={!!sysAlert}
        onClose={() => setSysAlert(null)}
        title={sysAlert?.title || ''}
        message={sysAlert?.message || ''}
        confirmText="Got it!"
      />

      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Profile;
