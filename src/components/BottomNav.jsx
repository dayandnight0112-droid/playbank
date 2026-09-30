import React, { useState, useEffect } from 'react';
import { Home, Swords, Sprout, Gift, User, Mail } from 'lucide-react';
import { playTapSound } from '../lib/soundEffects';
import { ENABLE_GARDEN, ENABLE_BATTLE_NAV } from '../config/features';
import { notificationService } from '../lib/notificationService';

/**
 * BottomNav
 * Fixed Gaming Bottom Navigation Bar:
 * ① Home (大厅)
 * ② Notice (信封 - 账单与特权通知中心)
 * ③ Battle (对战/练习 - select_subject, 默认停用隐藏)
 * ④ Garden (庄园 - 暂时停用状态下隐藏)
 * ⑤ Reward (奖励/商城 - marketplace)
 * ⑥ Profile (我的)
 */
const BottomNav = ({ currentView, setCurrentView, playerId = 'guest' }) => {
  const [unreadCount, setUnreadCount] = useState(() => notificationService.getUnreadCount(playerId));

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(notificationService.getUnreadCount(playerId));
    };

    updateCount();
    const unsubscribe = notificationService.subscribe(updateCount);

    const handleEvent = () => updateCount();
    if (typeof window !== 'undefined') {
      window.addEventListener('playbank:notifications-updated', handleEvent);
      window.addEventListener('playbank:booster-unlocked', handleEvent);
      window.addEventListener('playbank:booster-refunded', handleEvent);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('playbank:notifications-updated', handleEvent);
        window.removeEventListener('playbank:booster-unlocked', handleEvent);
        window.removeEventListener('playbank:booster-refunded', handleEvent);
      }
    };
  }, [playerId]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'notifications', icon: Mail, label: 'Notice', badge: unreadCount },
    ...(ENABLE_BATTLE_NAV ? [{ id: 'select_subject', icon: Swords, label: 'Battle' }] : []),
    ...(ENABLE_GARDEN ? [{ id: 'garden', icon: Sprout, label: 'Garden' }] : []),
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
        const nonHomeViews = [
          'notifications',
          ...(ENABLE_BATTLE_NAV ? ['select_subject'] : []),
          ...(ENABLE_GARDEN ? ['garden'] : []),
          'marketplace',
          'profile'
        ];
        const isActive = currentView === item.id || (item.id === 'home' && !nonHomeViews.includes(currentView));

        return (
          <button
            key={item.id}
            data-tutorial-target={item.id === 'marketplace' ? 'nav-marketplace' : undefined}
            type="button"
            onClick={() => {
              playTapSound();
              setCurrentView(item.id);
            }}
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
              {item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 900,
                    minWidth: '15px',
                    height: '15px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '1.5px solid #0F172A',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                    lineHeight: 1
                  }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
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
