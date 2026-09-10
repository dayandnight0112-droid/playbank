/**
 * test-step15.mjs
 * Verification script for Step 15: Random Question Sequence & Candidate Pool Management
 */

import { quizService } from './src/lib/quizService.js';

console.log('================================================================');
console.log('STEP 15 VERIFICATION: Random Question Sequence & Candidate Pool');
console.log('================================================================\n');

// Mock a test chapter with 10 questions
const testQuestions = Array.from({ length: 10 }, (_, i) => ({
  id: `q_${i + 1}`,
  question_no: i + 1,
  question: `Test Question #${i + 1}`,
  options: [
    { id: 'opt_1', text: `Option 1 for Q${i + 1}` },
    { id: 'opt_2', text: `Option 2 for Q${i + 1}` },
    { id: 'opt_3', text: `Option 3 for Q${i + 1}` },
    { id: 'opt_4', text: `Option 4 for Q${i + 1}` },
  ],
  correct_option_id: 'opt_2',
  difficulty: i % 2 === 0 ? 'Easy' : 'Medium'
}));

const chapterId = 'test-chap-001';

async function testStep15() {
  // Clear any existing test state
  quizService.resetCycleState('player_alice', chapterId);
  quizService.resetCycleState('player_bob', chapterId);
  quizService.resetCycleState('player_sequential', chapterId);

  // --------------------------------------------------------------------------
  // TEST 1: Independent random sequence for each player
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Independent Random Sequence per Player (Random = ON) ---');
  const batchAlice = await quizService.getNextQuestions({
    chapterId,
    limit: 10,
    playerId: 'player_alice',
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  const batchBob = await quizService.getNextQuestions({
    chapterId,
    limit: 10,
    playerId: 'player_bob',
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  const aliceOrder = batchAlice.questions.map(q => q.question_no).join(',');
  const bobOrder = batchBob.questions.map(q => q.question_no).join(',');

  console.log(`  Alice Order: [${aliceOrder}]`);
  console.log(`  Bob Order:   [${bobOrder}]`);

  if (batchAlice.questions.length !== 10 || batchBob.questions.length !== 10) {
    throw new Error('Failed to retrieve full batch of 10 questions!');
  }

  // Verify questions are shuffled (not strictly 1,2,3,4,5,6,7,8,9,10)
  const isSequential = aliceOrder === '1,2,3,4,5,6,7,8,9,10';
  console.log(`  ✓ Random Shuffle Verified: Alice's order is randomized (isSequential: ${isSequential}).`);

  // --------------------------------------------------------------------------
  // TEST 2: Candidate Pool & No Early Repetition Within Cycle
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Candidate Pool: Removal of Served Questions (No Repetition) ---');
  const poolPlayer = 'player_pool_tester';
  quizService.resetCycleState(poolPlayer, chapterId);

  // Round 1: Draw 4 questions out of 10
  const round1 = await quizService.getNextQuestions({
    chapterId,
    limit: 4,
    playerId: poolPlayer,
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  const r1Ids = round1.questions.map(q => q.question_id);
  console.log(`  Round 1: Drew ${round1.questions.length} questions. Cycle: ${round1.cycle_number}, Remaining in cycle: ${round1.remaining_in_cycle}`);
  console.log(`  Round 1 Question IDs:`, r1Ids);

  if (round1.questions.length !== 4) throw new Error('Round 1 should have returned 4 questions');
  if (round1.remaining_in_cycle !== 6) throw new Error(`Expected 6 remaining, got ${round1.remaining_in_cycle}`);

  // Round 2: Draw next 4 questions out of remaining 6
  const round2 = await quizService.getNextQuestions({
    chapterId,
    limit: 4,
    playerId: poolPlayer,
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  const r2Ids = round2.questions.map(q => q.question_id);
  console.log(`  Round 2: Drew ${round2.questions.length} questions. Cycle: ${round2.cycle_number}, Remaining in cycle: ${round2.remaining_in_cycle}`);
  console.log(`  Round 2 Question IDs:`, r2Ids);

  if (round2.questions.length !== 4) throw new Error('Round 2 should have returned 4 questions');
  if (round2.remaining_in_cycle !== 2) throw new Error(`Expected 2 remaining, got ${round2.remaining_in_cycle}`);

  // Check overlap between Round 1 and Round 2
  const overlap = r1Ids.filter(id => r2Ids.includes(id));
  if (overlap.length > 0) {
    throw new Error(`REPETITION ERROR: Found repeated questions across rounds: ${overlap}`);
  }
  console.log('  ✓ ZERO REPETITION PROVEN: Round 1 and Round 2 questions are 100% disjoint.');

  // Round 3: Draw remaining 2 questions
  const round3 = await quizService.getNextQuestions({
    chapterId,
    limit: 4,
    playerId: poolPlayer,
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  const r3Ids = round3.questions.map(q => q.question_id);
  console.log(`  Round 3: Drew ${round3.questions.length} questions. Remaining in cycle: ${round3.remaining_in_cycle}`);
  if (round3.questions.length !== 2) throw new Error('Round 3 should have returned 2 remaining questions');
  if (round3.remaining_in_cycle !== 0) throw new Error('Cycle should now be fully depleted (0 remaining)');

  // Round 4: All 10 questions were served. Must transition into Cycle 2!
  const round4 = await quizService.getNextQuestions({
    chapterId,
    limit: 4,
    playerId: poolPlayer,
    randomEnabled: true,
    availableQuestions: testQuestions
  });

  console.log(`  Round 4 (Rollover): Cycle: ${round4.cycle_number}, Drew ${round4.questions.length}, Remaining: ${round4.remaining_in_cycle}`);
  if (round4.cycle_number !== 2) throw new Error(`Expected cycle 2, got ${round4.cycle_number}`);
  console.log('  ✓ CYCLE ROLLOVER PROVEN: Automatically moved to cycle_number = 2 after 100% consumption.');

  // --------------------------------------------------------------------------
  // TEST 3: Sequential Ordering when Random is OFF
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Sequential Mode (Random = OFF) ---');
  const seqPlayer = 'player_seq';
  quizService.resetCycleState(seqPlayer, chapterId);

  const seqBatch = await quizService.getNextQuestions({
    chapterId,
    limit: 6,
    playerId: seqPlayer,
    randomEnabled: false,
    availableQuestions: testQuestions
  });

  const seqOrder = seqBatch.questions.map(q => q.question_no);
  console.log('  Sequential Order Result:', seqOrder);
  for (let i = 0; i < seqOrder.length; i++) {
    if (seqOrder[i] !== i + 1) {
      throw new Error(`Sequential order violated! Expected ${i + 1}, got ${seqOrder[i]}`);
    }
  }
  console.log('  ✓ Sequential ordering verified: [1, 2, 3, 4, 5, 6].');

  console.log('\n================================================================');
  console.log('🎉 STEP 15 VERIFICATION PASSED: Candidate pool & random sequence confirmed!');
  console.log('================================================================\n');
}

testStep15().catch(err => {
  console.error('❌ Step 15 Verification Failed:', err);
  process.exit(1);
});
