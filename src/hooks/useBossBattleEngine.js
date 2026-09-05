import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BATTLE_PHASES,
  PLAYER_ANIMATIONS,
  BOSS_ANIMATIONS,
  BATTLE_RESULTS,
  BATTLE_TIMINGS
} from '../data/battleConstants.js';
import { mockDb } from '../lib/mockDb.js';

/**
 * Universal Boss Battle Engine Hook (V1)
 * 
 * CORE RESPONSIBILITIES:
 * - Manages universal battle states (bossType, bossId, bossHP, stats, animations, phases)
 * - Executes the strict combat lifecycle pipeline:
 *   INTRO -> QUESTION -> ANSWER_LOCKED -> (PLAYER_ATTACK -> BOSS_HIT) or (MISS -> BOSS_BLOCK) -> NEXT_QUESTION -> RESULT
 * - V1 Simplifications: No player HP, Boss BLOCKs without attacking, results are VICTORY or BOSS_ESCAPED, 1 damage per correct answer.
 * 
 * @param {Object} params
 * @param {Object} params.encounter - Encounter configuration from createBossEncounter
 * @param {Array} params.questions - Questions array for the battle
 * @param {Function} [params.onComplete] - Callback on battle termination
 */
export const useBossBattleEngine = ({
  encounter,
  questions = [],
  onComplete
}) => {
  // 1. Immutable Boss & Type Identity
  const bossType = encounter?.type?.id || 'speed';
  const bossId = encounter?.character?.id || 'chrono_lynx';
  const totalQuestions = questions.length || encounter?.type?.questionCount || 8;
  const maxBossHP = encounter?.initialState?.maxBossHP || totalQuestions;

  // 2. Core Combat States
  const [bossHP, setBossHP] = useState(maxBossHP);
  const [questionIndex, setQuestionIndex] = useState(0);

  // 3. Question Statistics
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);

  // 4. Combo Tracking
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // 5. Phase & Animation State Machine
  const [battlePhase, setBattlePhase] = useState(BATTLE_PHASES.INTRO);
  const [playerAnimation, setPlayerAnimation] = useState(PLAYER_ANIMATIONS.IDLE);
  const [bossAnimation, setBossAnimation] = useState(BOSS_ANIMATIONS.IDLE);
  const [battleResult, setBattleResult] = useState(null); // null | 'VICTORY' | 'BOSS_ESCAPED'

  // 6. Visual Feedback States (Damage Float, Last Locked Answer)
  const [damageFloat, setDamageFloat] = useState(null); // { label, isCrit, isBlock }
  const [lastSelectedOption, setLastSelectedOption] = useState(null);

  // Timer Ref for clean lifecycle orchestration
  const timerRef = useRef(null);

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Safe timer scheduler
  const scheduleTransition = useCallback((callback, delayMs) => {
    clearPendingTimer();
    timerRef.current = setTimeout(callback, delayMs);
  }, [clearPendingTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearPendingTimer();
  }, [clearPendingTimer]);

  // -------------------------------------------------------------
  // Phase 1: INTRO sequence
  // -------------------------------------------------------------
  useEffect(() => {
    if (battlePhase === BATTLE_PHASES.INTRO) {
      setPlayerAnimation(PLAYER_ANIMATIONS.IDLE);
      setBossAnimation(BOSS_ANIMATIONS.IDLE);
      setDamageFloat(null);

      scheduleTransition(() => {
        setBattlePhase(BATTLE_PHASES.QUESTION);
      }, BATTLE_TIMINGS.INTRO_MS);
    }
  }, [battlePhase, scheduleTransition]);

  // -------------------------------------------------------------
  // Transition into Next Question / Final Result Check
  // -------------------------------------------------------------
  const transitionToNextOrFinish = useCallback((currentRemainingBossHp) => {
    const nextQIndex = questionIndex + 1;

    // Victory Check: Boss HP reached 0
    if (currentRemainingBossHp <= 0) {
      setPlayerAnimation(PLAYER_ANIMATIONS.VICTORY);
      setBossAnimation(BOSS_ANIMATIONS.DEFEAT);
      setBattlePhase(BATTLE_PHASES.RESULT);
      setBattleResult(BATTLE_RESULTS.VICTORY);
      return;
    }

    // Question Pool Depleted Check: Questions finished but Boss still has HP
    if (nextQIndex >= totalQuestions) {
      setPlayerAnimation(PLAYER_ANIMATIONS.IDLE);
      setBossAnimation(BOSS_ANIMATIONS.ESCAPE);
      setBattlePhase(BATTLE_PHASES.RESULT);
      setBattleResult(BATTLE_RESULTS.BOSS_ESCAPED);
      return;
    }

    // Advance to next question
    setBattlePhase(BATTLE_PHASES.NEXT_QUESTION);
    setPlayerAnimation(PLAYER_ANIMATIONS.IDLE);
    setBossAnimation(BOSS_ANIMATIONS.IDLE);
    setDamageFloat(null);
    setLastSelectedOption(null);

    const nextDelay = encounter?.type?.cadence?.nextTransitionMs || BATTLE_TIMINGS.NEXT_TRANSITION_MS;
    scheduleTransition(() => {
      setQuestionIndex(nextQIndex);
      setBattlePhase(BATTLE_PHASES.QUESTION);
    }, nextDelay);
  }, [questionIndex, totalQuestions, encounter, scheduleTransition]);

  // Configurable duration for showing correct answer on wrong/timeout
  const revealAnswerMs = encounter?.type?.battleRules?.revealAnswerMs || BATTLE_TIMINGS.REVEAL_ANSWER_MS;

  // Track revealed correct option index when user makes a mistake
  const [revealedCorrectIndex, setRevealedCorrectIndex] = useState(null);

  // -------------------------------------------------------------
  // Core Action: Submit Answer (Click an option)
  // -------------------------------------------------------------
  const submitAnswer = useCallback((selectedIndex, timeTaken = 0) => {
    if (battlePhase !== BATTLE_PHASES.QUESTION) return;

    clearPendingTimer();
    setBattlePhase(BATTLE_PHASES.ANSWER_LOCKED);
    setLastSelectedOption(selectedIndex);
    setRevealedCorrectIndex(null);

    const currentQ = questions[questionIndex];
    if (!currentQ) return;

    // Direct answer comparison (supports index or value)
    const isCorrect = typeof currentQ.correctIndex === 'number'
      ? selectedIndex === currentQ.correctIndex
      : currentQ.options
        ? currentQ.options[selectedIndex] === currentQ.correctAnswer
        : selectedIndex === currentQ.correctAnswer;

    // Find correct index for revealing later if wrong
    let actualCorrectIndex = -1;
    if (typeof currentQ.correctIndex === 'number') {
      actualCorrectIndex = currentQ.correctIndex;
    } else if (currentQ.options && currentQ.correctAnswer) {
      actualCorrectIndex = currentQ.options.indexOf(currentQ.correctAnswer);
    }

    // Dynamic Cadence: Speed Type scales with combo momentum ("越来越快")
    const customCadence = encounter?.type?.cadence;
    const speedFactor = (isCorrect && customCadence?.accelerateWithCombo)
      ? Math.max(0.72, 1 - Math.min(combo, 6) * 0.05)
      : 1.0;

    const lockDelay = Math.round((customCadence?.answerLockMs || BATTLE_TIMINGS.ANSWER_LOCK_MS) * speedFactor);
    const attackDelay = Math.round((customCadence?.playerAttackMs || BATTLE_TIMINGS.PLAYER_ATTACK_MS) * speedFactor);
    const reactionDelay = Math.round((customCadence?.bossReactionMs || BATTLE_TIMINGS.BOSS_REACTION_MS) * speedFactor);

    // Phase: ANSWER_LOCKED (brief pause to show selection)
    scheduleTransition(() => {
      // Step: Player Attack animation
      const isCrit = timeTaken <= 2.5;
      const attackAnim = isCrit ? PLAYER_ANIMATIONS.CRIT_ATTACK : PLAYER_ANIMATIONS.ATTACK;
      setPlayerAnimation(attackAnim);
      setBattlePhase(BATTLE_PHASES.PLAYER_ATTACK);

      if (isCorrect) {
        // --- BRANCH A: CORRECT HIT ---
        const nextCombo = combo + 1;
        setCorrect(prev => prev + 1);
        setCombo(nextCombo);
        setMaxCombo(prev => Math.max(prev, nextCombo));

        // Long-term learning history tracking
        mockDb.recordQuestionAnswer({
          question: currentQ,
          isCorrect: true,
          selectedOption: selectedIndex,
          source: 'boss_battle'
        });

        // Player attacks -> Boss Hit (ultra snappy)
        scheduleTransition(() => {
          setBossAnimation(BOSS_ANIMATIONS.HIT);
          setBattlePhase(BATTLE_PHASES.BOSS_HIT);

          // Calculate V1 damage: exactly 1 HP per correct answer
          const newBossHp = Math.max(0, bossHP - 1);
          setBossHP(newBossHp);

          // Step 8: Speed Combo Visual Progression (Level 1 ~ 8)
          const damageCalc = encounter?.type?.damageRule?.calculatePlayerDamage
            ? encounter.type.damageRule.calculatePlayerDamage({ isCorrect: true, timeTaken, combo: nextCombo })
            : null;

          const floatLabel = damageCalc?.floatLabel || (isCrit ? `SPEED CRIT! -1` : `-1 HP`);
          setDamageFloat({
            label: floatLabel,
            isCrit,
            isBlock: false,
            comboTier: damageCalc?.comboTier
          });

          // Boss Hit Reaction finishes -> Next Question (0.5s ~ 0.7s total turnaround)
          scheduleTransition(() => {
            transitionToNextOrFinish(newBossHp);
          }, reactionDelay);
        }, attackDelay);

      } else {
        // --- BRANCH B: WRONG ANSWER ---
        // Player Attack -> Boss Block -> Show Correct Answer -> Next Question
        setWrong(prev => prev + 1);
        setCombo(0);

        // Long-term learning & WRONG question bank tracking (saved permanently for RECALL / Memory Boss)
        mockDb.recordQuestionAnswer({
          question: currentQ,
          isCorrect: false,
          selectedOption: selectedIndex,
          source: 'boss_battle'
        });

        scheduleTransition(() => {
          setBossAnimation(BOSS_ANIMATIONS.BLOCK);
          setBattlePhase(BATTLE_PHASES.BOSS_BLOCK);
          setDamageFloat({ label: 'BLOCK!', isCrit: false, isBlock: true });

          // Boss Block finishes -> Show Correct Answer
          scheduleTransition(() => {
            setBattlePhase(BATTLE_PHASES.SHOW_CORRECT_ANSWER);
            setRevealedCorrectIndex(actualCorrectIndex);

            // Give player time to absorb the correct answer before advancing
            scheduleTransition(() => {
              transitionToNextOrFinish(bossHP);
            }, revealAnswerMs);
          }, reactionDelay);
        }, attackDelay);
      }
    }, lockDelay);
  }, [
    battlePhase,
    questions,
    questionIndex,
    combo,
    bossHP,
    revealAnswerMs,
    clearPendingTimer,
    scheduleTransition,
    transitionToNextOrFinish
  ]);

  // -------------------------------------------------------------
  // Core Action: Timeout (Timer reaches 0)
  // -------------------------------------------------------------
  const handleTimeout = useCallback(() => {
    if (battlePhase !== BATTLE_PHASES.QUESTION) return;

    clearPendingTimer();
    setBattlePhase(BATTLE_PHASES.ANSWER_LOCKED);
    setLastSelectedOption(null);
    setRevealedCorrectIndex(null);
    setSkipped(prev => prev + 1);
    setCombo(0);

    const currentQ = questions[questionIndex];
    let actualCorrectIndex = -1;
    if (currentQ) {
      if (typeof currentQ.correctIndex === 'number') {
        actualCorrectIndex = currentQ.correctIndex;
      } else if (currentQ.options && currentQ.correctAnswer) {
        actualCorrectIndex = currentQ.options.indexOf(currentQ.correctAnswer);
      }

      // Record timeout into wrong question bank
      mockDb.recordQuestionAnswer({
        question: currentQ,
        isCorrect: false,
        selectedOption: null,
        source: 'boss_battle_timeout'
      });
    }

    scheduleTransition(() => {
      // Player executes attack, but times out / too slow
      setPlayerAnimation(PLAYER_ANIMATIONS.ATTACK);
      setBattlePhase(BATTLE_PHASES.PLAYER_ATTACK);

      scheduleTransition(() => {
        setBossAnimation(BOSS_ANIMATIONS.BLOCK);
        setBattlePhase(BATTLE_PHASES.BOSS_BLOCK);
        setDamageFloat({ label: 'TIME UP! BLOCKED', isCrit: false, isBlock: true });

        scheduleTransition(() => {
          setBattlePhase(BATTLE_PHASES.SHOW_CORRECT_ANSWER);
          setRevealedCorrectIndex(actualCorrectIndex);

          scheduleTransition(() => {
            transitionToNextOrFinish(bossHP);
          }, revealAnswerMs);
        }, BATTLE_TIMINGS.BOSS_REACTION_MS);
      }, BATTLE_TIMINGS.PLAYER_ATTACK_MS);
    }, BATTLE_TIMINGS.ANSWER_LOCK_MS);
  }, [
    battlePhase,
    questions,
    questionIndex,
    bossHP,
    revealAnswerMs,
    clearPendingTimer,
    scheduleTransition,
    transitionToNextOrFinish
  ]);

  // -------------------------------------------------------------
  // Utility: Skip Intro immediately
  // -------------------------------------------------------------
  const skipIntro = useCallback(() => {
    if (battlePhase === BATTLE_PHASES.INTRO) {
      clearPendingTimer();
      setBattlePhase(BATTLE_PHASES.QUESTION);
    }
  }, [battlePhase, clearPendingTimer]);

  // -------------------------------------------------------------
  // Notify external listener on result
  // -------------------------------------------------------------
  useEffect(() => {
    if (battlePhase === BATTLE_PHASES.RESULT && battleResult && onComplete) {
      onComplete({
        result: battleResult,
        correct,
        wrong,
        skipped,
        maxCombo,
        bossHP,
        maxBossHP,
        totalQuestions
      });
    }
  }, [
    battlePhase,
    battleResult,
    correct,
    wrong,
    skipped,
    maxCombo,
    bossHP,
    maxBossHP,
    totalQuestions,
    onComplete
  ]);

  // -------------------------------------------------------------
  // Utility: Restart Battle (Reset states to initial values)
  // -------------------------------------------------------------
  const resetBattle = useCallback(() => {
    clearPendingTimer();
    setBossHP(maxBossHP);
    setQuestionIndex(0);
    setCorrect(0);
    setWrong(0);
    setSkipped(0);
    setCombo(0);
    setMaxCombo(0);
    setPlayerAnimation(PLAYER_ANIMATIONS.IDLE);
    setBossAnimation(BOSS_ANIMATIONS.IDLE);
    setBattleResult(null);
    setDamageFloat(null);
    setLastSelectedOption(null);
    setRevealedCorrectIndex(null);
    setBattlePhase(BATTLE_PHASES.INTRO);

    // Re-trigger INTRO timer
    scheduleTransition(() => {
      setBattlePhase(BATTLE_PHASES.QUESTION);
    }, BATTLE_TIMINGS.INTRO_MS);
  }, [clearPendingTimer, maxBossHP, scheduleTransition]);

  // Active question object
  const currentQuestion = questions[questionIndex] || null;

  return {
    // 1. Identity
    bossType,
    bossId,

    // 2. Boss HP
    maxBossHP,
    bossHP,

    // 3. Question Progress
    questionIndex,
    totalQuestions,
    currentQuestion,

    // 4. Statistics
    correct,
    wrong,
    skipped,

    // 5. Combo
    combo,
    maxCombo,

    // 6. State Machine & Animations
    battlePhase,
    playerAnimation,
    bossAnimation,
    battleResult,

    // 7. Visual Feedback
    damageFloat,
    lastSelectedOption,
    revealedCorrectIndex,

    // 8. Control Dispatchers
    submitAnswer,
    handleTimeout,
    skipIntro,
    resetBattle
  };
};
