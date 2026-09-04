// Mock Database using LocalStorage
import { questions as defaultQuestions } from '../data/questions';
const USERS_KEY = 'playbank_users';
const CURRENT_SESSION_KEY = 'playbank_session';
const PRODUCTS_KEY = 'playbank_products';
const ORDERS_KEY = 'playbank_orders';

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
  }
};
