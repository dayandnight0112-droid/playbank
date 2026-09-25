/**
 * typingConfig.js
 * Playbank English Typing Game Configuration & Age Rules
 * 
 * Rules:
 * - 7–9岁:   6题,  每题 3分 (满分 18分)
 * - 10–12岁: 6题,  每题 5分 (满分 30分)
 * - 13–15岁: 10题, 每题 7分 (满分 70分)
 * - 16–17岁: 20题, 每题 10分 (满分 200分)
 * 
 * Strict Constraint:
 * - NO Combo multipliers for Typing Game (enableCombo: false)
 * - Independent from Multiple Choice questions
 */

export const AGE_GROUP_KEYS = {
  AGE_7_9: '7-9',
  AGE_10_12: '10-12',
  AGE_13_15: '13-15',
  AGE_16_17: '16-17',
};

export const TYPING_AGE_CONFIGS = {
  [AGE_GROUP_KEYS.AGE_7_9]: {
    id: '7-9',
    label: '7 – 9 岁',
    sublabel: '小学低年级 (Standard 1–3)',
    icon: '🎒',
    minAge: 7,
    maxAge: 9,
    questionCount: 6,
    scorePerQuestion: 3,
    maxScore: 18,
    enableCombo: false,
    difficultyLabel: '基础 (Easy)',
    contentType: 'words',
    contentDescription: '基础英文字词 (Basic Words)',
    speechRate: 0.85, // 略微放慢发音，利于初学儿童听辨
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
  },
  [AGE_GROUP_KEYS.AGE_10_12]: {
    id: '10-12',
    label: '10 – 12 岁',
    sublabel: '小学高年级 (Standard 4–6)',
    icon: '📚',
    minAge: 10,
    maxAge: 12,
    questionCount: 6,
    scorePerQuestion: 5,
    maxScore: 30,
    enableCombo: false,
    difficultyLabel: '进阶 (Medium)',
    contentType: 'words_and_phrases',
    contentDescription: '进阶词汇与短语 (Words & Phrases)',
    speechRate: 0.9,
    color: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.35)',
  },
  [AGE_GROUP_KEYS.AGE_13_15]: {
    id: '13-15',
    label: '13 – 15 岁',
    sublabel: '初中 (Form 1–3)',
    icon: '🎓',
    minAge: 13,
    maxAge: 15,
    questionCount: 10,
    scorePerQuestion: 7,
    maxScore: 70,
    enableCombo: false,
    difficultyLabel: '挑战 (Hard)',
    contentType: 'sentences',
    contentDescription: '实用句型与短语 (Sentences)',
    speechRate: 0.95,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  [AGE_GROUP_KEYS.AGE_16_17]: {
    id: '16-17',
    label: '16 – 17 岁',
    sublabel: '高中 / SPM (Form 4–5)',
    icon: '⚡',
    minAge: 16,
    maxAge: 17,
    questionCount: 20,
    scorePerQuestion: 10,
    maxScore: 200,
    enableCombo: false,
    difficultyLabel: '专家 (Expert)',
    contentType: 'passages',
    contentDescription: '长句与短文精选 (Passages)',
    speechRate: 1.0,
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.35)',
  },
};

/**
 * Standard list of age options for UI rendering
 */
export const TYPING_AGE_OPTIONS = Object.values(TYPING_AGE_CONFIGS);

/**
 * Maps an exact age number (7-17) or group string ('7-9') to standard age group key.
 * Fallback is '10-12'.
 * 
 * @param {number|string} ageOrGroup 
 * @returns {string} One of '7-9' | '10-12' | '13-15' | '16-17'
 */
export function normalizeAgeGroupKey(ageOrGroup) {
  if (!ageOrGroup) return AGE_GROUP_KEYS.AGE_10_12;

  // If already a valid group key
  if (TYPING_AGE_CONFIGS[ageOrGroup]) {
    return ageOrGroup;
  }

  // Handle object input (e.g. { id: '7-9' })
  if (typeof ageOrGroup === 'object' && ageOrGroup.id && TYPING_AGE_CONFIGS[ageOrGroup.id]) {
    return ageOrGroup.id;
  }

  const numericAge = parseInt(ageOrGroup, 10);
  if (isNaN(numericAge)) {
    return AGE_GROUP_KEYS.AGE_10_12;
  }

  if (numericAge <= 9) return AGE_GROUP_KEYS.AGE_7_9;
  if (numericAge <= 12) return AGE_GROUP_KEYS.AGE_10_12;
  if (numericAge <= 15) return AGE_GROUP_KEYS.AGE_13_15;
  return AGE_GROUP_KEYS.AGE_16_17;
}

/**
 * Get configuration object for a given age or group
 * 
 * @param {number|string} ageOrGroup 
 * @returns {typeof TYPING_AGE_CONFIGS['7-9']}
 */
export function getTypingAgeConfig(ageOrGroup) {
  const groupKey = normalizeAgeGroupKey(ageOrGroup);
  return TYPING_AGE_CONFIGS[groupKey] || TYPING_AGE_CONFIGS[AGE_GROUP_KEYS.AGE_10_12];
}
