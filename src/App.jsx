import { useState, useEffect } from 'react';
import './index.css';
import BottomNav from './components/BottomNav';
import Home from './views/Home';
import SelectSubject from './views/SelectSubject';
import Quiz from './views/Quiz';
import Marketplace from './views/Marketplace';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import Garden from './views/Garden';
import SaveScoreModal from './components/SaveScoreModal';
import CustomModal from './components/CustomModal';
import BoosterOfferModal from './components/BoosterOfferModal';
import CompleteProfileModal from './components/CompleteProfileModal';
import { mockDb } from './lib/mockDb';
import AdminDashboard from './views/AdminDashboard';
import WelcomeScreen from './views/WelcomeScreen';
import ChoosePath from './views/ChoosePath';
import Tutorial from './views/Tutorial';
import TutorialReward from './views/TutorialReward';
import LoginModal from './components/LoginModal';
import ExitRetentionModal from './components/home/ExitRetentionModal';

function App() {
  const [guestProfile, setGuestProfile] = useState(() => mockDb.getGuestProfile());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExitRetention, setShowExitRetention] = useState(false);
  const [tutorialStats, setTutorialStats] = useState({ earnedBP: 120, maxCombo: 6 });

  const [currentView, setCurrentView] = useState(() => {
    const session = mockDb.getCurrentSession();
    if (session) return 'home';
    const guest = mockDb.getGuestProfile();
    if (guest && guest.tutorialComplete) return 'home';
    if (guest && guest.selectedPath && !guest.tutorialComplete) return 'tutorial';
    return 'welcome';
  });
  // Step 34: Returning Guest Routing & Welcome Back Toast
  const [welcomeBackToast, setWelcomeBackToast] = useState(() => {
    const session = mockDb.getCurrentSession();
    if (session) return `Welcome back, ${session.ic_name || session.email?.split('@')[0] || 'Player'}!`;
    const guest = mockDb.getGuestProfile();
    if (guest && guest.tutorialComplete) {
      return `⚔️ 欢迎归来，${guest.guestName || 'Guest'}！已无缝恢复冒险存档`;
    }
    return null;
  });

  useEffect(() => {
    if (welcomeBackToast) {
      const timer = setTimeout(() => {
        setWelcomeBackToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [welcomeBackToast]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBoosterOffer, setShowBoosterOffer] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [pendingRetroactive, setPendingRetroactive] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', showCancel: false, onConfirm: null, confirmText: 'OK'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
  const openModal = (config) => setModalConfig({ ...config, isOpen: true });

  // Guest State Management
  const getTodayDateString = () => new Date().toDateString();

  const [currentUser, setCurrentUser] = useState(() => mockDb.getCurrentSession());
  
  const [userBP, setUserBP] = useState(() => {
    const session = mockDb.getCurrentSession();
    if (session) return session.total_bp;
    const guest = mockDb.getGuestProfile();
    return guest ? (guest.bankPoint || 0) : (parseInt(localStorage.getItem('playbank_user_bp')) || 0);
  });
  
  const [playsToday, setPlaysToday] = useState(() => {
    const session = mockDb.getCurrentSession();
    const lastPlayDate = localStorage.getItem(`playbank_last_play_date_${session ? session.id : 'guest'}`);
    if (lastPlayDate !== getTodayDateString()) {
      return 0; // reset for new day
    }
    return parseInt(localStorage.getItem(`playbank_plays_today_${session ? session.id : 'guest'}`)) || 0;
  });

  useEffect(() => {
    if (currentUser) {
      setUserBP(currentUser.total_bp);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('playbank_user_bp', (userBP || 0).toString());
      mockDb.updateGuestProfile({ bankPoint: userBP || 0 });
    }
  }, [userBP, currentUser]);

  useEffect(() => {
    const lastPlayDate = localStorage.getItem(`playbank_last_play_date_${currentUser ? currentUser.id : 'guest'}`);
    if (lastPlayDate !== getTodayDateString()) {
      setPlaysToday(0);
    } else {
      setPlaysToday(parseInt(localStorage.getItem(`playbank_plays_today_${currentUser ? currentUser.id : 'guest'}`)) || 0);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`playbank_plays_today_${currentUser ? currentUser.id : 'guest'}`, (playsToday || 0).toString());
    localStorage.setItem(`playbank_last_play_date_${currentUser ? currentUser.id : 'guest'}`, getTodayDateString());
  }, [playsToday, currentUser]);



  const handleStartChallenge = () => {
    // Step 32: Unlimited Practice Policy - Never block or expel players!
    // Players can play infinitely. Plays 1-5 give 100% BP; plays > 5 give 20% practice BP.
    setCurrentView('select_subject');
  };

  const resetAttempts = () => {
    setPlaysToday(0);
    setUserBP(0);
    setCurrentUser(null);
    mockDb.clearGuestProfile();
    setGuestProfile(null);
    localStorage.removeItem(`playbank_plays_today_${currentUser ? currentUser.id : 'guest'}`);
    localStorage.removeItem(`playbank_last_play_date_${currentUser ? currentUser.id : 'guest'}`);
    localStorage.removeItem('playbank_user_bp');
    sessionStorage.removeItem('guest_first_play_register');
    sessionStorage.removeItem('guest_200_register');
    sessionStorage.removeItem('user_200_booster_shown');
    setCurrentView('welcome');
    openModal({
      title: 'Reset Successful',
      message: 'You are now a brand new player! All data wiped, starting from Welcome Screen.',
      confirmText: 'Awesome'
    });
  };

  const startQuizFlow = (params) => {
    setPlaysToday(prev => prev + 1);
    setCurrentView('quiz');
  };

  const handleQuitQuiz = (sessionBP = 0) => {
    openModal({
      title: 'Quit Quiz?',
      message: `Are you sure you want to exit? You currently have ${sessionBP} BP in this session. If you exit, it will be lost.`,
      showCancel: true,
      confirmText: 'Quit',
      onConfirm: () => {
        setCurrentView('home');
        closeModal();
      }
    });
  };

  const handleQuizComplete = (earnedBP) => {
    // Step 32: Practice mode diminishing returns (Plays 1-5: 100% full rewards; Plays > 5: 20% practice reward)
    const effectiveBP = playsToday > 5 ? Math.max(2, Math.round(earnedBP * 0.2)) : earnedBP;

    if (currentUser) {
      const updatedUser = mockDb.updateUserBP(currentUser.id, effectiveBP);
      if (updatedUser) {
        setUserBP(updatedUser.total_bp);
        
        // Trigger Booster Offer for User hitting 200 BP
        if (updatedUser.total_bp >= 200 && updatedUser.score_multiplier !== 3 && !localStorage.getItem(`playbank_booster_rejected_${updatedUser.id}`)) {
          setShowBoosterOffer({ isFirstTimeOffer: true });
        }
      }
      setCurrentView('home');
    } else {
      const newGuestBP = userBP + effectiveBP;
      setUserBP(newGuestBP);
      mockDb.updateGuestProfile({ bankPoint: newGuestBP });

      // Guest First Play OR Hit 200 BP
      if (!sessionStorage.getItem('guest_first_play_register')) {
        sessionStorage.setItem('guest_first_play_register', 'true');
        setShowSaveModal('guest_first_play');
      } else if (newGuestBP >= 200 && !sessionStorage.getItem('guest_200_register')) {
        sessionStorage.setItem('guest_200_register', 'true');
        setShowSaveModal('guest_200');
      } else {
        setCurrentView('home');
      }
    }
  };

  // Toggle dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={() => {
              if (guestProfile && guestProfile.tutorialComplete) {
                setCurrentView('home');
              } else if (guestProfile && guestProfile.selectedPath) {
                setCurrentView('tutorial');
              } else {
                setCurrentView('choose_path');
              }
            }}
            onOpenLogin={() => setShowLoginModal(true)}
            hasExistingProgress={!!(guestProfile && guestProfile.tutorialComplete)}
            guestName={guestProfile?.guestName}
          />
        );
      case 'choose_path':
        return (
          <ChoosePath
            onSelectPath={(path) => {
              const newGuest = mockDb.createGuest(path);
              setGuestProfile(newGuest);
              setUserBP(0);
              setCurrentView('tutorial');
            }}
            onBack={() => setCurrentView('welcome')}
          />
        );
      case 'tutorial':
        return (
          <Tutorial
            guest={guestProfile}
            onComplete={(earnedBP = 120, maxCombo = 6) => {
              const updated = mockDb.updateGuestProfile({
                tutorialComplete: true,
                bankPoint: (guestProfile?.bankPoint || 0) + earnedBP
              });
              setGuestProfile(updated);
              setUserBP(updated?.bankPoint || earnedBP);
              setTutorialStats({ earnedBP, maxCombo });
              setCurrentView('tutorial_reward');
            }}
            onExit={() => {
              openModal({
                title: 'Leave Tutorial?',
                message: "You're almost there! Complete the training to start your adventure.",
                showCancel: true,
                confirmText: 'Keep Going',
                cancelText: 'Exit',
                onConfirm: closeModal
              });
            }}
          />
        );
      case 'tutorial_reward':
        return (
          <TutorialReward
            guest={guestProfile}
            stats={tutorialStats}
            onEnterLobby={() => setCurrentView('home')}
            onLoginAndSave={() => setShowLoginModal(true)}
          />
        );
      case 'home':
        return (
          <Home
            currentUser={currentUser}
            guestProfile={guestProfile}
            userBP={userBP}
            playsToday={playsToday}
            onStartChallenge={handleStartChallenge}
            onGoMarket={() => setCurrentView('marketplace')}
            onGoBattle={() => setCurrentView('select_subject')}
            onUpdateBP={(newBP) => setUserBP(newBP)}
          />
        );
      case 'select_subject':
        return <SelectSubject onBack={() => setCurrentView('home')} onStartQuiz={startQuizFlow} openModal={openModal} />;
      case 'quiz':
        return <Quiz onComplete={handleQuizComplete} onBack={handleQuitQuiz} currentBP={userBP} currentUser={currentUser} onGoGarden={() => setCurrentView('garden')} />;
      case 'garden':
        return <Garden userBP={userBP} onUpdateBP={(newBP) => setUserBP(newBP)} onGoQuiz={() => setCurrentView('select_subject')} />;
      case 'marketplace':
        return (
          <Marketplace 
            userBP={userBP} 
            currentUser={currentUser} 
            onRegister={() => setShowSaveModal('normal')} 
            onUserUpdate={(user) => {
              setCurrentUser(user);
              setUserBP(user.total_bp);
            }} 
          />
        );
      case 'leaderboard':
        return <Leaderboard currentUser={currentUser} />;
      case 'profile':
        return (
          <Profile 
            currentUser={currentUser} 
            userBP={userBP} 
            onRequestBooster={() => setShowBoosterOffer({ isFirstTimeOffer: false })}
            onLogout={() => { 
              if (!currentUser && userBP > 0) {
                setShowExitRetention(true);
              } else {
                mockDb.logoutUser(); 
                setCurrentUser(null); 
                setUserBP(parseInt(localStorage.getItem('playbank_user_bp')) || 0); 
                setCurrentView('welcome');
              }
            }} 
            onRegister={() => setShowSaveModal('normal')} 
          />
        );
      default:
        return (
          <Home
            currentUser={currentUser}
            guestProfile={guestProfile}
            userBP={userBP}
            playsToday={playsToday}
            onStartChallenge={handleStartChallenge}
            onGoMarket={() => setCurrentView('marketplace')}
            onOpenLogin={() => setShowLoginModal(true)}
            onUpdateBP={(newBP) => setUserBP(newBP)}
          />
        );
    }
  };

  if (currentUser && currentUser.role === 'admin') {
    return <AdminDashboard onLogout={() => { mockDb.logoutUser(); setCurrentUser(null); }} />;
  }

  const hideBottomNav = ['welcome', 'choose_path', 'tutorial', 'tutorial_reward', 'quiz'].includes(currentView);

  return (
    <div className="app-container">
      {/* Returning Player Welcome Back Toast */}
      {welcomeBackToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'linear-gradient(135deg, rgba(16, 26, 46, 0.96) 0%, rgba(26, 38, 66, 0.96) 100%)',
          border: '1px solid #10b981',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '8px 18px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          {welcomeBackToast}
        </div>
      )}

      {/* Temporary Debug Button for Resetting Plays */}
      <button 
        onClick={() => {
          if (!currentUser && userBP > 0) {
            setShowExitRetention(true);
          } else {
            resetAttempts();
          }
        }}
        style={{
          position: 'absolute',
          bottom: '150px',
          right: '20px',
          zIndex: 100,
          background: 'var(--brand-primary)',
          color: '#000',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow-sm)',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
        title="Reset Attempts"
      >
        ↺
      </button>

      {renderView()}
      
      {/* Bottom Navigation is hidden on Onboarding, Tutorial, and Quiz screens */}
      {!hideBottomNav && (
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      )}

      {/* Returning Player Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        guestProfile={guestProfile}
        guestBP={userBP}
        onLoginSuccess={(user, mergeInfo) => {
          setCurrentUser(user);
          setUserBP(user.total_bp);
          setGuestProfile(null);
          setShowLoginModal(false);
          if (mergeInfo?.mergedBP > 0) {
            setWelcomeBackToast(`✨ 登录成功！已成功合并 ${mergeInfo.mergedBP} BP 战利品 (总额: ${user.total_bp} BP)`);
          } else {
            setWelcomeBackToast(`⚔️ 欢迎归来，${user.ic_name || user.email?.split('@')[0] || 'Player'}！云端存档已就绪`);
          }
          setCurrentView('home');
        }}
      />

      {showSaveModal && (
        <SaveScoreModal 
          registerContext={showSaveModal}
          onClose={() => {
            if (showSaveModal === 'guest_first_play') {
              openModal({
                title: 'Are you sure?',
                message: "If you don't register, your BP will reset when you exit. Are you sure you want to skip?",
                showCancel: true,
                confirmText: 'Skip Registration',
                onConfirm: () => {
                  closeModal();
                  setShowSaveModal(false);
                }
              });
            } else {
              setShowSaveModal(false);
            }
          }} 
          currentBP={userBP}
          onRegisterSuccess={(user) => {
            setCurrentUser(user);
            setShowSaveModal(false);
            localStorage.setItem('playbank_user_bp', '0'); // Clear guest BP
            setShowBoosterOffer({ isFirstTimeOffer: user.total_bp >= 200, fromRegistration: true });
          }}
        />
      )}

      {/* Global Custom Modal */}
      <CustomModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />

      {/* Booster Offer Modal */}
      {showBoosterOffer && (
        <BoosterOfferModal
          isFirstTimeOffer={showBoosterOffer.isFirstTimeOffer}
          onClose={() => {
            if (showBoosterOffer.isFirstTimeOffer) {
              openModal({
                title: 'Are you sure?',
                message: 'Are you sure you want to miss out on tripling your currently accumulated BP? If you skip now, this retroactive bonus will be gone forever!',
                showCancel: true,
                confirmText: 'Yes, Skip Bonus',
                onConfirm: () => {
                  if (currentUser) {
                    localStorage.setItem(`playbank_booster_rejected_${currentUser.id}`, 'true');
                  }
                  closeModal();
                  setShowBoosterOffer(false);
                  
                  if (showBoosterOffer.fromRegistration) {
                    openModal({
                      title: 'Registration Successful',
                      message: 'Your guest BP has been merged into your new account!',
                      confirmText: 'Awesome'
                    });
                  }
                }
              });
            } else {
              setShowBoosterOffer(false);
            }
          }}
          onUnlock={(applyRetroactive) => {
            if (currentUser) {
              localStorage.setItem(`playbank_booster_rejected_${currentUser.id}`, 'true'); // Prevents future auto-popups
              const updatedUser = mockDb.unlockBooster(currentUser.id, applyRetroactive);
              if (updatedUser) {
                setCurrentUser(updatedUser);
                setUserBP(updatedUser.total_bp);
              }
            }
            setShowBoosterOffer(false);
            setPendingRetroactive(applyRetroactive);
            setShowCompleteProfile(true);
          }}
        />
      )}

      {/* Complete Profile Modal (After RM20 unlock) */}
      {showCompleteProfile && currentUser && (
        <CompleteProfileModal
          currentUser={currentUser}
          onComplete={(updatedUser) => {
            setCurrentUser(updatedUser);
            setShowCompleteProfile(false);
            openModal({
              title: 'Profile Completed & 3X Booster Unlocked! 🚀',
              message: pendingRetroactive 
                ? 'Payment Successful! Your current BP has been tripled, and you now earn 30 BP on every correct answer! You can now invite friends to earn more!' 
                : 'Payment Successful! You now earn 30 BP on every correct answer! You can now invite friends to earn more!',
              confirmText: 'Awesome!'
            });
          }}
        />
      )}

      {/* Exit & Progress Retention Modal for Guests (Step 31) */}
      <ExitRetentionModal
        isOpen={showExitRetention}
        onClose={() => setShowExitRetention(false)}
        onSaveAndLogin={() => {
          setShowExitRetention(false);
          setShowSaveModal('normal');
        }}
        onConfirmExit={() => {
          setShowExitRetention(false);
          resetAttempts();
        }}
        guestProfile={guestProfile}
        userBP={userBP}
      />
    </div>
  );
}

export default App;
