import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * OnboardingBackButton
 * Circular 3D tactile back button matching the design specification.
 * Used at top-left from Step 3 through Step 11.
 */
const OnboardingBackButton = ({ onClick, style = {} }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top, 16px))',
        left: '20px',
        zIndex: 50,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: '#FFFFFF',
        border: '2.5px solid #000000',
        boxShadow: '0 3.5px 0 #000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: 'none',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
        ...style
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(2px)';
        e.currentTarget.style.boxShadow = '0 1.5px 0 #000000';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 3.5px 0 #000000';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'translateY(2px)';
        e.currentTarget.style.boxShadow = '0 1.5px 0 #000000';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 3.5px 0 #000000';
      }}
      aria-label="Back"
    >
      <ArrowLeft size={20} strokeWidth={3} color="#000000" />
    </button>
  );
};

export default OnboardingBackButton;
