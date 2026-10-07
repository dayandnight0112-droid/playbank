/**
 * test-step2-age-persistence.mjs
 * 
 * 步骤 2 自动化验证脚本：
 * 验证玩家年龄记忆与大厅入口轻量化规则：
 * 1. 游客本地持久化：mockDb.savePlayerAge 写入 localStorage 及 guestProfile.exactAge
 * 2. 注册玩家云端与 Profile 同步：session.exact_age 与 mockDb.saveSession 同步
 * 3. 再次获取年龄 (getPlayerAge)：注册玩家优先读取 session，游客读取 guestProfile/localStorage
 * 4. 统一开局时自动复用已有年龄，无需再次弹窗打断
 */

import { mockDb } from './src/lib/mockDb.js';

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
  console.log('🚀 开始测试【步骤 2：保存玩家年龄与大厅入口轻量化】');
  console.log('================================================================\n');

  // 清空测试存储
  localStorage.clear();

  // Test 1: 初始无存储时默认 10 岁
  console.log('▶ [Test 1] 验证初始状态无年龄保存时的默认回退...');
  const defaultAge = mockDb.getPlayerAge();
  assert(defaultAge === 10, '初始无设置时默认返回 10 岁');

  // Test 2: 游客保存年龄（存入本机 localStorage 与 guestProfile）
  console.log('\n▶ [Test 2] 验证游客保存年龄（存入 localStorage 与 guestProfile）...');
  mockDb.createGuest('typing', '测试游客');
  mockDb.savePlayerAge(12);

  const savedGuestAge = mockDb.getPlayerAge();
  assert(savedGuestAge === 12, '游客读取年龄成功返回 12 岁');
  assert(localStorage.getItem('playbank_player_age') === '12', 'localStorage 正确保存 12 岁');

  const guest = mockDb.getGuestProfile();
  assert(guest && guest.exactAge === 12, 'guestProfile.exactAge 同步更新为 12');

  // Test 3: 注册玩家保存年龄（存入 Profile / Session）
  console.log('\n▶ [Test 3] 验证注册玩家保存年龄（写入 session 与 Profile）...');
  const mockSession = {
    id: 'user_123_test',
    ic_name: 'TestUser',
    email: 'test@example.com',
    exact_age: 14
  };
  mockDb.saveSession(mockSession);

  const sessionAge = mockDb.getPlayerAge();
  assert(sessionAge === 14, '登录玩家优先从 session 读取年龄 14 岁');

  // 修改注册玩家年龄为 16 岁
  mockDb.savePlayerAge(16);
  const updatedSessionAge = mockDb.getPlayerAge();
  assert(updatedSessionAge === 16, '修改后 session 年龄成功更新为 16 岁');
  const currentSess = mockDb.getCurrentSession();
  assert(currentSess && currentSess.exact_age === 16, '当前 session 数据中 exact_age 为 16');

  // Test 4: 退出登录后恢复游客对应年龄
  console.log('\n▶ [Test 4] 验证注销登录后，平滑回退至游客已存年龄...');
  localStorage.removeItem('playbank_session');
  // 此时只有游客数据，我们之前设为 12 岁
  const backToGuestAge = mockDb.getPlayerAge();
  // 注意：刚才在 Test 3 中 savePlayerAge(16) 也更新了 localStorage 和 guestProfile
  assert(backToGuestAge === 16, '无登录会话时读取本地已存年龄 16 岁');

  // Test 5: 边界年龄校验 (例如非法字符或超出范围)
  console.log('\n▶ [Test 5] 验证非法输入时的容错处理...');
  mockDb.savePlayerAge('invalid');
  const fallbackAge = mockDb.getPlayerAge();
  assert(fallbackAge === 10, '非法输入自动 fallback 回 10 岁');

  console.log('\n================================================================');
  console.log(`🎉 步骤 2 测试执行完毕: 全部 ${passed}/${total} 项断言通过！`);
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('测试运行异常:', err);
  process.exit(1);
});
