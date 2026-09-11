/**
 * quizService.js
 * Service for Player Game Client (Part C: Steps 14 - 18)
 * 
 * Strict Read-Only Contract:
 * - Reads ONLY from public.published_chapters security view.
 * - Chapters in 'draft' or 'archived' status are completely excluded.
 * - Respects current version snapshots and question counts.
 * 
 * Step 15: Random Question Sequence & Candidate Pool Management:
 * - When Random is ON: Generates player-specific independent random sequence.
 * - Unserved question pool managed by player_id + chapter_id + cycle_number.
 * - Questions served are removed from unserved pool to prevent early repetition.
 */

import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { playerAuthService } from './playerAuthService.js';

export const FALLBACK_GRADES = [
  { id: 'year-1', name: 'Year 1', level: 'primary', order: 1 },
  { id: 'year-2', name: 'Year 2', level: 'primary', order: 2 },
  { id: 'year-3', name: 'Year 3', level: 'primary', order: 3 },
  { id: 'year-4', name: 'Year 4', level: 'primary', order: 4 },
  { id: 'year-5', name: 'Year 5', level: 'primary', order: 5 },
  { id: 'year-6', name: 'Year 6', level: 'primary', order: 6 },
  { id: 'form-1', name: 'Form 1', level: 'secondary', order: 7 },
  { id: 'form-2', name: 'Form 2', level: 'secondary', order: 8 },
  { id: 'form-3', name: 'Form 3', level: 'secondary', order: 9 },
  { id: 'form-4', name: 'Form 4', level: 'secondary', order: 10 },
  { id: 'form-5', name: 'Form 5', level: 'secondary', order: 11 },
];

export const FALLBACK_SUBJECTS = [
  { id: 'sejarah', title: 'Sejarah', iconType: 'landmark', titleZh: '历史' },
  { id: 'science', title: 'Science', iconType: 'microscope', titleZh: '科学' },
  { id: 'bm', title: 'Bahasa Melayu', iconType: 'book', titleZh: '马来文' },
  { id: 'english', title: 'English', iconType: 'languages', titleZh: '英文' },
  { id: 'chinese', title: 'Chinese', iconType: 'pen-tool', titleZh: '华文' },
  { id: 'math', title: 'Mathematics', iconType: 'calculator', titleZh: '数学', planning: true },
];

/**
 * Robust pseudo-random UUID generator
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Fisher-Yates shuffle with true uniform distribution
 */
