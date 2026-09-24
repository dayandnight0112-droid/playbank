// Phase 5 Unit Test: Step 4 (Start Game) Completion & Seamless Level Transition
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

console.log('=== Running Phase 5 Home Tutorial Step 4 (Start Game) Tests ===\n');

// 1. Selector Verification in AdventureScene.jsx
console.log('--- Test 1: Continue Button Target Selector Verification ---');
const adventureScenePath = path.resolve('src/components/home/AdventureScene.jsx');
const adventureSceneContent = fs.readFileSync(adventureScenePath, 'utf-8');

assert(
  adventureSceneContent.includes('data-tutorial-target="home-continue-button"'),
  'AdventureScene.jsx must tag PrimaryButton with data-tutorial-target="home-continue-button"'
);
assert(
  HOME_TUTORIAL_STEPS[4].targetSelector === '[data-tutorial-target="home-continue-button"]',
  'Step 4 configuration must target home-continue-button'
);

const primaryButtonPath = path.resolve('src/components/common/PrimaryButton.jsx');
const primaryButtonContent = fs.readFileSync(primaryButtonPath, 'utf-8');
assert(
  primaryButtonContent.includes('...restProps'),
  'PrimaryButton.jsx must forward ...restProps to allow data-tutorial-target rendering on button'
);


// 2. Step 4 Completion Flow & select_subject Transition Simulation
console.log('\n--- Test 2: Step 4 Start Game Click, Persistence & Navigation ---');
const testPlayerId = 'guest_step4_hero';
mockDb.grantHomeTutorialEligibility(testPlayerId);
// Advance to Step 4
mockDb.saveHomeTutorialState(testPlayerId, { currentStep: 4, subStep: 'highlight' });

let currentView = 'home';
let state = mockDb.getHomeTutorialState(testPlayerId);
assert(state.currentStep === 4, 'Player must be on Step 4');
assert(state.status === 'in_progress', 'Player must still be in_progress before click');
assert(mockDb.isHomeTutorialEligible(testPlayerId) === true, 'Player must be eligible before clicking start game');

// Simulate handleStartChallenge logic from App.jsx
function simulateStartChallenge(playerId) {
  const tutorial = mockDb.getHomeTutorialState(playerId);
  if (tutorial && tutorial.eligible && tutorial.status !== 'completed' && tutorial.currentStep === 4) {
    mockDb.markHomeTutorialComplete(playerId);
  }
  currentView = 'select_subject';
}

// Player clicks CONTINUE button
simulateStartChallenge(testPlayerId);

assert(currentView === 'select_subject', 'View must seamlessly navigate to select_subject');
const completedState = mockDb.getHomeTutorialState(testPlayerId);
assert(completedState.status === 'completed', 'Tutorial MUST be marked as completed');
assert(completedState.currentStep === 4, 'CurrentStep must be 4');
assert(typeof completedState.completedAt === 'string' && completedState.completedAt.length > 0, 'completedAt must be set');
assert(mockDb.isHomeTutorialEligible(testPlayerId) === false, 'Completed player must no longer be eligible');


// 3. Strict Rule: Clicking before Step 4 MUST NOT complete tutorial
console.log('\n--- Test 3: Premature Clicks (Steps 1, 2, 3) MUST NOT Mark Completed ---');
const earlyPlayerId = 'guest_early_clicker';
mockDb.grantHomeTutorialEligibility(earlyPlayerId);
mockDb.saveHomeTutorialState(earlyPlayerId, { currentStep: 2, subStep: 'highlight' });

// Simulate accidental trigger when player is only at Step 2
simulateStartChallenge(earlyPlayerId);

const earlyState = mockDb.getHomeTutorialState(earlyPlayerId);
assert(
  earlyState.status === 'in_progress',
  'Tutorial MUST remain in_progress if player is not at Step 4'
);
assert(earlyState.completedAt === null, 'completedAt MUST remain null');
assert(mockDb.isHomeTutorialEligible(earlyPlayerId) === true, 'Player must still be eligible');


// 4. Veteran / Already Completed Player Safety
console.log('\n--- Test 4: Veteran / Already Completed Player Click Safety ---');
const veteranPlayerId = 'user_hero_1'; // Veteran user
currentView = 'home';
simulateStartChallenge(veteranPlayerId);
assert(currentView === 'select_subject', 'Veteran user must normally route to select_subject without side effects');
assert(mockDb.isHomeTutorialEligible(veteranPlayerId) === false, 'Veteran user must remain ineligible');

console.log('\n🎉 ALL Phase 5 Tests Passed Successfully!\n');
