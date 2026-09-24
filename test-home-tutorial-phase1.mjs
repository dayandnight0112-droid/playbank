// Phase 1 Unit Test: Home Tutorial State Machine & Player Eligibility
import { mockDb, HOME_TUTORIAL_VERSION } from './src/lib/mockDb.js';

// Setup Mock LocalStorage for Node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
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

console.log('=== Running Phase 1 Home Tutorial Tests ===\n');

// 1. Initial State & Persistence
console.log('--- Test 1: State Machine Initialization & Persistence ---');
const guestId = 'guest_test_999';
mockDb.resetHomeTutorial(guestId);

let state = mockDb.getHomeTutorialState(guestId);
assert(state === null, 'Uninitialized guest should return null state');
assert(mockDb.isHomeTutorialEligible(guestId) === false, 'Uninitialized guest should not be eligible');

// Grant eligibility
const granted = mockDb.grantHomeTutorialEligibility(guestId);
assert(granted.version === HOME_TUTORIAL_VERSION, `Version should be ${HOME_TUTORIAL_VERSION}`);
assert(granted.status === 'in_progress', 'Initial status should be in_progress');
assert(granted.currentStep === 1, 'Initial currentStep should be 1');
assert(granted.subStep === 'highlight', 'Initial subStep should be highlight');
assert(granted.completedAt === null, 'Initial completedAt should be null');
assert(granted.eligible === true, 'eligible flag should be true');
assert(mockDb.isHomeTutorialEligible(guestId) === true, 'Player should now be eligible');

// Save step progress
const updated = mockDb.saveHomeTutorialState(guestId, { currentStep: 2, subStep: 'modal_opened' });
assert(updated.currentStep === 2, 'Updated currentStep should be 2');
assert(updated.subStep === 'modal_opened', 'Updated subStep should be modal_opened');

// Read back from storage
const reloaded = mockDb.getHomeTutorialState(guestId);
assert(reloaded.currentStep === 2, 'Reloaded currentStep should match 2');
assert(reloaded.subStep === 'modal_opened', 'Reloaded subStep should match modal_opened');
assert(mockDb.isHomeTutorialEligible(guestId) === true, 'Player should still be eligible before step 4 complete');

// Complete tutorial
const completed = mockDb.markHomeTutorialComplete(guestId);
assert(completed.status === 'completed', 'Completed status should be completed');
assert(completed.currentStep === 4, 'Completed currentStep should be 4');
assert(typeof completed.completedAt === 'string' && completed.completedAt.length > 0, 'completedAt timestamp should be set');
assert(mockDb.isHomeTutorialEligible(guestId) === false, 'Completed player should no longer be eligible');


// 2. Old Player Isolation (Boundary Test)
console.log('\n--- Test 2: Old Player Isolation & No Auto-Trigger ---');
const oldUserId = 'user_hero_1'; // Existing player in mockDb
assert(mockDb.isHomeTutorialEligible(oldUserId) === false, 'Existing old player without new tutorial tag MUST NOT be eligible');

const randomLegacyGuest = 'guest_legacy_old';
assert(mockDb.isHomeTutorialEligible(randomLegacyGuest) === false, 'Legacy guest MUST NOT be eligible');


// 3. Guest to Registered User Migration
console.log('\n--- Test 3: Guest-to-Register State Migration ---');
const activeGuest = mockDb.createGuest('chinese', 'TutorialTester');
const activeGuestId = activeGuest.playerId;
mockDb.grantHomeTutorialEligibility(activeGuestId);
mockDb.saveHomeTutorialState(activeGuestId, { currentStep: 3, subStep: 'in_shop' });

assert(mockDb.isHomeTutorialEligible(activeGuestId) === true, 'Active guest at step 3 should be eligible');
const guestStateBefore = mockDb.getHomeTutorialState(activeGuestId);
assert(guestStateBefore.currentStep === 3, 'Guest before register is at step 3');

// Register new user with this guest
const registerResult = mockDb.registerUser('newplayer@test.com', 'pass123', '0123456789', 150, 'uuid_new_reg_123');
assert(!registerResult.error, 'registerUser should succeed');
const registeredUserId = registerResult.user.id;

// Check if tutorial state was migrated to new registered user
const migratedState = mockDb.getHomeTutorialState(registeredUserId);
assert(migratedState !== null, 'Registered user should inherit tutorial state');
assert(migratedState.currentStep === 3, 'Registered user should retain step 3');
assert(migratedState.subStep === 'in_shop', 'Registered user should retain subStep in_shop');
assert(migratedState.status === 'in_progress', 'Registered user should retain in_progress');
assert(mockDb.isHomeTutorialEligible(registeredUserId) === true, 'Registered user should be eligible to continue');


// 4. Merge Guest into Existing User Migration
console.log('\n--- Test 4: Merge Guest into Existing User Migration ---');
const existingUserReg = mockDb.registerUser('existing@test.com', 'pass123', '0123456788', 0, 'uuid_target_user_456');
assert(!existingUserReg.error, 'Target user creation should succeed');
const existingUserId = existingUserReg.user.id;

// Create guest with tutorial step 2
const guestForMerge = mockDb.createGuest('chinese', 'MergeTester');
const guestMergeId = guestForMerge.playerId;
mockDb.grantHomeTutorialEligibility(guestMergeId);
mockDb.saveHomeTutorialState(guestMergeId, { currentStep: 2, subStep: 'modal_opened' });

// Merge into existing user
mockDb.mergeGuestToUser(existingUserId, guestForMerge);

const userAfterMerge = mockDb.getHomeTutorialState(existingUserId);
assert(userAfterMerge !== null, 'Target user should receive tutorial state');
assert(userAfterMerge.currentStep === 2, 'Target user should receive step 2');
assert(userAfterMerge.subStep === 'modal_opened', 'Target user should receive subStep');
assert(mockDb.isHomeTutorialEligible(existingUserId) === true, 'Target user should be eligible to continue');

// If target user was ALREADY completed, migration should NOT overwrite completed status
const veteranUserId = 'uuid_veteran_789';
mockDb.grantHomeTutorialEligibility(veteranUserId);
mockDb.markHomeTutorialComplete(veteranUserId);

const guestForVeteran = mockDb.createGuest('chinese', 'AnotherGuest');
mockDb.grantHomeTutorialEligibility(guestForVeteran.playerId);
mockDb.saveHomeTutorialState(guestForVeteran.playerId, { currentStep: 1, subStep: 'highlight' });

mockDb.migrateHomeTutorialState(guestForVeteran.playerId, veteranUserId);
const veteranAfterMerge = mockDb.getHomeTutorialState(veteranUserId);
assert(veteranAfterMerge.status === 'completed', 'Veteran user completed status MUST NOT be overwritten');
assert(mockDb.isHomeTutorialEligible(veteranUserId) === false, 'Veteran user must not become eligible again');

console.log('\n🎉 ALL Phase 1 Tests Passed Successfully!\n');