export const shuffleArray = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const quizService = {
  /**
   * Step 16: Shuffle Options and Map to Visual Letters A, B, C, D
   * 
   * Process:
   * 1. Reads 4 fixed option objects with persistent option IDs.
   * 2. Shuffles the 4 options randomly (Fisher-Yates).
   * 3. Assigns visual letters 'A', 'B', 'C', 'D' only AFTER shuffling.
   * 4. Returns display options array preserving original fixed IDs.
   */
  shuffleAndLabelOptions(options) {
    if (!Array.isArray(options) || options.length === 0) return [];
    
    // Normalize to { id, text }
    const normalized = options.map((opt, i) => {
      if (typeof opt === 'string') {
        return { id: `opt_${i + 1}`, text: opt };
      }
      return { id: String(opt.id || `opt_${i + 1}`), text: String(opt.text || '') };
    });

    // Step 16.2: Random shuffle
    const shuffled = shuffleArray(normalized);

    // Step 16.3: Assign A, B, C, D after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      letter: String.fromCharCode(65 + idx), // A, B, C, D
      displayIndex: idx
    }));
  },

  /**
   * Step 16: Authoritative Answer Evaluation by Option ID
   * 
   * Strictly compares selectedOptionId with correctOptionId.
   * Never evaluates based on visual letter position (A/B/C/D).
   */
  evaluateAnswer({ selectedOptionId, correctOptionId }) {
    if (!selectedOptionId || !correctOptionId) {
      return { isCorrect: false, correctOptionId };
    }
    const isCorrect = String(selectedOptionId).trim() === String(correctOptionId).trim();
    return {
      isCorrect,
      correctOptionId
    };
  },
  /**
   * Step 14: Get all 11 grades
   */
  async getGrades() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(g => ({
            id: g.id,
            name: g.name,
            level: g.education_level || (g.id.startsWith('year') ? 'primary' : 'secondary'),
            order: g.display_order,
          }));
        }
      } catch (err) {
        console.warn('[quizService] Failed to load grades from Supabase, using fallback:', err.message);
      }
    }
    return FALLBACK_GRADES;
  },

  /**
   * Step 14: Get active subjects
   */
  async getSubjects() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(s => ({
            id: s.id,
            title: s.title_en || s.id,
            titleZh: s.title_zh,
            iconType: s.icon_type,
            planning: s.id === 'math' || s.id === 'mathematics',
          }));
        }
      } catch (err) {
        console.warn('[quizService] Failed to load subjects from Supabase, using fallback:', err.message);
      }
    }
    return FALLBACK_SUBJECTS;
  },

  /**
   * Step 14: Query Published Chapters
   * Strict security view usage: SELECT * FROM public.published_chapters
   * Guarantees:
   * - ONLY published chapters are returned.
   * - Draft and archived chapters are completely filtered out.
   * - Returns chapter_id, bab_number, title, version_no, question_count, random_questions.
   */
  async getPublishedChapters(gradeId, subjectId) {
    if (!gradeId || !subjectId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const normalizedSubjectId = (subjectId === 'math' || subjectId === 'mathematics')
          ? 'math'
          : (subjectId === 'history' ? 'sejarah' : subjectId);

        let query = supabase
          .from('published_chapters')
          .select('*')
          .eq('grade_id', gradeId)
          .gt('question_count', 0);

        if (normalizedSubjectId === 'math') {
          query = query.in('subject_id', ['math', 'mathematics']);
        } else {
          query = query.eq('subject_id', normalizedSubjectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[quizService] Error fetching published_chapters:', error.message);
          throw new Error(`Failed to load published chapters: ${error.message}`);
        }

        return (data || [])
          .filter(ch => (ch.question_count || 0) > 0)
          .map(ch => ({
            id: ch.id,
            gradeId: ch.grade_id,
            subjectId: ch.subject_id,
            gradeSubjectId: ch.grade_subject_id,
            babNumber: ch.bab_number,
            title: ch.title,
            fullName: `${ch.bab_number}: ${ch.title}`,
            randomQuestions: Boolean(ch.random_questions),
            versionNo: ch.version_no,
            currentVersionId: ch.current_version_id,
            questionCount: ch.question_count || 0,
            publishedAt: ch.published_at,
          }));
      } catch (err) {
        console.error('[quizService] Published chapters fetch failed:', err);
        throw err;
      }
    }

    return [];
  },

  /**
   * Step 2 Security Contract:
   * Direct reading of public.questions table is strictly eliminated.
   * All official questions are served exclusively via secure get_next_questions RPC.
   */
  async getPublishedQuestions() {
    return [];
  },

  /**
   * Helper: Read Cycle State for a specific player + chapter
   */
  getCycleState(playerId, chapterId) {
    const key = `playbank_cycle_pool_${playerId || 'guest'}_${chapterId}`;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } else if (globalThis.__quizMemoryStore) {
        const raw = globalThis.__quizMemoryStore.get(key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[quizService] Failed to read cycle state:', e);
    }
    return null;
  },

  /**
   * Helper: Save Cycle State for a specific player + chapter
   */
  saveCycleState(playerId, chapterId, state) {
    const key = `playbank_cycle_pool_${playerId || 'guest'}_${chapterId}`;
    try {
      const jsonStr = JSON.stringify(state);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, jsonStr);
      } else {
        if (!globalThis.__quizMemoryStore) globalThis.__quizMemoryStore = new Map();
        globalThis.__quizMemoryStore.set(key, jsonStr);
      }
    } catch (e) {
      console.warn('[quizService] Failed to save cycle state:', e);
    }
  },

  /**
   * Reset Cycle State for a specific player + chapter (useful for testing or full cycle reset)
   */
  resetCycleState(playerId, chapterId) {
    const key = `playbank_cycle_pool_${playerId || 'guest'}_${chapterId}`;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else if (globalThis.__quizMemoryStore) {
        globalThis.__quizMemoryStore.delete(key);
      }
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Step 15: Implementation of Random Question Sequence & Candidate Pool Management
   * 
   * Requirements:
   * 1. When Chapter Random is ON:
   *    - Each player gets an independent random sequence.
   *    - Never just picks one random question blindly.
   *    - Builds an unserved question pool (未出题目池) for player + chapter + cycle.
   *    - Only extracts from unserved pool.
   *    - Removed from unserved pool upon appearance.
   * 2. When Chapter Random is OFF:
   *    - Strictly follows question_no order.
   * 3. Cloud + Local dual-mode:
   *    - Authenticated users with active session call Supabase RPC `get_next_questions`.
   *    - Guests and offline users run the exact same candidate pool algorithm locally.
   */
  async getNextQuestions({
    chapterId,
    limit = 8,
    playerId = 'guest',
    randomEnabled = true,
    versionNo = 1,
    availableQuestions = [],
    fallbackQuestions = []
  }) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 8, 20));
    // 1. If Supabase is configured, ensure auth session is ready and call Cloud RPC
    if (isSupabaseConfigured && supabase) {
      try {
        // Step 2.1: Ensure auth session is initialized (Anonymous or Registered)
        await playerAuthService.initAuth();
        const { data: { session } } = await supabase.auth.getSession();

        if (session && session.user) {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('get_next_questions', {
            p_chapter_id: chapterId,
            p_limit: safeLimit
          });

          if (rpcErr) {
            console.error('[quizService] Cloud get_next_questions RPC error:', rpcErr);
            // Step 2.6: Do NOT silently fallback for published chapters!
            throw new Error(`加载章节题目失败: ${rpcErr.message}`);
          }

          if (rpcData && rpcData.questions) {
            if (rpcData.questions.length === 0) {
              throw new Error('本章节暂无可用题目，请联系管理员。');
            }

            // Step 2.4 & Security Guarantee: Cleanly format options and question text with zero leakage
            const safeQuestions = rpcData.questions.map((q) => {
              let rawOptions = [];
              if (Array.isArray(q.options)) {
                rawOptions = q.options.map((opt, i) => {
                  if (typeof opt === 'string') {
                    return { id: `opt_${i + 1}`, text: opt };
                  }
                  return { id: String(opt.id || `opt_${i + 1}`), text: String(opt.text || '') };
                });
              }

              return {
                id: String(q.question_id || q.id),
                question_id: String(q.question_id || q.id),
                impression_id: q.impression_id,
                question_no: Number(q.question_no || 1),
                question: String(q.question || q.text || ''),
                text: String(q.question || q.text || ''),
                options: rawOptions,
                difficulty: q.difficulty || 'Medium'
              };
            });

            return {
              cycle_number: rpcData.cycle_number,
              version_no: rpcData.version_no,
              questions: safeQuestions,
              remaining_in_cycle: rpcData.remaining_in_cycle,
              total_in_cycle: rpcData.total_in_cycle || safeQuestions.length,
              served_in_cycle: rpcData.served_in_cycle || 0,
              is_cloud_rpc: true
            };
          }
        } else {
          // If Supabase session is missing after initAuth, report error so user can re-auth
          throw new Error('未检测到有效的玩家登录会话，请刷新重试。');
        }
      } catch (err) {
        // Step 2.6: Do NOT silently fallback to demo bank for published chapters
        console.error('[quizService] getNextQuestions error:', err.message);
        throw err;
      }
    }

    // 2. Offline / Local Demo Fallback (ONLY when Supabase is completely unconfigured in .env)
    const candidateList = (availableQuestions && availableQuestions.length > 0) ? availableQuestions : fallbackQuestions;
    const totalQuestionsCount = candidateList.length;
    if (totalQuestionsCount === 0) {
      return {
        cycle_number: 1,
        version_no: versionNo,
        questions: [],
        remaining_in_cycle: 0,
        is_cloud_rpc: false
      };
    }

    let state = this.getCycleState(effectivePlayerId, chapterId);
    let cycleNumber = state?.cycleNumber || 1;
    let unservedQuestionIds = Array.isArray(state?.unservedQuestionIds) ? [...state.unservedQuestionIds] : [];
    let servedQuestionIds = Array.isArray(state?.servedQuestionIds) ? [...state.servedQuestionIds] : [];

    // Check if new cycle is needed:
    // - first time
    // - version changed
    // - pool depleted
    // - OR existing pool contains stale IDs not in current candidateList
    const isVersionChanged = state?.chapterVersion && state.chapterVersion !== versionNo;
    const isPoolDepleted = unservedQuestionIds.length === 0;

    const availableIdSet = new Set(candidateList.map(q => String(q.id || q.question_id)));
    const hasStaleIds = unservedQuestionIds.length > 0 && unservedQuestionIds.some(id => !availableIdSet.has(id));

    if (!state || isVersionChanged || isPoolDepleted || hasStaleIds) {
      if (state && !isVersionChanged && isPoolDepleted && !hasStaleIds) {
        cycleNumber += 1; // Increment cycle when all questions have appeared
      } else {
        cycleNumber = 1;
      }

      // Prepare fresh candidate pool
      let candidates = [...candidateList];
      if (randomEnabled) {
        // Shuffle candidates for this player's cycle
        candidates = shuffleArray(candidates);
      } else {
        // Order by question_no ascending
        candidates.sort((a, b) => {
          const noA = Number(a.question_no ?? a.questionNo ?? 0);
          const noB = Number(b.question_no ?? b.questionNo ?? 0);
          return noA - noB;
        });
      }

      unservedQuestionIds = candidates.map(q => String(q.id || q.question_id));
      servedQuestionIds = [];
    }

    // Step 15 core: Extract next batch only from the unserved pool
    const drawnIds = unservedQuestionIds.slice(0, safeLimit);
    const nextUnservedIds = unservedQuestionIds.slice(safeLimit);
    const nextServedIds = [...servedQuestionIds, ...drawnIds];

    const drawnQuestions = drawnIds.map(id => candidateList.find(q => String(q.id || q.question_id) === String(id))).filter(Boolean);

    // Persist updated pool state
    this.saveCycleState(effectivePlayerId, chapterId, {
      playerId: effectivePlayerId,
      chapterId,
      cycleNumber,
      chapterVersion: versionNo,
      randomEnabled: Boolean(randomEnabled),
      unservedQuestionIds: nextUnservedIds,
      servedQuestionIds: nextServedIds,
      updatedAt: new Date().toISOString()
    });

    // Map drawn IDs back to standardized question objects with unique impression_id
    const questionsMap = new Map(availableQuestions.map(q => [String(q.id), q]));
    const selectedQuestions = drawnIds.map((qId, idx) => {
      const q = questionsMap.get(qId) || {};
      return {
        impression_id: generateUUID(),
        question_id: qId,
        question_no: q.question_no ?? q.questionNo ?? (idx + 1),
        question: q.question || q.text || q.title || '',
        text: q.question || q.text || q.title || '',
        options: q.options || (q.incorrectAnswers && q.correctAnswer ? [
          { id: 'opt_1', text: q.correctAnswer },
          ...q.incorrectAnswers.map((txt, i) => ({ id: `opt_${i + 2}`, text: txt }))
        ] : []),
        difficulty: q.difficulty || 'Medium',
        // Internal metadata (stripped during display or grading)
        _raw: q
      };
    });

    return {
      cycle_number: cycleNumber,
      version_no: versionNo,
      questions: selectedQuestions,
      remaining_in_cycle: nextUnservedIds.length,
      served_in_cycle: nextServedIds.length,
      total_in_cycle: totalQuestionsCount,
      is_cloud_rpc: false
    };
  },

  /**
   * Universal storage getter supporting browser localStorage & memory fallback
   */
  getStorage(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      } else if (globalThis.__quizMemoryStore) {
        return globalThis.__quizMemoryStore.get(key) || null;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  },

  /**
   * Universal storage setter supporting browser localStorage & memory fallback
   */
  saveStorage(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        if (!globalThis.__quizMemoryStore) globalThis.__quizMemoryStore = new Map();
        globalThis.__quizMemoryStore.set(key, value);
      }
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Universal storage remover supporting browser localStorage & memory fallback
   */
  removeStorage(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else if (globalThis.__quizMemoryStore) {
        globalThis.__quizMemoryStore.delete(key);
      }
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Step 18: Record Single Answer Event & Update Cumulative Question History
   * 
   * Strict Specification Compliance:
   * 1. Records single attempt fields:
   *    - player_id / guest_id
   *    - chapter_id
   *    - question_id
   *    - chapter_version
   *    - selected_option_id
   *    - is_correct
   *    - response_time
   *    - answered_at
   *    - cycle_number
   * 2. Cumulative aggregation per (player_id, question_id):
   *    - total_attempts (出现/作答次数)
   *    - correct_count (正确次数)
   * Step 2: Authoritative Server-Side Answer Evaluation via RPC submit_answer
   * @param {Object} params
   * @param {string} params.impressionId
   * @param {string} params.selectedOptionId
   * @param {number} params.responseTimeMs
   * @returns {Promise<{ is_correct: boolean, correct_option_id: string, explanation: string, is_idempotent: boolean }>}
   */
  async submitAnswerRPC({ impressionId, selectedOptionId, responseTimeMs = 1000, sessionId = null }) {
    if (!impressionId) {
      throw new Error('Missing impression_id for submit_answer RPC');
    }

    if (isSupabaseConfigured && supabase) {
      let rpcParams = {
        p_impression_id: impressionId,
        p_selected_option_id: selectedOptionId || '',
        p_response_time_ms: Math.max(0, Math.round(responseTimeMs))
      };
      if (sessionId) {
        rpcParams.p_session_id = sessionId;
      }

      let { data, error } = await supabase.rpc('submit_answer', rpcParams);

      // If the 4-arg overload hasn't been migrated yet in Supabase (PGRST202), retry with 3 args
      if (error && error.code === 'PGRST202' && sessionId) {
        const retry = await supabase.rpc('submit_answer', {
          p_impression_id: impressionId,
          p_selected_option_id: selectedOptionId || '',
          p_response_time_ms: Math.max(0, Math.round(responseTimeMs))
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('[quizService] submit_answer RPC error:', error.message);
        throw new Error(error.message);
      }

      return {
        is_correct: Boolean(data?.is_correct),
        correct_option_id: data?.correct_option_id || null,
        explanation: data?.explanation || '',
        is_idempotent: Boolean(data?.is_idempotent)
      };
    }

    throw new Error('Supabase is not configured for cloud answer submission');
  },

  /**
   * Step 18: Record detailed answer event & cumulative wrong question history
   */
  recordAnswer({
    playerId,
    chapterId,
    questionId,
    chapterVersion = 1,
    selectedOptionId,
    isCorrect,
    responseTimeMs,
    cycleNumber = 1,
    impressionId = null,
    questionText = '',
    options = [],
    correctOptionId = null,
    explanation = '',
    cloudSynced = false
  }) {
    const answeredAt = new Date().toISOString();
    const effectivePlayerId = playerId || 'guest';

    // 2. Append to Immutable Answer Log (Step 18 Field Requirements)
    const answerLogKey = `playbank_answers_${effectivePlayerId}`;
    let answerLog = [];
    try {
      const rawLog = this.getStorage(answerLogKey);
      if (rawLog) answerLog = JSON.parse(rawLog);
    } catch (e) {
      answerLog = [];
    }

    const answerEntry = {
      id: generateUUID(),
      player_id: effectivePlayerId,
      guest_id: effectivePlayerId,
      chapter_id: chapterId,
      question_id: questionId,
      chapter_version: chapterVersion,
      selected_option_id: selectedOptionId,
      is_correct: Boolean(isCorrect),
      response_time: Math.max(0, Math.round(responseTimeMs)),
      answered_at: answeredAt,
      cycle_number: cycleNumber,
      cloud_synced: cloudSynced
    };

    answerLog.push(answerEntry);
    if (answerLog.length > 500) answerLog.shift();
    this.saveStorage(answerLogKey, JSON.stringify(answerLog));

    // 3. Update Aggregated Question History (Cumulative stats for Memory Boss)
    const historyKey = `playbank_question_history_${effectivePlayerId}`;
    let historyMap = {};
    try {
      const rawHist = this.getStorage(historyKey);
      if (rawHist) historyMap = JSON.parse(rawHist);
    } catch (e) {
      historyMap = {};
    }

    const qKey = `${chapterId}_${questionId}`;
    const existing = historyMap[qKey] || {
      player_id: effectivePlayerId,
      chapter_id: chapterId,
      question_id: questionId,
      total_attempts: 0,
      correct_count: 0,
      wrong_count: 0,
      last_wrong_at: null,
      last_attempt_at: null,
      question_text: questionText,
      options: options,
      correct_option_id: correctOptionId,
      explanation: explanation
    };

    existing.total_attempts += 1;
    if (isCorrect) {
      existing.correct_count += 1;
    } else {
      existing.wrong_count += 1;
      existing.last_wrong_at = answeredAt;
    }
    existing.last_attempt_at = answeredAt;
    if (questionText) existing.question_text = questionText;
    if (options && options.length > 0) existing.options = options;
    if (correctOptionId) existing.correct_option_id = correctOptionId;
    if (explanation) existing.explanation = explanation;

    historyMap[qKey] = existing;
    this.saveStorage(historyKey, JSON.stringify(historyMap));

    return {
      answer: answerEntry,
      cumulative: existing,
      cloud_synced: cloudSynced
    };
  },

  /**
   * Step 18: Extract Wrong Questions History for Memory Boss
   * 
   * Returns questions answered incorrectly by player,
   * sorted by highest wrong count or most recent wrong date.
   */
  getWrongQuestionsHistory(playerId = 'guest', chapterId = null) {
    const effectivePlayerId = playerId || 'guest';
    const historyKey = `playbank_question_history_${effectivePlayerId}`;
    let historyMap = {};
    try {
      const raw = this.getStorage(historyKey);
      if (raw) historyMap = JSON.parse(raw);
    } catch (e) {
      return [];
    }

    let list = Object.values(historyMap).filter(item => item.wrong_count > 0);
    if (chapterId) {
      list = list.filter(item => item.chapter_id === chapterId);
    }

    list.sort((a, b) => {
      if (b.wrong_count !== a.wrong_count) {
        return b.wrong_count - a.wrong_count;
      }
      return new Date(b.last_wrong_at || 0) - new Date(a.last_wrong_at || 0);
    });

    return list;
  },

  /**
   * Step 18: Query Answer History Ledger
   */
  getAnswerHistory(playerId = 'guest', chapterId = null) {
    const effectivePlayerId = playerId || 'guest';
    const answerLogKey = `playbank_answers_${effectivePlayerId}`;
    try {
      const raw = this.getStorage(answerLogKey);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!chapterId) return list;
      return list.filter(item => item.chapter_id === chapterId);
    } catch (e) {
      return [];
    }
  },

  /**
   * Reset Answer and Question History for testing
   */
  resetAnswerHistory(playerId = 'guest') {
    const effectivePlayerId = playerId || 'guest';
    this.removeStorage(`playbank_answers_${effectivePlayerId}`);
    this.removeStorage(`playbank_question_history_${effectivePlayerId}`);
  },

  /**
   * Helper: Save detailed question breakdown for a specific session
   */
  saveSessionDetails(sessionId, details) {
    if (!sessionId) return;
    try {
      const key = `playbank_sess_details_${sessionId}`;
      this.saveStorage(key, JSON.stringify(details));
    } catch (e) {
      console.warn('[quizService] Failed to save session details:', e);
    }
  },

  /**
   * Helper: Get detailed question breakdown for a specific session
   */
  getSessionDetails(sessionId) {
    if (!sessionId) return null;
    try {
      const key = `playbank_sess_details_${sessionId}`;
      const raw = this.getStorage(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // Ignore
    }
    return null;
  },

  /**
   * Step 4.2 & Requirements 1-3: Create Game Session in Supabase BEFORE quiz starts
   * Fail-fast: strictly validates UUID and creates game_sessions with started_at
   */
  async createGameSession({
    chapterId,
    chapterVersion = 1,
    chapterTitle = 'Sejarah',
    totalQuestions = 8
  }) {
    // 1. Strict UUID validation from source
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chapterId);
    if (!isUUID) {
      const errMsg = `对局建立失败: 章节ID不是有效的UUID (${chapterId})，请返回关卡选择`;
      console.error('[quizService] Invalid chapter UUID:', chapterId);
      throw new Error(errMsg);
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase客户端未初始化，无法建立对局');
    }

    const userId = await playerAuthService.getAuthUserId();
    if (!userId) {
      throw new Error('对局建立失败：未检测到有效Supabase auth.uid()');
    }

    const effectiveStartedAt = new Date().toISOString();

    const { data: created, error: insertErr } = await supabase
      .from('game_sessions')
      .insert({
        player_id: userId,
        chapter_id: chapterId,
        chapter_version: chapterVersion,
        started_at: effectiveStartedAt,
        total_questions: totalQuestions,
        correct_count: 0,
        wrong_count: 0,
        score: 0,
        earned_bp: 0,
        status: 'in_progress'
      })
      .select('id, player_id, chapter_id, status, started_at')
      .single();

    if (insertErr) {
      console.error('[GameSession] Create failed:', insertErr);
      throw new Error(`对局建立失败: ${insertErr.message}`);
    }

    if (!created?.id) {
      throw new Error('对局建立失败: 未从Supabase获取到新Session ID');
    }

    console.log(`[GameSession] Created\nsession_id: ${created.id}\nplayer_id: ${created.player_id}\nchapter_id: ${created.chapter_id}\nstatus: in_progress`);

    // Cache initial session info
    this.saveSessionDetails(created.id, {
      id: created.id,
      chapter_id: chapterId,
      chapter_title: chapterTitle,
      chapter_version: chapterVersion,
      started_at: effectiveStartedAt,
      total_questions: totalQuestions,
      status: 'in_progress',
      questions: []
    });

    return created;
  },

  /**
   * Requirement 6: Complete the exact same Game Session upon finishing 8 questions
   * Fail-fast: awaits Supabase UPDATE and throws if update does not succeed
   */
  async completeGameSession({
    sessionId,
    chapterId,
    chapterTitle = 'Sejarah',
    chapterVersion = 1,
    startedAt,
    totalQuestions = 8,
    correctCount = 0,
    wrongCount = 0,
    score = 0,
    earnedBP = 0,
    questionsDetails = []
  }) {
    if (!sessionId) {
      throw new Error('结算保存失败: 缺少有效的 Session ID');
    }

    const endedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const authUserId = await playerAuthService.getAuthUserId();
      if (!authUserId) {
        throw new Error('未检测到有效的玩家登录态，无法保存结算');
      }

      const updateRes = await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          ended_at: endedAt,
          total_questions: totalQuestions,
          correct_count: correctCount,
          wrong_count: wrongCount,
          score: score,
          earned_bp: earnedBP
        })
        .eq('id', sessionId)
        .eq('player_id', authUserId)
        .select('id, status, score, correct_count, wrong_count')
        .single();

      if (updateRes.error) {
        console.error('[GameSession] Complete failed:', updateRes.error);
        throw new Error(`结算保存失败: ${updateRes.error.message || updateRes.error.details || 'Supabase更新被拒绝'}`);
      }

      if (!updateRes.data || updateRes.data.status !== 'completed') {
        throw new Error('结算保存失败: 数据库未能成功更新对局状态为 completed');
      }

      console.log(`[GameSession] Completed\nsession_id: ${sessionId}\nstatus: completed\nscore: ${score}\ncorrect_count: ${correctCount}\nwrong_count: ${wrongCount}`);
    }

    // Save questions details associated with this exact session
    this.saveSessionDetails(sessionId, {
      id: sessionId,
      chapter_id: chapterId,
      chapter_title: chapterTitle,
      chapter_version: chapterVersion,
      started_at: startedAt,
      ended_at: endedAt,
      total_questions: totalQuestions,
      correct_count: correctCount,
      wrong_count: wrongCount,
      score: score,
      earned_bp: earnedBP,
      status: 'completed',
      questions: questionsDetails
    });

    return { sessionId, status: 'completed' };
  },

  /**
   * Requirement 4: Mark Session as abandoned if player quits early
   */
  async abandonGameSession(sessionId) {
    if (!sessionId || !isSupabaseConfigured || !supabase) return;
    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'abandoned',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (e) {
      console.warn('[quizService] Failed to mark session as abandoned:', e);
    }
  },

  /**
   * Backward-compatible recordGameSession
   */
  async recordGameSession(params) {
    return this.completeGameSession({
      sessionId: params.sessionId || generateUUID(),
      ...params
    });
  },

  /**
   * Step 4: Get Game Sessions List (Only completed sessions)
   */
  async getGameSessions(playerId = null, limit = 20) {
    const { sessions } = await this.getPlayerFullStats(playerId);
    return (sessions || []).slice(0, limit);
  },

  /**
   * Step 4: Get Full Player Stats (Sessions & Answers) with Supabase Cloud Priority
   * Strictly adheres to Rule 5: NO guessing or auto-synthesizing sessions from answers!
   */
  async getPlayerFullStats(playerId = null) {
    let cloudSessions = [];
    let cloudAnswers = [];
    let fetchError = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const authUserId = playerId && playerId !== 'guest' ? playerId : await playerAuthService.getAuthUserId();
        if (authUserId) {
          const [sessRes, ansRes] = await Promise.all([
            supabase
              .from('game_sessions')
              .select('*, chapters(title, bab_number, grade_id, subjects(title_zh, title_en))')
              .eq('player_id', authUserId)
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(50),
            supabase
              .from('player_answers')
              .select('*, questions(question, options, explanation)')
              .eq('player_id', authUserId)
              .order('answered_at', { ascending: false })
              .limit(500)
          ]);

          if (sessRes.error) {
            console.error('[quizService] Error fetching game_sessions:', sessRes.error);
            throw new Error(`读取对局记录失败: ${sessRes.error.message}`);
          } else if (Array.isArray(sessRes.data)) {
            cloudSessions = sessRes.data;
          }

          if (ansRes.error) {
            console.warn('[quizService] Error fetching player_answers:', ansRes.error);
            // player_answers is supplementary for cumulative totals; don't hard crash if empty
          } else if (Array.isArray(ansRes.data)) {
            cloudAnswers = ansRes.data;
          }
        }
      } catch (err) {
        console.error('[quizService] getPlayerFullStats exception:', err);
        throw err;
      }
    }

    // Attach question details saved for each completed session
    const formattedSessions = cloudSessions.map((cs) => {
      const details = this.getSessionDetails(cs.id);
      const subName = cs.chapters?.subjects?.title_zh || cs.chapters?.subjects?.title_en || details?.subject_name || '历史';
      const chapTitle = cs.chapters?.title || details?.chapter_title || 'Sejarah 答题对局';
      const durationSec = cs.active_duration_seconds != null
        ? Number(cs.active_duration_seconds)
        : (cs.started_at && cs.ended_at ? Math.max(0, Math.round((new Date(cs.ended_at) - new Date(cs.started_at)) / 1000)) : 0);

      return {
        id: cs.id,
        player_id: cs.player_id,
        chapter_id: cs.chapter_id,
        chapter_title: chapTitle,
        subject_name: subName,
        started_at: cs.started_at,
        ended_at: cs.ended_at,
        total_questions: cs.total_questions || 8,
        correct_count: cs.correct_count ?? 0,
        wrong_count: cs.wrong_count ?? 0,
        score: cs.score ?? 0,
        earned_bp: cs.earned_bp ?? 0,
        status: cs.status,
        active_duration_seconds: durationSec,
        created_at: cs.created_at || cs.started_at,
        questions: details?.questions || []
      };
    });

    return {
      sessions: formattedSessions,
      answers: cloudAnswers
    };
  },

  /**
   * Step 4: Get Aggregated Summary Stats for Player Profile
   * Strictly calculates REAL statistics (NO hardcoded 128h / 980 / 2480 / 312)
   */
  async getPlayerSummaryStats(playerId = null) {
    const { sessions, answers } = await this.getPlayerFullStats(playerId);

    // 4.2 Play Time: SUM(game_sessions.active_duration_seconds)
    const totalSeconds = (sessions || []).reduce((acc, s) => {
      const dur = s.active_duration_seconds != null
        ? Number(s.active_duration_seconds)
        : (s.started_at && s.ended_at ? Math.max(0, Math.round((new Date(s.ended_at) - new Date(s.started_at)) / 1000)) : 0);
      return acc + (dur > 0 && dur <= 3600 ? dur : 0);
    }, 0);

    const totalMinutes = Math.round(totalSeconds / 60);

    // 4.2 Correct & Wrong Answers
    const answerCorrectCount = (answers || []).filter(a => a.is_correct === true).length;
    const answerWrongCount = (answers || []).filter(a => a.is_correct === false).length;
    const sessionCorrectSum = (sessions || []).reduce((acc, s) => acc + (Number(s.correct_count) || 0), 0);
    const sessionWrongSum = (sessions || []).reduce((acc, s) => acc + (Number(s.wrong_count) || 0), 0);

    const totalCorrect = Math.max(sessionCorrectSum, answerCorrectCount);
    const totalWrong = Math.max(sessionWrongSum, answerWrongCount);

    // 4.2 Best Score: MAX(game_sessions.score) of completed sessions (0 if none)
    const completedSessions = (sessions || []).filter(s => s.status === 'completed' || s.score != null);
    const bestScore = completedSessions.length
      ? Math.max(...completedSessions.map(session => Number(session.score) || 0))
      : 0;

    return {
      completedSessionsCount: completedSessions.length,
      totalCorrect,
      totalWrong,
      bestScore,
      totalSeconds,
      totalMinutes,
      recentSessions: sessions,
      wrongQuestions: this.getWrongQuestionsHistory(playerId)
    };
  }
};
