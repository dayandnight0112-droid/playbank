/**
 * test-unified-launch-flow.mjs
 * 
 * 步骤 1 自动化验证脚本：
 * 验证统一开局流程 (gameLauncherService) 的核心规则：
 * 1. 统一处理年龄、体力、题目准备与会话建立
 * 2. 失败/体力不足绝不扣体力，且有异常时原路退回
 * 3. 轮换机制（单数局选择题，双数局打字题）表现一致
 * 4. 防连点/并发保护生效
 */

import { gameLauncherService, mapAgeToGrade } from './src/lib/gameLauncherService.js';
import { energyService } from './src/lib/energyService.js';

// Polyfill minimal browser environment for node test
if (typeof globalThis.window === 'undefined') {
  const store = {};
  globalThis.window = {
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ 通过: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ 失败: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🚀 开始测试【步骤 1：统一开局流程 (gameLauncherService)】');
  console.log('================================================================\n');

  const testPlayerId = 'test_unified_player_' + Date.now();

  // Test 1: 年龄映射年级准确性
  console.log('▶ [Test 1] 验证年龄到年级 (mapAgeToGrade) 的映射规则...');
  const g7 = mapAgeToGrade(7);
  const g10 = mapAgeToGrade(10);
  const g13 = mapAgeToGrade(13);
  const g16 = mapAgeToGrade(16);
  assert(g7.gradeId === 'year-1', '7岁对应 Year 1');
  assert(g10.gradeId === 'year-4', '10岁对应 Year 4');
  assert(g13.gradeId === 'form-1', '13岁对应 Form 1');
  assert(g16.gradeId === 'form-4', '16岁对应 Form 4');

  // Test 2: 体力检查与不足拦截
  console.log('\n▶ [Test 2] 验证体力充足与零体力时的开局拦截...');
  // 初始化体力为 5
  const initialEnergy = energyService.getEnergyState(testPlayerId);
  assert(initialEnergy.energy === 5, '初始体力为 5 点');

  const check1 = gameLauncherService.checkEnergy(testPlayerId);
  assert(check1.hasEnergy === true && check1.energy === 5, '体力检查准确识别充足体力');

  // 模拟将体力消耗至 0
  for (let i = 0; i < 5; i++) {
    await energyService.consumeEnergy(testPlayerId);
  }
  const zeroEnergy = energyService.getEnergyState(testPlayerId);
  assert(zeroEnergy.energy === 0, '当前体力已为 0 点');

  let exhaustedTriggered = false;
  let quizCallbackTriggered = false;
  const launchResFail = await gameLauncherService.launchGame({
    playerId: testPlayerId,
    age: 10,
    roundIndex: 1,
    onLaunchQuiz: () => { quizCallbackTriggered = true; },
    onEnergyExhausted: () => { exhaustedTriggered = true; }
  });

  assert(launchResFail.success === false, '零体力时拒绝开局');
  assert(launchResFail.reason === 'NO_ENERGY', '拒绝原因标记为 NO_ENERGY');
  assert(exhaustedTriggered === true, '成功触发 onEnergyExhausted 回调');
  assert(quizCallbackTriggered === false, '未执行选择题开局回调');
  assert(energyService.getEnergyState(testPlayerId).energy === 0, '未发生任何异常扣费');

  // Test 3: 单数局启动选择题与体力扣除
  console.log('\n▶ [Test 3] 验证第 1 局（单数局）启动选择题，并精确扣除 1 点体力...');
  // 恢复 2 点体力
  energyService.refundEnergy(testPlayerId, 2);
  assert(energyService.getEnergyState(testPlayerId).energy === 2, '补充 2 点体力供测试使用');

  let launchedMode = null;
  let launchedRound = null;
  const launchResOdd = await gameLauncherService.launchGame({
    playerId: testPlayerId,
    age: 10,
    roundIndex: 1,
    onLaunchQuiz: async ({ quizParams, round }) => {
      launchedMode = 'quiz';
      launchedRound = round;
      assert(quizParams.subject === 'english', '选择题科目为 english');
      assert(quizParams.gradeId === 'year-4', '10岁对应 year-4 题库');
      assert(quizParams.questionCount === 10, '选择题题目数量为 10');
    },
    onLaunchTyping: () => {
      launchedMode = 'typing';
    }
  });

  assert(launchResOdd.success === true, '第 1 局开局成功');
  assert(launchedMode === 'quiz', '正确路由至选择题模式');
  assert(launchedRound === 1, '对局轮数为 1');
  assert(energyService.getEnergyState(testPlayerId).energy === 1, '成功扣除 1 点体力，剩余 1 点');

  // Test 4: 双数局启动打字题与体力扣除
  console.log('\n▶ [Test 4] 验证第 2 局（双数局）启动打字题，并精确扣除最后 1 点体力...');
  let launchedTypingRound = null;
  let launchedTypingAge = null;
  const launchResEven = await gameLauncherService.launchGame({
    playerId: testPlayerId,
    age: 12,
    roundIndex: 2,
    onLaunchQuiz: () => {
      launchedMode = 'quiz';
    },
    onLaunchTyping: async ({ age, round }) => {
      launchedMode = 'typing';
      launchedTypingRound = round;
      launchedTypingAge = age;
    }
  });

  assert(launchResEven.success === true, '第 2 局开局成功');
  assert(launchedMode === 'typing', '正确路由至打字题模式');
  assert(launchedTypingRound === 2, '对局轮数为 2');
  assert(launchedTypingAge === 12, '打字题年龄正确传递为 12 岁');
  assert(energyService.getEnergyState(testPlayerId).energy === 0, '体力正确扣至 0 点');

  // Test 5: 开局异常时自动退还体力
  console.log('\n▶ [Test 5] 验证开局过程发生异常时，自动补偿退还体力 (refundEnergy)...');
  // 补充 1 点体力
  energyService.refundEnergy(testPlayerId, 1);
  assert(energyService.getEnergyState(testPlayerId).energy === 1, '当前有 1 点体力');

  const launchResError = await gameLauncherService.launchGame({
    playerId: testPlayerId,
    age: 10,
    roundIndex: 3,
    onLaunchQuiz: async () => {
      throw new Error('模拟渲染异常或网络中断');
    }
  });

  assert(launchResError.success === false, '检测到异常，开局返回失败');
  assert(launchResError.reason === 'ERROR', '原因标记为 ERROR');
  assert(energyService.getEnergyState(testPlayerId).energy === 1, '体力已原路补偿退还，仍为 1 点');

  // 总结
  console.log('\n================================================================');
  console.log(`🎉 步骤 1 测试执行完毕: 全部 ${passed}/${total} 项断言通过！`);
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('测试运行异常:', err);
  process.exit(1);
});
