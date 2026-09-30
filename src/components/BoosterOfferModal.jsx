import React, { useState, useEffect } from 'react';
import {
  Zap,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Lock,
  ArrowLeft,
  QrCode,
  Sparkles,
  Check,
  Info,
  Clock
} from 'lucide-react';
import { paymentService, PAYMENT_CHANNELS } from '../lib/paymentService';
import { energyService, PAID_MAX_ENERGY } from '../lib/energyService';
import { playModalSwooshSound, playTapSound } from '../lib/soundEffects';
import { BOOSTER_CONFIG } from '../config/boosterConfig';

const TERMS_VERSION = BOOSTER_CONFIG.COMPLIANCE.TC_VERSION;

const BoosterOfferModal = ({
  onClose,
  onUnlock,
  playerId = 'guest',
  isFirstTimeOffer = false
}) => {
  // Audit trail initialization
  const [childInitiatedAt] = useState(() => new Date().toISOString());
  // Steps: 'overview' | 'parent_form' | 'payment' | 'success'
  const [step, setStep] = useState('overview');

  // Parent Gate state
  const [gateQuestion, setGateQuestion] = useState({ a: 7, b: 8, answer: 15 });
  const [parentGateInput, setParentGateInput] = useState('');
  const [gateError, setGateError] = useState('');

  // Parent Details form
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');
  const [agreeTc, setAgreeTc] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [formError, setFormError] = useState('');
  const [showTcDetail, setShowTcDetail] = useState(false);

  // Payment order state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentPayload, setPaymentPayload] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate random math gate on mount
  useEffect(() => {
    const a = Math.floor(Math.random() * 8) + 6; // 6-13
    const b = Math.floor(Math.random() * 8) + 5; // 5-12
    setGateQuestion({ a, b, answer: a + b });
  }, []);

  const handleClose = () => {
    if (isProcessing) return;
    playModalSwooshSound(false);
    onClose();
  };

  // Step 1 -> Step 2: Go to parent form
  const handleProceedToParentForm = () => {
    playTapSound();
    setStep('parent_form');
  };

  // Step 2 -> Step 3: Validate Parent Gate & Form, then create order
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setFormError('');
    setGateError('');

    // Verify Parent Gate (simple math test)
    if (parseInt(parentGateInput.trim(), 10) !== gateQuestion.answer) {
      setGateError('家长验证计算错误，请重新输入');
      return;
    }

    if (!parentName.trim()) {
      setFormError('请填写家长或法定监护人姓名');
      return;
    }
    if (!parentPhone.trim() || parentPhone.trim().length < 8) {
      setFormError('请填写有效的家长联系电话');
      return;
    }
    if (!agreeTc) {
      setFormError('请阅读并勾选同意购买条款 (T&C) 与退款政策');
      return;
    }

    setIsProcessing(true);
    try {
      const orderRes = await paymentService.createOrder({
        playerId,
        amount: BOOSTER_CONFIG.PRICING.AMOUNT,
        channel: PAYMENT_CHANNELS.DUITNOW_QR,
        parentDetails: {
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          parentRelation,
          agreedTcVersion: TERMS_VERSION,
          marketingConsent: agreeMarketing
        },
        auditTrail: {
          childInitiatedAt,
          parentGatePassedAt: new Date().toISOString(),
          gateChallenge: {
            formula: `${gateQuestion.a} + ${gateQuestion.b} = ${gateQuestion.answer}`,
            passed: true
          }
        }
      });

      setCurrentOrder(orderRes.order);
      setPaymentPayload(orderRes.paymentPayload);
      setStep('payment');
    } catch (err) {
      setFormError('创建订单失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3 -> Step 4: Confirm Payment & Fulfill
  const handleConfirmPaid = async () => {
    if (!currentOrder) return;
    setIsProcessing(true);

    try {
      // 1. 调用 paymentService 完成支付核验并开通体力与权益
      const fulfillRes = await paymentService.fulfillPayment(currentOrder.transactionId);
      if (fulfillRes.success) {
        setStep('success');
        if (onUnlock) {
          onUnlock(currentOrder);
        }
      } else {
        alert('支付核验未能通过，请稍后重试');
      }
    } catch (err) {
      console.error('[BoosterOfferModal] Payment fulfillment error:', err);
      alert('支付处理异常，请联系客服');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(5px)',
      padding: '16px'
    }}>
      <div
        className="modal-spring"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          border: '4px solid #000000',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '10px 10px 0px #000000',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        {step !== 'success' && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#F1F5F9',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 1: OVERVIEW & VALUE PROPOSITION                         */}
        {/* ------------------------------------------------------------ */}
        {step === 'overview' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '22px',
                backgroundColor: '#000000',
                color: '#FFBC00',
                boxShadow: '4px 4px 0px #FFBC00'
              }}>
                <Zap size={42} fill="#FFBC00" />
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEF3C7',
              border: '2px solid #F59E0B',
              borderRadius: '9999px',
              padding: '4px 12px',
              marginBottom: '10px'
            }}>
              <Sparkles size={14} color="#D97706" />
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#92400E', letterSpacing: '0.5px' }}>
                家长一次性购买 · 永久有效
              </span>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, marginBottom: '8px' }}>
              PlayBank VIP 特权包
            </h2>

            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '16px', padding: '0 8px' }}>
              由家长一次性付款开通，孩子账号永久尊享 10 次储存上限与 3 倍 BP 答题收益！
            </p>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
                  永久账号权益 (One-Time)
                </div>
                <div style={{ fontSize: '12px', color: '#78350F', fontWeight: 600, marginTop: '2px' }}>
                  无后续订阅费用 · 永久生效
                </div>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#000000' }}>
                RM20
              </div>
            </div>

            {/* Benefits List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              {/* Benefit 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '14px',
                padding: '10px 12px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  <Zap size={16} color="#0284C7" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    游玩次数上限由 5 增至 10
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
                    储存容量翻倍，能连续挑战更多局！恢复速率保持<strong>每小时 1 次</strong>，达上限停止（非每日清零，离线也照常恢复）。
                  </div>
                </div>
              </div>

              {/* Benefit 2 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '14px',
                padding: '10px 12px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  <Sparkles size={16} color="#D97706" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    永久享有游戏所得 3× BP
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
                    每题答对获 30 BP（原为 10 BP），升级与兑换更快！从开通后的游戏结算立即生效，不追溯旧局。
                  </div>
                </div>
              </div>

              {/* Benefit 3 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '14px',
                padding: '10px 12px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  <Clock size={16} color="#16A34A" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    购买当下立即补足 5 次次数
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
                    保留当前正在进行的恢复倒计时，并额外补足 5 次（最高满 10 次），孩子立即体验升级！
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleProceedToParentForm}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '9999px',
                backgroundColor: '#FFBC00',
                border: '3px solid #000000',
                fontSize: '16px',
                fontWeight: 900,
                color: '#000000',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.1s ease'
              }}
            >
              <span>由家长确认并开通</span>
              <ChevronRight size={18} strokeWidth={3} />
            </button>

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>
              <Lock size={12} />
              <span>本服务需由成年家长或法定监护人完成操作</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 2: PARENT GATE & FORM (PDPA COMPLIANCE)                */}
        {/* ------------------------------------------------------------ */}
        {step === 'parent_form' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setStep('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748B'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                家长确认与资料登记
              </h2>
            </div>

            <form onSubmit={handleProceedToPayment}>
              {/* 1. Parent Gate Test */}
              <div style={{
                backgroundColor: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderRadius: '14px',
                padding: '10px 12px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Lock size={14} color="#B45309" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E' }}>
                    家长身份核对（请家长作答）
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#78350F' }}>
                    {gateQuestion.a} + {gateQuestion.b} =
                  </span>
                  <input
                    type="number"
                    value={parentGateInput}
                    onChange={(e) => setParentGateInput(e.target.value)}
                    placeholder="答案"
                    style={{
                      width: '80px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: '2px solid #D97706',
                      fontSize: '13px',
                      fontWeight: 800,
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#92400E' }}>防止儿童误触</span>
                </div>
                {gateError && (
                  <div style={{ color: '#DC2626', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                    {gateError}
                  </div>
                )}
              </div>

              {/* 2. Parent Contact Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    家长 / 监护人姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="例如: Tan Mei Ling"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '2px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    联系电话 (WhatsApp / 电话) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+60 12-3456789"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '2px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    与玩家关系 *
                  </label>
                  <select
                    value={parentRelation}
                    onChange={(e) => setParentRelation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '2px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Father">父亲 (Father)</option>
                    <option value="Mother">母亲 (Mother)</option>
                    <option value="Guardian">法定监护人 (Guardian)</option>
                    <option value="Other">其他直系亲属 (Relative)</option>
                  </select>
                </div>
              </div>

              {/* PDPA Purpose Notice */}
              <div style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '11px',
                color: '#64748B',
                lineHeight: 1.35,
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#475569', marginBottom: '2px' }}>
                  <ShieldCheck size={13} color="#0284C7" />
                  <span>个人资料保护通知 (PDPA Notice)</span>
                </div>
                收集上述资料仅用于本次购买凭据登记、开通核查及必要售后支持。绝不储存任何银行卡号，亦不会向未经授权的第三方披露。
              </div>

              {/* Checkboxes: Mandatory T&C */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeTc}
                    onChange={(e) => setAgreeTc(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#D97706' }}
                  />
                  <span style={{ fontSize: '11px', color: '#1E293B', lineHeight: 1.35 }}>
                    <strong>[必选]</strong> 我确认已知晓本产品为<strong>一次性付费 RM20</strong>，永久享有 10 次上限（每小时恢复 1 次）与 3× BP，并同意
                    <button
                      type="button"
                      onClick={() => setShowTcDetail(prev => !prev)}
                      style={{ background: 'none', border: 'none', color: '#2563EB', padding: '0 3px', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                    >
                      《服务条款与退款政策》
                    </button>
                  </span>
                </label>

                {/* Collapsible T&C Detail */}
                {showTcDetail && (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px dashed #94A3B8',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '10px',
                    color: '#475569',
                    lineHeight: 1.4
                  }}>
                    • 条款版本：{TERMS_VERSION}<br />
                    • 退款政策：如因系统故障未成功开通，可联系客服申请全额退款。退款处理完成后，账号特权与 10 次上限将自动回收并降级为免费状态。<br />
                    • 严禁作弊：系统以服务器授时为基准，若存在恶意篡改设备时间刷取次数之行为，平台有权暂停服务。
                  </div>
                )}

                {/* Independent Optional Marketing Consent (Unchecked by default) */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#2563EB' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.35 }}>
                    <strong>[可选]</strong> 我同意 PlayBank 通过 WhatsApp 或电话向我发送关于孩子学习报告与优惠通知（可随时拒绝或退订）。
                  </span>
                </label>
              </div>

              {formError && (
                <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFBC00',
                  border: '3px solid #000000',
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#000000',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  boxShadow: '4px 4px 0px #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>{isProcessing ? '处理中...' : '确认并前往支付 (RM20.00)'}</span>
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 3: PAYMENT SCREEN (DUITNOW QR FRAMEWORK)                */}
        {/* ------------------------------------------------------------ */}
        {step === 'payment' && paymentPayload && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setStep('parent_form')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748B'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                DuitNow QR 支付渠道
              </h2>
            </div>

            {/* Order summary pill */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '14px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>账单参考号 (Ref No)</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', letterSpacing: '0.5px' }}>
                  {paymentPayload.referenceNo}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>应付金额</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>
                  RM 20.00
                </span>
              </div>
            </div>

            {/* DuitNow QR Visual Placeholder */}
            <div style={{
              backgroundColor: '#FFF',
              border: '3px solid #ED1C24', // DuitNow red brand color
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(237, 28, 36, 0.15)',
              display: 'inline-block'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#ED1C24',
                fontWeight: 900,
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                <QrCode size={18} />
                <span>DuitNow QR 预留渠道</span>
              </div>

              {/* Simulated QR Code box */}
              <div style={{
                width: '160px',
                height: '160px',
                margin: '0 auto',
                backgroundColor: '#F8FAFC',
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px'
              }}>
                <QrCode size={64} color="#334155" />
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                  PlayBank 商户渠道
                </span>
                <span style={{ fontSize: '9px', color: '#94A3B8' }}>
                  支持所有银行与电子钱包
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px', fontWeight: 600 }}>
                收款商户：{paymentPayload.merchantName}
              </div>
            </div>

            {/* Payment Instructions */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
              marginBottom: '16px'
            }}>
              {paymentPayload.instructions.map((ins, i) => (
                <div key={i}>{ins}</div>
              ))}
            </div>

            {/* Fulfill Action Button */}
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '9999px',
                backgroundColor: '#10B981',
                border: '3px solid #000000',
                fontSize: '16px',
                fontWeight: 900,
                color: '#FFFFFF',
                cursor: isProcessing ? 'wait' : 'pointer',
                boxShadow: '4px 4px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={18} strokeWidth={3} />
              <span>{isProcessing ? '正在验证支付...' : '我已完成付款，立即开通'}</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 4: SUCCESS & INSTANT UNLOCK CONFIRMATION                */}
        {/* ------------------------------------------------------------ */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '24px',
                backgroundColor: '#DCFCE7',
                border: '3px solid #16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '4px 4px 0px #16A34A'
              }}>
                <CheckCircle2 size={46} color="#16A34A" strokeWidth={2.5} />
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              🎉 VIP 特权开通成功！
            </h2>

            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '20px' }}>
              感谢家长的支持！特权已即时绑定至该玩家账号。
            </p>

            <div style={{
              backgroundColor: '#F0FDF4',
              border: '2px solid #86EFAC',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '22px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Check size={16} color="#16A34A" strokeWidth={3} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                  游玩上限已提升至 10 次（已补足 5 次）
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Check size={16} color="#16A34A" strokeWidth={3} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                  永久 3× BP 积分加成已生效
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#16A34A" strokeWidth={3} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                  保留当前计时，每 1 小时恢复 1 次
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '9999px',
                backgroundColor: '#FFBC00',
                border: '3px solid #000000',
                fontSize: '16px',
                fontWeight: 900,
                color: '#000000',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #000000'
              }}
            >
              立即进入游戏畅玩
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BoosterOfferModal;
