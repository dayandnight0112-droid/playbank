import React from 'react';

const PrimaryButton = ({
  children,
  subtitle,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary' | 'dark' | 'success'
  size = 'large', // 'normal' | 'large'
  style = {},
  className = ''
}) => {
  const isLarge = size === 'large';

  // Theme color maps
  const colorMap = {
    primary: {
      bg: 'var(--brand-primary, #FFBC00)',
      shadow: '#C98F00',
      border: '#000000',
      text: '#000000'
    },
    dark: {
      bg: '#1F2937',
      shadow: '#000000',
      border: '#000000',
      text: '#FFFFFF'
    },
    success: {
      bg: '#10B981',
      shadow: '#047857',
      border: '#000000',
      text: '#FFFFFF'
    }
  };

  const colors = colorMap[variant] || colorMap.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`game-primary-btn ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        padding: isLarge ? '18px 24px' : '14px 20px',
        background: colors.bg,
        border: `3px solid ${colors.border}`,
        borderRadius: isLarge ? '24px' : '16px',
        boxShadow: `0 ${isLarge ? '7px' : '5px'} 0px #000000`,
        color: colors.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = `translateY(${isLarge ? '5px' : '4px'})`;
          e.currentTarget.style.boxShadow = '0 2px 0px #000000';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 ${isLarge ? '7px' : '5px'} 0px #000000`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 ${isLarge ? '7px' : '5px'} 0px #000000`;
        }
      }}
      onTouchStart={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = `translateY(${isLarge ? '5px' : '4px'})`;
          e.currentTarget.style.boxShadow = '0 2px 0px #000000';
        }
      }}
      onTouchEnd={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 ${isLarge ? '7px' : '5px'} 0px #000000`;
        }
      }}
    >
      <span style={{
        fontSize: isLarge ? '24px' : '17px',
        fontWeight: 900,
        letterSpacing: '1px',
        lineHeight: 1.1,
        textTransform: 'uppercase'
      }}>
        {children}
      </span>
      {subtitle && (
        <span style={{
          fontSize: isLarge ? '13px' : '11px',
          fontWeight: 700,
          opacity: 0.85,
          letterSpacing: '0.5px'
        }}>
          {subtitle}
        </span>
      )}
    </button>
  );
};

export default PrimaryButton;
