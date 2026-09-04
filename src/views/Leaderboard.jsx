import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Users, Calendar, Crown } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const Leaderboard = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('overall'); // overall | weekly | referral
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    // 每次 tab 改变时重新 fetch 排行榜
    setLeaders(mockDb.getLeaderboard(activeTab));
  }, [activeTab]);

  const formatBP = (bp) => Number(bp).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // 辅助函数，渲染名次样式
  const getRankStyle = (index) => {
    switch (index) {
      case 0: return { color: '#FFD700', icon: <Crown size={24} color="#FFD700" /> }; // Gold
      case 1: return { color: '#C0C0C0', icon: <Medal size={24} color="#C0C0C0" /> }; // Silver
      case 2: return { color: '#CD7F32', icon: <Award size={24} color="#CD7F32" /> }; // Bronze
      default: return { color: '#888', icon: <span style={{ fontWeight: 900, fontSize: '16px' }}>{index + 1}</span> };
    }
  };

  return (
    <div className="view-content" style={{ padding: '24px 20px 100px 20px' }}>
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trophy size={28} color="#000" />
          </div>
          <div>
            <h1 className="text-h2">Leaderboard</h1>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>Compete with the best</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--card-bg)', padding: '6px', borderRadius: '16px', boxShadow: 'var(--card-shadow-sm)' }}>
        <button 
          onClick={() => setActiveTab('overall')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: activeTab === 'overall' ? '#000' : 'transparent', color: activeTab === 'overall' ? '#FFF' : '#666', fontWeight: 900, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Overall
        </button>
        <button 
          onClick={() => setActiveTab('weekly')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: activeTab === 'weekly' ? '#000' : 'transparent', color: activeTab === 'weekly' ? '#FFF' : '#666', fontWeight: 900, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Weekly
        </button>
        <button 
          onClick={() => setActiveTab('referral')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: activeTab === 'referral' ? '#000' : 'transparent', color: activeTab === 'referral' ? '#FFF' : '#666', fontWeight: 900, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Referral
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p style={{ fontWeight: 600 }}>No ranked players yet.</p>
          </div>
        ) : (
          leaders.map((user, index) => {
            const isMe = currentUser && currentUser.id === user.id;
            const rankStyle = getRankStyle(index);
            
            let displayValue = '';
            let label = '';
            if (activeTab === 'overall') {
              displayValue = formatBP(user.total_bp); label = 'BP';
            } else if (activeTab === 'weekly') {
              displayValue = formatBP(user.weekly_bp); label = 'BP';
            } else {
              displayValue = formatBP(user.total_referral_bonus); label = 'Bonus BP';
            }

            return (
              <div key={user.id} style={{ 
                display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '20px', 
                background: isMe ? 'rgba(255,188,0,0.15)' : 'var(--card-bg)', 
                border: isMe ? '2px solid var(--brand-primary)' : '2px solid transparent',
                boxShadow: isMe ? '0 8px 24px rgba(255,188,0,0.2)' : 'var(--card-shadow-sm)',
                transition: 'transform 0.2s'
              }}>
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center', marginRight: '12px' }}>
                  {rankStyle.icon}
                </div>
                
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isMe ? '#000' : '#F3F4F6', color: isMe ? '#FFF' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, marginRight: '16px' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#000' }}>
                    {isMe ? 'You' : user.name}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#000' }}>{displayValue}</p>
                  <p style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{label}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Leaderboard;
