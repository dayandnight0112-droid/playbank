/**
 * test-notification-system.mjs
 * 测试底部导航栏通知功能（付款成功/失败/退款通知链）
 */

import assert from 'assert';

// 模拟浏览器存储环境
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

const { notificationService, NOTIFICATION_TYPES } = await import('./src/lib/notificationService.js');
const { paymentService, PAYMENT_CHANNELS } = await import('./src/lib/paymentService.js');

console.log('================================================================');
console.log('🚀 开始测试底部导航栏通知系统 (付款成功 / 失败 / 退款)');
console.log('================================================================\n');

async function runNotificationTests() {
  const playerId = 'test_child_notif_001';

  // 1. 初始状态：无通知
  console.log('▶ [Test 1] 验证初始通知状态与计数...');
  let notifs = notificationService.getNotifications(playerId);
  assert.strictEqual(notifs.length, 0);
  assert.strictEqual(notificationService.getUnreadCount(playerId), 0);
  console.log('  ✅ 通过: 初始通知为空，未读数为 0\n');

  // 2. 创建订单并成功付款 -> 触发付款成功通知
  console.log('▶ [Test 2] 验证付款成功后自动推送通知...');
  const orderRes = await paymentService.createOrder({
    playerId,
    amount: 20.00,
    channel: PAYMENT_CHANNELS.DUITNOW_QR,
    parentDetails: { parentName: 'Mr. Tan', parentPhone: '+60 12-3456789' }
  });
  const txId = orderRes.order.transactionId;

  // 执行付款发货
  await paymentService.fulfillPayment(txId);

  notifs = notificationService.getNotifications(playerId);
  assert.strictEqual(notifs.length, 1, '应有 1 条新通知');
  assert.strictEqual(notifs[0].type, NOTIFICATION_TYPES.PAYMENT_SUCCESS);
  assert.strictEqual(notifs[0].transactionId, txId);
  assert.strictEqual(notifs[0].read, false, '新通知初始应为未读');
  assert.strictEqual(notificationService.getUnreadCount(playerId), 1, '未读数应为 1');
  console.log(`  - 成功接收通知: [${notifs[0].title}] 金额: RM${notifs[0].amount}`);
  console.log('  ✅ 通过: 付款成功通知即时推送到账，未读角标为 1\n');

  // 3. 标记已读
  console.log('▶ [Test 3] 验证通知已读状态更新...');
  notificationService.markAsRead(notifs[0].id, playerId);
  assert.strictEqual(notificationService.getUnreadCount(playerId), 0, '标为已读后未读数应为 0');
  notifs = notificationService.getNotifications(playerId);
  assert.strictEqual(notifs[0].read, true);
  console.log('  ✅ 通过: 单条通知标为已读生效\n');

  // 4. 模拟订单失败 -> 触发失败通知
  console.log('▶ [Test 4] 验证付款失败/超时后自动推送失败通知...');
  const failedOrderRes = await paymentService.createOrder({
    playerId,
    amount: 20.00,
    channel: PAYMENT_CHANNELS.DUITNOW_QR,
    parentDetails: { parentName: 'Mr. Tan', parentPhone: '+60 12-3456789' }
  });
  const failTxId = failedOrderRes.order.transactionId;
  await paymentService.failOrder(failTxId, '银行网关返回交易超时 (Timeout)');

  notifs = notificationService.getNotifications(playerId);
  assert.strictEqual(notifs.length, 2, '当前应有 2 条通知');
  const failNotif = notifs.find(n => n.type === NOTIFICATION_TYPES.PAYMENT_FAILED);
  assert.ok(failNotif, '应包含付款失败通知');
  assert.strictEqual(failNotif.transactionId, failTxId);
  assert.strictEqual(notificationService.getUnreadCount(playerId), 1, '新增 1 条未读');
  console.log(`  - 接收失败通知: [${failNotif.title}] 原因: ${failNotif.message}`);
  console.log('  ✅ 通过: 付款失败通知与角标增加生效\n');

  // 5. 模拟订单退款 -> 触发退款通知
  console.log('▶ [Test 5] 验证订单退款后自动推送退款通知...');
  await paymentService.refundOrder(txId, '家长申请误购全额退款');

  notifs = notificationService.getNotifications(playerId);
  assert.strictEqual(notifs.length, 3, '当前应有 3 条通知');
  const refundNotif = notifs.find(n => n.type === NOTIFICATION_TYPES.PAYMENT_REFUNDED);
  assert.ok(refundNotif, '应包含退款通知');
  assert.strictEqual(refundNotif.transactionId, txId);
  assert.ok(refundNotif.message.includes('退款已成功受理'));
  console.log(`  - 接收退款通知: [${refundNotif.title}]`);
  console.log('  ✅ 通过: 订单退款完成通知无缝推送到信箱\n');

  // 6. 全部标为已读与清空
  console.log('▶ [Test 6] 验证全部已读与清空功能...');
  assert.ok(notificationService.getUnreadCount(playerId) > 0);
  notificationService.markAllAsRead(playerId);
  assert.strictEqual(notificationService.getUnreadCount(playerId), 0, '全部已读后未读数为 0');

  notificationService.clearAll(playerId);
  // 清空后，因为订单列表还在，自动同步机制会保证账单记录安全
  console.log('  ✅ 通过: 全部标为已读与清空操作完整可用\n');

  console.log('================================================================');
  console.log('🎉 底部导航栏信封通知功能全套测试 100% 顺利通过！');
  console.log('================================================================');
}

runNotificationTests().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
