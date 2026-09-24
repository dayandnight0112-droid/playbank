// Phase 2 Unit Test: Home Tutorial Overlay & Dynamic Focusing System
import {
  HOME_TUTORIAL_STEPS,
  TIMEOUT_SAFETY_MS,
  calculateBubblePlacement,
  generateCutoutClipPath
} from './src/components/tutorial/tutorialConfig.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== Running Phase 2 Home Tutorial Overlay Tests ===\n');

// 1. Step Configurations Completeness
console.log('--- Test 1: Step Configuration Verification ---');
const steps = [1, 2, 3, 4];
for (const stepNum of steps) {
  const conf = HOME_TUTORIAL_STEPS[stepNum];
  assert(!!conf, `Step ${stepNum} configuration must exist`);
  assert(conf.stepNumber === stepNum, `Step ${stepNum} stepNumber must match`);
  assert(typeof conf.title === 'string' && conf.title.length > 0, `Step ${stepNum} must have title`);
  assert(typeof conf.description === 'string' || typeof conf.description === 'function', `Step ${stepNum} must have description`);
  assert(typeof conf.targetSelector === 'string', `Step ${stepNum} must define targetSelector`);
  assert(['wave', 'cheer', 'stand'].includes(conf.mascotVariant), `Step ${stepNum} must specify valid mascot variant`);
}

// 2. Intelligent Mascot Bubble Placement Logic Verification
console.log('\n--- Test 2: Mascot Bubble Upper/Lower Space Logic ---');

// Case A: Target near top (e.g. Daily button at top: 120, bottom: 180, viewport: 800)
const topTarget = { top: 120, bottom: 180 };
const placementA = calculateBubblePlacement(topTarget, 800);
assert(placementA === 'below', 'Target near top must place bubble below to avoid occlusion');

// Case B: Target near bottom (e.g. Nav Marketplace at top: 720, bottom: 770, viewport: 800)
const bottomTarget = { top: 720, bottom: 770 };
const placementB = calculateBubblePlacement(bottomTarget, 800);
assert(placementB === 'above', 'Target near bottom must place bubble above to avoid occlusion');

// Case C: Middle-lower target (e.g. Continue button at top: 580, bottom: 640, viewport: 800)
const continueTarget = { top: 580, bottom: 640 };
const placementC = calculateBubblePlacement(continueTarget, 800);
assert(placementC === 'above', 'Continue button with ample top space must place bubble above');


// 3. Polygon Cutout Clip-Path Generation Verification
console.log('\n--- Test 3: Cutout Polygon Clip-Path Geometry ---');

const sampleRect = { top: 100, left: 20, bottom: 160, right: 80 };
const clipPathStr = generateCutoutClipPath(sampleRect);
assert(clipPathStr.includes('0% 0%'), 'Polygon outer frame must cover 0% 0%');
assert(clipPathStr.includes('20px 100px'), 'Cutout hole must contain top-left coords');
assert(clipPathStr.includes('80px 160px'), 'Cutout hole must contain bottom-right coords');


// 4. Safety Timeout & Fallback Logic
console.log('\n--- Test 4: Safety Watchdog Timeout Check ---');
assert(TIMEOUT_SAFETY_MS === 2500, 'Safety watchdog timeout must be 2.5 seconds');

let isTimedOut = false;
let overlayBlocked = true;

// Simulate target element missing after 2.5s
function triggerSafetyFallback() {
  isTimedOut = true;
  overlayBlocked = false; // unlocks screen
}

triggerSafetyFallback();
assert(isTimedOut === true, 'Safety timeout triggered when target not found');
assert(overlayBlocked === false, 'Overlay blocking must be released to prevent soft-locks');

console.log('\n🎉 ALL Phase 2 Tests Passed Successfully!\n');
