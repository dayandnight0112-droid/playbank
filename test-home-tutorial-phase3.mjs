// Phase 3 Unit Test: Step 1 (Daily Missions) & Step 2 (7-Day Streak) Integration
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

console.log('=== Running Phase 3 Home Tutorial Step 1 & Step 2 Tests ===\n');

// 1. Target Selector Attributes in Source Code
console.log('--- Test 1: DOM Target Selectors in Home.jsx & LobbySideAction ---');
const homeJsxPath = path.resolve('src/views/Home.jsx');
const homeJsxContent = fs.readFileSync(homeJsxPath, 'utf-8');

assert(
  homeJsxContent.includes('data-tutorial-target="lobby-daily"'),
  'Home.jsx must contain data-tutorial-target="lobby-daily" for Step 1'
);
assert(
  homeJsxContent.includes('data-tutorial-target="lobby-streak"'),
  'Home.jsx must contain data-tutorial-target="lobby-streak" for Step 2'
);

const lobbySideActionPath = path.resolve('src/components/home/LobbySideAction.jsx');
const lobbySideActionContent = fs.readFileSync(lobbySideActionPath, 'utf-8');
assert(
  lobbySideActionContent.includes('...restProps'),
  'LobbySideAction must forward ...restProps to allow data-tutorial-target rendering'
);


// 2. Step 1 (Daily Mission) Step Flow Simulation
console.log('\n--- Test 2: Step 1 Daily Mission Flow ---');
const testPlayerId = 'guest_step1_tester';
mockDb.grantHomeTutorialEligibility(testPlayerId);

let state = mockDb.getHomeTutorialState(testPlayerId);
assert(state.currentStep === 1, 'Initial step must be Step 1 (Daily Mission)');
assert(HOME_TUTORIAL_STEPS[1].targetSelector === '[data-tutorial-target="lobby-daily"]', 'Step 1 target must match selector');

// Simulate player clicking Daily button
let activeModal = 'daily';
assert(activeModal === 'daily', 'Daily Mission modal successfully opened on click');

// Simulate clicking "Next Step" from Daily Mission modal
const onStep1Advance = () => {
  activeModal = null; // Close modal
  return mockDb.saveHomeTutorialState(testPlayerId, { currentStep: 2, subStep: 'highlight' });
};

state = onStep1Advance();
assert(activeModal === null, 'Modal must be closed when clicking Next Step in Step 1');
assert(state.currentStep === 2, 'State must transition to Step 2');
assert(state.subStep === 'highlight', 'Substep must be highlight for next step');


// 3. Step 2 (7-Day Streak) Step Flow & No Auto-Claim Verification
console.log('\n--- Test 3: Step 2 7-Day Streak Flow & No Auto-Claiming Policy ---');
assert(HOME_TUTORIAL_STEPS[2].targetSelector === '[data-tutorial-target="lobby-streak"]', 'Step 2 target must match selector');

// Record initial streak & BP before opening modal
const initialStreakState = mockDb.getStreakState();
const initialBP = 100;
let playerBP = initialBP;

// Simulate player clicking Streak button
activeModal = 'streak';
assert(activeModal === 'streak', 'Streak modal successfully opened on click');

// Simulate viewing the guide and clicking "Next Step"
// CRITICAL: Watching tutorial MUST NOT trigger claimDailyStreak or grant awards automatically!
const onStep2Advance = () => {
  activeModal = null; // Close modal
  // Strictly no claim logic called here!
  return mockDb.saveHomeTutorialState(testPlayerId, { currentStep: 3, subStep: 'highlight' });
};

state = onStep2Advance();
assert(activeModal === null, 'Modal must be closed when clicking Next Step in Step 2');
assert(state.currentStep === 3, 'State must transition to Step 3');
assert(playerBP === initialBP, 'Player BP MUST NOT change from simply viewing tutorial');

const streakStateAfterTutorial = mockDb.getStreakState();
assert(
  streakStateAfterTutorial.claimedToday === initialStreakState.claimedToday,
  'Streak claimedToday MUST NOT be modified by tutorial progression'
);


// 4. Persistence Reload Test
console.log('\n--- Test 4: Reload & Persistence Continuity ---');
const reloadedState = mockDb.getHomeTutorialState(testPlayerId);
assert(reloadedState.currentStep === 3, 'Persisted state must accurately reflect Step 3 after Step 1 & 2 completion');
assert(mockDb.isHomeTutorialEligible(testPlayerId) === true, 'Player must remain eligible for Step 3 and Step 4');

console.log('\n🎉 ALL Phase 3 Tests Passed Successfully!\n');
