import { safeGetJSON, safeSetJSON } from './mockDb.js';
import { BOSS_TYPE_KEYS, getEnabledBossTypes, getBossTypeConfig } from '../data/bossTypes.js';
import { createBossEncounter } from '../data/bossRegistry.js';
import { quizService } from './quizService.js';
import { playerAuthService } from './playerAuthService.js';

/**
 * Safety switch: Set to false to safely disable Boss Battles while keeping all code,
 * assets, and models 100% intact for future reactivation.
 */
export const ENABLE_BOSS_BATTLE = false;

/**
 * Evaluates whether a Boss Encounter should be triggered after a normal quiz
 * and draws genuine, unserved questions from Supabase for the Boss Battle.
 *
 * Rules:
 * 1. Only enabled Boss Types are considered (currently strictly SPEED).
 * 2. Requires a valid chapter UUID from Supabase.
 * 3. Strict Cycle Rule: Boss can ONLY draw questions that have not yet appeared in the current cycle.
 *    If remainingInCycle < requiredCount (10), safe fallback: do NOT trigger Boss.
 * 4. Server-Authoritative: Questions fetched via get_next_questions RPC contain zero correct answers/explanations.
 */
export const evaluateBossTrigger = async ({
  chapterId,
  subjectId,
  subjectTitle,
  form = 4,
  chapter = 1,
  quizStats = null,
  cycleInfo = null,
  currentUser = null,
  forceTrigger = false
}) => {
  // Safe Bypass: If Boss Battle is disabled, immediately bypass without deleting any logic
  if (!ENABLE_BOSS_BATTLE) {
    return {
      shouldTrigger: false,
      reason: 'boss_temporarily_disabled',
      encounter: null,
      questions: []
    };
  }

  // 1. Get enabled Boss Types (Production safety guard)
  const enabledTypes = getEnabledBossTypes();
  const speedTypeAvailable = enabledTypes.some(t => t.type === BOSS_TYPE_KEYS.SPEED);

  if (!speedTypeAvailable) {
    return {
      shouldTrigger: false,
      reason: 'speed_boss_disabled',
      encounter: null,
      questions: []
    };
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!chapterId || !UUID_REGEX.test(chapterId)) {
    console.warn(`[BossTrigger] Invalid or missing chapter UUID: ${chapterId}. Boss cannot be triggered.`);
    return {
      shouldTrigger: false,
      reason: 'invalid_chapter_uuid',
      encounter: null,
      questions: []
    };
  }

  const requiredCount = getBossTypeConfig(BOSS_TYPE_KEYS.SPEED)?.questionCount || 10;
  const remainingInCycle = cycleInfo?.remainingInCycle;

  // 2. Strict Cycle Rule: If unserved questions in current cycle < 10, DO NOT trigger Boss!
  if (remainingInCycle !== undefined && remainingInCycle !== null && remainingInCycle < requiredCount && !forceTrigger) {
    console.warn(
      `[BossTrigger] Insufficient unserved questions in current cycle (${remainingInCycle}/${requiredCount}) for chapter: ${chapterId}. Safe fallback active: Boss not triggered.`
    );
    return {
      shouldTrigger: false,
      reason: 'insufficient_cycle_questions',
      availableCount: remainingInCycle,
      requiredCount,
      chapterId,
      encounter: null,
      questions: []
    };
  }

  // 3. Draw genuine unserved questions from Supabase via get_next_questions RPC
  try {
    const authUserId = await playerAuthService.getAuthUserId();
    const playerId = (currentUser?.id && currentUser.id !== 'guest') ? currentUser.id : authUserId;

    const batch = await quizService.getNextQuestions({
      chapterId,
      limit: requiredCount,
      playerId,
      randomEnabled: true
    });

    const questions = batch?.questions || [];

    if (questions.length < requiredCount) {
      console.warn(
        `[BossTrigger] Insufficient questions returned from cloud RPC (${questions.length}/${requiredCount}) for chapter: ${chapterId}. Safe fallback active: Boss not triggered.`
      );
      return {
        shouldTrigger: false,
        reason: 'insufficient_questions',
        availableCount: questions.length,
        requiredCount,
        chapterId,
        encounter: null,
        questions: []
      };
    }

    // 4. Console Evidence Logging
    console.log(`[BossTrigger] Boss Encounter Ready!
- Source: Supabase RPC (get_next_questions)
- Chapter ID (UUID): ${chapterId}
- Subject: ${subjectTitle || subjectId || 'Subject'} (Form ${form})
- Questions Fetched: ${questions.length} (Cycle ${batch.cycle_number}, remaining: ${batch.remaining_in_cycle})
- Trigger Result: SUCCESS`);

    // 5. Build Decoupled Encounter
    const encounter = createBossEncounter('chrono_lynx', BOSS_TYPE_KEYS.SPEED, {
      metadata: {
        chapterId,
        subjectId,
        subjectTitle,
        form,
        chapter,
        triggeredAt: new Date().toISOString()
      }
    });

    // 6. Pre-create dedicated Boss game session so submit_answer RPC has session ID ready immediately
    let bossSessionId = null;
    try {
      const created = await quizService.createGameSession({
        chapterId,
        totalQuestions: requiredCount,
        chapterTitle: `Boss Battle - ${subjectTitle || subjectId || 'Boss'}`
      });
      bossSessionId = created?.id || created?.session?.id || null;
    } catch (sErr) {
      console.warn('[BossTrigger] Could not pre-create boss session:', sErr);
    }

    // Update trigger state history
    const triggerHistory = safeGetJSON('playbank_boss_trigger_state', { totalTriggers: 0, lastTriggerAt: null });
    safeSetJSON('playbank_boss_trigger_state', {
      totalTriggers: (triggerHistory.totalTriggers || 0) + 1,
      lastTriggerAt: new Date().toISOString(),
      lastSubject: subjectTitle || subjectId,
      lastChapterId: chapterId,
      lastForm: form
    });

    return {
      shouldTrigger: true,
      bossType: BOSS_TYPE_KEYS.SPEED,
      bossId: 'chrono_lynx',
      encounter,
      questions,
      chapterId,
      sessionId: bossSessionId,
      subject: subjectTitle || subjectId,
      form,
      chapter,
      cycleNumber: batch.cycle_number,
      remainingInCycle: batch.remaining_in_cycle
    };
  } catch (err) {
    console.error(`[BossTrigger] Error fetching Boss questions for chapter ${chapterId}:`, err);
    return {
      shouldTrigger: false,
      reason: 'rpc_fetch_error',
      error: err.message,
      encounter: null,
      questions: []
    };
  }
};
