import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDb } from '../lib/mockDb';

export const TUTORIAL_TOTAL_STEPS = 10;

/**
 * Tutorial State Machine
 * Coordinates steps 1 to 10, progressive feedback, combo, timer, and automatic persistence.
 */
export const useTutorialStateMachine = ({
  guest,
  onComplete,
  onExit
}) => {
  // Step tracker: 1 .. TUTORIAL_TOTAL_STEPS, or 'complete'
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = guest?.tutorialStep;
    if (saved && saved >= 1 && saved <= TUTORIAL_TOTAL_STEPS) {
      return saved;
    }
    return 1;
  });

  // State phases for the current step: 'answering' | 'feedback' | 'feature_unlock' | 'complete'
  const [phase, setPhase] = useState('answering');
  
  // Last answer result
  const [lastAnswerResult, setLastAnswerResult] = useState(null); // { isCorrect, pointsEarned, explanation, selectedIndex }

  // Session stats during tutorial
  const [earnedBP, setEarnedBP] = useState(() => guest?.bankPoint || 0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Timer for 10-Second Challenge (Step 8)
  const [timeRemaining, setTimeRemaining] = useState(10);
  const timerRef = useRef(null);

  // Auto-sync progress to guest profile in localStorage
  const saveProgress = useCallback((stepNumber, bpAmount) => {
    if (guest?.id) {
      mockDb.updateGuestProfile({
        tutorialStep: stepNumber,
        tutorialProgress: stepNumber,
        bankPoint: bpAmount
      });
    }
  }, [guest?.id]);

  // Answer handling
  const handleAnswer = useCallback((selectedIndex, correctIndex, points = 10, isTimed = false) => {
    if (phase !== 'answering') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      const nextCombo = currentCombo + 1;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);
      const nextBP = earnedBP + points;

      setCurrentCombo(nextCombo);
      setMaxCombo(nextMaxCombo);
      setEarnedBP(nextBP);

      setLastAnswerResult({
        isCorrect: true,
        pointsEarned: points,
        selectedIndex,
        combo: nextCombo
      });

      // Check if this step has a milestone unlock popup (e.g. Q3: BP, Q5: Combo, Q8: Timer)
      setPhase('feedback');
    } else {
      // Friendly retry / wrong feedback without punitive loss
      setCurrentCombo(0);
      setLastAnswerResult({
        isCorrect: false,
        pointsEarned: 0,
        selectedIndex,
        combo: 0
      });
      setPhase('feedback');
    }
  }, [phase, currentCombo, maxCombo, earnedBP]);

  // Advance to next step
  const nextStep = useCallback(() => {
    if (currentStep >= TUTORIAL_TOTAL_STEPS) {
      setPhase('complete');
      saveProgress(TUTORIAL_TOTAL_STEPS, earnedBP);
      if (onComplete) {
        onComplete(earnedBP, maxCombo);
      }
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      setPhase('answering');
      setLastAnswerResult(null);
      setTimeRemaining(10);
      saveProgress(next, earnedBP);
    }
  }, [currentStep, earnedBP, maxCombo, saveProgress, onComplete]);

  // Restart timer for timed questions
  const startTimer = useCallback((duration = 10, onTimeout) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(duration);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Jump to specific step (for resume or dev debugging)
  const jumpToStep = useCallback((stepNumber) => {
    const valid = Math.max(1, Math.min(TUTORIAL_TOTAL_STEPS, stepNumber));
    setCurrentStep(valid);
    setPhase('answering');
    setLastAnswerResult(null);
    saveProgress(valid, earnedBP);
  }, [earnedBP, saveProgress]);

  // Retry current question without penalty
  const retryQuestion = useCallback(() => {
    setPhase('answering');
    setLastAnswerResult(null);
  }, []);

  // Calculate remaining steps (used for Exit Retention popup in Step 31)
  const stepsRemaining = Math.max(0, TUTORIAL_TOTAL_STEPS - currentStep + 1);

  return {
    currentStep,
    totalSteps: TUTORIAL_TOTAL_STEPS,
    phase,
    setPhase,
    lastAnswerResult,
    earnedBP,
    currentCombo,
    maxCombo,
    timeRemaining,
    stepsRemaining,
    handleAnswer,
    nextStep,
    retryQuestion,
    startTimer,
    jumpToStep
  };
};
