/**
 * Boss Type System (Battle Mechanics & Rules Engine)
 * 
 * DESIGN PRINCIPLE:
 * Boss Type governs pure gameplay rules, timing, scoring, and combat calculations.
 * It is completely decoupled from Boss Character names, lore, or art assets.
 * Any Boss Character can equip any Boss Type.
 */

export const BOSS_TYPES = {
  /**
   * 1. Speed Type (极速突袭型)
   * Core mechanics:
   * - 8 rapid consecutive questions
   * - Strict 7-second countdown per question
   * - Faster correct answers deal massive critical speed bonus damage
   * - Consecutive combos build up huge damage multipliers
   * - Wrong answers or timeouts cause immediate player HP loss and combo reset
   */
  speed: {
    typeId: 'speed',
    typeName: 'Speed Rush (极速突袭)',
    badge: '⚡',
    description: '连续 8 道极速题，手速越快伤害越高！保持连击重创 Boss！',
    
    // Total questions in this battle
    questionCount: 8,

    // Timer rules
    timerRule: {
      mode: 'per_question',        // Timer resets per question
      timeLimit: 7,                // 7 seconds per question
      urgentThreshold: 3,          // Enter tense heartbeat / red flash state when <= 3s
      tickIntervalMs: 100          // 100ms smooth timer precision for UI bar & calculations
    },

    // Combat damage formulas
    damageRule: {
      basePlayerDamage: 100,       // Base damage dealt by correct answer
      speedBonusMax: 60,           // Extra speed bonus for instant reaction
      bossAttackDamage: 25,        // Damage dealt to player on wrong answer or timeout

      /**
       * Calculate damage dealt to Boss by player
       * @param {Object} params
       * @param {boolean} params.isCorrect - Whether player selected correct answer
       * @param {number} params.timeTaken - Seconds taken to answer (e.g. 1.8)
       * @param {number} params.timeLimit - Question time limit (7)
       * @param {number} params.combo - Current combo streak before this hit
       * @returns {Object} { damage, isCrit, speedBonus, comboMultiplier, floatLabel }
       */
      calculatePlayerDamage: ({ isCorrect, timeTaken = 0, timeLimit = 7, combo = 0 }) => {
        if (!isCorrect) {
          return {
            damage: 0,
            isCrit: false,
            speedBonus: 0,
            comboMultiplier: 1,
            floatLabel: 'MISS'
          };
        }

        // Speed Factor: remaining time ratio (0.0 ~ 1.0)
        const timeRatio = Math.max(0, Math.min(1, (timeLimit - timeTaken) / timeLimit));
        
        // Speed bonus: up to +60 damage if answered instantly (< 2s)
        const speedBonus = Math.round(timeRatio * 60);
        
        // Combo multiplier: +20% per combo streak (e.g. Combo 3 = 1.6x)
        const comboMultiplier = 1 + Math.min(combo, 8) * 0.2;

        // Is Critical Strike: answered in less than 2.5 seconds
        const isCrit = timeTaken <= 2.5;
        const critMultiplier = isCrit ? 1.35 : 1.0;

        const rawDamage = (100 + speedBonus) * comboMultiplier * critMultiplier;
        const finalDamage = Math.round(rawDamage);

        let floatLabel = `${finalDamage}`;
        if (isCrit && combo >= 3) {
          floatLabel = `⚡ ULTRA CRIT! -${finalDamage}`;
        } else if (isCrit) {
          floatLabel = `SPEED CRIT! -${finalDamage}`;
        } else if (combo >= 3) {
          floatLabel = `COMBO x${combo}! -${finalDamage}`;
        } else {
          floatLabel = `-${finalDamage}`;
        }

        return {
          damage: finalDamage,
          isCrit,
          speedBonus,
          comboMultiplier: parseFloat(comboMultiplier.toFixed(2)),
          floatLabel
        };
      }
    },

    // Combo streak rules
    comboRule: {
      breakOnWrong: true,
      breakOnTimeout: true,
      /**
       * Returns multiplier formatted for display or calculations
       */
      getMultiplier: (combo) => 1 + Math.min(combo, 8) * 0.2
    },

    // Victory & Defeat conditions
    winCondition: {
      mode: 'deplete_boss_hp',     // Primary win condition: Boss HP drops to 0
      bossTotalHp: 1000,           // Balanced so 8 solid hits KO the boss
      playerMaxHp: 100,            // Player starts with 100 HP (can take 4 misses before KO)
      allowTimeoutFail: true       // Timeout damages player HP
    },

    // Battle cadence & UI pacing
    battleRules: {
      allowSkip: false,
      instantNext: false,
      feedbackDelayMs: 650,        // 650ms punchy attack animation before next question
      showSpeedometer: true        // Speed-type specific UI widget
    }
  },

  /**
   * Placeholder / Stubs for future Boss Types
   * Ensuring the architecture is fully pluggable without structural changes.
   */
  shield: {
    typeId: 'shield',
    typeName: 'Shield Guard (护盾破除型)',
    badge: '🛡️',
    description: 'Boss 拥有多层知识护盾，需在限定弱点科目连击破盾。',
    questionCount: 10,
    timerRule: { mode: 'per_question', timeLimit: 12, urgentThreshold: 3, tickIntervalMs: 100 },
    damageRule: { basePlayerDamage: 80, bossAttackDamage: 20 },
    comboRule: { breakOnWrong: true, breakOnTimeout: true, getMultiplier: (c) => 1 + c * 0.15 },
    winCondition: { mode: 'deplete_boss_hp', bossTotalHp: 1200, playerMaxHp: 100 }
  },

  elemental: {
    typeId: 'elemental',
    typeName: 'Elemental Rift (属性共鸣型)',
    badge: '🔮',
    description: '不同题目对应水/火/雷属性，针对 Boss 弱点属性可打出 2 倍克制伤害。',
    questionCount: 9,
    timerRule: { mode: 'per_question', timeLimit: 10, urgentThreshold: 3, tickIntervalMs: 100 },
    damageRule: { basePlayerDamage: 90, bossAttackDamage: 20 },
    comboRule: { breakOnWrong: true, breakOnTimeout: true, getMultiplier: (c) => 1 + c * 0.2 },
    winCondition: { mode: 'deplete_boss_hp', bossTotalHp: 1100, playerMaxHp: 100 }
  },

  puzzle: {
    typeId: 'puzzle',
    typeName: 'Mind Maze (迷宫心智型)',
    badge: '🧩',
    description: '连线与线索解谜战斗，限定步数内击破 Boss 核心。',
    questionCount: 6,
    timerRule: { mode: 'per_question', timeLimit: 15, urgentThreshold: 4, tickIntervalMs: 100 },
    damageRule: { basePlayerDamage: 150, bossAttackDamage: 30 },
    comboRule: { breakOnWrong: true, breakOnTimeout: true, getMultiplier: (c) => 1 + c * 0.25 },
    winCondition: { mode: 'deplete_boss_hp', bossTotalHp: 900, playerMaxHp: 100 }
  },

  endurance: {
    typeId: 'endurance',
    typeName: 'Endurance Marathon (极限耐力型)',
    badge: '⏱️',
    description: '无限答题波次， Boss 攻击频率逐渐加快，测试极限生存记录。',
    questionCount: 15,
    timerRule: { mode: 'per_question', timeLimit: 8, urgentThreshold: 2, tickIntervalMs: 100 },
    damageRule: { basePlayerDamage: 70, bossAttackDamage: 15 },
    comboRule: { breakOnWrong: true, breakOnTimeout: true, getMultiplier: (c) => 1 + c * 0.1 },
    winCondition: { mode: 'deplete_boss_hp', bossTotalHp: 1500, playerMaxHp: 100 }
  }
};

/**
 * Retrieve a Boss Type specification by its typeId
 * @param {string} typeId
 * @returns {Object} BossType specification (defaults to speed)
 */
export const getBossType = (typeId = 'speed') => {
  return BOSS_TYPES[typeId] || BOSS_TYPES.speed;
};

/**
 * List all registered Boss Types
 * @returns {Array} List of Boss Type configurations
 */
export const getAllBossTypes = () => {
  return Object.values(BOSS_TYPES);
};
