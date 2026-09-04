import { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, Users, BookOpen, ShoppingBag, Settings, TrendingUp, UserPlus, FileText, Flame, Trash2, Edit2, Ban, Lock, Unlock } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  
  // Real-time data states for Admin
  const [usersList, setUsersList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'basic', 'booster'

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedForm, setSelectedForm] = useState(1);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState('');

  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleQ, setSingleQ] = useState({ subject: 'sejarah', text: '', correctAnswer: '', wrong1: '', wrong2: '', wrong3: '' });

  // System Modal State
  const [sysModal, setSysModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', inputValue: '', placeholder: '', onConfirm: null, onCancel: null, isDestructive: false });

  const closeSysModal = () => setSysModal({ isOpen: false });

  const showAlert = (title, message) => {
    setSysModal({ isOpen: true, type: 'alert', title, message, onConfirm: closeSysModal, isDestructive: false });
  };

  const showConfirm = (title, message, onConfirm, isDestructive = false) => {
    setSysModal({ isOpen: true, type: 'confirm', title, message, onConfirm: () => { onConfirm(); closeSysModal(); }, onCancel: closeSysModal, isDestructive });
  };

  const showPrompt = (title, message, initialValue, placeholder, onConfirm) => {
    setSysModal({ isOpen: true, type: 'prompt', title, message, inputValue: initialValue, placeholder, onConfirm: (val) => { onConfirm(val); closeSysModal(); }, onCancel: closeSysModal });
  };

  const refreshData = () => {
    setMetrics(mockDb.getAdminMetrics());
    setUsersList(mockDb.getAllUsersAdmin());
    setQuestionsList(mockDb.getQuestions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!metrics) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Data...</div>;

  const mockChartData = [
    { name: 'Mon', users: 12, rev: 0 },
    { name: 'Tue', users: 19, rev: 0 },
    { name: 'Wed', users: 15, rev: 20 },
    { name: 'Thu', users: 22, rev: 0 },
    { name: 'Fri', users: 30, rev: 40 },
    { name: 'Sat', users: 45, rev: 100 },
    { name: 'Sun', users: Math.max(50, metrics.dau * 2), rev: 60 },
  ];

  const renderOverview = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
      <MetricCard title="Total Users" value={metrics.totalUsers} sub="Registered accounts" icon={<Users size={20} />} />
      <MetricCard title="Daily Active" value={metrics.dau} sub="Users played today" icon={<TrendingUp size={20} />} />
      <MetricCard title="Conversion Rate" value={`${metrics.conversionRate}%`} sub="Guest to Registered" icon={<UserPlus size={20} />} />
      <MetricCard title="3X Booster" value={`${metrics.boosterConversion}%`} sub="User Adoption" icon={<Flame size={20} />} />
      
      <div style={{ gridColumn: 'span 3', background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700, color: '#374151' }}>User Growth & Activity</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="users" stroke="#FFBC00" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <MetricCard title="Avg BP Earned" value={metrics.avgBP} sub="Per registered user" />
         <MetricCard title="Most Played" value={metrics.mostPlayedSubject} sub="Subject" />
         <MetricCard title="Top Referrer" value={metrics.topReferralUser} sub="Highest network" />
         <MetricCard title="Marketplace" value={metrics.redemptions} sub="Total redemptions" />
      </div>
    </div>
  );

  const renderUsers = () => {
    const registeredUsers = usersList.filter(u => u.email);
    const boosterUsers = registeredUsers.filter(u => u.score_multiplier === 3);

    const filteredUsers = registeredUsers.filter(u => {
      if (userFilter === 'booster') return u.score_multiplier === 3;
      if (userFilter === 'basic') return u.score_multiplier !== 3;
      return true;
    });

    const handleEditBP = (user) => {
      showPrompt(
        `Edit Total BP`,
        `Enter new Total BP for ${user.ic_name || user.email}:`,
        user.total_bp,
        "Enter BP value",
        (newBP) => {
          if (newBP !== '' && !isNaN(newBP)) {
            mockDb.updateUserAdmin(user.id, { total_bp: Number(newBP) });
            refreshData();
          }
        }
      );
    };

    const handleToggleBan = (user) => {
      showConfirm(
        user.is_banned ? 'Unban User' : 'Ban User',
        `Are you sure you want to ${user.is_banned ? 'UNBAN' : 'BAN'} ${user.ic_name || user.email}?`,
        () => {
          mockDb.toggleBanUserAdmin(user.id);
          refreshData();
        },
        !user.is_banned
      );
    };

    const handleDelete = (user) => {
      showConfirm(
        'Delete Account',
        `WARNING: Permanently delete account ${user.email}? This action cannot be undone.`,
        () => {
          mockDb.deleteUserAdmin(user.id);
          refreshData();
        },
        true
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <MetricCard title="Total Registered Users" value={registeredUsers.length} sub="All active student accounts" icon={<Users size={20} />} />
          <MetricCard title="Total Booster Users" value={boosterUsers.length} sub="Premium users (RM20 paid)" icon={<Flame size={20} />} />
        </div>

        <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>User Management</h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Filters */}
              <select 
                value={userFilter} 
                onChange={e => setUserFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
              >
                <option value="all">All Users</option>
                <option value="basic">Basic (Free)</option>
                <option value="booster">Booster (Premium)</option>
              </select>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Name / Email</th>
                <th style={{ padding: '12px' }}>Total BP</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u.id || i} style={{ borderBottom: '1px solid #E5E7EB', fontSize: '14px', background: u.is_banned ? '#FEF2F2' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {u.ic_name || u.email}
                    {u.is_banned && <span style={{ marginLeft: '8px', color: '#EF4444', fontSize: '12px', fontWeight: 'bold' }}>(BANNED)</span>}
                  </td>
                  <td style={{ padding: '12px', color: '#059669', fontWeight: 700 }}>{u.total_bp || 0}</td>
                  <td style={{ padding: '12px' }}>{u.score_multiplier === 3 ? <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>Booster</span> : <span style={{ background: '#E5E7EB', color: '#4B5563', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>Basic</span>}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleEditBP(u)} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit BP"><Edit2 size={16} /></button>
                    <button onClick={() => handleToggleBan(u)} style={{ color: u.is_banned ? '#10B981' : '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }} title={u.is_banned ? "Unban" : "Ban"}><Ban size={16} /></button>
                    <button onClick={() => handleDelete(u)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Account"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No users found for this filter.</div>}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const subjectsList = mockDb.getSubjects();
    
    if (!selectedSubject && subjectsList.length > 0) {
      setSelectedSubject(subjectsList[0].id);
    }

    const filteredQuestions = questionsList.filter(q => q.subject === selectedSubject && q.form === selectedForm);

    const handleAddSubject = () => {
      showPrompt("Add Subject", "Enter the name of the new Subject:", "", "e.g. Biology", (title) => {
        if (title) {
          const newSub = {
            id: title.toLowerCase().replace(/\s+/g, ''),
            title, subtitle: '', iconType: 'landmark', locked: false
          };
          mockDb.saveSubjects([...subjectsList, newSub]);
          refreshData();
        }
      });
    };

    const handleDeleteSubject = (s, e) => {
      e.stopPropagation();
      showConfirm("Delete Subject", `Delete ${s.title} and ALL its questions?`, () => {
        mockDb.deleteSubjectAdmin(s.id);
        if (selectedSubject === s.id) setSelectedSubject(null);
        refreshData();
      }, true);
    };

    const handleToggleLock = (s, e) => {
      e.stopPropagation();
      mockDb.toggleSubjectLockAdmin(s.id);
      refreshData();
    };

    const handleDeleteQuestion = (q) => {
      showConfirm("Delete Question", "Permanently delete this question?", () => {
        mockDb.deleteQuestionAdmin(q._originalIndex);
        refreshData();
      }, true);
    };

    const handleEditQuestion = (q) => {
      setSingleQ({ ...q, wrong1: q.incorrectAnswers[0]||'', wrong2: q.incorrectAnswers[1]||'', wrong3: q.incorrectAnswers[2]||'', _editIndex: q._originalIndex });
      setShowSingleModal(true);
    };

    const handleOpenAddQuestion = () => {
      setSingleQ({ subject: selectedSubject, form: selectedForm, text: '', correctAnswer: '', wrong1: '', wrong2: '', wrong3: '' });
      setShowSingleModal(true);
    };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Subjects Sidebar */}
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Subjects</h3>
            <button onClick={handleAddSubject} style={{ background: '#111827', color: '#FFF', padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subjectsList.map(s => {
              const isActive = selectedSubject === s.id;
              return (
                <li 
                  key={s.id} 
                  onClick={() => setSelectedSubject(s.id)}
                  style={{ 
                    padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isActive ? '#F3F4F6' : 'transparent', border: isActive ? '1px solid #D1D5DB' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: isActive ? 700 : 500, color: '#111827' }}>{s.title}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => handleToggleLock(s, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.locked ? '#EF4444' : '#10B981' }} title={s.locked ? 'Locked' : 'Active'}>
                      {s.locked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button onClick={(e) => handleDeleteSubject(s, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} title="Delete Subject">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Questions Main Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Form Tabs */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map(f => (
              <button 
                key={f}
                onClick={() => setSelectedForm(f)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                  background: selectedForm === f ? '#111827' : '#F3F4F6', color: selectedForm === f ? '#FFF' : '#6B7280'
                }}
              >
                Form {f}
              </button>
            ))}
          </div>

          <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                Questions ({subjectsList.find(s => s.id === selectedSubject)?.title || ''} - Form {selectedForm})
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowBulkModal(true)}
                  style={{ background: '#E5E7EB', color: '#111827', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >Bulk Import</button>
                <button onClick={handleOpenAddQuestion} style={{ background: '#111827', color: '#FFF', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add Single</button>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Question</th>
                  <th style={{ padding: '12px' }}>Correct Answer</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => (
                  <tr key={q._originalIndex} style={{ borderBottom: '1px solid #E5E7EB', fontSize: '13px' }}>
                    <td style={{ padding: '12px', maxWidth: '300px' }}>{q.text}</td>
                    <td style={{ padding: '12px', color: '#059669', fontWeight: 600 }}>{q.correctAnswer}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleEditQuestion(q)} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteQuestion(q)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuestions.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No questions found for this category.</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderMarket = () => {
    const productsList = JSON.parse(localStorage.getItem('playbank_products')) || [];
    const ordersList = JSON.parse(localStorage.getItem('playbank_orders')) || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Products Inventory</h3>
            <button style={{ background: '#111827', color: '#FFF', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add Product</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Price (BP/Cash)</th>
                <th style={{ padding: '12px' }}>Stock</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsList.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.bp_price} BP / RM{p.cash_price}</td>
                  <td style={{ padding: '12px', color: p.stock > 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>{p.stock}</td>
                  <td style={{ padding: '12px' }}>
                    <button style={{ color: '#3B82F6', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Orders</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>User Email</th>
                <th style={{ padding: '12px' }}>Item</th>
                <th style={{ padding: '12px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map((o, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E5E7EB', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{o.id}</td>
                  <td style={{ padding: '12px' }}>{o.userEmail}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{o.productName}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: o.type === 'bp' ? '#FEF3C7' : '#DBEAFE', color: o.type === 'bp' ? '#D97706' : '#2563EB', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {o.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#F9FAFB', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#111827', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFBC00' }}>PlayBank Admin</h2>
        </div>
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MenuBtn active={activeMenu === 'overview'} onClick={() => setActiveMenu('overview')} icon={<LayoutDashboard size={18} />} label="Overview" />
          <MenuBtn active={activeMenu === 'users'} onClick={() => setActiveMenu('users')} icon={<Users size={18} />} label="Students & Referrals" />
          <MenuBtn active={activeMenu === 'content'} onClick={() => setActiveMenu('content')} icon={<BookOpen size={18} />} label="Questions & Subjects" />
          <MenuBtn active={activeMenu === 'market'} onClick={() => setActiveMenu('market')} icon={<ShoppingBag size={18} />} label="Marketplace" />
          <MenuBtn active={activeMenu === 'reports'} onClick={() => setActiveMenu('reports')} icon={<FileText size={18} />} label="Reports" />
        </div>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1F2937' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '24px', textTransform: 'capitalize', color: '#111827' }}>
          {activeMenu === 'market' ? 'Marketplace' : activeMenu}
        </h1>
        {activeMenu === 'overview' && renderOverview()}
        {activeMenu === 'users' && renderUsers()}
        {activeMenu === 'content' && renderContent()}
        {activeMenu === 'market' && renderMarket()}
        {activeMenu === 'reports' && (
          <div style={{ background: '#FFF', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#6B7280', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <FileText size={64} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '8px' }}>Reports</h3>
            <p>Generate financial and usage reports (Coming Soon).</p>
          </div>
        )}
      </div>

      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', width: '600px', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Bulk Import Questions</h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Paste your questions array in JSON format. It will be mapped to the currently selected subject <strong>({selectedSubject})</strong> and Form <strong>({selectedForm})</strong> automatically. <br/>
              <code>{`[ { "text": "Q?", "correctAnswer": "A", "incorrectAnswers": ["B", "C", "D"] } ]`}</code>
            </p>
            <textarea 
              value={bulkData}
              onChange={e => setBulkData(e.target.value)}
              placeholder="Paste JSON array here..."
              style={{ width: '100%', height: '300px', padding: '12px', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #D1D5DB', resize: 'none', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowBulkModal(false)}
                style={{ padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={() => {
                  try {
                    let newQs = JSON.parse(bulkData);
                    if (!Array.isArray(newQs)) throw new Error('Root must be an array');
                    
                    // Automatically append selectedSubject and selectedForm
                    newQs = newQs.map(q => ({
                      ...q,
                      subject: selectedSubject,
                      form: selectedForm
                    }));

                    const updated = [...questionsList.map(q => { const o = {...q}; delete o._originalIndex; return o; }), ...newQs];
                    mockDb.saveQuestions(updated);
                    setBulkData('');
                    setShowBulkModal(false);
                    refreshData();
                    showAlert("Success", `Imported ${newQs.length} questions successfully!`);
                  } catch(e) {
                    showAlert('Error', 'Invalid JSON: ' + e.message);
                  }
                }}
                style={{ padding: '10px 16px', background: '#111827', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >Import Data</button>
            </div>
          </div>
        </div>
      )}

      {showSingleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', width: '500px', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{singleQ._editIndex !== undefined ? 'Edit Question' : 'Add Single Question'}</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
               <span style={{ padding: '4px 12px', background: '#E5E7EB', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>Subject: {singleQ.subject}</span>
               <span style={{ padding: '4px 12px', background: '#E5E7EB', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>Form: {singleQ.form}</span>
            </div>

            <input placeholder="Question Text" value={singleQ.text} onChange={e => setSingleQ({...singleQ, text: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <input placeholder="Correct Answer" value={singleQ.correctAnswer} onChange={e => setSingleQ({...singleQ, correctAnswer: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <input placeholder="Wrong Answer 1" value={singleQ.wrong1} onChange={e => setSingleQ({...singleQ, wrong1: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <input placeholder="Wrong Answer 2" value={singleQ.wrong2} onChange={e => setSingleQ({...singleQ, wrong2: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <input placeholder="Wrong Answer 3" value={singleQ.wrong3} onChange={e => setSingleQ({...singleQ, wrong3: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                onClick={() => setShowSingleModal(false)}
                style={{ padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={() => {
                  if (!singleQ.text || !singleQ.correctAnswer) {
                     showAlert("Validation Error", "Question Text and Correct Answer are required.");
                     return;
                  }
                  const payload = {
                    subject: singleQ.subject,
                    text: singleQ.text,
                    correctAnswer: singleQ.correctAnswer,
                    incorrectAnswers: [singleQ.wrong1, singleQ.wrong2, singleQ.wrong3].filter(Boolean),
                    form: singleQ.form
                  };

                  if (singleQ._editIndex !== undefined) {
                    mockDb.updateQuestionAdmin(singleQ._editIndex, payload);
                  } else {
                    const cleanList = questionsList.map(q => { const o = {...q}; delete o._originalIndex; return o; });
                    mockDb.saveQuestions([...cleanList, payload]);
                  }
                  
                  setShowSingleModal(false);
                  refreshData();
                }}
                style={{ padding: '10px 16px', background: '#111827', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >Save Question</button>
            </div>
          </div>
        </div>
      )}

      {/* 统一系统弹窗 System Modal */}
      {sysModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#FFF', width: '400px', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: sysModal.isDestructive ? '#EF4444' : '#111827' }}>{sysModal.title}</h2>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.5' }}>{sysModal.message}</p>
            
            {sysModal.type === 'prompt' && (
              <input 
                autoFocus
                placeholder={sysModal.placeholder}
                value={sysModal.inputValue}
                onChange={e => setSysModal({...sysModal, inputValue: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }} 
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              {sysModal.type !== 'alert' && (
                <button 
                  onClick={sysModal.onCancel}
                  style={{ padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >Cancel</button>
              )}
              <button 
                onClick={() => sysModal.type === 'prompt' ? sysModal.onConfirm(sysModal.inputValue) : sysModal.onConfirm()}
                style={{ padding: '10px 16px', background: sysModal.isDestructive ? '#EF4444' : '#111827', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                {sysModal.type === 'alert' ? 'OK' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, sub, icon }) {
  return (
    <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        {icon}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '4px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function MenuBtn({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: '8px', border: 'none',
        background: active ? '#FFBC00' : 'transparent',
        color: active ? '#000' : (active ? '#000' : '#9CA3AF'),
        fontWeight: active ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
      }}
    >
      {icon} {label}
    </button>
  );
}
