// Mock Database using LocalStorage
import { questions as defaultQuestions } from '../data/questions.js';
const USERS_KEY = 'playbank_users';
const CURRENT_SESSION_KEY = 'playbank_session';
const PRODUCTS_KEY = 'playbank_products';
const ORDERS_KEY = 'playbank_orders';
const GARDEN_STATE_KEY = 'playbank_garden_state';

export const DEFAULT_TREES = [
  {
    id: "apple",
    name: "Apple Tree",
    icon: "🍎",
    rewardBP: 80,
    description: "Classic sweet apple tree with fresh leaves and juicy red apples."
  },
  {
    id: "sunflower",
    name: "Sunflower",
    icon: "🌻",
    rewardBP: 50,
    description: "Radiant golden sunflower blooming with warm sunshine and seeds."
  },
  {
    id: "bean",
    name: "Bean Plant",
    icon: "🫘",
    rewardBP: 30,
    description: "Enchanted climbing beanstalk with hanging jade bean pods."
  }
];

const DEFAULT_GARDEN_STATE = {
  currentTreeId: "apple",
  growth: 0,
  stage: 1,
  water: 3,
  completedTrees: [],
  collection: [],
  lastUpdated: null,
  starterGranted: true
};

const getGardenStateRaw = () => {
  try {
    const raw = localStorage.getItem(GARDEN_STATE_KEY);
    if (!raw) {
      saveGardenStateRaw(DEFAULT_GARDEN_STATE);
      return { ...DEFAULT_GARDEN_STATE };
    }
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_GARDEN_STATE, ...parsed };
    // 确保初次体验 Step 4 时拥有 3 滴水供测试
    if (!merged.starterGranted && merged.water === 0 && merged.growth === 0) {
      merged.water = 3;
      merged.starterGranted = true;
      saveGardenStateRaw(merged);
    }
    return merged;
  } catch (e) {
    return { ...DEFAULT_GARDEN_STATE };
  }
};

const saveGardenStateRaw = (state) => {
  localStorage.setItem(GARDEN_STATE_KEY, JSON.stringify(state));
};

const DAILY_MISSIONS_KEY = 'playbank_daily_missions';

export const getMalaysiaDateString = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const malaysiaTime = new Date(utc + (3600000 * 8));
  return malaysiaTime.toISOString().split('T')[0];
};

export const getTimeUntilMalaysiaMidnight = () => {
  const now = new Date();
  const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nowMY = new Date(nowUtc + (8 * 3600000));
  
  const nextMidnightMY = new Date(nowMY);
  nextMidnightMY.setHours(24, 0, 0, 0);
  
  const diffMs = Math.max(0, nextMidnightMY.getTime() - nowMY.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const pad = (n) => String(n).padStart(2, '0');

  return {
    diffMs,
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    approxFormatted: `${hours}h ${minutes}m`
  };
};

export const createInitialDailyMissions = (dateStr) => ({
  date: dateStr || getMalaysiaDateString(),
  missions: {
    completeQuiz: {
      id: 'completeQuiz',
      title: 'Complete 1 Quiz',
      reward: 1,
      progress: 0,
      target: 1,
      claimed: false
    },
    answerQuestions: {
      id: 'answerQuestions',
      title: 'Answer 10 Questions',
      reward: 1,
      progress: 0,
      target: 10,
      claimed: false
    },
    correctAnswers: {
      id: 'correctAnswers',
      title: 'Get 5 Correct Answers',
      reward: 1,
      progress: 0,
      target: 5,
      claimed: false
    }
  }
});

const getDailyMissionsRaw = () => {
  try {
    const today = getMalaysiaDateString();
    const raw = localStorage.getItem(DAILY_MISSIONS_KEY);
    if (!raw) {
      const initial = createInitialDailyMissions(today);
      localStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) {
      const resetMissions = createInitialDailyMissions(today);
      localStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(resetMissions));
      return resetMissions;
    }
    return parsed;
  } catch (e) {
    return createInitialDailyMissions();
  }
};

