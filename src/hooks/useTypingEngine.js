/**
 * useTypingEngine.js
 * Playbank English Typing Game Core State Machine Hook
 * 
 * Rules:
 * 1. Correct character: Blue ('correct')
 * 2. Wrong character: Red ('wrong') and retained in input
 * 3. Error Lock: When wrong character is present, isLocked = true
 *    - All incoming characters are blocked
 *    - ONLY Backspace is permitted to delete the wrong character
 * 4. Completion: When all characters match, turns Green ('completed')
 *    - Triggers onQuestionComplete callback
 * 5. Strict: NO Combo calculation
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { playKeyTypeSound, playErrorBuzzSound, playTypingSuccessSound } from '../lib/soundEffects.js';

export function useTypingEngine({
  targetText = '',
  onQuestionComplete = null,
  soundEnabled = true,
  autoAdvanceDelayMs = 400
} = {}) {
  const [userInput, setUserInput] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Clean target text (trim extra trailing spaces)
  const cleanTarget = useMemo(() => targetText || '', [targetText]);
  const isCompletedRef = useRef(false);

  // Reset state when targetText changes
  useEffect(() => {
    setUserInput('');
    setIsLocked(false);
    setIsCompleted(false);
    isCompletedRef.current = false;
  }, [cleanTarget]);

  /**
   * Character-level breakdown for rendering
   */
  const charStates = useMemo(() => {
    const chars = cleanTarget.split('');
    const inputChars = userInput.split('');

    return chars.map((expectedChar, idx) => {
      const typedChar = inputChars[idx];
      let status = 'pending';

      if (isCompleted) {
        status = 'completed'; // Whole sentence turns vibrant green!
      } else if (typedChar !== undefined) {
        if (typedChar === expectedChar) {
          status = 'correct'; // Blue
        } else {
          status = 'wrong'; // Red
        }
      } else if (idx === inputChars.length && !isLocked) {
        status = 'current'; // Active cursor position
      }

      return {
        expectedChar,
        typedChar: typedChar || '',
        status,
        isSpace: expectedChar === ' '
      };
    });
  }, [cleanTarget, userInput, isLocked, isCompleted]);

  /**
   * Handle completion trigger
   */
  const handleComplete = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsCompleted(true);

    if (soundEnabled) {
      playTypingSuccessSound();
    }

    if (typeof onQuestionComplete === 'function') {
      setTimeout(() => {
        onQuestionComplete();
      }, autoAdvanceDelayMs);
    }
  }, [soundEnabled, onQuestionComplete, autoAdvanceDelayMs]);

  /**
   * Process a single character entry (Desktop keydown or Mobile input)
   */
  const handleCharInput = useCallback((char) => {
    if (isCompletedRef.current || !cleanTarget) return;

    // 1. If currently locked by an error, block all new characters!
    if (isLocked) {
      if (soundEnabled) playErrorBuzzSound();
      return;
    }

    const currentIndex = userInput.length;
    if (currentIndex >= cleanTarget.length) return;

    const expectedChar = cleanTarget[currentIndex];

    // 2. Check match (case-sensitive as standard English spelling)
    if (char === expectedChar) {
      const nextInput = userInput + char;
      setUserInput(nextInput);
      if (soundEnabled) playKeyTypeSound();

      // Check if complete
      if (nextInput.length === cleanTarget.length) {
        handleComplete();
      }
    } else {
      // 3. Wrong character entered! Retain it and enter LOCKED state
      const nextInput = userInput + char;
      setUserInput(nextInput);
      setIsLocked(true);
      setErrorCount((prev) => prev + 1);
      if (soundEnabled) playErrorBuzzSound();
    }
  }, [cleanTarget, userInput, isLocked, soundEnabled, handleComplete]);

  /**
   * Handle Backspace: deletes the last character and unlocks if error is cleared
   */
  const handleBackspace = useCallback(() => {
    if (isCompletedRef.current || userInput.length === 0) return;

    const nextInput = userInput.slice(0, -1);
    setUserInput(nextInput);

    // If we were locked, check if the remaining input is now free of error
    if (isLocked) {
      const remainingMatches = cleanTarget.startsWith(nextInput);
      if (remainingMatches) {
        setIsLocked(false);
      }
    }

    if (soundEnabled) playKeyTypeSound();
  }, [userInput, cleanTarget, isLocked, soundEnabled]);

  /**
   * Direct KeyDown handler for desktop keyboard
   */
  const handleKeyDown = useCallback((e) => {
    if (isCompletedRef.current) return;

    // Ignore system / modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    // Only process printable single characters
    if (e.key.length === 1) {
      e.preventDefault();
      handleCharInput(e.key);
    }
  }, [handleBackspace, handleCharInput]);

  /**
   * Mobile Hidden Input change handler
   * Synchronizes mobile virtual keyboard input with the state machine
   */
  const handleMobileInputChange = useCallback((rawNewVal) => {
    if (isCompletedRef.current || rawNewVal === undefined) return;

    const oldLen = userInput.length;
    const newLen = rawNewVal.length;

    if (newLen > oldLen) {
      // User typed one or more new characters
      const addedChars = rawNewVal.slice(oldLen);
      for (const ch of addedChars) {
        handleCharInput(ch);
      }
    } else if (newLen < oldLen) {
      // User pressed backspace on virtual keyboard
      const diff = oldLen - newLen;
      for (let i = 0; i < diff; i++) {
        handleBackspace();
      }
    }
  }, [userInput, handleCharInput, handleBackspace]);

  return {
    userInput,
    isLocked,
    isCompleted,
    errorCount,
    charStates,
    progressPercent: cleanTarget.length > 0 ? Math.round((userInput.length / cleanTarget.length) * 100) : 0,
    handleKeyDown,
    handleMobileInputChange,
    handleBackspace
  };
}
