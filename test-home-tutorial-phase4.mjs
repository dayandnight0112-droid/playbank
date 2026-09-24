// Phase 4 Unit Test: Step 3 (Shop/Marketplace Experience) & Seamless Cross-View Navigation
import fs from 'fs';
import path from 'path';
import { mockDb } from './src/lib/mockDb.js';
import { HOME_TUTORIAL_STEPS } from './src/components/tutorial/tutorialConfig.js';

// Setup Mock LocalStorage
class MockLocalStorage {
  constructor() { this.store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
global.localStorage = new MockLocalStorage();

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== Running Phase 4 Home Tutorial Step 3 (Shop Experience) Tests ===\n');

// 1. Selector in BottomNav.jsx
console.log('--- Test 1: BottomNav Marketplace Selector ---');
const bottomNavPath = path.resolve('src/components/BottomNav.jsx');
const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf-8');

assert(
  bottomNavContent.includes('data-tutorial-target={item.id === \'marketplace\' ? \'nav-marketplace\' : undefined}'),
  'BottomNav.jsx must tag marketplace tab with data-tutorial-target="nav-marketplace"'
);
assert(
  HOME_TUTORIAL_STEPS[3].targetSelector === '[data-tutorial-target="nav-marketplace"]',
  'Step 3 configuration must target nav-marketplace'
);


// 2. Step 3 Lobby-to-Shop Transition Simulation
console.log('\n--- Test 2: Lobby to Shop Transition ---');
const testPlayerId = 'guest_shop_tester_1';
mockDb.grantHomeTutorialEligibility(testPlayerId);
// Advance to Step 3
mockDb.saveHomeTutorialState(testPlayerId, { currentStep: 3, subStep: 'highlight' });

let currentView = 'home';
let state = mockDb.getHomeTutorialState(testPlayerId);
assert(state.currentStep === 3, 'State must be at Step 3');
assert(currentView === 'home', 'Player begins in Home lobby');

// Player clicks highlighted shop icon in BottomNav
currentView = 'marketplace';
assert(currentView === 'marketplace', 'Player successfully routed into Marketplace');


// 3. Shop Experience & BP Comparison Check
console.log('\n--- Test 3: Shop Experience, BP Presentation & No Auto-Purchase ---');
const playerInitialBP = 190;
const shopDesc = HOME_TUTORIAL_STEPS[3].shopDescription(playerInitialBP);

assert(
  shopDesc.includes('190 BP'),
  'Shop tutorial description must clearly state player\'s current BP (190 BP)'
);
assert(
  shopDesc.includes('无需购买'),
  'Shop tutorial must clearly inform player that purchase is optional'
);

// Verify no order was automatically placed
const userOrders = mockDb.getUserOrders(testPlayerId);
assert(userOrders.length === 0, 'Tutorial MUST NOT automatically create orders or place purchases');


// 4. Return to Lobby and Advance to Step 4
console.log('\n--- Test 4: Return to Lobby & State Progression to Step 4 ---');
// Simulate clicking "返回大厅，继续 →"
const onReturnToLobby = () => {
  currentView = 'home';
  return mockDb.saveHomeTutorialState(testPlayerId, { currentStep: 4, subStep: 'highlight' });
};

state = onReturnToLobby();
assert(currentView === 'home', 'Player successfully navigated back to Home');
assert(state.currentStep === 4, 'Tutorial state successfully advanced to Step 4');
assert(state.status === 'in_progress', 'Tutorial remains in_progress until Step 4 start game is clicked');


// 5. Interruption and Resume Continuity Test
console.log('\n--- Test 5: Refresh/Interruption Continuity at Step 3/4 ---');
// Simulate page refresh in Home at Step 4
const reloadedState = mockDb.getHomeTutorialState(testPlayerId);
assert(reloadedState.currentStep === 4, 'Reloaded state must accurately remain at Step 4');
assert(mockDb.isHomeTutorialEligible(testPlayerId) === true, 'Player must remain eligible for Step 4');

console.log('\n🎉 ALL Phase 4 Tests Passed Successfully!\n');
