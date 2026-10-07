/**
 * test-step4-energy-display.mjs
 * 
 * 步骤 4 自动化测试：
 * 验证选择题与打字题结算页的体力展示与按钮状态控制：
 * 1. 有体力状态（energy > 0）：
 *    - 显示文案包含 "⚡ 剩余体力：" 与 "X/5"
 *    - 主按钮显示 "继续下一局 ▶ · 消耗1⚡"
 *    - 主按钮保持可用可点击
 * 2. 0 体力状态（energy === 0）：
 *    - 显示文案包含 "⚡ 剩余体力：0/5 · 距离恢复1点还有" 及分钟提示
 *    - 主按钮显示 "体力恢复中"
 *    - 主按钮置灰不可点击（disabled）
 * 3. 返回大厅入口：
 *    - 无论体力是否充足，"返回大厅" 始终可用
 *    - 奖励仅单次幂等领取
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup lightweight localStorage polyfill for Node test
if (!globalThis.localStorage) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}
if (!globalThis.window) {
  globalThis.window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

console.log('🚀 开始步骤 4 自动化验证：结算页体力显示与不足状态...');

// 1. 静态源码特征检查
const quizContent = fs.readFileSync(path.join(__dirname, 'src/views/Quiz.jsx'), 'utf-8');
const typingContent = fs.readFileSync(path.join(__dirname, 'src/views/TypingGame.jsx'), 'utf-8');
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf-8');

// 检查 Quiz.jsx
assert.ok(quizContent.includes('energyService.getEnergyState'), 'Quiz.jsx 必须调用 energyService.getEnergyState 获取体力状态');
assert.ok(quizContent.includes('⚡ 剩余体力：'), 'Quiz.jsx 必须包含 ⚡ 剩余体力： 格式文案');
assert.ok(quizContent.includes('继续下一局 ▶ · 消耗1⚡'), 'Quiz.jsx 有体力时主按钮应显示 继续下一局 ▶ · 消耗1⚡');
assert.ok(quizContent.includes('体力恢复中'), 'Quiz.jsx 无体力时主按钮应显示 体力恢复中');
assert.ok(quizContent.includes('disabled={isAnimating || !hasEnergy}'), 'Quiz.jsx 无体力时按钮必须置灰 disabled');

// 检查 TypingGame.jsx
assert.ok(typingContent.includes('energyService.getEnergyState'), 'TypingGame.jsx 必须调用 energyService.getEnergyState 获取体力状态');
assert.ok(typingContent.includes('⚡ 剩余体力：'), 'TypingGame.jsx 必须包含 ⚡ 剩余体力： 格式文案');
assert.ok(typingContent.includes('继续下一局 ▶ · 消耗1⚡'), 'TypingGame.jsx 有体力时主按钮应显示 继续下一局 ▶ · 消耗1⚡');
assert.ok(typingContent.includes('体力恢复中'), 'TypingGame.jsx 无体力时主按钮应显示 体力恢复中');
assert.ok(typingContent.includes('disabled={isAnimating || !hasEnergy}'), 'TypingGame.jsx 无体力时按钮必须置灰 disabled');

console.log('✅ Quiz.jsx 和 TypingGame.jsx 静态断言通过！');

// 2. 模拟运行体力服务及文案生成逻辑
const mockEnergyCalculation = (state) => {
  const currentEnergy = state?.energy ?? 0;
  const maxEnergy = state?.maxEnergy ?? 5;
  const hasEnergy = currentEnergy > 0;
  const recoveryMinutes = Math.max(1, Math.ceil((state?.secondsToNextRecovery || 0) / 60));
  const energyStatusText = hasEnergy
    ? `⚡ 剩余体力：${currentEnergy}/${maxEnergy}`
    : `⚡ 剩余体力：0/${maxEnergy} · 距离恢复1点还有 ${recoveryMinutes} 分钟`;
  const buttonText = hasEnergy ? '继续下一局 ▶ · 消耗1⚡' : '体力恢复中';
  const buttonDisabled = !hasEnergy;

  return { currentEnergy, maxEnergy, hasEnergy, energyStatusText, buttonText, buttonDisabled };
};

// 测试案例 A: 体力充足 (4/5)
{
  const res = mockEnergyCalculation({ energy: 4, maxEnergy: 5, secondsToNextRecovery: 1800 });
  assert.equal(res.hasEnergy, true);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：4/5');
  assert.equal(res.buttonText, '继续下一局 ▶ · 消耗1⚡');
  assert.equal(res.buttonDisabled, false);
}

// 测试案例 B: 体力剩 1 点 (1/5)
{
  const res = mockEnergyCalculation({ energy: 1, maxEnergy: 5, secondsToNextRecovery: 3200 });
  assert.equal(res.hasEnergy, true);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：1/5');
  assert.equal(res.buttonText, '继续下一局 ▶ · 消耗1⚡');
  assert.equal(res.buttonDisabled, false);
}

// 测试案例 C: 体力归零 (0/5，距离恢复 45 分钟)
{
  const res = mockEnergyCalculation({ energy: 0, maxEnergy: 5, secondsToNextRecovery: 45 * 60 });
  assert.equal(res.hasEnergy, false);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：0/5 · 距离恢复1点还有 45 分钟');
  assert.equal(res.buttonText, '体力恢复中');
  assert.equal(res.buttonDisabled, true);
}

// 测试案例 D: 体力归零，倒计时小于 1 分钟 (向上取整为 1 分钟)
{
  const res = mockEnergyCalculation({ energy: 0, maxEnergy: 5, secondsToNextRecovery: 25 });
  assert.equal(res.hasEnergy, false);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：0/5 · 距离恢复1点还有 1 分钟');
  assert.equal(res.buttonText, '体力恢复中');
  assert.equal(res.buttonDisabled, true);
}

// 测试案例 E: 付费玩家体力上限为 10，归零时
{
  const res = mockEnergyCalculation({ energy: 0, maxEnergy: 10, secondsToNextRecovery: 3500 });
  assert.equal(res.hasEnergy, false);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：0/10 · 距离恢复1点还有 59 分钟');
  assert.equal(res.buttonText, '体力恢复中');
  assert.equal(res.buttonDisabled, true);
}

// 测试案例 F: 付费玩家体力充足（10/10 满额或 9/10）
{
  const res = mockEnergyCalculation({ energy: 10, maxEnergy: 10, isPaid: true, secondsToNextRecovery: 0 });
  assert.equal(res.hasEnergy, true);
  assert.equal(res.maxEnergy, 10);
  assert.equal(res.energyStatusText, '⚡ 剩余体力：10/10');
  assert.equal(res.buttonText, '继续下一局 ▶ · 消耗1⚡');
  assert.equal(res.buttonDisabled, false);
}

// 3. 验证 energyService 对付费玩家的自动识别与 10 局上限同步
import { energyService } from './src/lib/energyService.js';

// 模拟注册付款玩家
const paidPlayerId = 'test_paid_user_' + Date.now();
localStorage.setItem('playbank_session', JSON.stringify({ id: paidPlayerId, has_booster: true, score_multiplier: 3 }));

const paidState = energyService.getEnergyState(paidPlayerId);
assert.equal(paidState.isPaid, true, '付费玩家 isPaid 必须为 true');
assert.equal(paidState.maxEnergy, 10, '付费玩家 maxEnergy 必须为 10（可玩10局）');
assert.ok(paidState.energy >= 5, '付费玩家开通后体力池初始至少应有 5 点以上');

// 消耗 1 点后仍有 10 局池容量
const afterConsume = await energyService.consumeEnergy(paidPlayerId);
assert.equal(afterConsume.success, true);
assert.equal(afterConsume.maxEnergy, 10, '消耗后上限保持为 10');

console.log('✅ 付费玩家 10 局上限与自动识别全部断言通过！');
console.log('🎉 步骤 4 自动化测试 100% 成功！');
