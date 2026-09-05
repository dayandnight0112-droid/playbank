/**
 * Boss Type System (Battle Mechanics & Rules Engine)
 * 
 * DESIGN PRINCIPLE:
 * Defines universal Boss Type configurations for the 5 confirmed battle mechanics:
 * 1. SPEED (Fully realized)
 * 2. SHIELD (Placeholder)
 * 3. RECALL (Placeholder)
 * 4. CHAOS (Placeholder)
 * 5. FINAL (Placeholder)
 * 
 * Neutral code keys are used so UI labels can change at any time.
 */

/**
 * 5 Neutral Battle Type Keys
 */
export const BOSS_TYPE_KEYS = {
  SPEED: 'SPEED',
  SHIELD: 'SHIELD',
  RECALL: 'RECALL',
  CHAOS: 'CHAOS',
  FINAL: 'FINAL'
};

/**
 * @typedef {Object} BossTypeConfig
 * @property {string} type - Neutral type key (from BOSS_TYPE_KEYS)
 * @property {string} displayName - Human-readable name for UI
 * @property {string} description - Brief summary of mechanics
 * @property {boolean} isImplemented - Whether this type is fully playable
 * @property {number} [questionCount] - Number of questions for this battle
 * @property {number} [bossHp] - Boss health points (configured independently per Type)
 * @property {string} [timerMode] - Timer pacing ('FAST' | 'STANDARD' | 'RELAXED' | etc.)
 * @property {number} [timeLimit] - Seconds allocated per question
 * @property {number} [urgentThreshold] - Seconds left before visual warning
 * @property {string} [questionMode] - Question style ('QUICK_RECALL' | 'STANDARD' | etc.)
 * @property {string} [battleModifier] - Combat modifier ('SPEED_PRESSURE' | 'NONE' | etc.)
 * @property {Object} [battleRules] - Pacing and reveal settings
 * @property {Object} [damageRule] - Damage formulas
 * @property {Object} [comboRule] - Combo break rules
 */

/**
 * Step 8: Speed Combo Visual Progression (Level 1 ~ Level 8)
 * Pure visual & typography upgrade; does NOT affect 1-HP base damage.
 */
export const SPEED_COMBO_TIERS = {
  1: { level: 1, label: 'HIT!', floatLabel: 'HIT! -1', color: '#F1F5F9', bg: 'rgba(255,255,255,0.12)', glow: 'none' },
  2: { level: 2, label: 'COMBO x2', floatLabel: 'COMBO x2! -1', color: '#FDE047', bg: 'rgba(253, 224, 71, 0.2)', glow: '0 0 12px rgba(250, 204, 21, 0.5)' },
  3: { level: 3, label: 'COMBO x3', floatLabel: 'COMBO x3! -1', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.25)', glow: '0 0 16px rgba(245, 158, 11, 0.6)' },
  4: { level: 4, label: 'FAST STREAK!', floatLabel: '⚡ FAST STREAK! -1', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.3)', glow: '0 0 20px rgba(251, 146, 60, 0.7)' },
  5: { level: 5, label: 'ON FIRE!', floatLabel: '🔥 ON FIRE! -1', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.35)', glow: '0 0 25px rgba(239, 68, 68, 0.8)' },
  6: { level: 6, label: 'UNSTOPPABLE!', floatLabel: '⚡ UNSTOPPABLE! -1', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.4)', glow: '0 0 30px rgba(236, 72, 153, 0.85)' },
  7: { level: 7, label: 'MAX SPEED!', floatLabel: '🚀 MAX SPEED! -1', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.45)', glow: '0 0 35px rgba(139, 92, 246, 0.9)' },
  8: { level: 8, label: 'FINISHER!', floatLabel: '💥 FINISHER! -1', color: '#FFBC00', bg: 'linear-gradient(90deg, #EF4444, #F59E0B)', glow: '0 0 45px rgba(255, 188, 0, 1)' }
};

export const getSpeedComboTier = (combo = 0) => {
  if (combo <= 0) return null;
  const clamped = Math.min(combo, 8);
  return SPEED_COMBO_TIERS[clamped] || SPEED_COMBO_TIERS[8];
};

