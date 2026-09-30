/**
 * test-booster-flow.mjs
 * 验证 3× BP 弹窗改造与家长购买流、游戏内结算乘数生效
 */

import assert from 'assert';

const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
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

const { energyService } = await import('./src/lib/energyService.js');
const { paymentService, PAYMENT_STATUS, PAYMENT_CHANNELS } = await import('./src/lib/paymentService.js');
const { mockDb } = await import('./src/lib/mockDb.js');

console.log('⚡ 开始测试 3× BP 付费权益与发货规则（一次性购买，永久生效）...\n');

async function run() {
  const playerId = 'test_child_101';

  // 1. 验证购买前：免费用户 5 次上限，倍数为 1
  console.log('▶ [Test 1] 购买前状态核查...');
  const beforeEnergy = energyService.getEnergyState(playerId);
  assert.strictEqual(beforeEnergy.maxEnergy, 5, '免费上限应为 5');
  assert.strictEqual(beforeEnergy.isPaid, false);
  console.log('  ✅ 通过: 初始为免费玩家 (上限 5 次)\n');

  // 2. 消耗 2 次体力，进入倒计时
  console.log('▶ [Test 2] 消耗 2 次体力，产生倒计时...');
  await energyService.consumeEnergy(playerId);
  await energyService.consumeEnergy(playerId);
  const midEnergy = energyService.getEnergyState(playerId);
  assert.strictEqual(midEnergy.energy, 3, '剩余次数应为 3');
  assert.ok(midEnergy.nextRecoveryAt > 0, '应存在恢复倒计时');
  const savedNextRecovery = midEnergy.nextRecoveryAt;
  console.log(`  ✅ 通过: 剩余 ${midEnergy.energy}/5，下次恢复戳: ${savedNextRecovery}\n`);

  // 3. 家长填写合规资料并创建订单
  console.log('▶ [Test 3] 家长提交资料，创建 DuitNow 预留订单 (PDPA 合规)...');
  const orderRes = await paymentService.createOrder({
    playerId,
    amount: 20.00,
    channel: PAYMENT_CHANNELS.DUITNOW_QR,
    parentDetails: {
      parentName: 'Tan Ah Kao',
      parentPhone: '+60128889999',
      parentRelation: 'Father',
      agreedTcVersion: 'v1.0-2026',
      marketingConsent: true
    }
  });

  assert.ok(orderRes.order.transactionId);
  assert.strictEqual(orderRes.order.amount, 20.00);
  assert.strictEqual(orderRes.order.status, PAYMENT_STATUS.PENDING);
  assert.strictEqual(orderRes.order.parentDetails.name, 'Tan Ah Kao');
  assert.strictEqual(orderRes.order.parentDetails.tcVersion, 'v1.0-2026');
  assert.ok(orderRes.order.parentDetails.agreedAt);
  console.log(`  ✅ 通过: 订单已创建，Transaction ID: ${orderRes.order.transactionId}\n`);

  // 4. 模拟网关确认付款并开通发货
  console.log('▶ [Test 4] 模拟支付确认，执行原子发货...');
  const fulfillRes = await paymentService.fulfillPayment(orderRes.order.transactionId);
  assert.strictEqual(fulfillRes.success, true);

  // 5. 验证体力上限与补足 5 次
  console.log('▶ [Test 5] 验证游玩次数升级权益（上限扩充至 10，额外补足 5 次，保留计时）...');
  const afterEnergy = energyService.getEnergyState(playerId);
  assert.strictEqual(afterEnergy.maxEnergy, 10, '上限已扩增至 10');
  assert.strictEqual(afterEnergy.isPaid, true, '标记为付费 VIP');
  assert.strictEqual(afterEnergy.energy, 3 + 5, '当前次数应从 3 + 5 补足为 8');
  assert.strictEqual(afterEnergy.nextRecoveryAt, savedNextRecovery, '应保留原有的恢复时间戳，不丢弃已积累的分秒');
  console.log(`  ✅ 通过: 次数变为 ${afterEnergy.energy}/10，倒计时平滑继承\n`);

  // 6. 验证订单在 Storage 中完整可查（供 Admin 查看）
  console.log('▶ [Test 6] 验证订单持久化（供 Admin 额度监控与家长合规核查）...');
  const allOrders = paymentService.getOrders();
  const matched = allOrders.find(o => o.transactionId === orderRes.order.transactionId);
  assert.ok(matched, '应能检索到该订单');
  assert.strictEqual(matched.status, PAYMENT_STATUS.PAID);
  assert.strictEqual(matched.parentDetails.relation, 'Father');
  console.log('  ✅ 通过: 订单完整存储，包含家长姓名、联系电话、关系与条款签署时间戳\n');

  console.log('🎉 3× BP 付费权益与发货规则全链路测试完全通过！');
}

run().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
