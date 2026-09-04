import React, { useState } from 'react';

/**
 * LobbySideAction
 * Tactile, 3D mobile game action button used on Home Lobby sidebars.
 * Supports:
 * - Red Dot alert (with gentle pulse animation)
 * - Status Badge / Pill (e.g. 'READY', 'Day 3', '04:12')
 * - Interactive click feedback
 */
const LobbySideAction = ({
  icon,
  label,
  badgeType = null, // 'dot' | 'pill'
  badgeText = '',
  badgeColor = '#EF4444',
  glowColor = 'rgba(255, 255, 255, 0.15)',
  onClick
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      style={{
        position: 'relative',
        width: '52px',
        height: '56px',
        padding: '6px 2px 4px',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        border: `2px solid ${glowColor}`,
        boxShadow: isPressed
          ? '0 1px 3px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transform: isPressed ? 'translateY(3px)' : 'translateY(0)',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        outline: 'none',
        userSelect: 'none'
      }}
    >
      {/* Red Dot Notification */}
      {badgeType === 'dot' && (
        <span
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: badgeColor,
            border: '2px solid #0F172A',
            boxShadow: `0 0 8px ${badgeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: badgeColor,
              opacity: 0.75,
              animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
        </span>
      )}

      {/* Main Icon */}
      <span
        style={{
          fontSize: '22px',
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
        }}
      >
        {icon}
      </span>

      {/* Label or Pill */}
      {badgeType === 'pill' ? (
        <span
          style={{
            fontSize: '9px',
            fontWeight: 900,
            color: '#FFFFFF',
            background: badgeColor,
            padding: '1px 5px',
            borderRadius: '9999px',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            boxShadow: `0 2px 4px rgba(0,0,0,0.4), 0 0 6px ${badgeColor}66`,
            marginTop: '1px',
            whiteSpace: 'nowrap'
          }}
        >
          {badgeText}
        </span>
      ) : (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#CBD5E1',
            letterSpacing: '0.2px',
            lineHeight: 1.1
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
};

export default LobbySideAction;
