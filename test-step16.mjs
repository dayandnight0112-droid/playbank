/**
 * test-step16.mjs
 * Verification script for Step 16: Shuffled Option Positions & Option ID Evaluation
 */

import { quizService } from './src/lib/quizService.js';

console.log('================================================================');
console.log('STEP 16 VERIFICATION: Option Shuffling & Option ID Grading');
console.log('================================================================\n');

async function testStep16() {
  // Define a canonical set of 4 options with fixed IDs
  const fixedOptions = [
    { id: 'opt_a', text: 'Parameswara' },
    { id: 'opt_b', text: 'Tun Perak' },
    { id: 'opt_c', text: 'Hang Tuah' },
    { id: 'opt_d', text: 'Sultan Mahmud Shah' }
  ];

  // --------------------------------------------------------------------------
  // TEST 1: Fixed Option IDs preserved + Random Shuffling + Letter Assignment
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Fixed IDs Preserved & Post-Shuffle Labeling ---');
  const labeled = quizService.shuffleAndLabelOptions(fixedOptions);

  console.log('  Shuffled & Labeled Output:');
  labeled.forEach(opt => {
    console.log(`    Letter: ${opt.letter} (Index: ${opt.displayIndex}) | Option ID: ${opt.id} | Text: "${opt.text}"`);
  });

  if (labeled.length !== 4) throw new Error('Expected 4 options in shuffled output');
  const letters = labeled.map(o => o.letter).join('');
  if (letters !== 'ABCD') throw new Error(`Expected letters ABCD, got: ${letters}`);

  const uniqueIds = new Set(labeled.map(o => o.id));
  if (uniqueIds.size !== 4) throw new Error('Option IDs were corrupted or duplicated during shuffling!');
  console.log('  ✓ Verified: Letters A, B, C, D assigned strictly AFTER shuffling, all 4 original IDs preserved.');

  // --------------------------------------------------------------------------
  // TEST 2: Four Mandatory Position Cases (Correct answer originally at A, B, C, D)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Mandatory 4 Cases (Correct Answer Originally at A, B, C, D) ---');

  const testCases = [
    { name: 'Case A: Correct answer originally at Index 0 (opt_a)', correctId: 'opt_a' },
    { name: 'Case B: Correct answer originally at Index 1 (opt_b)', correctId: 'opt_b' },
    { name: 'Case C: Correct answer originally at Index 2 (opt_c)', correctId: 'opt_c' },
    { name: 'Case D: Correct answer originally at Index 3 (opt_d)', correctId: 'opt_d' },
  ];

  for (const tc of testCases) {
    console.log(`\n  Running [${tc.name}]:`);

    // Shuffle options
    const presentation = quizService.shuffleAndLabelOptions(fixedOptions);
    const correctDisplay = presentation.find(o => o.id === tc.correctId);

    console.log(`    Target Correct ID: ${tc.correctId}`);
    console.log(`    Landed on visual position: "${correctDisplay.letter}" (display index ${correctDisplay.displayIndex})`);

    // 1. Submit the correct option by its Option ID
    const correctSubmission = quizService.evaluateAnswer({
      selectedOptionId: correctDisplay.id,
      correctOptionId: tc.correctId
    });

    if (!correctSubmission.isCorrect) {
      throw new Error(`Grading failure: Selected correct option ${correctDisplay.id} but received isCorrect = false!`);
    }
    console.log(`    ✓ Player clicked "${correctDisplay.letter}" (ID: ${correctDisplay.id}) -> Evaluated: CORRECT (true)`);

    // 2. Submit every other wrong option
    const wrongOptions = presentation.filter(o => o.id !== tc.correctId);
    for (const wrongOpt of wrongOptions) {
      const wrongSubmission = quizService.evaluateAnswer({
        selectedOptionId: wrongOpt.id,
        correctOptionId: tc.correctId
      });
      if (wrongSubmission.isCorrect) {
        throw new Error(`Grading failure: Selected wrong option ${wrongOpt.id} but received isCorrect = true!`);
      }
    }
    console.log(`    ✓ Submitting remaining 3 wrong options (${wrongOptions.map(w => `${w.letter}:${w.id}`).join(', ')}) -> Evaluated: WRONG (false)`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Proof that grading does NOT depend on visual letter (A/B/C/D)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Independence from Visual Letters (Anti-Letter-Locking Proof) ---');
  // Scenario: Question correctOptionId is 'opt_c'.
  // Player picks button visually labeled 'A', which holds 'opt_c'.
  const mockOptions = [
    { id: 'opt_c', text: 'Correct Answer', letter: 'A', displayIndex: 0 },
    { id: 'opt_a', text: 'Wrong 1', letter: 'B', displayIndex: 1 },
    { id: 'opt_b', text: 'Wrong 2', letter: 'C', displayIndex: 2 },
    { id: 'opt_d', text: 'Wrong 3', letter: 'D', displayIndex: 3 },
  ];

  const evalA = quizService.evaluateAnswer({
    selectedOptionId: mockOptions[0].id, // 'opt_c'
    correctOptionId: 'opt_c'
  });

  if (!evalA.isCorrect) throw new Error('Letter independence failed!');
  console.log('  ✓ Option "opt_c" at visual position "A" evaluated correctly as TRUE.');

  // If a naive system evaluated option at position 'C' (which is 'opt_b') as correct because letter was 'C':
  const evalC = quizService.evaluateAnswer({
    selectedOptionId: mockOptions[2].id, // 'opt_b'
    correctOptionId: 'opt_c'
  });
  if (evalC.isCorrect) throw new Error('Visual letter false positive detected!');
  console.log('  ✓ Option at visual position "C" (holds "opt_b") evaluated strictly as FALSE (no letter confusion).');

  console.log('\n================================================================');
  console.log('🎉 STEP 16 VERIFICATION PASSED: All 4 position cases & Option ID grading verified!');
  console.log('================================================================\n');
}

testStep16().catch(err => {
  console.error('❌ Step 16 Verification Failed:', err);
  process.exit(1);
});
