import React from 'react';

const CurrencyBadge = ({
  icon = '🪙',
  amount = 0,
  accentColor = '#FBBF24',
  borderColor = 'rgba(245, 158, 11, 0.4)',
  onClick
}) => {
  const formattedAmount = typeof amount === 'number'
    ? (amount % 1 === 0 ? amount.toLocaleString() : amount.toFixed(1))
    : amount;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(30, 41, 59, 0.9)',
        border: `2px solid ${borderColor}`,
        borderRadius: '9999px',
        padding: '5px 12px 5px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 900,
          color: accentColor,
          letterSpacing: '0.3px',
          lineHeight: 1
        }}
      >
        {formattedAmount}
      </span>
    </div>
  );
};

export default CurrencyBadge;
