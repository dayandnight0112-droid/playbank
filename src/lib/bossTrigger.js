import { mockDb, safeGetJSON, safeSetJSON } from './mockDb.js';
import { BOSS_TYPE_KEYS, getEnabledBossTypes, getBossTypeConfig } from '../data/bossTypes.js';
import { createBossEncounter } from '../data/bossRegistry.js';

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

/**
 * Normalizes subject string/id into matching keywords
 */
export const normalizeSubjectName = (subject) => {
  if (!subject) return '';
  const str = String(subject).toLowerCase();
  if (str === '1' || str.includes('history') || str.includes('sejarah')) return 'sejarah';
  if (str === '2' || str.includes('science') || str.includes('sains')) return 'science';
  if (str === '3' || str.includes('math')) return 'mathematics';
  return str;
};

/**
 * Filter questions from question bank matching active subject and form
 */
export const getMatchingQuestions = (subject, form = 4) => {
  const allQuestions = mockDb.getQuestions();
  const normalizedSubj = normalizeSubjectName(subject);
  const formNum = Number(form) || 4;

  const matched = allQuestions.filter(q => {
    // 1. Check form
    const matchesForm = (q.form && Number(q.form) === formNum) ||
      (q.subject && q.subject.includes(String(formNum)));
    if (!matchesForm) return false;

    // 2. Check subject
    const qSubj = (q.subject || '').toLowerCase();
    const qSubjName = (q.subjectName || '').toLowerCase();

    if (normalizedSubj === 'sejarah') {
      return qSubj.includes('sejarah') || qSubjName.includes('history');
    }
    if (normalizedSubj === 'science') {
      return qSubj.includes('science') || qSubjName.includes('science') || qSubj.includes('sains');
    }
    if (normalizedSubj === 'mathematics') {
      return qSubj.includes('math') || qSubjName.includes('math');
    }

    return qSubj.includes(normalizedSubj) || qSubjName.includes(normalizedSubj);
  });

  return matched;
};

/**
 * Evaluates whether a Boss Encounter should be triggered after a normal quiz.
 * 
 * Rules:
 * 1. Only enabled Boss Types are considered (currently strictly SPEED).
 * 2. Questions must match current subject/form.
 * 3. Safe fallback: if matched questions < 8, do NOT trigger.
 * 4. Generates 8 normalized questions ready for BossBattle.
 * 
 * @param {Object} params
 * @param {string|number} params.subject - Active subject
 * @param {number} params.form - Active form
 * @param {number} [params.chapter=1] - Active chapter
 * @param {Object} [params.quizStats] - Quiz performance stats
 * @param {Object} [params.currentUser] - Current user/session
 * @param {boolean} [params.forceTrigger=false] - Testing override
 * @returns {Object} Trigger evaluation result
 */
export const evaluateBossTrigger = ({
  subject = 'History',
  form = 4,
  chapter = 1,
  quizStats = null,
  currentUser = null,
  forceTrigger = false
}) => {
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

  // 2. Pull available questions for current subject/form
  const matchedQuestions = getMatchingQuestions(subject, form);
  const requiredCount = getBossTypeConfig(BOSS_TYPE_KEYS.SPEED)?.questionCount || 8;

  // Safe fallback: if fewer than 8 questions exist in the pool, DO NOT trigger!
  if (matchedQuestions.length < requiredCount) {
    console.warn(`[BossTrigger] Insufficient questions (${matchedQuestions.length}/${requiredCount}) for subject: ${subject}, form: ${form}. Safe fallback active.`);
    return {
      shouldTrigger: false,
      reason: 'insufficient_questions',
      availableCount: matchedQuestions.length,
      requiredCount,
      encounter: null,
      questions: []
    };
  }

  // 3. Trigger Condition Check
  const triggerHistory = safeGetJSON('playbank_boss_trigger_state', { totalTriggers: 0, lastTriggerAt: null });
  
  // Step 11: Enabled trigger upon successful quiz completion (or forceTrigger)
  const shouldTrigger = true;

  if (!shouldTrigger && !forceTrigger) {
    return {
      shouldTrigger: false,
      reason: 'condition_not_met',
      encounter: null,
      questions: []
    };
  }

  // 4. Draw 8 genuine questions from current subject pool
  const shuffled = shuffleArray(matchedQuestions).slice(0, requiredCount);
  const normalizedQuestions = shuffled.map(q => {
    const options = q.options || shuffleArray([q.correctAnswer, ...q.incorrectAnswers]);
    const correctIndex = options.indexOf(q.correctAnswer);
    return {
      ...q,
      subject: q.subject || `${subject} Form ${form}`,
      chapter: q.chapter || chapter || 1,
      options,
      correctIndex
    };
  });

  // 5. Build Decoupled Encounter (Boss Character = Chrono Lynx, Boss Type = SPEED)
  const encounter = createBossEncounter('chrono_lynx', BOSS_TYPE_KEYS.SPEED, {
    metadata: {
      subject,
      form,
      chapter,
      triggeredAt: new Date().toISOString()
    }
  });

  // Update trigger state
  safeSetJSON('playbank_boss_trigger_state', {
    totalTriggers: (triggerHistory.totalTriggers || 0) + 1,
    lastTriggerAt: new Date().toISOString(),
    lastSubject: subject,
    lastForm: form
  });

  return {
    shouldTrigger: true,
    bossType: BOSS_TYPE_KEYS.SPEED,
    bossId: 'chrono_lynx',
    encounter,
    questions: normalizedQuestions,
    subject,
    form,
    chapter
  };
};
