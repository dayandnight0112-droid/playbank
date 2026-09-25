import React, { useEffect, useRef } from 'react';

/**
 * TypingHiddenInput
 * High-performance Keep-Focus invisible input controller for Typing Game.
 * 
 * Features:
 * - Auto-focuses on mount and question change
 * - Listens for global clicks/touches to re-focus, preventing mobile keyboard dismissal
 * - Suppresses autocorrect, autocapitalize, and spellcheck to prevent IME candidate conflicts
 * - Transparent and strategically positioned to prevent scroll jumps
 */
export default function TypingHiddenInput({
  value = '',
  onChange,
  onKeyDown,
  disabled = false
}) {
  const inputRef = useRef(null);

  // Focus on mount and re-focus on value updates
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [disabled]);

  // Keep-Focus: Click anywhere on screen keeps the input focused for mobile keyboards
  useEffect(() => {
    const handleGlobalTap = (e) => {
      // Don't steal focus if user is clicking an interactive button or link
      if (e.target && (e.target.closest('button') || e.target.closest('a') || e.target.closest('input'))) {
        return;
      }
      if (!disabled && inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    window.addEventListener('click', handleGlobalTap, { passive: true });
    window.addEventListener('touchstart', handleGlobalTap, { passive: true });

    return () => {
      window.removeEventListener('click', handleGlobalTap);
      window.removeEventListener('touchstart', handleGlobalTap);
    };
  }, [disabled]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      autoFocus
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck="false"
      autoComplete="off"
      inputMode="text"
      aria-label="Typing Input Buffer"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.01,
        width: '1px',
        height: '1px',
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        pointerEvents: 'auto',
        zIndex: 1
      }}
    />
  );
}
