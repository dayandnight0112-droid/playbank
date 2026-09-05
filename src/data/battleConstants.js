/**
 * Battle Constants & State Machine Enums (Universal for all Bosses)
 * 
 * V1 SCOPE:
 * - No player HP system
 * - Wrong answer leads to Boss BLOCK animation without hurting player
 * - Battle result is either 'VICTORY' or 'BOSS_ESCAPED'
 * - Streamlined animations
 */

export const BATTLE_PHASES = {
  INTRO: 'INTRO',                     // Entrance animation & VS banner (1.5s)
  QUESTION: 'QUESTION',               // Question visible, timer active, waiting for answer
  ANSWER_LOCKED: 'ANSWER_LOCKED',     // Selected or timed out, interaction locked
  PLAYER_ATTACK: 'PLAYER_ATTACK',     // Player executes attack animation (both on correct & wrong)
  BOSS_HIT: 'BOSS_HIT',               // Correct: Boss takes hit, HP -1, flash & shake
  BOSS_BLOCK: 'BOSS_BLOCK',           // Wrong/Timeout: Boss blocks attack, shield / deflect reaction
  SHOW_CORRECT_ANSWER: 'SHOW_CORRECT_ANSWER', // Wrong/Timeout: Highlight correct answer for education
  NEXT_QUESTION: 'NEXT_QUESTION',     // Transition to next question
  RESULT: 'RESULT'                    // Final outcome: VICTORY or BOSS_ESCAPED
};

export const PLAYER_ANIMATIONS = {
  IDLE: 'IDLE',
  ATTACK: 'ATTACK',
  CRIT_ATTACK: 'CRIT_ATTACK',
  VICTORY: 'VICTORY'
};

export const BOSS_ANIMATIONS = {
  IDLE: 'IDLE',
  HIT: 'HIT',
  BLOCK: 'BLOCK',
  DEFEAT: 'DEFEAT',
  ESCAPE: 'ESCAPE'
};

export const BATTLE_RESULTS = {
  VICTORY: 'VICTORY',
  BOSS_ESCAPED: 'BOSS_ESCAPED'
};

/**
 * Cadence timings (in milliseconds)
 * Configurable defaults that can be overridden per Boss Type
 */
export const BATTLE_TIMINGS = {
  INTRO_MS: 1500,           // Duration of INTRO phase before 1st question
  ANSWER_LOCK_MS: 280,      // Brief pause upon clicking option to show selection state
  PLAYER_ATTACK_MS: 380,    // Duration of player slash/strike animation before impact
  BOSS_REACTION_MS: 480,    // Duration of boss hit shake or block bounce
  REVEAL_ANSWER_MS: 800,    // Time showing the revealed correct answer on miss
  NEXT_TRANSITION_MS: 250   // Smooth question swap delay
};
