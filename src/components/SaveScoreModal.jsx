import { useState } from 'react';
import { X, Zap, AlertTriangle, LogIn, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
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

  // Step 2, 3, 4, 5: Duplicate Email & Switch Account Flow State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateModalStep, setDuplicateModalStep] = useState('options'); // 'options' | 'confirm_switch' | 'login_existing'
  const [duplicateEmail, setDuplicateEmail] = useState('');
  const [switchRequestId, setSwitchRequestId] = useState(null);
  const [existingPassword, setExistingPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const handleExecuteExistingLogin = async () => {
    if (!existingPassword) {
      setLoginError('请输入密码');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    try {
      let loggedUser = null;
      let loginSuccess = false;

      // 1. Authenticate with Supabase
      try {
        const sbRes = await playerAuthService.signInWithPassword({
          email: duplicateEmail,
          password: existingPassword
        });
        if (sbRes?.user && !sbRes.user.is_anonymous) {
          loggedUser = sbRes.user;
          loginSuccess = true;
        }
      } catch (sbErr) {
        console.warn('[Step 5] Supabase login error:', sbErr.message);
      }

      // 2. Also check MockDB for local dev / demo accounts
      const mockRes = mockDb.loginUser(duplicateEmail, existingPassword);
      if (mockRes?.user && !mockRes.error) {
        loggedUser = loggedUser || mockRes.user;
        loginSuccess = true;
      }

      // 3. Handle Failure: Keep Guest 100% active, update ticket to failed
      if (!loginSuccess) {
        if (switchRequestId) {
          await playerAuthService.failAccountSwitch(switchRequestId, 'failed');
        }
        setLoginError('密码错误或账号不存在，请重试。如忘记密码可点击上方找回。');
        setIsSubmitting(false);
        return;
      }

      // 4. Handle Success: Call complete_account_switch RPC to mark old guest as abandoned_guest
      if (switchRequestId) {
        const rpcRes = await playerAuthService.completeAccountSwitch(switchRequestId);
        if (!rpcRes.success) {
          console.warn('[Step 5] completeAccountSwitch RPC notice:', rpcRes.error);
        }
      }

      setShowDuplicateModal(false);
      onRegisterSuccess(loggedUser);
    } catch (err) {
      if (switchRequestId) {
        await playerAuthService.failAccountSwitch(switchRequestId, 'failed');
      }
      setLoginError(err.message || '登录遇到网络问题，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setDuplicateModalStep('options');
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
            {duplicateModalStep === 'login_existing' ? (
              /* Step 5: 登录旧账号验证页面 */
              <div>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#E0F2FE',
                    border: '2.5px solid #000000',
                    boxShadow: '0 2px 0 #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <LogIn size={26} color="#0284C7" strokeWidth={2.5} />
                </div>

                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#000000', margin: '0 0 6px 0' }}>
                  登录 PlayBank 账号
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0' }}>
                  请输入原账号密码以完成安全验证
                </p>

                {loginError && (
                  <div
                    style={{
                      backgroundColor: '#FEE2E2',
                      border: '1.5px solid #EF4444',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '14px',
                      textAlign: 'left',
                      lineHeight: 1.4
                    }}
                  >
                    ⚠️ {loginError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', textAlign: 'left' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '4px' }}>
                      目标账号邮箱
                    </label>
                    <input
                      type="email"
                      value={duplicateEmail}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: '#F3F4F6',
                        border: '2px solid #D1D5DB',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#4B5563',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>
                        输入账号密码
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('请通过登录页或联系客服找回密码。在此之前当前游客进度依然完好保留。')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#D97706',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        忘记密码？
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="请输入原账号密码"
                      value={existingPassword}
                      onChange={(e) => setExistingPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #000000',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleExecuteExistingLogin}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#FFCE00',
                      border: '2.5px solid #000000',
                      borderRadius: '14px',
                      boxShadow: '0 3px 0 #000000',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <span>{isSubmitting ? '正在验证...' : '验证密码并切换账号'}</span>
                    <ArrowRight size={18} color="#000000" strokeWidth={2.6} />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (switchRequestId) {
                        await playerAuthService.failAccountSwitch(switchRequestId, 'cancelled');
                      }
                      setDuplicateModalStep('confirm_switch');
                      setLoginError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>返回上一步</span>
                  </button>
                </div>
              </div>
            ) : duplicateModalStep === 'confirm_switch' ? (
              /* Step 3: 登录旧账号前再次确认 */
              <div>
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
                  <AlertCircle size={28} color="#D97706" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                  确定切换到旧账号？
                </h3>

                {/* Description Box */}
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '2px solid #000000',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    margin: '16px 0'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                    登录成功后：
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>
                    <li>系统会切换到原来的正式账号</li>
                    <li>当前 Guest 的 Player Code 将停止使用</li>
                    <li>当前 Guest 的 BP、答题记录和游戏进度<strong>不会合并</strong></li>
                    <li>当前 Guest 会在 Admin 标记为“空玩家”</li>
                    <li>Guest 账号<strong>不会被删除</strong></li>
                  </ul>
                </div>

                {/* Info Callout */}
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1.5px dashed #F59E0B',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '11px',
                    color: '#92400E',
                    lineHeight: 1.4,
                    textAlign: 'left',
                    marginBottom: '20px'
                  }}
                >
                  💡 如果你希望保留当前 Guest 进度，应该返回并选择“更换 Email”，把当前 Guest 原位注册。
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const switchRes = await playerAuthService.createAccountSwitchRequest({
                          reason: 'duplicate_email_login'
                        });
                        setSwitchRequestId(switchRes?.request?.id || null);
                        setExistingPassword('');
                        setLoginError(null);
                        setDuplicateModalStep('login_existing');
                        if (onChooseLoginOldAccount) {
                          onChooseLoginOldAccount(duplicateEmail, switchRes?.request);
                        }
                      } catch (err) {
                        console.warn('[Step 4] createAccountSwitchRequest error:', err);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#FFCE00',
                      border: '2.5px solid #000000',
                      borderRadius: '14px',
                      boxShadow: '0 3px 0 #000000',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <span>确认并登录</span>
                    <ArrowRight size={18} color="#000000" strokeWidth={2.6} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateModalStep('options')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>返回</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: 选项选择页 */
              <div>
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
                  {/* Option 1: 登录旧账号 -> Step 3 确认 */}
                  <button
                    type="button"
                    onClick={() => setDuplicateModalStep('confirm_switch')}
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
                        登录后将使用你原来的 PlayBank 账号。当前游客账号不会合并
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
            )}
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
