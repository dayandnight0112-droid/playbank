/**
 * notificationService.js
 * PlayBank 玩家通知中心服务 (In-App Notification Center)
 * 
 * 核心功能：
 * 1. 负责记录付款成功、付款失败、退款成功等关键财务/权益变动通知。
 * 2. 支持已读/未读状态管理、未读小红点角标计数。
 * 3. 自动同步对齐订单流水 (playbank_payment_orders)，确保不漏通知。
 * 4. 支持实时事件总线 (playbank:notifications-updated)，与底部导航栏 (BottomNav) 无缝联动。
 */

import { BOOSTER_CONFIG } from '../config/boosterConfig.js';

export const NOTIFICATION_TYPES = {
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded',
  SYSTEM: 'system'
};

const STORAGE_PREFIX = 'playbank_notifications_';
const ORDERS_KEY = 'playbank_payment_orders';

class NotificationService {
  constructor() {
    this._listeners = new Set();
  }

  _getKey(playerId = 'guest') {
    return `${STORAGE_PREFIX}${playerId || 'guest'}`;
  }

  /**
   * 获取玩家所有通知
   */
  getNotifications(playerId = 'guest') {
    if (typeof localStorage === 'undefined') return [];
    try {
      const key = this._getKey(playerId);
      const raw = localStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];

      // 自动检查与补充订单流水的通知（确保历史与并发订单均有对应通知）
      list = this._syncWithOrders(list, playerId);
      return list;
    } catch (e) {
      console.error('[notificationService] Failed to read notifications:', e);
      return [];
    }
  }

  /**
   * 获取未读通知总数 (用于 BottomNav 红点角标)
   */
  getUnreadCount(playerId = 'guest') {
    const list = this.getNotifications(playerId);
    return list.filter(n => !n.read).length;
  }

  /**
   * 与订单列表对齐，确保每一笔已付款、已退款或失败的订单都生成对应通知
   */
  _syncWithOrders(currentList, playerId = 'guest') {
    try {
      const rawOrders = localStorage.getItem(ORDERS_KEY);
      if (!rawOrders) return currentList;
      const orders = JSON.parse(rawOrders);
      if (!Array.isArray(orders)) return currentList;

      const playerOrders = orders.filter(o => o.playerId === playerId || playerId === 'guest');
      let updated = false;

      playerOrders.forEach(order => {
        // 1. 付款成功通知补全 (只要曾经发货或当前为已支付)
        if (order.fulfilledAt || order.status === 'paid') {
          const exists = currentList.some(n => n.type === NOTIFICATION_TYPES.PAYMENT_SUCCESS && n.transactionId === order.transactionId);
          if (!exists) {
            currentList.push({
              id: `notif_paid_${order.transactionId}`,
              type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
              title: '🎉 付款成功 · VIP 特权已生效',
              message: `感谢支持！您已成功开通 PlayBank 专属权益。永久享有 10 次体力储存上限（每小时恢复 1 次）及答题/打字 3× BP 积分加成！`,
              amount: order.amount || BOOSTER_CONFIG.PRICING.AMOUNT,
              currency: order.currency || 'MYR',
              transactionId: order.transactionId,
              createdAt: order.fulfilledAt || order.createdAt || new Date().toISOString(),
              read: false,
              details: {
                benefit: '10次上限 + 3× BP',
                merchant: BOOSTER_CONFIG.PAYMENT.MERCHANT_NAME,
                channel: order.channel || 'DuitNow QR'
              }
            });
            updated = true;
          }
        }

        // 2. 退款通知补全
        if (order.status === 'refunded') {
          const exists = currentList.some(n => n.type === NOTIFICATION_TYPES.PAYMENT_REFUNDED && n.transactionId === order.transactionId);
          if (!exists) {
            currentList.push({
              id: `notif_ref_${order.transactionId}`,
              type: NOTIFICATION_TYPES.PAYMENT_REFUNDED,
              title: '🔄 退款处理完成通知',
              message: `您的订单（${order.transactionId}）退款已成功受理。款项将原路退回，账号特权已重置为免费 5 次上限与常规积分。`,
              amount: order.amount || BOOSTER_CONFIG.PRICING.AMOUNT,
              currency: order.currency || 'MYR',
              transactionId: order.transactionId,
              createdAt: order.refundedAt || new Date().toISOString(),
              read: false,
              details: {
                reason: order.refundReason || '家长申请退款',
                refundedBy: order.refundedBy || '平台管理员'
              }
            });
            updated = true;
          }
        }

        // 3. 失败通知补全
        if (order.status === 'failed') {
          const exists = currentList.some(n => n.type === NOTIFICATION_TYPES.PAYMENT_FAILED && n.transactionId === order.transactionId);
          if (!exists) {
            currentList.push({
              id: `notif_failed_${order.transactionId}`,
              type: NOTIFICATION_TYPES.PAYMENT_FAILED,
              title: '⚠️ 付款未完成 / 交易失败',
              message: `您的 DuitNow 账单未能完成核验：${order.failReason || '交易超时'}。如银行账户已扣款，请提供交易参考号联系客服协助。`,
              amount: order.amount || BOOSTER_CONFIG.PRICING.AMOUNT,
              currency: order.currency || 'MYR',
              transactionId: order.transactionId,
              createdAt: order.failedAt || new Date().toISOString(),
              read: false,
              details: {
                reason: order.failReason || '交易超时'
              }
            });
            updated = true;
          }
        }
      });

      if (updated) {
        currentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(this._getKey(playerId), JSON.stringify(currentList));
      }
    } catch (e) {
      console.warn('[notificationService] Sync with orders failed:', e);
    }
    return currentList;
  }

  /**
   * 保存通知列表并广播事件
   */
  _saveNotifications(playerId, list) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this._getKey(playerId), JSON.stringify(list));
      this._notifyChange(playerId);
    } catch (e) {
      console.error('[notificationService] Failed to save notifications:', e);
    }
  }

  /**
   * 添加新通知 (带幂等防重守卫)
   */
  addNotification({
    playerId = 'guest',
    type = NOTIFICATION_TYPES.SYSTEM,
    title = '',
    message = '',
    amount = null,
    currency = 'MYR',
    transactionId = null,
    details = {}
  }) {
    const list = this.getNotifications(playerId);

    // 幂等防重：同一笔交易同一类型通知不重复产生
    if (transactionId) {
      const existing = list.find(n => n.type === type && n.transactionId === transactionId);
      if (existing) {
        return existing;
      }
    }

    const newNotif = {
      id: `notif_${type}_${transactionId || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      amount,
      currency,
      transactionId,
      details,
      createdAt: new Date().toISOString(),
      read: false
    };

    list.unshift(newNotif);
    this._saveNotifications(playerId, list);
    return newNotif;
  }

  /**
   * 便捷方法：推送付款成功通知
   */
  notifyPaymentSuccess(order) {
    return this.addNotification({
      playerId: order.playerId,
      type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
      title: '🎉 付款成功 · VIP 特权已生效',
      message: `恭喜！一次性付费 RM${Number(order.amount || 20).toFixed(2)} 已确认。永久 10 次上限（每小时恢复 1 次）＋ 答题/打字 3× BP 加成已到账。`,
      amount: order.amount,
      transactionId: order.transactionId,
      details: {
        channel: order.channel || 'DuitNow QR',
        fulfilledAt: order.fulfilledAt || new Date().toISOString()
      }
    });
  }

  /**
   * 便捷方法：推送付款失败/未完成通知
   */
  notifyPaymentFailed(order, reason = '付款未在有效时间内完成') {
    return this.addNotification({
      playerId: order?.playerId || 'guest',
      type: NOTIFICATION_TYPES.PAYMENT_FAILED,
      title: '⚠️ 付款未完成 / 交易失败',
      message: `您的 DuitNow 账单未能完成核验：${reason}。如银行账户已扣款，请提供交易参考号联系客服协助。`,
      amount: order?.amount,
      transactionId: order?.transactionId,
      details: {
        reason,
        failedAt: new Date().toISOString()
      }
    });
  }

  /**
   * 便捷方法：推送退款完成通知
   */
  notifyPaymentRefunded(order, reason = '家长申请退款') {
    return this.addNotification({
      playerId: order.playerId,
      type: NOTIFICATION_TYPES.PAYMENT_REFUNDED,
      title: '🔄 退款处理完成通知',
      message: `您的订单（${order.transactionId}）退款已成功受理。款项将原路退回，账号特权已重置为免费 5 次上限与常规积分。`,
      amount: order.amount,
      transactionId: order.transactionId,
      details: {
        reason,
        refundedAt: new Date().toISOString()
      }
    });
  }

  /**
   * 标记单条通知为已读
   */
  markAsRead(notificationId, playerId = 'guest') {
    const list = this.getNotifications(playerId);
    const target = list.find(n => n.id === notificationId);
    if (target && !target.read) {
      target.read = true;
      this._saveNotifications(playerId, list);
    }
  }

  /**
   * 全部标记为已读
   */
  markAllAsRead(playerId = 'guest') {
    const list = this.getNotifications(playerId);
    let changed = false;
    list.forEach(n => {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      this._saveNotifications(playerId, list);
    }
  }

  /**
   * 清空所有通知
   */
  clearAll(playerId = 'guest') {
    this._saveNotifications(playerId, []);
  }

  /**
   * 订阅通知变更事件
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => {
      this._listeners.delete(callback);
    };
  }

  _notifyChange(playerId) {
    const unread = this.getUnreadCount(playerId);
    this._listeners.forEach(cb => {
      try {
        cb({ playerId, unreadCount: unread });
      } catch (e) {
        console.error('[notificationService] Listener error:', e);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('playbank:notifications-updated', {
        detail: { playerId, unreadCount: unread }
      }));
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