export const BOSS_TYPE_CONFIGS = {
  /**
   * 1. SPEED Type (Fully Implemented)
   * 8 rapid consecutive questions, strict 7s timer, fast reaction triggers visual crits
   */
  [BOSS_TYPE_KEYS.SPEED]: {
    type: BOSS_TYPE_KEYS.SPEED,
    displayName: 'Speed Battle',
    description: '连续 8 道极速题，反应越快视觉反馈越强！',
    isImplemented: true,

    questionCount: 8,
    bossHp: 8, // Configured per Type independently (not forced to match questionCount)

    timerMode: 'FAST',
    timeLimit: 10, // Configurable: currently 10s, can easily be changed to 8s or 6s
    urgentThreshold: 3,

    // Step 6: Dramatic intro banner text
    introBanner: {
      title: 'SPEED BATTLE',
      subtitle: '8 QUESTIONS',
      warning: "DON'T SLOW DOWN!"
    },

    questionMode: 'QUICK_RECALL',
    battleModifier: 'SPEED_PRESSURE',

    // Step 7: Ultra-fast cadence for Speed Type (0.5s - 0.7s turnaround)
    cadence: {
      answerLockMs: 90,           // Near-instant lock (90ms)
      playerAttackMs: 160,        // Quick dash slash (160ms)
      bossReactionMs: 220,        // Crisp hit impact (220ms)
      nextTransitionMs: 100,      // Immediate question swap (100ms)
      accelerateWithCombo: true   // Dynamic acceleration: gets even faster with combo!
    },

    battleRules: {
      revealAnswerMs: 800
    },

    damageRule: {
      basePlayerDamage: 1,

      /**
       * V1: Every correct answer deals 1 damage.
       * Speed & Combo drive animations, VFX, and float labels.
       */
      calculatePlayerDamage: ({ isCorrect, timeTaken = 0, combo = 0 }) => {
        if (!isCorrect) {
          return {
            damage: 0,
            isCrit: false,
            floatLabel: 'BLOCK!',
            isBlock: true,
            comboTier: null
          };
        }

        const isCrit = timeTaken <= 2.5;
        const tier = getSpeedComboTier(combo);
        const floatLabel = tier ? tier.floatLabel : '-1 HP';

        return {
          damage: 1, // Fixed V1 damage: exactly 1
          isCrit,
          floatLabel,
          isBlock: false,
          comboTier: tier
        };
      }
    },

    comboRule: {
      breakOnWrong: true,
      breakOnTimeout: true
    }
  },

  /**
   * 2. SHIELD Type (Placeholder - parameters to be confirmed later)
   */
  [BOSS_TYPE_KEYS.SHIELD]: {
    type: BOSS_TYPE_KEYS.SHIELD,
    displayName: 'Shield Battle',
    description: '护盾与连击机制（待配置）',
    isImplemented: false
  },

  /**
   * 3. RECALL Type (Placeholder - parameters to be confirmed later)
   */
  [BOSS_TYPE_KEYS.RECALL]: {
    type: BOSS_TYPE_KEYS.RECALL,
    displayName: 'Recall Battle',
    description: '错题温习与记忆机制（待配置）',
    isImplemented: false
  },

  /**
   * 4. CHAOS Type (Placeholder - parameters to be confirmed later)
   */
  [BOSS_TYPE_KEYS.CHAOS]: {
    type: BOSS_TYPE_KEYS.CHAOS,
    displayName: 'Chaos Battle',
    description: '混乱干扰与多维机制（待配置）',
    isImplemented: false
  },

  /**
   * 5. FINAL Type (Placeholder - parameters to be confirmed later)
   */
  [BOSS_TYPE_KEYS.FINAL]: {
    type: BOSS_TYPE_KEYS.FINAL,
    displayName: 'Final Battle',
    description: '章节大领主决战机制（待配置）',
    isImplemented: false
  }
};

/**
 * Retrieve a Boss Type Config by key (case-insensitive)
 * @param {string} [typeKey='SPEED']
 * @returns {BossTypeConfig}
 */
export const getBossTypeConfig = (typeKey = 'SPEED') => {
  const normalizedKey = (typeKey || 'SPEED').toString().toUpperCase();
  return BOSS_TYPE_CONFIGS[normalizedKey] || BOSS_TYPE_CONFIGS[BOSS_TYPE_KEYS.SPEED];
};

/**
 * Backward compatibility alias for existing calls
 */
export const BOSS_TYPES = BOSS_TYPE_CONFIGS;
export const getBossType = getBossTypeConfig;
export const getAllBossTypes = () => Object.values(BOSS_TYPE_CONFIGS);
