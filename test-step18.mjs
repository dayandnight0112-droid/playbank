/**
 * test-step18.mjs
 * Verification script for Step 18: Answer Ledger, Question History & Memory Boss Extraction
 */

import { quizService } from './src/lib/quizService.js';

console.log('================================================================');
console.log('STEP 18 VERIFICATION: Answer Event Log, History & Memory Boss API');
console.log('================================================================\n');

const testPlayerId = 'player_hero_18';
const testChapterId = 'sej-f4-bab1';

async function testStep18() {
  // Clear any existing test history
  quizService.resetAnswerHistory(testPlayerId);

  // --------------------------------------------------------------------------
  // TEST 1: Single Answer Event Field Completeness
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Single Answer Event Recording (Field Compliance) ---');
  const res1 = await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_01',
    chapterVersion: 2,
    selectedOptionId: 'opt_correct',
    isCorrect: true,
    responseTimeMs: 1250,
    cycleNumber: 1,
    questionText: 'Siapakah pengasas Kesultanan Melayu Melaka?',
    options: [
      { id: 'opt_correct', text: 'Parameswara' },
      { id: 'opt_wrong', text: 'Tun Perak' }
    ],
    correctOptionId: 'opt_correct',
    explanation: 'Parameswara mengasaskan Melaka sekitar tahun 1400.'
  });

  const ans = res1.answer;
  console.log('  Recorded Answer Entry:');
  console.log(`    player_id:          ${ans.player_id}`);
    console.log(`    chapter_id:         ${ans.chapter_id}`);
  console.log(`    question_id:        ${ans.question_id}`);
  console.log(`    chapter_version:    ${ans.chapter_version}`);
  console.log(`    selected_option_id: ${ans.selected_option_id}`);
  console.log(`    is_correct:         ${ans.is_correct}`);
  console.log(`    response_time:      ${ans.response_time} ms`);
  console.log(`    answered_at:        ${ans.answered_at}`);
  console.log(`    cycle_number:       ${ans.cycle_number}`);

  // Validate all 9 required fields
  if (!ans.player_id || !ans.chapter_id || !ans.question_id || ans.chapter_version === undefined ||
      !ans.selected_option_id || ans.is_correct === undefined || ans.response_time === undefined ||
      !ans.answered_at || ans.cycle_number === undefined) {
    throw new Error('Incomplete answer event fields!');
  }
  console.log('  ✓ All 9 mandatory fields recorded accurately.');

  // --------------------------------------------------------------------------
  // TEST 2: Cumulative History per (player_id, question_id)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Cumulative Question History Tracking ---');
  // Attempt 1 was correct: total=1, correct=1, wrong=0, last_wrong=null
  if (res1.cumulative.total_attempts !== 1 || res1.cumulative.correct_count !== 1 || res1.cumulative.wrong_count !== 0) {
    throw new Error('Cumulative error on attempt 1!');
  }
  console.log('  ✓ Attempt 1 (Correct): total=1, correct=1, wrong=0, last_wrong_at=null');

  // Attempt 2 on same question: wrong answer
  const res2 = await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_01',
    chapterVersion: 2,
    selectedOptionId: 'opt_wrong',
    isCorrect: false,
    responseTimeMs: 2400,
    cycleNumber: 2
  });

  const cum2 = res2.cumulative;
  console.log(`  ✓ Attempt 2 (Wrong): total=${cum2.total_attempts}, correct=${cum2.correct_count}, wrong=${cum2.wrong_count}, last_wrong_at=${cum2.last_wrong_at}`);
  if (cum2.total_attempts !== 2 || cum2.correct_count !== 1 || cum2.wrong_count !== 1 || !cum2.last_wrong_at) {
    throw new Error('Cumulative error on attempt 2 (wrong answer)!');
  }

  // Attempt 3 on same question: wrong answer again
  const res3 = await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_01',
    chapterVersion: 2,
    selectedOptionId: 'opt_wrong',
    isCorrect: false,
    responseTimeMs: 1800,
    cycleNumber: 3
  });
  const cum3 = res3.cumulative;
  console.log(`  ✓ Attempt 3 (Wrong): total=${cum3.total_attempts}, correct=${cum3.correct_count}, wrong=${cum3.wrong_count}, last_wrong_at=${cum3.last_wrong_at}`);
  if (cum3.total_attempts !== 3 || cum3.correct_count !== 1 || cum3.wrong_count !== 2) {
    throw new Error('Cumulative error on attempt 3!');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Memory Boss Extraction API (Filtering & Sorting)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Memory Boss Extraction API ---');
  // Record some other questions:
  // q_sej_02: Answered correctly twice (wrong_count = 0)
  await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_02',
    questionText: 'Apakah faktor kegemilangan Melaka?',
    isCorrect: true
  });
  await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_02',
    questionText: 'Apakah faktor kegemilangan Melaka?',
    isCorrect: true
  });

  // q_sej_03: Answered wrongly once (wrong_count = 1)
  await quizService.recordAnswer({
    playerId: testPlayerId,
    chapterId: testChapterId,
    questionId: 'q_sej_03',
    questionText: 'Hukum Kanun Melaka mengandungi berapa fasal?',
    isCorrect: false
  });

  // Query wrong questions for Memory Boss
  const wrongQuestionsForBoss = quizService.getWrongQuestionsHistory(testPlayerId, testChapterId);
  console.log(`  Total wrong questions available for Memory Boss: ${wrongQuestionsForBoss.length}`);
  
  wrongQuestionsForBoss.forEach((wq, i) => {
    console.log(`    #${i + 1} [${wq.question_id}] "${wq.question_text}" | Wrong: ${wq.wrong_count} | Attempts: ${wq.total_attempts} | Last Wrong: ${wq.last_wrong_at}`);
  });

  // Verify questions where wrong_count === 0 (q_sej_02) are EXCLUDED
  const hasOnlyWrong = wrongQuestionsForBoss.every(q => q.wrong_count > 0);
  if (!hasOnlyWrong) throw new Error('Memory Boss extraction included correct questions!');
  console.log('  ✓ Verified: Zero wrong questions (like q_sej_02) are strictly excluded.');

  // Verify sorted by highest wrong count (q_sej_01 with 2 wrongs must be before q_sej_03 with 1 wrong)
  if (wrongQuestionsForBoss[0].question_id !== 'q_sej_01' || wrongQuestionsForBoss[1].question_id !== 'q_sej_03') {
    throw new Error('Memory Boss wrong questions sorting is incorrect!');
  }
  console.log('  ✓ Verified: Questions sorted by highest mistake frequency (q_sej_01 with 2 mistakes ranked #1).');

  // --------------------------------------------------------------------------
  // TEST 4: Full Answer History Ledger Query
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 4] Answer Ledger Query ---');
  const fullLedger = quizService.getAnswerHistory(testPlayerId, testChapterId);
  console.log(`  Total Answer Events in Ledger: ${fullLedger.length}`);
  if (fullLedger.length !== 6) {
    throw new Error(`Expected 6 total answers in ledger, found ${fullLedger.length}`);
  }
  console.log('  ✓ Answer ledger accurately logged all 6 historical answer events.');

  console.log('\n================================================================');
  console.log('🎉 STEP 18 VERIFICATION PASSED: Answer Ledger & Memory Boss API Verified!');
  console.log('================================================================\n');
}

testStep18().catch(err => {
  console.error('❌ Step 18 Verification Failed:', err);
  process.exit(1);
});
