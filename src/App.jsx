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
import BossBattle from './views/BossBattle';
import { evaluateBossTrigger } from './lib/bossTrigger';
import OnboardingFlow from './views/onboarding/OnboardingFlow';
import { quizService } from './lib/quizService';
import { playerAuthService } from './lib/playerAuthService';
import HomeTutorialOverlay from './components/tutorial/HomeTutorialOverlay';
import TypingGame from './views/TypingGame';
import AgeSelectModal from './components/typing/AgeSelectModal';
import { getTypingAgeConfig } from './data/typingConfig';

function App() {
  const [guestProfile, setGuestProfile] = useState(() => mockDb.getGuestProfile());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExitRetention, setShowExitRetention] = useState(false);
  const [tutorialStats, setTutorialStats] = useState({ earnedBP: 120, maxCombo: 6 });
  const [lobbyActiveModal, setLobbyActiveModal] = useState(null);
  const [showAgeSelectModal, setShowAgeSelectModal] = useState(false);
  const [playerAge, setPlayerAge] = useState(() => mockDb.getPlayerAge());
  const [gameRoundIndex, setGameRoundIndex] = useState(() => mockDb.getGameRoundIndex());

  // Phase 2: Top-level Home Tutorial State
  const currentActivePlayerId = guestProfile?.playerId || guestProfile?.id || 'guest';
  const [homeTutorialState, setHomeTutorialState] = useState(() => {
    return mockDb.getHomeTutorialState(currentActivePlayerId);
  });
  const [quizParams, setQuizParams] = useState({
    gradeId: 'form-4',
    gradeName: 'Form 4',
    form: 4,
    subject: 'sejarah',
    subjectTitle: 'History',
    chapterId: '8bde7fd7-a4c0-485c-8328-5e08a6eb3db8',
    chapterTitle: 'Warisan Negara Bangsa',
    babNumber: 'Bab 1',
    versionNo: 1,
    questionCount: 10,
    randomQuestions: true
  });
  const [bossBattleParams, setBossBattleParams] = useState(null);
  const [bossEncounterAlert, setBossEncounterAlert] = useState(false);

  const [currentView, setCurrentView] = useState(() => {
    // Step 1: First-visit detection
    // If player has not completed Onboarding, route to 'onboarding'
    const isOnboardingComplete = mockDb.isOnboardingComplete();
    if (!isOnboardingComplete) {
      return 'onboarding';
    }
    // Completed onboarding: Direct to Home Page (or restore existing session)
    const session = mockDb.getCurrentSession();
    if (session) return 'home';
    const guest = mockDb.getGuestProfile();
    if (guest && guest.tutorialComplete) return 'home';
    if (guest && guest.selectedPath && !guest.tutorialComplete) return 'tutorial';
    return 'home';
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

  // Step 2.1: Initialize Supabase Player Auth on mount
  useEffect(() => {
    playerAuthService.initAuth().then(async (res) => {
      if (res?.user) {
        console.log(`[App] Player auth initialized: ${res.user.id} (anonymous: ${res.isAnonymous})`);
        try {
          // Fetch authoritative wallet balance from cloud
          const wallet = await playerAuthService.getPlayerWallet(res.user.id);
          if (wallet && typeof wallet.balance_bp === 'number') {
            console.log('[App] Authoritative wallet balance fetched on mount:', wallet.balance_bp);
            setUserBP(wallet.balance_bp);
            mockDb.updateGuestProfile({ bankPoint: wallet.balance_bp });
            const session = mockDb.getCurrentSession();
            if (session) {
              session.total_bp = wallet.balance_bp;
              if (typeof mockDb.saveSession === 'function') {
                mockDb.saveSession(session);
              }
              setCurrentUser({ ...session });
            }
          }

          const profile = await playerAuthService.getCloudProfile(res.user.id);
          
          // Sync cloud exact_age & profile metadata to current session if user is registered
          if (profile) {
            const currentSess = mockDb.getCurrentSession();
            if (currentSess) {
              let changed = false;
              if (profile.exact_age && currentSess.exact_age !== profile.exact_age) {
                currentSess.exact_age = profile.exact_age;
                currentSess.age = profile.exact_age;
                changed = true;
              }
              if (profile.age_group && currentSess.age_group !== profile.age_group) {
                currentSess.age_group = profile.age_group;
                changed = true;
              }
              if (profile.nickname && !profile.nickname.startsWith('Guest_') && currentSess.ic_name !== profile.nickname) {
                currentSess.ic_name = profile.nickname;
                currentSess.nickname = profile.nickname;
                changed = true;
              }
              if (changed) {
                if (typeof mockDb.saveSession === 'function') {
                  mockDb.saveSession(currentSess);
                } else {
                  localStorage.setItem('playbank_session', JSON.stringify(currentSess));
                }
                setCurrentUser({ ...currentSess });
              }
            }
          }

          // Step 10: If cloud profile is already abandoned_guest, purge dirty local credentials immediately
          if (profile?.account_status === 'abandoned_guest') {
            console.warn('[App] Current player account is marked as abandoned_guest on server. Purging local credentials...');
            await playerAuthService.handleAccountAbandoned();
            return;
          }

          const currentGuest = mockDb.getGuestProfile();
          const localName = currentGuest?.guestName?.trim();
          const isLocalCustomName = localName && !localName.startsWith('Guest_') && localName !== '冒险家';
          const isCloudGeneric = !profile?.nickname || profile.nickname.startsWith('Guest_') || profile.nickname === '冒险家';

          // If local player has a custom name (e.g. 'ABC') but cloud has generic 'Guest_xxxx',
          // sync custom name UP to cloud so Admin sees 'ABC' too!
          if (isLocalCustomName && isCloudGeneric) {
            await playerAuthService.syncProfileMetadata({ nickname: localName });
          }

          if (profile?.player_code) {
            const guestUpdates = { player_code: profile.player_code };
            // NEVER overwrite local custom name with generic 'Guest_xxxx'
            if (profile.nickname && !profile.nickname.startsWith('Guest_')) {
              guestUpdates.guestName = profile.nickname;
            }
            if (profile.exact_age) {
              guestUpdates.exactAge = profile.exact_age;
            }
            const updated = mockDb.updateGuestProfile(guestUpdates);
            if (updated) {
              setGuestProfile(updated);
            }
          }
        } catch (e) {
          console.warn('[App] Failed to sync cloud profile on mount:', e);
        }
      }
    });
  }, []);

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
  
  // Authoritative server wallet state (starts at 0, loaded from Supabase)
  const [userBP, setUserBP] = useState(0);
  
  const [playsToday, setPlaysToday] = useState(() => {
    const session = mockDb.getCurrentSession();
    const lastPlayDate = localStorage.getItem(`playbank_last_play_date_${session ? session.id : 'guest'}`);
    if (lastPlayDate !== getTodayDateString()) {
      return 0; // reset for new day
    }
    return parseInt(localStorage.getItem(`playbank_plays_today_${session ? session.id : 'guest'}`)) || 0;
  });

  // Purge legacy local BP on mount & load authoritative wallet balance
  useEffect(() => {
    playerAuthService.purgeLocalBP();
    playerAuthService.getMyWallet().then((wallet) => {
      if (wallet && typeof wallet.balance_bp === 'number') {
        setUserBP(wallet.balance_bp);
      }
    });
  }, []);

  // Listen to authoritative wallet update events across all game/mission/streak/garden/shop actions
  useEffect(() => {
    const handleWalletUpdated = (e) => {
      if (e.detail && typeof e.detail.balance_bp === 'number') {
        setUserBP(e.detail.balance_bp);
      }
    };
    window.addEventListener('playbank:wallet-updated', handleWalletUpdated);
    return () => window.removeEventListener('playbank:wallet-updated', handleWalletUpdated);
  }, []);

  useEffect(() => {
    if (currentUser) {
      playerAuthService.getMyWallet().then((wallet) => {
        if (wallet && typeof wallet.balance_bp === 'number') {
          setUserBP(wallet.balance_bp);
        }
      });
    }
  }, [currentUser]);

  // Phase 2: Sync tutorial state on player or view changes
  useEffect(() => {
    const id = currentUser?.id || guestProfile?.playerId || guestProfile?.id || 'guest';
    setHomeTutorialState(mockDb.getHomeTutorialState(id));
  }, [currentUser, guestProfile, currentView]);

  const handleTutorialStepAdvance = (nextStep, subStep = 'highlight') => {
    const id = currentUser?.id || guestProfile?.playerId || guestProfile?.id || 'guest';
    const updated = mockDb.saveHomeTutorialState(id, { currentStep: nextStep, subStep });
    setHomeTutorialState(updated);
  };

  const handleTutorialComplete = () => {
    const id = currentUser?.id || guestProfile?.playerId || guestProfile?.id || 'guest';
    const completed = mockDb.markHomeTutorialComplete(id);
    setHomeTutorialState(completed);
  };

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

  useEffect(() => {
    mockDb.validateAndHealState();

    const handleStorageChange = (e) => {
      if (['playbank_session', 'playbank_guest_profile', 'playbank_users'].includes(e.key)) {
        const session = mockDb.getCurrentSession();
        setCurrentUser(session);
        if (!session) {
          setGuestProfile(mockDb.getGuestProfile());
        }
      }
    };

    // Step 10: Developer console reset helper (does not appear in player UI)
    window.__resetOnboarding = () => {
      mockDb.resetOnboarding();
      window.location.reload();
    };

    const handleAvatarChanged = () => {
      const session = mockDb.getCurrentSession();
      setCurrentUser(session);
      if (!session) {
        setGuestProfile(mockDb.getGuestProfile());
      }
    };

    const handleAccountAbandoned = () => {
      console.warn('[App] Caught playbank:account-abandoned event. Resetting player state...');
      const session = mockDb.getCurrentSession();
      setCurrentUser(session);
      setGuestProfile(mockDb.getGuestProfile());
      setUserBP(mockDb.getSafeUserBP());
      openModal({
        title: '游客账号已切换',
        message: '该游客账号已切换至已有正式账号，系统已清理此游客本地缓存。请重新进入或登录正式账号。',
        confirmText: '我知道了'
      });
    };

    const handleWalletUpdated = (e) => {
      try {
        if (e.detail?.balance_bp !== undefined && e.detail?.balance_bp !== null) {
          console.log('[App] Authoritative wallet update received:', e.detail.balance_bp);
          setUserBP(e.detail.balance_bp);
          mockDb.updateGuestProfile({ bankPoint: e.detail.balance_bp });
          const session = mockDb.getCurrentSession();
          if (session) {
            session.total_bp = e.detail.balance_bp;
            if (typeof mockDb.saveSession === 'function') {
              mockDb.saveSession(session);
            }
            setCurrentUser({ ...session });
          }
        }
      } catch (err) {
        console.error('[App] handleWalletUpdated error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('playbank:avatar-changed', handleAvatarChanged);
    window.addEventListener('playbank:account-abandoned', handleAccountAbandoned);
    window.addEventListener('playbank:wallet-updated', handleWalletUpdated);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('playbank:avatar-changed', handleAvatarChanged);
      window.removeEventListener('playbank:account-abandoned', handleAccountAbandoned);
      window.removeEventListener('playbank:wallet-updated', handleWalletUpdated);
      delete window.__resetOnboarding;
    };
  }, []);

  const handleStartChallenge = () => {
    // Phase 5: If player is currently on Step 4 of Home Tutorial, mark it complete!
    const id = currentUser?.id || guestProfile?.playerId || guestProfile?.id || 'guest';
    const tutorial = mockDb.getHomeTutorialState(id);
    if (tutorial && tutorial.eligible && tutorial.status !== 'completed' && tutorial.currentStep === 4) {
      handleTutorialComplete();
    }
    // Show Age Select Modal to determine exact age and round gameplay
    setShowAgeSelectModal(true);
  };

  const handleConfirmAgeAndStart = async (chosenAge) => {
    setShowAgeSelectModal(false);
    const validAge = parseInt(chosenAge, 10) || 10;
    setPlayerAge(validAge);
    mockDb.savePlayerAge(validAge);

    // Check round alternation: Odd = Multiple Choice, Even = Typing Game
    const currentRound = gameRoundIndex || 1;
    const isMultipleChoice = currentRound % 2 === 1;

    if (isMultipleChoice) {
      // Single/Odd round: English Multiple Choice
      const mapAgeToGrade = (age) => {
        const num = parseInt(age, 10);
        if (num <= 7) return { gradeId: 'year-1', gradeName: 'Year 1', form: 1 };
        if (num === 8) return { gradeId: 'year-2', gradeName: 'Year 2', form: 2 };
        if (num === 9) return { gradeId: 'year-3', gradeName: 'Year 3', form: 3 };
        if (num === 10) return { gradeId: 'year-4', gradeName: 'Year 4', form: 4 };
        if (num === 11) return { gradeId: 'year-5', gradeName: 'Year 5', form: 5 };
        if (num === 12) return { gradeId: 'year-6', gradeName: 'Year 6', form: 6 };
        if (num === 13) return { gradeId: 'form-1', gradeName: 'Form 1', form: 1 };
        if (num === 14) return { gradeId: 'form-2', gradeName: 'Form 2', form: 2 };
        if (num === 15) return { gradeId: 'form-3', gradeName: 'Form 3', form: 3 };
        if (num === 16) return { gradeId: 'form-4', gradeName: 'Form 4', form: 4 };
        return { gradeId: 'form-5', gradeName: 'Form 5', form: 5 };
      };

      const gradeInfo = mapAgeToGrade(validAge);
      let selectedChapter = null;
      try {
        const pubChapters = await quizService.getPublishedChapters(gradeInfo.gradeId, 'english');
        if (pubChapters && pubChapters.length > 0) {
          selectedChapter = pubChapters[0];
        }
      } catch (err) {
        console.warn('[App] Could not load published English chapters for grade:', gradeInfo.gradeId, err);
      }

      startQuizFlow({
        gradeId: gradeInfo.gradeId,
        gradeName: gradeInfo.gradeName,
        form: gradeInfo.form,
        subject: 'english',
        subjectTitle: 'English',
        chapterId: selectedChapter?.id || '8bde7fd7-a4c0-485c-8328-5e08a6eb3db8',
        chapterTitle: selectedChapter?.title || 'Vocabulary & Grammar',
        babNumber: selectedChapter?.babNumber || 'Unit 1',
        versionNo: selectedChapter?.versionNo || 1,
        questionCount: 10,
        randomQuestions: true
      });
    } else {
      // Double/Even round: English Typing Game
      setPlaysToday(prev => prev + 1);
      setCurrentView('typing');
    }
  };

  const resetAttempts = () => {
    setPlaysToday(0);
    setUserBP(0);
    setCurrentUser(null);
    mockDb.clearGuestProfile();
    mockDb.resetOnboarding();
    setGuestProfile(null);
    mockDb.saveGameRoundIndex(1);
    setGameRoundIndex(1);
    localStorage.removeItem(`playbank_plays_today_${currentUser ? currentUser.id : 'guest'}`);
    localStorage.removeItem(`playbank_last_play_date_${currentUser ? currentUser.id : 'guest'}`);
    localStorage.removeItem('playbank_user_bp');
    sessionStorage.removeItem('guest_first_play_register');
    sessionStorage.removeItem('guest_200_register');
    sessionStorage.removeItem('user_200_booster_shown');
    setCurrentView('onboarding');
    openModal({
      title: 'Reset Successful',
      message: 'You are now a brand new player! All data wiped, starting from Onboarding.',
      confirmText: 'Awesome'
    });
  };

  const startQuizFlow = (params) => {
    setPlaysToday(prev => prev + 1);
    if (params) {
      setQuizParams(prev => ({ ...prev, ...params }));
    }
    setBossBattleParams(null);
    setCurrentView('quiz');
  };

  const handleQuitQuiz = (sessionBP = 0, sessionId = null) => {
    openModal({
      title: 'Quit Quiz?',
      message: `Are you sure you want to exit? You currently have ${sessionBP} BP in this session. If you exit, it will be lost.`,
      showCancel: true,
      confirmText: 'Quit',
      onConfirm: () => {
        if (sessionId) {
          quizService.abandonGameSession(sessionId).catch(err => console.warn('[App] Failed to mark session abandoned:', err));
        }
        setBossBattleParams(null);
        setCurrentView('home');
        closeModal();
      }
    });
  };

  const handleEvaluateBossTrigger = async (quizStats, cycleInfo) => {
    return await evaluateBossTrigger({
      chapterId: quizParams.chapterId,
      subjectId: quizParams.subject,
      subjectTitle: quizParams.subjectTitle || 'History',
      form: quizParams.form || 4,
      chapter: quizParams.chapter || 1,
      quizStats,
      cycleInfo,
      currentUser
    });
  };

  const handleTriggerBossEncounter = (triggerResult, quizStats) => {
    // 1. Normal Quiz BP was already authoritatively settled by completeGameSession in Quiz.jsx.
    // We only log the attempt in mockDb for local stats.
    const normalBP = quizStats?.sessionBP || 0;
    if (currentUser && normalBP > 0) {
      mockDb.logQuizAttempt(currentUser.id, quizParams.subjectTitle || 'History', normalBP);
    }

    // 2. Trigger Boss Encounter Alert and switch view
    setBossBattleParams(triggerResult);
    setBossEncounterAlert(true);
    setTimeout(() => {
      setBossEncounterAlert(false);
      setCurrentView('boss_battle');
    }, 1400);
  };

  const handleCheckBossTrigger = async (quizStats, cycleInfo) => {
    const triggerResult = await handleEvaluateBossTrigger(quizStats, cycleInfo);
    if (triggerResult.shouldTrigger) {
      handleTriggerBossEncounter(triggerResult, quizStats);
      return true; // Boss encounter triggered!
    }
    return false; // Proceed to normal Quiz Result
  };

  const handleQuizComplete = (earnedBP) => {
    // Advance game round index (Odd -> Even, Even -> Odd)
    const nextRound = (gameRoundIndex || 1) + 1;
    setGameRoundIndex(nextRound);
    mockDb.saveGameRoundIndex(nextRound);

    // Note: earnedBP was already settled in cloud by completeGameSession RPC.
    // Local state (userBP / mockDb) has already been updated by the playbank:wallet-updated event.
    const currentBP = mockDb.getSafeUserBP();

    if (currentUser) {
      // Trigger Booster Offer for User hitting 200 BP
      if (currentBP >= 200 && currentUser.score_multiplier !== 3 && !localStorage.getItem(`playbank_booster_rejected_${currentUser.id}`)) {
        setShowBoosterOffer({ isFirstTimeOffer: true });
      }
      setCurrentView('home');
    } else {
      // Guest First Play OR Hit 200 BP
      if (!sessionStorage.getItem('guest_first_play_register')) {
        sessionStorage.setItem('guest_first_play_register', 'true');
        setShowSaveModal('guest_first_play');
      } else if (currentBP >= 200 && !sessionStorage.getItem('guest_200_register')) {
        sessionStorage.setItem('guest_200_register', 'true');
        setShowSaveModal('guest_200');
      } else {
        setCurrentView('home');
      }
    }
  };

  const handleTypingComplete = (earnedBP) => {
    // Advance game round index (Even -> Odd)
    const nextRound = (gameRoundIndex || 1) + 1;
    setGameRoundIndex(nextRound);
    mockDb.saveGameRoundIndex(nextRound);

    const currentBP = mockDb.getSafeUserBP();

    if (currentUser) {
      if (currentBP >= 200 && currentUser.score_multiplier !== 3 && !localStorage.getItem(`playbank_booster_rejected_${currentUser.id}`)) {
        setShowBoosterOffer({ isFirstTimeOffer: true });
      }
      setCurrentView('home');
    } else {
      if (!sessionStorage.getItem('guest_first_play_register')) {
        sessionStorage.setItem('guest_first_play_register', 'true');
        setShowSaveModal('guest_first_play');
      } else if (currentBP >= 200 && !sessionStorage.getItem('guest_200_register')) {
        sessionStorage.setItem('guest_200_register', 'true');
        setShowSaveModal('guest_200');
      } else {
        setCurrentView('home');
      }
    }
  };

  const handleBossBattleComplete = (stats) => {
    // 1. Boss BP was already settled in cloud by completeGameSession RPC in BossBattle.jsx.
    // Local state has already been updated by the playbank:wallet-updated event.
    const currentBP = mockDb.getSafeUserBP();

    if (currentUser) {
      if (currentBP >= 200 && currentUser.score_multiplier !== 3 && !localStorage.getItem(`playbank_booster_rejected_${currentUser.id}`)) {
        setShowBoosterOffer({ isFirstTimeOffer: true });
      }
    }

    // 2. Log boss attempt in mockDb
    mockDb.logBossAttempt({
      userId: currentUser?.id || 'guest',
      bossId: stats?.bossId || 'chrono_lynx',
      bossType: stats?.bossType || 'SPEED',
      subject: stats?.subject || quizParams.subjectTitle || 'History',
      form: stats?.form || quizParams.form || 4,
      chapter: stats?.chapter || quizParams.chapter || 1,
      correct: stats?.correct,
      wrong: stats?.wrong,
      skipped: stats?.skipped,
      accuracy: stats?.accuracy,
      maxCombo: stats?.maxCombo,
      bossResult: stats?.battleResult,
      earnedBP: stats?.earnedBP || 0
    });

    // 3. Clear transient encounter state
    setBossBattleParams(null);

    // 4. Return to normal study loop
    setCurrentView('home');
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
      case 'onboarding':
        return (
          <OnboardingFlow
            onComplete={async (userProfileData) => {
              mockDb.setOnboardingComplete(true);

              // 1. Establish guest session in Supabase now that player confirmed onboarding
              let guestPlayerCode = null;
              let syncedNickname = userProfileData?.nickname?.trim() || '冒险家';
              const rawAge = userProfileData?.ageGroup;
              const normalizedAgeGroup = (typeof rawAge === 'object' && rawAge !== null ? rawAge.id : rawAge) || '13-15';
              const rawChannel = userProfileData?.sourceChannel;
              const normalizedChannel = (typeof rawChannel === 'object' && rawChannel !== null ? rawChannel.id : rawChannel) || null;
              const dailyGoalMinutes = Number(userProfileData?.dailyGoal?.minutes) || 10;

              try {
                const authRes = await playerAuthService.ensurePlayerAuth();
                if (authRes?.user?.id) {
                  console.log('[App] Guest session established on onboarding complete:', authRes.user.id);
                  const updatedProfile = await playerAuthService.syncProfileMetadata({
                    nickname: syncedNickname,
                    age_group: normalizedAgeGroup,
                    source_channel: normalizedChannel,
                    daily_goal_minutes: dailyGoalMinutes
                  });
                  if (updatedProfile?.player_code) {
                    guestPlayerCode = updatedProfile.player_code;
                  }
                  if (updatedProfile?.nickname) {
                    syncedNickname = updatedProfile.nickname;
                  }
                }
              } catch (err) {
                console.error('[App] Failed to establish guest session:', err);
              }

              // Map selected subject to tutorial path
              let tutorialPath = 'chinese';
              const subjId = (userProfileData?.selectedSubject?.id || '').toLowerCase();
              const subjName = (userProfileData?.selectedSubject?.name || '').toLowerCase();
              if (subjId.includes('english') || subjName.includes('english')) {
                tutorialPath = 'english';
              } else if (subjId.includes('chinese') || subjName.includes('华文')) {
                tutorialPath = 'chinese';
              } else {
                tutorialPath = 'mixed';
              }

              // Create or update guest profile with onboarding choices
              let guest = mockDb.getGuestProfile();
              if (!guest) {
                guest = mockDb.createGuest(tutorialPath, syncedNickname);
              }
              const updatedGuest = mockDb.updateGuestProfile({
                guestName: syncedNickname,
                player_code: guestPlayerCode || guest?.player_code,
                selectedPath: tutorialPath,
                ageGroup: userProfileData?.ageGroup,
                sourceChannel: userProfileData?.sourceChannel,
                selectedSubject: userProfileData?.selectedSubject,
                subjectProficiency: userProfileData?.subjectProficiency,
                dailyGoal: userProfileData?.dailyGoal,
                tutorialComplete: false,
                tutorialProgress: 1,
                tutorialStep: 1
              });

              setGuestProfile(updatedGuest || guest);
              setUserBP(0);

              // Step 11: Route directly into Part A Tutorial Game trial
              setCurrentView('tutorial');
            }}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        );
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
            onUpdateBP={(newBP) => setUserBP(newBP)}
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
            onGoBattle={handleStartChallenge}
            onGoProfile={() => setCurrentView('profile')}
            onUpdateBP={(newBP) => setUserBP(newBP)}
            onActiveModalChange={setLobbyActiveModal}
            externalActiveModal={lobbyActiveModal}
          />
        );
      case 'select_subject':
        return <SelectSubject onBack={() => setCurrentView('home')} onStartQuiz={startQuizFlow} openModal={openModal} />;
      case 'quiz':
        return (
          <Quiz
            onComplete={handleQuizComplete}
            onBack={(bp, sid) => handleQuitQuiz(bp, sid)}
            currentBP={userBP}
            currentUser={currentUser}
            onGoGarden={() => setCurrentView('garden')}
            quizParams={quizParams}
            onEvaluateBossTrigger={handleEvaluateBossTrigger}
            onTriggerBossEncounter={handleTriggerBossEncounter}
          />
        );
      case 'typing':
        return (
          <TypingGame
            age={playerAge}
            onComplete={handleTypingComplete}
            onQuit={() => setCurrentView('home')}
          />
        );
      case 'boss_battle':
        return (
          <BossBattle
            encounter={bossBattleParams?.encounter}
            questions={bossBattleParams?.questions}
            chapterId={bossBattleParams?.chapterId || quizParams?.chapterId}
            sessionId={bossBattleParams?.sessionId}
            subject={bossBattleParams?.subject || quizParams?.subjectTitle}
            form={bossBattleParams?.form || quizParams?.form}
            chapter={bossBattleParams?.chapter || quizParams?.chapter}
            currentUser={currentUser}
            guestProfile={guestProfile}
            onComplete={handleBossBattleComplete}
            onBack={() => {
              setBossBattleParams(null);
              setCurrentView('home');
            }}
          />
        );
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
        return <Leaderboard currentUser={currentUser} guestProfile={guestProfile} />;
      case 'profile':
        return (
          <Profile 
            currentUser={currentUser} 
            guestProfile={guestProfile}
            userBP={userBP} 
            onBack={() => setCurrentView('home')}
            onRequestBooster={() => setShowBoosterOffer({ isFirstTimeOffer: false })}
            onLogout={() => { 
              if (!currentUser && userBP > 0) {
                setShowExitRetention(true);
              } else {
                mockDb.logoutUser(); 
                setCurrentUser(null); 
                mockDb.clearGuestProfile();
                localStorage.setItem('playbank_user_bp', '0');
                setUserBP(0); 
                setGuestProfile(null);
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
            onActiveModalChange={setLobbyActiveModal}
            externalActiveModal={lobbyActiveModal}
          />
        );
    }
  };

  if (currentUser && currentUser.role === 'admin') {
    return <AdminDashboard onLogout={() => { mockDb.logoutUser(); setCurrentUser(null); }} />;
  }

  const hideBottomNav = ['onboarding', 'welcome', 'choose_path', 'tutorial', 'tutorial_reward', 'quiz', 'typing', 'boss_battle'].includes(currentView);

  return (
    <div className={`app-container ${currentView === 'home' ? 'home-active' : ''}`}>
      {/* Returning Player Welcome Back Toast */}
      {welcomeBackToast && (
        <div style={{
          position: 'absolute',
          top: 'calc(max(16px, env(safe-area-inset-top, 16px)) + 54px)',
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
      {currentView === 'home' && (
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
      )}

      {/* Dev Test Button for Boss Battle: strictly hidden in Production, only visible in Dev mode */}
      {import.meta.env.DEV && currentView === 'home' && (
        <button
          onClick={() => {
            const triggerResult = evaluateBossTrigger({
              subject: quizParams.subjectTitle || 'History',
              form: quizParams.form || 4,
              chapter: 1,
              currentUser,
              forceTrigger: true
            });
            if (triggerResult.shouldTrigger) {
              setBossBattleParams(triggerResult);
              setCurrentView('boss_battle');
            }
          }}
          style={{
            position: 'absolute',
            bottom: '200px',
            right: '20px',
            zIndex: 100,
            background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
            color: '#FFF',
            border: '2px solid #FFF',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
            fontSize: '18px'
          }}
          title="Play Boss Battle (Dev Mode Only)"
        >
          ⚔️
        </button>
      )}

      {/* Cinematic Boss Encounter Ambush Overlay */}
      {bossEncounterAlert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(5, 8, 16, 0.94)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '340px',
            padding: '28px 24px',
            borderRadius: '24px',
            border: '2px solid #EF4444',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.98) 100%)',
            boxShadow: '0 0 60px rgba(239, 68, 68, 0.7)'
          }}>
            <div style={{ fontSize: '46px', marginBottom: '8px', animation: 'bounce 1s infinite' }}>⚠️</div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#10B981', letterSpacing: '1.2px', marginBottom: '6px' }}>
              CHALLENGE CLEARED! (+BP SAVED)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.2 }}>
              BOSS ENCOUNTER!
            </div>
            <div style={{ fontSize: '13px', color: '#F1F5F9', marginTop: '10px', fontWeight: 700 }}>
              Speed Demon · Chrono Lynx
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
              Preparing Speed Battle arena...
            </div>
          </div>
        </div>
      )}

      {renderView()}
      
      {/* Bottom Navigation is hidden on Onboarding, Tutorial, and Quiz screens */}
      {!hideBottomNav && (
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      )}

      {/* Phase 2: Independent Home Tutorial Overlay (Coordinated across Home & Marketplace) */}
      {homeTutorialState && homeTutorialState.eligible && homeTutorialState.status !== 'completed' && ['home', 'marketplace'].includes(currentView) && (
        <HomeTutorialOverlay
          tutorialState={homeTutorialState}
          currentView={currentView}
          userBP={userBP}
          isModalOpen={!!lobbyActiveModal}
          activeModalType={lobbyActiveModal}
          onStepAdvance={handleTutorialStepAdvance}
          onCloseModal={() => setLobbyActiveModal(null)}
          onNavigateToHome={() => setCurrentView('home')}
          onStartGame={() => {
            handleTutorialComplete();
            handleStartChallenge();
          }}
        />
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
            setGuestProfile(null);
            setShowSaveModal(false);
            localStorage.setItem('playbank_user_bp', '0'); // Clear guest BP
            setShowBoosterOffer({ isFirstTimeOffer: (user.total_bp || userBP) >= 200, fromRegistration: true });
          }}
          onSwitchAccountSuccess={(user) => {
            setCurrentUser(user);
            setUserBP(user.total_bp || 0);
            setGuestProfile(null);
            setShowSaveModal(false);
            const displayName = user.ic_name || user.nickname || user.email?.split('@')[0] || 'Player';
            setWelcomeBackToast(`⚔️ 欢迎归来，${displayName}！已切换至正式账号，云端存档已就绪`);
            setCurrentView('home');
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
                message: 'Are you sure you want to miss out on the 3X BP Booster? All your future quiz answers will earn 30 BP instead of 10 BP!',
                showCancel: true,
                confirmText: 'Skip Booster',
                onConfirm: () => {
                  if (currentUser) {
                    localStorage.setItem(`playbank_booster_rejected_${currentUser.id}`, 'true');
                  }
                  closeModal();
                  setShowBoosterOffer(false);
                  
                  if (showBoosterOffer.fromRegistration) {
                    openModal({
                      title: 'Registration Successful',
                      message: 'Your account is ready! Enjoy PlayBank!',
                      confirmText: 'Awesome'
                    });
                  }
                }
              });
            } else {
              setShowBoosterOffer(false);
            }
          }}
          onUnlock={async () => {
            if (currentUser) {
              localStorage.setItem(`playbank_booster_rejected_${currentUser.id}`, 'true');
              await playerAuthService.unlockBpBooster();
              const wallet = await playerAuthService.getMyWallet();
              if (wallet && typeof wallet.balance_bp === 'number') {
                setUserBP(wallet.balance_bp);
              }
              setCurrentUser(prev => prev ? ({ ...prev, score_multiplier: 3, has_booster: true }) : prev);
            }
            setShowBoosterOffer(false);
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

      {/* Age Selection Modal for English Multiple Choice & Typing Game */}
      <AgeSelectModal
        isOpen={showAgeSelectModal}
        onClose={() => setShowAgeSelectModal(false)}
        onConfirmAge={handleConfirmAgeAndStart}
        defaultAge={playerAge}
        gameRound={gameRoundIndex}
      />
    </div>
  );
}

export default App;
