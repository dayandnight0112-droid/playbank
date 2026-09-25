/**
 * typingPlayService.js
 * Player Game Client Service for English Typing Game (Step 1)
 * 
 * Fetches published typing questions by exact age (7 to 17) from Supabase,
 * with seamless local fallback to guarantee 100% offline availability and zero crash.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getTypingQuestionsForAge } from '../data/typingQuestions.js';
import { getTypingAgeConfig } from '../data/typingConfig.js';

/**
 * Fisher-Yates array shuffle (non-mutating)
 */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const typingPlayService = {
  /**
   * Fetch randomized, published typing questions for player's exact age (7 to 17)
   * 
   * @param {number|string} age - Exact age (e.g. 8)
   * @param {number} [customLimit] - Optional question count override
   * @returns {Promise<Array<{id: string, text: string, translation: string, category: string}>>}
   */
  async getQuestionsForAge(age, customLimit = null) {
    const targetAge = parseInt(age, 10) || 10;
    const config = getTypingAgeConfig(targetAge);
    const limit = customLimit && customLimit > 0 ? customLimit : config.questionCount;

    // 1. Try Supabase cloud query first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('typing_questions')
          .select('id, age, text, translation, category, status')
          .eq('age', targetAge)
          .eq('status', 'published');

        if (!error && Array.isArray(data) && data.length > 0) {
          const shuffled = shuffleArray(data);
          if (shuffled.length >= limit) {
            return shuffled.slice(0, limit);
          }
          // If fewer items in cloud than limit, loop them
          const extended = [...shuffled];
          while (extended.length < limit) {
            extended.push(...shuffleArray(data));
          }
          return extended.slice(0, limit);
        }
      } catch (err) {
        console.warn('[typingPlayService] Cloud fetch failed, falling back to local pool:', err);
      }
    }

    // 2. Local Fallback (zero latency, offline safe)
    return getTypingQuestionsForAge(targetAge, limit);
  }
};
