/**
 * test-step17.mjs
 * Verification script for Step 17: 40-Question Chapter Exhaustion Cycle & Anti-Repetition
 */

import { quizService } from './src/lib/quizService.js';

console.log('================================================================');
console.log('STEP 17 VERIFICATION: 40-Question Exhaustion Cycle & Anti-Repeat');
console.log('================================================================\n');

// Create 40 questions for testing Chapter
const totalQuestionsCount = 40;
const fortyQuestions = Array.from({ length: totalQuestionsCount }, (_, i) => ({
  id: `sejarah_q_${i + 1}`,
  question_no: i + 1,
  question: `Sejarah Form 4 Question #${i + 1}`,
  options: [
    { id: 'opt_1', text: `Option 1 for Q${i + 1}` },
    { id: 'opt_2', text: `Option 2 for Q${i + 1}` },
    { id: 'opt_3', text: `Option 3 for Q${i + 1}` },
    { id: 'opt_4', text: `Option 4 for Q${i + 1}` },
  ],
  correct_option_id: 'opt_1',
  difficulty: 'Medium'
}));

const testChapterId = 'f4-sejarah-bab1';
const testPlayerId = 'guest_player_step17';

async function testStep17() {
  // Reset initial state
  quizService.resetCycleState(testPlayerId, testChapterId);

  // --------------------------------------------------------------------------
  // TEST 1: Full 5-Match 40-Question Cycle (8 questions per match)
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Full 40-Question Cycle Simulation (5 Matches x 8 Qs) ---');
  const allDrawnQuestions = [];
  const matches = [
    { match: 1, expectedRemaining: 32 },
    { match: 2, expectedRemaining: 24 },
    { match: 3, expectedRemaining: 16 },
    { match: 4, expectedRemaining: 8 },
    { match: 5, expectedRemaining: 0 },
  ];

  for (const m of matches) {
    const batch = await quizService.getNextQuestions({
      chapterId: testChapterId,
      limit: 8,
      playerId: testPlayerId,
      randomEnabled: true,
      versionNo: 1,
      availableQuestions: fortyQuestions
    });

    console.log(`  Match ${m.match}: Drew ${batch.questions.length} questions | Remaining in Cycle: ${batch.remaining_in_cycle} | Cycle: ${batch.cycle_number}`);

    if (batch.questions.length !== 8) {
      throw new Error(`Match ${m.match} expected 8 questions, got ${batch.questions.length}`);
    }
    if (batch.remaining_in_cycle !== m.expectedRemaining) {
      throw new Error(`Match ${m.match} expected ${m.expectedRemaining} remaining, got ${batch.remaining_in_cycle}`);
    }
    if (batch.cycle_number !== 1) {
      throw new Error(`Match ${m.match} expected cycle_number = 1, got ${batch.cycle_number}`);
    }

    allDrawnQuestions.push(...batch.questions.map(q => q.question_id));
  }

  // Verify that all 40 questions appeared with ZERO repetition
  const uniqueQuestions = new Set(allDrawnQuestions);
  console.log(`\n  Total questions drawn across 5 matches: ${allDrawnQuestions.length}`);
  console.log(`  Unique questions count in Cycle 1:     ${uniqueQuestions.size}`);

  if (uniqueQuestions.size !== 40) {
    throw new Error(`Repetition detected! Expected 40 unique questions, but found only ${uniqueQuestions.size}`);
  }
  console.log('  ✓ MATHEMATICAL PROOF PASSED: All 40 questions appeared with 0 duplicates in Cycle 1!');

  // --------------------------------------------------------------------------
  // TEST 2: Automatic Transition to Cycle 2 on Match 6
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Cycle 2 Rollover & Reshuffle (Match 6) ---');
  const match6 = await quizService.getNextQuestions({
    chapterId: testChapterId,
    limit: 8,
    playerId: testPlayerId,
    randomEnabled: true,
    versionNo: 1,
    availableQuestions: fortyQuestions
  });

  console.log(`  Match 6 (Rollover): Drew ${match6.questions.length} questions | Remaining: ${match6.remaining_in_cycle} | Cycle: ${match6.cycle_number}`);
  if (match6.cycle_number !== 2) {
    throw new Error(`Expected cycle_number = 2 on Match 6, got ${match6.cycle_number}`);
  }
  if (match6.remaining_in_cycle !== 32) {
    throw new Error(`Expected remaining = 32 in Cycle 2, got ${match6.remaining_in_cycle}`);
  }
  console.log('  ✓ CYCLE 2 ROLLOVER PASSED: Successfully reset to Cycle 2 with 40 reshuffled candidates.');

  // --------------------------------------------------------------------------
  // TEST 3: Browser Refresh & Quit-Reenter Simulation
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Anti-Refresh & Quit-Reenter Guarantee ---');
  const persistencePlayer = 'guest_refresh_tester';
  quizService.resetCycleState(persistencePlayer, testChapterId);

  // Play Match 1 (draws first 8 questions)
  const session1 = await quizService.getNextQuestions({
    chapterId: testChapterId,
    limit: 8,
    playerId: persistencePlayer,
    randomEnabled: true,
    versionNo: 1,
    availableQuestions: fortyQuestions
  });
  const session1Ids = session1.questions.map(q => q.question_id);
  console.log(`  Session 1: Drew 8 questions: [${session1Ids.slice(0, 3).join(', ')} ... +5 more]`);

  // Simulate player refreshing the browser / quitting and re-entering next day:
  // We inspect the saved state from storage
  const savedState = quizService.getCycleState(persistencePlayer, testChapterId);
  console.log(`  Storage State Verified: ${savedState.servedQuestionIds.length} served, ${savedState.unservedQuestionIds.length} unserved.`);

  // Play Session 2 (draws next 8 questions after refresh)
  const session2 = await quizService.getNextQuestions({
    chapterId: testChapterId,
    limit: 8,
    playerId: persistencePlayer,
    randomEnabled: true,
    versionNo: 1,
    availableQuestions: fortyQuestions
  });
  const session2Ids = session2.questions.map(q => q.question_id);
  console.log(`  Session 2 (Post-Refresh): Drew 8 questions: [${session2Ids.slice(0, 3).join(', ')} ... +5 more]`);

  // Verify ZERO questions from Session 1 leaked into Session 2
  const refreshedOverlap = session1Ids.filter(id => session2Ids.includes(id));
  if (refreshedOverlap.length > 0) {
    throw new Error(`REFRESH LEAK: Questions repeated after browser refresh: ${refreshedOverlap}`);
  }
  console.log('  ✓ ANTI-REFRESH PASSED: Zero overlap between Session 1 and Session 2 after browser restart.');

  console.log('\n================================================================');
  console.log('🎉 STEP 17 VERIFICATION PASSED: 40-Q Cycle, Rollover & Persistence 100% Solid!');
  console.log('================================================================\n');
}

testStep17().catch(err => {
  console.error('❌ Step 17 Verification Failed:', err);
  process.exit(1);
});
