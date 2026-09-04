import { Home, Grid, Trophy, ShoppingBag, User } from 'lucide-react';

const BottomNav = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Redeem' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'var(--brand-primary)',
      padding: '16px 8px calc(24px + env(safe-area-inset-bottom, 0px))',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
      zIndex: 50
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? '#000000' : 'rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
              transform: isActive ? 'translateY(-4px)' : 'none'
            }}
          >
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
              fill={isActive ? '#000000' : 'none'}
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: isActive ? 700 : 500,
              opacity: isActive ? 1 : 0.8
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
