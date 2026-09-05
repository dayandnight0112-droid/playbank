/**
 * Boss Encounter Registry & Composition Factory
 * 
 * ARCHITECTURE ROLE:
 * Assembles a [BossCharacter] with a [BossType] into an immutable [BossEncounter]
 * for the Combat Engine to execute.
 * 
 * RULE:
 * Zero hardcoded name checks. Mechanics are derived solely from BossType,
 * while visual presentation is derived solely from BossCharacter.
 */

import { getBossCharacter } from './bossCharacters.js';
import { getBossType } from './bossTypes.js';

/**
 * Creates an encounter instance by cleanly coupling a character with a battle type.
 * @param {string} bossId - Character ID (e.g. 'chrono_lynx', 'pyro_golem')
 * @param {string} typeId - Battle mechanic ID (e.g. 'speed', 'shield')
 * @param {Object} [customOverrides={}] - Optional level scaling, reward bonuses, or overrides
 * @returns {Object} Ready-to-run encounter configuration
 */
export const createBossEncounter = (bossId = 'chrono_lynx', typeId = 'speed', customOverrides = {}) => {
  const character = getBossCharacter(bossId);
  const type = getBossType(typeId);

  // Derive initial combat state parameters strictly from type specification
  const maxBossHp = customOverrides.bossHp || type.bossHp || 8;
  const questionCount = customOverrides.questionCount || type.questionCount || 8;
  const timeLimit = customOverrides.timeLimit || type.timeLimit || 7;

  return {
    // Pure audiovisual & lore identity
    character: {
      id: character.bossId,
      name: character.bossName,
      title: character.title,
      lore: character.lore,
      artwork: character.artwork,
      sprites: character.sprites,
      theme: character.theme,
      sound: character.sound
    },

    // Pure battle mechanics & calculation engine
    type: {
      id: type.type,
      name: type.displayName,
      description: type.description,
      questionCount,
      bossHp: maxBossHp,
      timerMode: type.timerMode,
      timeLimit,
      urgentThreshold: type.urgentThreshold || 3,
      questionMode: type.questionMode,
      battleModifier: type.battleModifier,
      introBanner: type.introBanner || null,
      cadence: type.cadence || null,
      damageRule: type.damageRule,
      comboRule: type.comboRule,
      battleRules: type.battleRules,
      isImplemented: type.isImplemented !== false
    },

    // Derived combat configuration
    initialState: {
      bossHP: maxBossHp,
      maxBossHP: maxBossHp,
      currentQuestionIndex: 0,
      totalQuestions: questionCount,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      earnedBP: 0
    },

    // Optional metadata
    metadata: {
      createdAt: Date.now(),
      difficultyMultiplier: customOverrides.difficultyMultiplier || 1.0,
      rewardBPMultiplier: customOverrides.rewardBPMultiplier || 1.0
    }
  };
};

/**
 * Mapping of Chapter / Stage bosses for Story Mode
 */
export const CHAPTER_BOSS_MAPPING = {
  1: {
    characterId: 'chrono_lynx',
    typeId: 'speed',
    chapterName: 'Training Camp 极速试炼',
    rewardBP: 150
  },
  2: {
    characterId: 'chrono_lynx', // Same character, but could be speed with higher HP
    typeId: 'speed',
    chapterName: 'Mystic Library 极速破卷',
    rewardBP: 200
  },
  3: {
    characterId: 'pyro_golem',
    typeId: 'speed',           // Notice: Pyro Golem can ALSO equip Speed Type!
    chapterName: 'Sky Ruins 熔火竞速',
    rewardBP: 300
  }
};

/**
 * Get the encounter configuration for a given chapter
 * @param {number} chapter
 * @returns {Object} Boss encounter config
 */
export const getChapterBossEncounter = (chapter = 1) => {
  const mapping = CHAPTER_BOSS_MAPPING[chapter] || CHAPTER_BOSS_MAPPING[1];
  return createBossEncounter(mapping.characterId, mapping.typeId, {
    rewardBPMultiplier: mapping.rewardBP ? mapping.rewardBP / 100 : 1.0
  });
};
