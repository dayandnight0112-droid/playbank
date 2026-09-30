/**
 * test-energy-system.mjs
 * 单元与集成测试：验证体力池系统核心规则与支付框架
 */

import assert from 'assert';

// Mock localStorage for Node environment
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

// Mock window and CustomEvent
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

const { energyService, FREE_MAX_ENERGY, PAID_MAX_ENERGY, RECOVERY_INTERVAL_MS } = await import('./src/lib/energyService.js');
const { paymentService, PAYMENT_STATUS } = await import('./src/lib/paymentService.js');

console.log('⚡ 开始测试 PlayBank 游玩次数系统（体力池机制）与支付框架...\n');

async function runTests() {
  const playerId = 'test_player_001';

  // --- 测试 1: 新玩家默认满额状态 ---
  console.log('▶ [Test 1] 验证新玩家默认体力状态...');
  let state = energyService.getEnergyState(playerId);
  assert.strictEqual(state.energy, 5, '免费玩家默认体力应为 5');
  assert.strictEqual(state.maxEnergy, 5, '免费玩家最大体力上限应为 5');
  assert.strictEqual(state.isPaid, false, '新玩家应为免费身份');
  assert.strictEqual(state.isFull, true, '满额状态应为 true');
  assert.strictEqual(state.nextRecoveryAt, null, '满额时无需倒计时');
  console.log('  ✅ 通过: 初始体力为 5/5，满额且无倒计时\n');

  // --- 测试 2: 消耗 1 次体力并启动倒计时 ---
  console.log('▶ [Test 2] 验证开局扣除 1 次体力...');
  const consumeRes = await energyService.consumeEnergy(playerId);
  assert.strictEqual(consumeRes.success, true, '扣除应成功');
  assert.strictEqual(consumeRes.remainingEnergy, 4, '剩余体力应为 4');
  assert.ok(consumeRes.nextRecoveryAt > Date.now(), '应生成未来 1 小时的恢复时间戳');
  assert.ok(consumeRes.secondsToNextRecovery > 3500 && consumeRes.secondsToNextRecovery <= 3600, '倒计时应在 3600 秒左右');

  state = energyService.getEnergyState(playerId);
  assert.strictEqual(state.energy, 4, '查询状态体力应为 4');
  assert.strictEqual(state.isFull, false, '满额状态应为 false');
  console.log(`  ✅ 通过: 扣除成功，剩余 ${state.energy}/${state.maxEnergy}，倒计时 ${state.formattedCountdown}\n`);

  // --- 测试 3: 离线恢复模拟 (推进时间 1 小时) ---
  console.log('▶ [Test 3] 验证经过 1 小时后离线恢复 1 次体力...');
  // 模拟推进内部时钟偏移 +3,601,000 ms (1小时多1秒)
  energyService._serverTimeOffset = RECOVERY_INTERVAL_MS + 1000;
  state = energyService.getEnergyState(playerId);
  assert.strictEqual(state.energy, 5, '经过 1 小时应恢复至 5');
  assert.strictEqual(state.isFull, true, '恢复到上限后应停止并显示满额');
  assert.strictEqual(state.nextRecoveryAt, null, '满额后倒计时应清除');
  console.log('  ✅ 通过: 经过 1 小时后成功恢复 1 次并达到上限停止\n');

  // --- 测试 4: 连续消耗至 0 并在 0 时拦截开局 ---
  console.log('▶ [Test 4] 验证体力耗尽至 0 时的拦截保护...');
  // 归零时基准
  energyService._serverTimeOffset = 0;
  for (let i = 0; i < 5; i++) {
    const res = await energyService.consumeEnergy(playerId);
    assert.strictEqual(res.success, true);
  }
  state = energyService.getEnergyState(playerId);
  assert.strictEqual(state.energy, 0, '消耗 5 次后体力应为 0');

  // 第 6 次应被拦截拒绝
  const failRes = await energyService.consumeEnergy(playerId);
  assert.strictEqual(failRes.success, false, '体力为 0 时开局应被拦截');
  assert.strictEqual(failRes.reason, 'NO_ENERGY', '拦截原因应为 NO_ENERGY');
  assert.strictEqual(failRes.remainingEnergy, 0);
  assert.ok(failRes.secondsToNextRecovery > 0, '应返回下一次恢复倒计时');
  console.log(`  ✅ 通过: 体力为 0 时成功拦截，提示倒计时: ${failRes.formattedCountdown}\n`);

  // --- 测试 5: 故障补偿与返还 (refundEnergy) ---
  console.log('▶ [Test 5] 验证开局失败时的补偿返还...');
  const refunded = energyService.refundEnergy(playerId, 1);
  assert.strictEqual(refunded.energy, 1, '补偿 1 次后体力应变为 1');
  console.log('  ✅ 通过: 异常中断补偿机制正常工作\n');

  // --- 测试 6: 家长一次性购买升级（扩容至 10，立即补足 5 次） ---
  console.log('▶ [Test 6] 验证付费升级权益（上限扩充至 10，额外赠送 5 次）...');
  // 当前体力为 1，升级后应为 1 + 5 = 6，上限为 10
  const paidState = energyService.upgradeToPaid(playerId);
  assert.strictEqual(paidState.isPaid, true, '应标记为付费状态');
  assert.strictEqual(paidState.maxEnergy, 10, '上限应增至 10');
  assert.strictEqual(paidState.energy, 6, '当前体力应由 1 补足 5 变为 6');
  assert.strictEqual(paidState.isFull, false, '6 < 10，非满额');
  assert.ok(paidState.nextRecoveryAt > 0, '保留恢复计时器');
  console.log(`  ✅ 通过: 付费升级成功，上限变为 10，体力瞬间补足 5 次变为 ${paidState.energy}/${paidState.maxEnergy}\n`);

  // --- 测试 7: 支付框架完整流程与幂等性 ---
  console.log('▶ [Test 7] 验证支付框架（订单创建、DuitNow 预留、幂等开通、退款降级）...');
  const orderRes = await paymentService.createOrder({
    playerId: 'test_player_002',
    amount: 20.00,
    parentDetails: {
      parentName: 'Mr. Tan',
      parentPhone: '+60123456789',
      parentRelation: 'Father',
      agreedTcVersion: 'v1.0',
      marketingConsent: true
    }
  });

  assert.ok(orderRes.order.transactionId, '应生成交易流水号');
  assert.strictEqual(orderRes.order.status, PAYMENT_STATUS.PENDING, '初始状态应为 pending');
  assert.ok(orderRes.paymentPayload.referenceNo, '应生成 DuitNow 账单参考号');
  console.log(`  - 订单创建成功，参考号: ${orderRes.paymentPayload.referenceNo}`);

  // 模拟支付成功确认
  const fulfillRes = await paymentService.fulfillPayment(orderRes.order.transactionId);
  assert.strictEqual(fulfillRes.success, true, '权益开通应成功');
  const player2Energy = energyService.getEnergyState('test_player_002');
  assert.strictEqual(player2Energy.isPaid, true, '玩家2应已升级为付费用户');
  assert.strictEqual(player2Energy.maxEnergy, 10, '玩家2体力上限应为 10');

  // 幂等测试：重复确认同一笔交易
  const duplicateRes = await paymentService.fulfillPayment(orderRes.order.transactionId);
  assert.strictEqual(duplicateRes.success, true);
  assert.strictEqual(duplicateRes.alreadyProcessed, true, '重复通知应被幂等拦截，不重复发货');
  console.log('  - 幂等性防护生效，重复支付通知被安全拦截');

  // 退款降级测试
  const refundRes = await paymentService.refundOrder(orderRes.order.transactionId, 'Parent test refund');
  assert.strictEqual(refundRes.success, true, '退款应成功');
  const player2Refunded = energyService.getEnergyState('test_player_002');
  assert.strictEqual(player2Refunded.isPaid, false, '退款后应降级为免费用户');
  assert.strictEqual(player2Refunded.maxEnergy, 5, '退款后上限应降回 5');
  console.log('  - 退款降级成功，权益自动回收\n');

  console.log('🎉 所有游玩次数体系与支付框架测试全部顺利通过！');
}

runTests().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
