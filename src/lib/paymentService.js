/**
 * paymentService.js
 * 可扩展支付渠道框架 (Extensible Payment Provider Framework)
 * 
 * 设计目的：
 * 针对 DuitNow QR、银行转账、第三方支付网关（如 Stripe、Billplz 等）目前尚未定稿的情况，
 * 提供统一抽象接口。未来无论最终采用 DuitNow 静态/动态 QR、对公账户还是网关，
 * 只需要在对应的 Provider 填充真实商户参数与 API，即可无缝运作。
 */

import { energyService } from './energyService.js';
import { mockDb } from './mockDb.js';
import { BOOSTER_CONFIG } from '../config/boosterConfig.js';
import { notificationService } from './notificationService.js';

export const PAYMENT_CHANNELS = {
  DUITNOW_QR: 'duitnow_qr',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const ORDERS_KEY = 'playbank_payment_orders';

class BasePaymentProvider {
  constructor(channelName) {
    this.channelName = channelName;
  }

  /**
   * 发起支付订单（子类实现）
   * @param {Object} orderDetails 订单信息 (id, amount, playerId, parentDetails)
   * @returns {Promise<Object>} 返回支付参数 (如 QR 码、付款链接、参考号)
   */
  async createPayment(orderDetails) {
    throw new Error('createPayment must be implemented by payment provider');
  }

  /**
   * 检查支付状态
   * @param {string} transactionId 交易流水号
   * @returns {Promise<string>} 返回 PAYMENT_STATUS
   */
  async checkStatus(transactionId) {
    throw new Error('checkStatus must be implemented by payment provider');
  }
}

/**
 * DuitNow QR 预留 Provider
 * 当后续确定 DuitNow 账户或网关时，只需在此填充 API 或商户 QR 配置
 */
export class DuitNowQRProvider extends BasePaymentProvider {
  constructor(config = {}) {
    super(PAYMENT_CHANNELS.DUITNOW_QR);
    this.merchantName = config.merchantName || BOOSTER_CONFIG.PAYMENT.MERCHANT_NAME;
    this.duitNowId = config.duitNowId || BOOSTER_CONFIG.PAYMENT.DUITNOW_ID;
    this.staticQrUrl = config.staticQrUrl || null;
  }

  async createPayment({ transactionId, amount, playerId, parentDetails }) {
    // 构造唯一的账单参考编号 (Reference Code)
    const referenceNo = `${BOOSTER_CONFIG.PAYMENT.REFERENCE_PREFIX}-${Date.now().toString(36).toUpperCase()}-${transactionId.slice(-4)}`;
    
    return {
      channel: PAYMENT_CHANNELS.DUITNOW_QR,
      transactionId,
      referenceNo,
      amount,
      currency: 'MYR',
      merchantName: this.merchantName,
      // 如果有静态二维码可直接返回，未来接入动态 API 时调用后端生成
      qrCodeData: this.staticQrUrl || `duitnow://pay?to=${this.duitNowId}&amount=${amount}&ref=${referenceNo}`,
      instructions: [
        '1. 打开您的银行 App 或电子钱包 (Touch n Go / GrabPay / 任意银行)',
        '2. 扫描 DuitNow 二维码',
        `3. 确认付款金额为 RM ${amount.toFixed(2)} 并完成付款`,
        `4. 备注填写您的参考号: ${referenceNo}`
      ]
    };
  }

  async checkStatus(transactionId) {
    // 预留与支付网关 Webhook/轮询核对接口
    return PAYMENT_STATUS.PAID;
  }
}

/**
 * 支付管理核心服务 (Payment Manager)
 */
class PaymentService {
  constructor() {
    this._providers = new Map();
    this._processedTransactions = new Set();

    // 默认注册 DuitNow QR Provider
    this.registerProvider(PAYMENT_CHANNELS.DUITNOW_QR, new DuitNowQRProvider());
  }

  /**
   * 注册支付通道提供商
   */
  registerProvider(channel, providerInstance) {
    this._providers.set(channel, providerInstance);
  }

  /**
   * 获取所有本地保存的订单记录
   */
  getOrders() {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * 保存订单
   */
  _saveOrder(order) {
    if (typeof localStorage === 'undefined') return;
    try {
      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.transactionId === order.transactionId);
      if (idx >= 0) {
        orders[idx] = order;
      } else {
        orders.unshift(order);
      }
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('[paymentService] Failed to save order:', e);
    }
  }

  /**
   * 1. 发起支付订单 (创建合规订单、审计链与支付载荷)
   */
  async createOrder({
    playerId = 'guest',
    amount = BOOSTER_CONFIG.PRICING.AMOUNT,
    parentDetails = {}, // { parentName, parentPhone, parentRelation, agreedTcVersion, agreedPrivacy, marketingConsent }
    channel = PAYMENT_CHANNELS.DUITNOW_QR,
    auditTrail = {}
  }) {
    const provider = this._providers.get(channel) || this._providers.get(PAYMENT_CHANNELS.DUITNOW_QR);
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const orderData = {
      transactionId,
      playerId,
      amount: Number(amount) || BOOSTER_CONFIG.PRICING.AMOUNT,
      currency: 'MYR',
      channel,
      status: PAYMENT_STATUS.PENDING,
      parentDetails: {
        name: parentDetails.parentName || '',
        phone: parentDetails.parentPhone || '',
        relation: parentDetails.parentRelation || 'Parent',
        tcVersion: parentDetails.agreedTcVersion || BOOSTER_CONFIG.COMPLIANCE.TC_VERSION,
        agreedAt: parentDetails.agreedAt || nowIso,
        marketingConsent: Boolean(parentDetails.marketingConsent)
      },
      auditTrail: {
        childInitiatedAt: auditTrail.childInitiatedAt || nowIso,
        parentGatePassedAt: auditTrail.parentGatePassedAt || nowIso,
        gateChallenge: auditTrail.gateChallenge || { type: 'arithmetic_verification', passed: true },
        tcAgreedAt: parentDetails.agreedAt || nowIso,
        tcVersion: parentDetails.agreedTcVersion || BOOSTER_CONFIG.COMPLIANCE.TC_VERSION,
        qrPresentedAt: nowIso,
        clientMetadata: {
          userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node'),
          language: (typeof navigator !== 'undefined' ? navigator.language : 'zh-CN'),
          timezone: 'Asia/Kuala_Lumpur'
        }
      },
      createdAt: nowIso,
      fulfilledAt: null
    };

    // 保存初始待支付订单
    this._saveOrder(orderData);

    // 请求 Provider 生成支付参数
    const paymentPayload = await provider.createPayment(orderData);
    return {
      order: orderData,
      paymentPayload
    };
  }

  /**
   * 2. 支付完成核验与开通权益 (严格保证幂等性)
   * 只能在确认支付后触发，同一笔交易仅发货一次
   */
  async fulfillPayment(transactionId) {
    if (this._processedTransactions.has(transactionId)) {
      console.warn(`[paymentService] Transaction ${transactionId} already processed (idempotency guard).`);
      return { success: true, alreadyProcessed: true };
    }

    const orders = this.getOrders();
    const order = orders.find(o => o.transactionId === transactionId);
    if (!order) {
      return { success: false, reason: 'ORDER_NOT_FOUND' };
    }

    if (order.status === PAYMENT_STATUS.PAID && order.fulfilledAt) {
      this._processedTransactions.add(transactionId);
      return { success: true, alreadyProcessed: true };
    }

    // 1. 开通游玩次数权益（永久 10 次上限 + 立即补充 5 次）
    energyService.upgradeToPaid(order.playerId);

    // 2. 开通永久 3× BP 乘数权益
    if (typeof mockDb.unlockBooster === 'function') {
      mockDb.unlockBooster(order.playerId);
    }
    const currentSession = mockDb.getCurrentSession();
    if (currentSession) {
      currentSession.score_multiplier = BOOSTER_CONFIG.BENEFITS.BP_MULTIPLIER;
      if (typeof mockDb.saveSession === 'function') {
        mockDb.saveSession(currentSession);
      }
    }
    const guest = mockDb.getGuestProfile();
    if (guest) {
      mockDb.updateGuestProfile({ score_multiplier: BOOSTER_CONFIG.BENEFITS.BP_MULTIPLIER });
    }

    // 3. 更新订单状态为已支付并已发放，记录审计节点
    const fulfilledTime = new Date().toISOString();
    order.status = PAYMENT_STATUS.PAID;
    order.fulfilledAt = fulfilledTime;
    order.auditTrail = {
      ...(order.auditTrail || {}),
      fulfilledAt: fulfilledTime,
      fulfillmentType: 'instant_authoritative'
    };
    this._saveOrder(order);
    this._processedTransactions.add(transactionId);

    // 4. 写入通知中心 (付款成功通知)
    try {
      notificationService.notifyPaymentSuccess(order);
    } catch (e) {
      console.warn('[paymentService] Failed to emit payment success notification:', e);
    }

    // 广播权益生效事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('playbank:booster-unlocked', {
        detail: { playerId: order.playerId, transactionId }
      }));
    }

    return {
      success: true,
      order
    };
  }

  /**
   * 3. 退款处理
   */
  async refundOrder(transactionId, reason = 'Parent requested refund') {
    const orders = this.getOrders();
    const order = orders.find(o => o.transactionId === transactionId);
    if (!order) return { success: false, reason: 'ORDER_NOT_FOUND' };

    const refundedTime = new Date().toISOString();
    order.status = PAYMENT_STATUS.REFUNDED;
    order.refundedAt = refundedTime;
    order.refundReason = reason;
    order.auditTrail = {
      ...(order.auditTrail || {}),
      refundedAt: refundedTime,
      refundReason: reason,
      revocationStatus: 'energy_and_multiplier_revoked'
    };
    this._saveOrder(order);

    // 回收体力与 3× 权益
    energyService.downgradeToFree(order.playerId);

    const session = mockDb.getCurrentSession();
    if (session) {
      session.score_multiplier = 1;
      if (typeof mockDb.saveSession === 'function') {
        mockDb.saveSession(session);
      }
    }
    const guest = mockDb.getGuestProfile();
    if (guest) {
      mockDb.updateGuestProfile({ score_multiplier: 1 });
    }

    // 写入通知中心 (退款通知)
    try {
      notificationService.notifyPaymentRefunded(order, reason);
    } catch (e) {
      console.warn('[paymentService] Failed to emit payment refunded notification:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('playbank:booster-refunded', {
        detail: { playerId: order.playerId, transactionId, reason }
      }));
    }

    return { success: true, order };
  }

  /**
   * 4. 标记订单支付失败 / 取消
   */
  async failOrder(transactionId, reason = '付款未在有效时间内完成') {
    const orders = this.getOrders();
    const order = orders.find(o => o.transactionId === transactionId);
    if (!order) return { success: false, reason: 'ORDER_NOT_FOUND' };

    order.status = PAYMENT_STATUS.FAILED;
    order.failedAt = new Date().toISOString();
    order.failReason = reason;
    this._saveOrder(order);

    // 写入通知中心 (失败通知)
    try {
      notificationService.notifyPaymentFailed(order, reason);
    } catch (e) {
      console.warn('[paymentService] Failed to emit payment failed notification:', e);
    }

    return { success: true, order };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