const saveDailyMissionsRaw = (missionsState) => {
  localStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(missionsState));
};

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const getProducts = () => {
  let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
  const isStale = !products || products.some(p => !p.hasOwnProperty('bp_price') || !p.hasOwnProperty('tnc'));
  if (isStale) {
    products = [
      {
        id: '1',
        name: 'Notebook Set',
        bp_price: 800,
        cash_price: 15,
        stock: 10,
        icon_type: 'book',
        description: 'A premium pack of 3 high-quality grid notebooks. Perfect for study notes, exams, and daily logs. Featuring eco-friendly paper and water-resistant covers.',
        tnc: '1. Only redeemable within Malaysia.\n2. Delivery takes 3-5 working days.\n3. Non-refundable once redeemed.'
      },
      {
        id: '2',
        name: 'Study Lamp',
        bp_price: 1500,
        cash_price: 29,
        stock: 5,
        icon_type: 'lamp',
        description: 'Eye-care LED desk lamp with adjustable brightness levels and 3 color modes. Keep your workspace bright and comfortable without eye strain.',
        tnc: '1. Includes a 6-month local warranty.\n2. USB cable included, adapter excluded.\n3. Defective items can be exchanged within 7 days of receipt.'
      },
      {
        id: '3',
        name: 'Exam Booster Pack',
        bp_price: 1200,
        cash_price: 20,
        stock: 8,
        icon_type: 'rocket',
        description: 'The ultimate preparation kit. Includes 5 mock exam papers, formula cheat sheets, 2 gel pens, and custom study stickers to boost your score!',
        tnc: '1. Study materials are aligned with the latest syllabus.\n2. Mock exams are available in both English and Malay.\n3. Delivery via standard post.'
      },
      {
        id: '4',
        name: 'Water Bottle',
        bp_price: 1000,
        cash_price: 15,
        stock: 12,
        icon_type: 'droplet',
        description: '750ml BPA-free sports water bottle with a leak-proof flip top lid and carrying strap. Keep hydrated while crushing your study goals!',
        tnc: '1. Safe for warm and cold drinks (up to 80°C).\n2. Dishwasher safe, but hand wash recommended.\n3. Available in various sleek colors.'
      }
    ];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
  return products;
};

const saveProducts = (products) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

const getOrders = () => JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
const saveOrders = (orders) => localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

const generateReferralCode = (email) => {
  const prefix = (email ? email.split('@')[0].substring(0, 3) : 'PB').toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${rand}`;
};

export const mockDb = {
  // Register a new user
  registerUser: (email, password, whatsapp, guestBP) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { error: 'Email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      whatsapp,
      referral_code: generateReferralCode(email),
      referred_by: null,
      ic_name: null,
      ic_no: null,
      age: null,
      school: null,
      total_referral_bonus: 0,
      total_bp: guestBP || 0,
      weekly_bp: guestBP || 0,
      score_multiplier: 1,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    return { user: newUser };
  },

  // Complete User Profile (After RM20 payment)
  completeUserProfile: (userId, icName, icNo, age, school, inputReferralCode) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { error: 'User not found' };

    let referredBy = users[userIndex].referred_by;
    // Only allow setting referral code if not already set
    if (inputReferralCode && !referredBy) {
      const parentUser = users.find(u => u.referral_code === inputReferralCode);
      if (parentUser && parentUser.id !== userId) {
        referredBy = parentUser.id;
      } else if (!parentUser) {
        return { error: 'Invalid Referral Code' };
      }
    }

    users[userIndex].ic_name = icName;
    users[userIndex].ic_no = icNo;
    users[userIndex].age = age;
    users[userIndex].school = school;
    users[userIndex].referred_by = referredBy;
    saveUsers(users);

    const session = mockDb.getCurrentSession();
    if (session && session.id === userId) {
      session.ic_name = icName;
      session.ic_no = icNo;
      session.age = age;
      session.school = school;
      session.referred_by = referredBy;
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    }
    return { user: users[userIndex] };
  },

  // Login existing user
  loginUser: (email, password) => {
    if (email === 'admin@playbank.com' && password === 'admin123') {
      const adminUser = { id: 'admin', email: 'admin@playbank.com', role: 'admin', ic_name: 'Super Admin' };
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(adminUser));
      return { user: adminUser };
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { error: 'Invalid email or password' };
    }
    if (user.is_banned) {
      return { error: 'Your account has been banned. Please contact support.' };
    }
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    return { user };
  },

  // Logout current user
  logoutUser: () => {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  },

  // Get currently logged in user session
  getCurrentSession: () => {
    return JSON.parse(localStorage.getItem(CURRENT_SESSION_KEY));
  },

  // Distribute Referral Bonus
  distributeReferralBP: (sourceUserId, earnedBP) => {
    if (earnedBP <= 0) return;
    const users = getUsers();
    const sourceUser = users.find(u => u.id === sourceUserId);
    if (!sourceUser || !sourceUser.referred_by) return;

    let currentLevelUser = users.find(u => u.id === sourceUser.referred_by);
    const percentages = [0.10, 0.01, 0.001]; // Level 1, 2, 3
    let updated = false;

    for (let i = 0; i < 3; i++) {
      if (!currentLevelUser) break;

      // Only give bonus if the referrer has paid RM20 (multiplier is 3)
      if (currentLevelUser.score_multiplier === 3) {
        const bonus = Number((earnedBP * percentages[i]).toFixed(3));
        if (bonus > 0) {
          currentLevelUser.total_bp = Number((currentLevelUser.total_bp + bonus).toFixed(3));
          currentLevelUser.weekly_bp = Number(((currentLevelUser.weekly_bp || 0) + bonus).toFixed(3));
          currentLevelUser.total_referral_bonus = Number(((currentLevelUser.total_referral_bonus || 0) + bonus).toFixed(3));
          
          // Update array
          const idx = users.findIndex(u => u.id === currentLevelUser.id);
          if (idx !== -1) users[idx] = currentLevelUser;
          updated = true;
        }
      }

      // Go to next level
      if (currentLevelUser.referred_by) {
        currentLevelUser = users.find(u => u.id === currentLevelUser.referred_by);
      } else {
        break;
      }
    }

    if (updated) {
      saveUsers(users);
      // Refresh current session if affected
      const session = mockDb.getCurrentSession();
      if (session) {
        const sessionUserUpdated = users.find(u => u.id === session.id);
        if (sessionUserUpdated) {
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionUserUpdated));
        }
      }
    }
  },

  getQuestions: () => {
    let q = JSON.parse(localStorage.getItem('playbank_questions'));
    if (!q || q.length === 0) {
      q = defaultQuestions;
      localStorage.setItem('playbank_questions', JSON.stringify(q));
    }
    return q.map((question, index) => ({ ...question, _originalIndex: index }));
  },

  deleteSubjectAdmin: (subjectId) => {
    let subjects = JSON.parse(localStorage.getItem('playbank_subjects'));
    subjects = subjects.filter(s => s.id !== subjectId);
    localStorage.setItem('playbank_subjects', JSON.stringify(subjects));
    
    // Auto delete questions associated with this subject
    let questions = JSON.parse(localStorage.getItem('playbank_questions')) || [];
    questions = questions.filter(q => q.subject !== subjectId);
    localStorage.setItem('playbank_questions', JSON.stringify(questions));
  },

  toggleSubjectLockAdmin: (subjectId) => {
    let subjects = JSON.parse(localStorage.getItem('playbank_subjects'));
    const index = subjects.findIndex(s => s.id === subjectId);
    if (index !== -1) {
      subjects[index].locked = !subjects[index].locked;
      localStorage.setItem('playbank_subjects', JSON.stringify(subjects));
    }
  },

  updateQuestionAdmin: (index, updates) => {
    let questions = JSON.parse(localStorage.getItem('playbank_questions'));
    if (questions[index]) {
      questions[index] = { ...questions[index], ...updates };
      delete questions[index]._originalIndex;
      localStorage.setItem('playbank_questions', JSON.stringify(questions));
    }
  },

  deleteQuestionAdmin: (index) => {
    let questions = JSON.parse(localStorage.getItem('playbank_questions'));
    questions.splice(index, 1);
    localStorage.setItem('playbank_questions', JSON.stringify(questions));
  },

  // Update user BP
  updateUserBP: (userId, additionalBP) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    users[userIndex].total_bp += additionalBP;
    users[userIndex].weekly_bp = (users[userIndex].weekly_bp || 0) + additionalBP;
    saveUsers(users);

    const session = mockDb.getCurrentSession();
    if (session && session.id === userId) {
      session.total_bp = users[userIndex].total_bp;
      session.weekly_bp = users[userIndex].weekly_bp;
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    }

    // Trigger distribution (the original user earned BP, let's distribute to uplines)
    mockDb.distributeReferralBP(userId, additionalBP);

    // Re-fetch to get potentially updated upline bonus if they refer each other (though rare/prevented)
    return getUsers().find(u => u.id === userId);
  },

  // Unlock 3X BP Booster
  unlockBooster: (userId, applyRetroactive = false) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    users[userIndex].score_multiplier = 3;
    if (applyRetroactive) {
      users[userIndex].total_bp *= 3;
    }
    saveUsers(users);

    const session = mockDb.getCurrentSession();
    if (session && session.id === userId) {
      session.score_multiplier = 3;
      if (applyRetroactive) {
        session.total_bp = users[userIndex].total_bp;
      }
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    }
    
    // We do not distribute retroactive bonus to uplines here, only future earns.
    return users[userIndex];
  },

  // Get referral list
  getReferralList: (userId) => {
    const users = getUsers();
    let allReferrals = [];
    
    const level1 = users.filter(u => u.referred_by === userId && u.score_multiplier === 3);
    level1.forEach(u1 => {
      let subReferralsCount = 0;
      
      const level2 = users.filter(u => u.referred_by === u1.id && u.score_multiplier === 3);
      subReferralsCount += level2.length;
      
      level2.forEach(u2 => {
        const level3 = users.filter(u => u.referred_by === u2.id && u.score_multiplier === 3);
        subReferralsCount += level3.length;
      });
      
      allReferrals.push({ 
        ...u1, 
        contributed_bp: Number((u1.total_bp * 0.1).toFixed(3)),
        sub_referrals_count: subReferralsCount
      });
    });
    
    return allReferrals.map(u => {
      // Obfuscate name
      let displayName = 'Guest';
      let rawName = u.ic_name || (u.email ? u.email.split('@')[0] : 'User');
      if (rawName) {
        displayName = rawName.split(' ').map(part => part.charAt(0) + 'xxx').join(' ');
      }
      
      return {
        id: u.id,
        name: displayName,
        sub_referrals_count: u.sub_referrals_count,
        contributed_bp: u.contributed_bp
      };
    });
  },

  // Get Leaderboard
  getLeaderboard: (type = 'overall') => {
    let users = getUsers();
    // Only rank registered users
    let rankedUsers = users.filter(u => u.email); 
    
    // Obfuscate names and prepare data
    rankedUsers = rankedUsers.map(u => {
      let displayName = 'User';
      let rawName = u.ic_name || u.email.split('@')[0];
      if (rawName) {
        displayName = rawName.split(' ').map(part => part.charAt(0) + 'xxx').join(' ');
      }
      return {
        id: u.id,
        name: displayName,
        total_bp: u.total_bp || 0,
        weekly_bp: u.weekly_bp || 0,
        total_referral_bonus: u.total_referral_bonus || 0,
        ic_name: u.ic_name, // For currentUser exact match
      };
    });
    
    if (type === 'overall') {
      return rankedUsers.sort((a, b) => b.total_bp - a.total_bp).slice(0, 50);
    } else if (type === 'weekly') {
      return rankedUsers.sort((a, b) => b.weekly_bp - a.weekly_bp).slice(0, 50);
    } else if (type === 'referral') {
      return rankedUsers.sort((a, b) => b.total_referral_bonus - a.total_referral_bonus).slice(0, 50);
    }
    
    return [];
  },

  getProducts: () => getProducts(),

  getUserOrders: (userId) => {
    const orders = getOrders();
    return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createOrder: (userId, productId, type, shippingDetails) => {
    const products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return { error: 'Product not found' };

    const product = products[productIndex];
    if (product.stock <= 0) return { error: 'Product is out of stock' };

    let updatedUser = null;

    if (type === 'bp') {
      if (!userId) return { error: 'Registration required for BP redemption' };
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return { error: 'User not found' };

      const user = users[userIndex];
      if (user.total_bp < product.bp_price) return { error: 'Insufficient BP' };

      user.total_bp -= product.bp_price;
      users[userIndex] = user;
      saveUsers(users);

      const session = mockDb.getCurrentSession();
      if (session && session.id === userId) {
        session.total_bp = user.total_bp;
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
      }
      updatedUser = user;
    }

    product.stock -= 1;
    products[productIndex] = product;
    saveProducts(products);

    const orders = getOrders();
    const newOrder = {
      id: 'ORD-' + Date.now().toString().slice(-8).toUpperCase(),
      userId: userId || 'GUEST',
      userEmail: shippingDetails?.email || (updatedUser ? updatedUser.email : 'guest@playbank.com'),
      productId: product.id,
      productName: product.name,
      type,
      price: type === 'bp' ? product.bp_price : product.cash_price,
      shippingDetails: shippingDetails || null,
      created_at: new Date().toISOString()
    };

    orders.push(newOrder);
    saveOrders(orders);

    return {
      success: true,
      order: newOrder,
      updatedUser: updatedUser || null
    };
  },

  logoutUser: () => {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  },

  getSubjects: () => {
    let subjects = JSON.parse(localStorage.getItem('playbank_subjects'));
    if (!subjects) {
      subjects = [
        { id: 1, title: 'History', subtitle: '', iconType: 'landmark', locked: false },
        { id: 2, title: 'Science', subtitle: '', iconType: 'microscope', locked: true },
        { id: 3, title: 'Mathematics', subtitle: '', iconType: 'calculator', locked: true },
        { id: 4, title: 'Chinese', subtitle: 'Coming Soon', iconType: 'landmark', locked: true },
        { id: 5, title: 'English', subtitle: 'Coming Soon', iconType: 'landmark', locked: true },
        { id: 6, title: 'AddMath', subtitle: 'Coming Soon', iconType: 'calculator', locked: true },
        { id: 7, title: 'Biology', subtitle: 'Coming Soon', iconType: 'microscope', locked: true },
        { id: 8, title: 'Physics', subtitle: 'Coming Soon', iconType: 'microscope', locked: true },
        { id: 9, title: 'Chemistry', subtitle: 'Coming Soon', iconType: 'microscope', locked: true },
        { id: 10, title: 'Melayu', subtitle: 'Coming Soon', iconType: 'landmark', locked: true },
        { id: 11, title: 'Geografi', subtitle: 'Coming Soon', iconType: 'landmark', locked: true }
      ];
      localStorage.setItem('playbank_subjects', JSON.stringify(subjects));
    }
    return subjects;
  },

  saveQuestions: (questions) => {
    localStorage.setItem('playbank_questions', JSON.stringify(questions));
  },

  saveSubjects: (subjects) => {
    localStorage.setItem('playbank_subjects', JSON.stringify(subjects));
  },

  logQuizAttempt: (userId, subjectId, score) => {
    let logs = JSON.parse(localStorage.getItem('playbank_quiz_logs')) || [];
    logs.push({
      id: Date.now().toString(),
      userId,
      subjectId,
      score,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('playbank_quiz_logs', JSON.stringify(logs));
  },
  
  getAdminMetrics: () => {
    const users = getUsers();
    const logs = JSON.parse(localStorage.getItem('playbank_quiz_logs')) || [];
    const orders = getOrders();
    const subjects = mockDb.getSubjects();

    const registeredUsers = users.filter(u => u.email);
    
    const today = new Date().toISOString().split('T')[0];
    const activeUserIds = new Set(logs.filter(l => l.created_at.startsWith(today)).map(l => l.userId));
    
    const totalBP = registeredUsers.reduce((sum, u) => sum + (u.total_bp || 0), 0);
    const avgBP = registeredUsers.length ? (totalBP / registeredUsers.length).toFixed(0) : 0;

    let topReferralUser = 'N/A';
    let maxReferrals = -1;
    registeredUsers.forEach(u => {
       const refs = users.filter(sub => sub.referred_by === u.id).length;
       if (refs > maxReferrals && refs > 0) {
           maxReferrals = refs;
           topReferralUser = u.ic_name || u.email.split('@')[0];
       }
    });

    const subjectCounts = {};
    logs.forEach(l => {
      subjectCounts[l.subjectId] = (subjectCounts[l.subjectId] || 0) + 1;
    });
    let mostPlayedId = null;
    let maxPlays = -1;
    Object.keys(subjectCounts).forEach(sId => {
      if (subjectCounts[sId] > maxPlays) {
        maxPlays = subjectCounts[sId];
        mostPlayedId = sId;
      }
    });
    const mostPlayedSubject = subjects.find(s => s.id == mostPlayedId)?.title || 'N/A';

    return {
      totalUsers: registeredUsers.length,
      dau: activeUserIds.size,
      conversionRate: users.length ? ((registeredUsers.length / users.length) * 100).toFixed(1) : 0,
      avgBP,
      mostPlayedSubject,
      topReferralUser,
      redemptions: orders.length,
      boosterConversion: registeredUsers.length ? ((registeredUsers.filter(u => u.score_multiplier === 3).length / registeredUsers.length) * 100).toFixed(1) : 0
    };
  },

  getAllUsersAdmin: () => {
    return getUsers();
  },

  updateUserAdmin: (userId, updates) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveUsers(users);
      return users[index];
    }
    return null;
  },

  deleteUserAdmin: (userId) => {
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
  },

  toggleBanUserAdmin: (userId) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].is_banned = !users[index].is_banned;
      saveUsers(users);
      return users[index];
    }
    return null;
  },

  // Garden V1 Data Access
  getTreesConfig: () => DEFAULT_TREES,

  getGardenState: () => getGardenStateRaw(),

  saveGardenState: (state) => {
    saveGardenStateRaw(state);
    return state;
  },

  updateGardenState: (updates) => {
    const current = getGardenStateRaw();
    const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    saveGardenStateRaw(updated);
    return updated;
  },

  // 重置树木状态至 Stage 1 种子初始态 (0% Growth, 3 滴初始水)
  resetGardenState: () => {
    const fresh = {
      ...DEFAULT_GARDEN_STATE,
      currentTreeId: 'apple',
      growth: 0,
      stage: 1,
      water: 3,
      completedTrees: [],
      collection: [],
      starterGranted: true,
      lastUpdated: new Date().toISOString()
    };
    saveGardenStateRaw(fresh);
    return fresh;
  },

  // 浇水：Water -1, Growth +10
  waterTree: () => {
    const state = getGardenStateRaw();
    const currentWater = state.water || 0;
    if (currentWater <= 0) {
      return { error: 'Complete Daily Missions to earn Water!' };
    }

    const newWater = Math.max(0, currentWater - 1);
    const newGrowth = Math.min(100, (state.growth || 0) + 10);
    
    let newStage = 1;
    if (newGrowth >= 80) newStage = 5;
    else if (newGrowth >= 60) newStage = 4;
    else if (newGrowth >= 40) newStage = 3;
    else if (newGrowth >= 20) newStage = 2;

    const updated = {
      ...state,
      water: newWater,
      growth: newGrowth,
      stage: newStage,
      lastUpdated: new Date().toISOString()
    };
    saveGardenStateRaw(updated);
    return { success: true, gardenState: updated };
  },

  // 增加 Water 资源
  addWater: (amount = 1) => {
    const state = getGardenStateRaw();
    const updated = {
      ...state,
      water: (state.water || 0) + amount,
      lastUpdated: new Date().toISOString()
    };
    saveGardenStateRaw(updated);
    return updated;
  },

  // Daily Missions API
  getDailyMissions: () => getDailyMissionsRaw(),

  claimMissionReward: (missionKey) => {
    const state = getDailyMissionsRaw();
    const mission = state.missions[missionKey];
    if (!mission) return { error: 'Mission not found' };
    if (mission.claimed) return { error: 'Reward already claimed' };
    if (mission.progress < mission.target) return { error: 'Mission target not reached yet' };

    mission.claimed = true;
    saveDailyMissionsRaw(state);

    const updatedGarden = mockDb.addWater(mission.reward || 1);
    return {
      success: true,
      mission,
      waterAdded: mission.reward || 1,
      gardenState: updatedGarden,
      missionsState: state
    };
  },

  updateMissionProgress: (updates = {}) => {
    const state = getDailyMissionsRaw();
    Object.keys(updates).forEach(key => {
      if (state.missions[key]) {
        state.missions[key].progress = Math.min(
          state.missions[key].target,
          (state.missions[key].progress || 0) + updates[key]
        );
      }
    });
    saveDailyMissionsRaw(state);
    return state;
  },

  setMissionProgressDirect: (key, progress) => {
    const state = getDailyMissionsRaw();
    if (state.missions[key]) {
      state.missions[key].progress = Math.min(state.missions[key].target, progress);
      saveDailyMissionsRaw(state);
    }
    return state;
  },

  // Step 6: 检查并在跨天时自动重置
  checkAndResetDailyMissions: () => {
    return getDailyMissionsRaw();
  },

  // Step 6: 模拟触发 00:00 跨天重置（重置 3 个任务 progress=0, claimed=false；Water 与树成长不重置）
  resetDailyMissionsForce: (targetDate) => {
    const today = targetDate || getMalaysiaDateString();
    const resetState = createInitialDailyMissions(today);
    saveDailyMissionsRaw(resetState);
    return resetState;
  },

  // Step 6: 获取距马来西亚 00:00 的倒计时
  getTimeUntilMalaysiaMidnight: () => {
    return getTimeUntilMalaysiaMidnight();
  },

  // Step 7: 连接 Quiz 挑战结果到 Daily Mission 进度（不直接给水，只推进任务进度）
  recordQuizForDailyMissions: ({ quizCompleted = 1, questionsAnswered = 10, correctAnswers = 0 } = {}) => {
    const state = getDailyMissionsRaw();
    if (!state || !state.missions) return null;

    let updated = false;

    // 任务 1: Complete 1 Quiz (目标 1)
    if (state.missions.completeQuiz && !state.missions.completeQuiz.claimed) {
      const oldVal = state.missions.completeQuiz.progress || 0;
      state.missions.completeQuiz.progress = Math.min(
        state.missions.completeQuiz.target,
        oldVal + quizCompleted
      );
      updated = true;
    }

    // 任务 2: Answer 10 Questions (目标 10)
    if (state.missions.answerQuestions && !state.missions.answerQuestions.claimed) {
      const oldVal = state.missions.answerQuestions.progress || 0;
      state.missions.answerQuestions.progress = Math.min(
        state.missions.answerQuestions.target,
        oldVal + questionsAnswered
      );
      updated = true;
    }

    // 任务 3: Get 5 Correct Answers (目标 5)
    if (state.missions.correctAnswers && !state.missions.correctAnswers.claimed) {
      const oldVal = state.missions.correctAnswers.progress || 0;
      state.missions.correctAnswers.progress = Math.min(
        state.missions.correctAnswers.target,
        oldVal + correctAnswers
      );
      updated = true;
    }

    if (updated) {
      saveDailyMissionsRaw(state);
    }
    return state;
  },

  // Step 9: 增加用户 BP（兼容登录用户与访客）
  awardBP: (amount = 0) => {
    const session = mockDb.getCurrentSession();
    if (session && session.id) {
      const updated = mockDb.updateUserBP(session.id, amount);
      return updated?.total_bp || 0;
    } else {
      const current = parseInt(localStorage.getItem('playbank_user_bp') || '0', 10);
      const next = current + amount;
      localStorage.setItem('playbank_user_bp', next.toString());
      return next;
    }
  },

  // Step 9: 100% 树木成熟结算与领取一次性 BP 奖励（严格防重）
  claimTreeReward: (treeId) => {
    const state = getGardenStateRaw();
    const treeConfig = DEFAULT_TREES.find(t => t.id === (treeId || state.currentTreeId)) || DEFAULT_TREES[0];

    const completedList = state.completedTrees || [];
    if (completedList.includes(treeConfig.id)) {
      return { error: 'Reward for this tree has already been claimed!' };
    }

    if ((state.growth || 0) < 100) {
      return { error: 'Tree is not fully grown yet (needs 100% Growth)!' };
    }

    // 发放 BP
    const rewardBP = treeConfig.rewardBP || 50;
    const newTotalBP = mockDb.awardBP(rewardBP);

    // 记录到 completedTrees 和 collection
    const updatedCompleted = [...completedList, treeConfig.id];
    const existingCollection = state.collection || [];
    const updatedCollection = existingCollection.some(c => c.treeId === treeConfig.id)
      ? existingCollection
      : [...existingCollection, { treeId: treeConfig.id, name: treeConfig.name, completedAt: new Date().toISOString(), rewardBP }];

    const updatedState = {
      ...state,
      completedTrees: updatedCompleted,
      collection: updatedCollection,
      lastRewardClaimed: {
        treeId: treeConfig.id,
        rewardBP,
        claimedAt: new Date().toISOString()
      },
      lastUpdated: new Date().toISOString()
    };

    saveGardenStateRaw(updatedState);

    const nextTree = mockDb.getNextTreeConfig(treeConfig.id);

    return {
      success: true,
      rewardBP,
      newTotalBP,
      tree: treeConfig,
      nextTree,
      gardenState: updatedState
    };
  },

  // Step 10: 获取当前植物对应的下一棵树种配置
  getNextTreeConfig: (currentTreeId) => {
    const trees = DEFAULT_TREES;
    const currentIndex = trees.findIndex(t => t.id === currentTreeId);
    if (currentIndex === -1) return trees[1] || trees[0];
    const nextIndex = (currentIndex + 1) % trees.length;
    return trees[nextIndex];
  },

  // Step 10: 切换/种植下一棵树（保留现有水滴、BP与历史收藏，成长值重置为 0% 阶段 1）
  switchTree: (treeId) => {
    const state = getGardenStateRaw();
    const targetTree = DEFAULT_TREES.find(t => t.id === treeId) || DEFAULT_TREES[0];

    const updated = {
      ...state,
      currentTreeId: targetTree.id,
      growth: 0,
      stage: 1,
      lastUpdated: new Date().toISOString()
    };
    saveGardenStateRaw(updated);
    return {
      success: true,
      tree: targetTree,
      gardenState: updated
    };
  },

  // Step 11: 获取全量树木图鉴与收集成就统计数据
  getGardenCollection: () => {
    const state = getGardenStateRaw();
    const completedList = state.completedTrees || [];
    const collectionRecords = state.collection || [];

    const trees = DEFAULT_TREES.map(tree => {
      const isCompleted = completedList.includes(tree.id);
      const isCurrent = state.currentTreeId === tree.id;
      const record = collectionRecords.find(c => c.treeId === tree.id);
      return {
        ...tree,
        isCompleted,
        isCurrent,
        currentGrowth: isCurrent ? (state.growth || 0) : 0,
        completedAt: record?.completedAt || null,
        harvestCount: record ? 1 : 0
      };
    });

    const totalBPFromGarden = collectionRecords.reduce((sum, item) => sum + (item.rewardBP || 0), 0);

    return {
      trees,
      totalCompleted: completedList.length,
      totalTrees: DEFAULT_TREES.length,
      totalBPFromGarden,
      currentTreeId: state.currentTreeId,
      water: state.water || 0
    };
  },

  // 测试辅助：直接调整树木成长百分比（用于验证 100% 阶段与成熟弹窗）
  setTreeGrowthDirect: (growth = 100) => {
    const state = getGardenStateRaw();
    const newGrowth = Math.min(100, Math.max(0, growth));
    let newStage = 1;
    if (newGrowth >= 80) newStage = 5;
    else if (newGrowth >= 60) newStage = 4;
    else if (newGrowth >= 40) newStage = 3;
    else if (newGrowth >= 20) newStage = 2;

    const updated = {
      ...state,
      growth: newGrowth,
      stage: newStage,
      lastUpdated: new Date().toISOString()
    };
    saveGardenStateRaw(updated);
    return updated;
  }
};
