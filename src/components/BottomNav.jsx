import React from 'react';
import { Home, Swords, Sprout, Gift, User } from 'lucide-react';

/**
 * BottomNav
 * Fixed 5-Tab Gaming Bottom Navigation Bar (Step 24):
 * ① Home (大厅)
 * ② Battle (对战/练习 - select_subject)
 * ③ Garden (庄园)
 * ④ Reward (奖励/商城 - marketplace)
 * ⑤ Profile (我的)
 */
const BottomNav = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'select_subject', icon: Swords, label: 'Battle' },
    { id: 'garden', icon: Sprout, label: 'Garden' },
    { id: 'marketplace', icon: Gift, label: 'Reward' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(255, 255, 255, 0.12)',
        padding: '8px 12px calc(14px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.45)',
        zIndex: 100,
        boxSizing: 'border-box'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'home' && !['select_subject', 'garden', 'marketplace', 'profile'].includes(currentView));

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentView(item.id)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 2px',
              cursor: 'pointer',
              color: isActive ? '#FFBC00' : '#94A3B8',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease',
              transform: isActive ? 'translateY(-2px)' : 'none',
              outline: 'none',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '32px',
                borderRadius: '16px',
                background: isActive ? 'rgba(255, 188, 0, 0.15)' : 'transparent',
                transition: 'background 0.15s ease'
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.6 : 2}
                color={isActive ? '#FFBC00' : '#94A3B8'}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(255, 188, 0, 0.5))' : 'none'
                }}
              />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 900 : 600,
                letterSpacing: '0.2px',
                lineHeight: 1
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
