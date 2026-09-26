import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Clock, Check, Trophy, Flame, ChevronRight, CheckCircle2, MinusCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import { quizService } from '../lib/quizService.js';
import { playerAuthService } from '../lib/playerAuthService.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

function PlayBankMiniLogo() {
  return (
    <div className="animate-slide-up" style={{ margin: '0 auto', display: 'flex', height: '56px', width: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid var(--brand-primary)', backgroundColor: '#000', boxShadow: 'var(--card-shadow-sm)', overflow: 'hidden', animationDelay: '0.1s' }}>
      <img src={`${import.meta.env.BASE_URL}playbanklogo.png`} alt="PlayBank" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function TrophyHero() {
  return (
    <div className="animate-slide-up" style={{ position: 'relative', margin: '16px auto 0', display: 'flex', height: '190px', width: '190px', alignItems: 'center', justifyContent: 'center', animationDelay: '0.3s', zIndex: 10 }}>
      <div style={{ position: 'absolute', inset: '-30px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)', animation: 'pulse-glow 2s infinite ease-in-out' }} />
      <div style={{ position: 'relative', display: 'flex', height: '160px', width: '160px', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <img src={`${import.meta.env.BASE_URL}trophy.png`} alt="Trophy" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
      </div>
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: '11px', fontWeight: 500, color: '#7B7B7B' }}>{label}</p>
      <p style={{ marginTop: '4px', fontSize: '24px', fontWeight: 900, color: '#000' }}>{value}</p>
    </div>
  );
}

function ProgressCard() {
  return (
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '18px', background: '#FFD54F', padding: '12px 16px', boxShadow: 'var(--card-shadow-sm)' }}>
      <div style={{ display: 'flex', height: '44px', width: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#000', color: '#FFBC00' }}>
        <Flame size={22} fill="#FFBC00" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>Keep it up!</p>
        <p style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.2, color: '#5B4A00' }}>
          Answer 5 more quizzes<br />to extend your streak!
        </p>
      </div>
      <div style={{ width: '62px' }}>
        <p style={{ textAlign: 'right', fontSize: '14px', fontWeight: 900, color: '#000' }}>3/5</p>
        <div style={{ marginTop: '4px', height: '8px', borderRadius: '9999px', background: '#FFF1B8' }}>
          <div style={{ height: '8px', width: '60%', borderRadius: '9999px', background: '#000' }} />
        </div>
      </div>
      <ChevronRight size={18} color="#000" />
    </div>
  );
}

function SimpleChart() {
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ position: 'relative', height: '120px', borderRadius: '12px', background: '#FFF' }}>
        {/* y labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-between', fontSize: '9px', color: '#8A8A8A' }}>
          <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
        </div>
        {/* graph area */}
        <div style={{ marginLeft: '32px', marginRight: '8px', height: '100%' }}>
          <svg viewBox="0 0 260 120" style={{ height: '100%', width: '100%' }}>
            <line x1="0" y1="20" x2="260" y2="20" stroke="#EFEFEF" />
            <line x1="0" y1="45" x2="260" y2="45" stroke="#EFEFEF" />
            <line x1="0" y1="70" x2="260" y2="70" stroke="#EFEFEF" />
            <line x1="0" y1="95" x2="260" y2="95" stroke="#EFEFEF" />
            <polyline fill="none" stroke="#F2B400" strokeWidth="3" points="5,70 35,45 65,62 95,38 125,55 155,72 185,35 215,52 245,42 255,78" />
            {[ [5, 70], [35, 45], [65, 62], [95, 38], [125, 55], [155, 72], [185, 35], [215, 52], [245, 42], [255, 78] ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="#F2B400" stroke="#fff" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </div>
      {/* x-axis */}
      <div style={{ marginLeft: '32px', marginRight: '8px', marginTop: '4px', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', textAlign: 'center', fontSize: '9px', fontWeight: 500, color: '#8A8A8A' }}>
        <span>G1</span><span>G2</span><span>G3</span><span>G4</span><span>G5</span><span>G6</span><span>G7</span><span>G8</span><span>G9</span><span>G10</span>
      </div>
    </div>
  );
}

function SummaryItem({ icon, color, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color }}>{icon}</div>
      <p style={{ marginTop: '4px', fontSize: '18px', fontWeight: 900, color: '#000' }}>{value}</p>
      <p style={{ fontSize: '11px', fontWeight: 500, color: '#6A6A6A' }}>{label}</p>
    </div>
  );
}

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const Quiz = ({
  onComplete,
  onBack,
  currentBP,
  currentUser,
  onGoGarden,
  quizParams = null,
  onCheckBossTrigger = null,
  onEvaluateBossTrigger = null,
  onTriggerBossEncounter = null
}) => {
  const rawQuestions = mockDb.getQuestions();
  const { width, height } = useWindowSize();
  const multiplier = currentUser?.score_multiplier || 1;
  const scorePerQuestion = 10 * multiplier;
  const [status, setStatus] = useState('countdown'); // 'countdown' | 'playing' | 'result'
  const [countdown, setCountdown] = useState(3);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState(null); 
  
  const [sessionBP, setSessionBP] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [sessionQuestionsDetails, setSessionQuestionsDetails] = useState([]);

  // Animation Refs & State
  const bpTextRef = useRef(null);
  const claimBtnRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animVars, setAnimVars] = useState({});
  const hasRecordedMissionsRef = useRef(false);
  const currentSessionIdRef = useRef(null);
  const currentChapterIdRef = useRef(null);
  const pendingBossTriggerRef = useRef(null);
  const pendingFinalStatsRef = useRef(null);
  const questionsRef = useRef(questions);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Step 2.1 & 2.6 & Requirements 1-5: Initialize quiz with real chapter UUID and pre-created session (Fail-Fast)
  const loadQuizQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    setSubmitError(null);

    try {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const chapterId = quizParams?.chapterId;

      // Requirement 4: Strictly fail-fast. Do NOT auto-select "latest chapter"!
      if (!chapterId || !UUID_REGEX.test(chapterId)) {
        throw new Error('对局建立失败：未检测到有效Chapter UUID，请返回关卡选择重新进入。');
      }

      currentChapterIdRef.current = chapterId;

      // Requirement 3 & 5: Pre-create session directly, fail-fast, capture created id immediately
      const createdSession = await quizService.createGameSession({
        chapterId: chapterId,
        chapterTitle: quizParams?.chapterTitle || quizParams?.chapterName || 'Sejarah',
        chapterVersion: quizParams?.versionNo || 1,
        totalQuestions: quizParams?.questionCount || 10
      });

      const newSessionId = createdSession?.id || createdSession?.sessionId;
      if (!newSessionId) {
        throw new Error('对局建立失败：未从Supabase获取到新Session ID，已终止游戏。');
      }

      currentSessionIdRef.current = newSessionId;

      const authUserId = await playerAuthService.getAuthUserId();
      const playerId = (currentUser?.id && currentUser.id !== 'guest') ? currentUser.id : authUserId;
      const randomEnabled = quizParams?.randomQuestions !== undefined ? quizParams.randomQuestions : true;

      const fallbackQuestions = rawQuestions || [];

      const batch = await quizService.getNextQuestions({
        chapterId: chapterId,
        limit: quizParams?.questionCount || 10,
        playerId,
        randomEnabled,
        versionNo: quizParams?.versionNo || 1,
        fallbackQuestions
      });

      if (!batch?.questions || batch.questions.length === 0) {
        throw new Error('本章节暂无可作答的已发布题目。');
      }

      setCycleInfo({
        cycleNumber: batch.cycle_number,
        remainingInCycle: batch.remaining_in_cycle,
        servedInCycle: batch.served_in_cycle,
        totalInCycle: batch.total_in_cycle
      });
      setQuestions(batch.questions);
      setupQuestion(batch.questions[0]);
      setStartTime(Date.now());
      setIsLoadingQuestions(false);
    } catch (err) {
      console.error('[Quiz] loadQuizQuestions failed:', err);
      setLoadError(err.message || '对局建立失败，请重试。');
      setIsLoadingQuestions(false);
    }
  }, [quizParams, currentUser]);

  useEffect(() => {
    loadQuizQuestions();
  }, [loadQuizQuestions]);

  // Requirement 6: Await completeGameSession and confirm Supabase update before showing result or entering Boss
  const finalizeGameSession = useCallback(async (customStats = null, customBossTrigger = null) => {
    setIsSaving(true);
    setSaveError(null);

    const activeQuestions = questionsRef.current?.length > 0 ? questionsRef.current : questions;
    const statsToUse = customStats || pendingFinalStatsRef.current;
    
    // Authoritatively compute counts
    const computedCorrect = activeQuestions.filter(q => q.isUserCorrect === true).length;
    const effCorrect = statsToUse?.correctCount !== undefined ? statsToUse.correctCount : computedCorrect;
    const effSkipped = statsToUse?.skippedCount ?? skippedCount;
    const effWrong = activeQuestions.length - effCorrect - effSkipped;
    const effScore = effCorrect * scorePerQuestion;
    const effBP = statsToUse?.sessionBP ?? sessionBP;

    // Build clean question details array for this session (prevents ID mangling/loss)
    const questionsDetails = activeQuestions.map((q, idx) => {
      const rawOpts = q.options || [];
      const selectedOpt = rawOpts.find(o => o.id === q.selectedOptionId);
      const correctOpt = rawOpts.find(o => o.id === (q.revealedCorrectOptionId || q.correct_option_id));
      const isUserCorrect = q.isUserCorrect !== undefined
        ? q.isUserCorrect
        : (q.revealedCorrectOptionId ? q.revealedCorrectOptionId === q.selectedOptionId : false);

      let selectedText = q.selectedOptionText || selectedOpt?.text || null;
      if (!selectedText || q.selectedOptionId === 'timeout' || q.selectedOptionId === 'unanswered' || !q.selectedOptionId) {
        selectedText = '未作答 / Time Out';
      }

      let correctText = correctOpt?.text || q.revealedCorrectText || q.correctAnswer || '正确答案';
      if (typeof correctText === 'string' && correctText.startsWith('opt_')) {
        correctText = '正确答案';
      }

      return {
        question_no: idx + 1,
        question_text: q.question || q.text || `题目 #${idx + 1}`,
        selected_option_text: selectedText,
        correct_option_text: correctText,
        explanation: q.revealedExplanation || q.explanation || '',
        is_correct: isUserCorrect,
        response_time_ms: q.responseTimeMs || 2000
      };
    });

    setSessionQuestionsDetails(questionsDetails);

    try {
      // Step 6: MUST await completeGameSession and confirm Supabase returned success
      const completionResult = await quizService.completeGameSession({
        sessionId: currentSessionIdRef.current,
        chapterId: currentChapterIdRef.current || quizParams?.chapterId,
        chapterTitle: quizParams?.chapterTitle || quizParams?.chapterName || 'Sejarah',
        chapterVersion: quizParams?.versionNo || 1,
        startedAt: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        totalQuestions: activeQuestions.length,
        correctCount: effCorrect,
        wrongCount: effWrong,
        score: effScore,
        earnedBP: effBP,
        questionsDetails
      });

      if (!completionResult || completionResult.status !== 'completed') {
        throw new Error('数据库未能确认对局状态为 completed');
      }

      // Advance daily missions only upon confirmed success
      if (!hasRecordedMissionsRef.current) {
        hasRecordedMissionsRef.current = true;
        mockDb.recordQuizForDailyMissions({
          quizCompleted: 1,
          questionsAnswered: activeQuestions.length,
          correctAnswers: effCorrect
        });
      }

      setIsSaving(false);

      // 保存成功后：异步评估是否触发 Boss (使用真实的 chapterId 与 cycleInfo)
      let bossTrigger = null;
      if (onEvaluateBossTrigger) {
        bossTrigger = await onEvaluateBossTrigger(statsToUse || { sessionBP: effBP, correctCount: effCorrect, wrongCount: effWrong }, cycleInfo);
      } else if (onCheckBossTrigger) {
        bossTrigger = await onCheckBossTrigger(statsToUse || { sessionBP: effBP, correctCount: effCorrect, wrongCount: effWrong }, cycleInfo);
      }

      if (bossTrigger && (bossTrigger.shouldTrigger || bossTrigger === true)) {
        if (onTriggerBossEncounter) {
          onTriggerBossEncounter(bossTrigger, statsToUse || { sessionBP: effBP, correctCount: effCorrect, wrongCount: effWrong });
        }
      } else {
        setStatus('result');
      }
    } catch (err) {
      console.error('[Quiz] completeGameSession failed:', err);
      setSaveError(err.message || '结算保存失败，请重试');
      setIsSaving(false);
    }
  }, [questions, scorePerQuestion, skippedCount, quizParams, startTime, sessionBP, onTriggerBossEncounter, onCheckBossTrigger]);

  // Step 16: Setup Question with fixed option IDs and post-shuffle A/B/C/D labeling
  const setupQuestion = (question) => {
    if (!question) return;
    let rawOptions = [];
    if (Array.isArray(question.options) && question.options.length > 0) {
      rawOptions = question.options;
    } else {
      rawOptions = [
        { id: 'opt_1', text: question.correctAnswer },
        ...(question.incorrectAnswers || []).map((t, i) => ({ id: `opt_${i + 2}`, text: t }))
      ];
    }
    const labeledOptions = quizService.shuffleAndLabelOptions(rawOptions);
    setShuffledOptions(labeledOptions);
    setTimeLeft(10);
    setSelectedOption(null);
    setSelectedOptionId(null);
    setFeedback(null);
    setQuestionStartTime(Date.now());
  };

  // Countdown logic
  useEffect(() => {
    if (status !== 'countdown') return;
    if (countdown === 0) {
      setStatus('playing');
      return;
    }
    const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, status]);

  // Timer logic
  useEffect(() => {
    if (status !== 'playing' || feedback !== null || questions.length === 0) return; 

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [feedback, questions, currentIndex, status]);

  const handleTimeout = async () => {
    if (feedback !== null || status !== 'playing') return;
    setFeedback('timeout');
    setSkippedCount(prev => prev + 1);
    setCombo(0);

    let correctOptId = null;
    let explanation = '';

    try {
      const question = questions[currentIndex];
      if (question) {
        if (question.impression_id) {
          try {
            const res = await quizService.submitAnswerRPC({
              impressionId: question.impression_id,
              selectedOptionId: 'timeout',
              responseTimeMs: 10000,
              sessionId: currentSessionIdRef.current
            });
            correctOptId = res.correct_option_id;
            explanation = res.explanation || '';
          } catch (e) {
            console.warn('[Quiz] Timeout submit_answer failed:', e);
          }
        } else {
          correctOptId = question.correct_option_id || question.correctOptionId || 'opt_1';
          explanation = question.explanation || '';
        }

        question.revealedCorrectOptionId = correctOptId;
        question.revealedExplanation = explanation;
        question.selectedOptionId = 'timeout';
        question.selectedOptionText = '未作答 / Time Out';
        const correctOpt = shuffledOptions.find(o => o.id === correctOptId);
        if (correctOpt) {
          question.revealedCorrectText = `${correctOpt.letter}. ${correctOpt.text}`;
        }

        // Step 18: Record answer and cumulative wrong history on timeout
        quizService.recordAnswer({
          playerId: currentUser?.id || 'guest',
          sessionId: currentSessionIdRef.current,
          chapterId: currentChapterIdRef.current || quizParams?.chapterId,
          questionId: String(question.question_id || question.id || `q_${currentIndex + 1}`),
          chapterVersion: quizParams?.versionNo || 1,
          selectedOptionId: 'timeout',
          isCorrect: false,
          responseTimeMs: 10000,
          cycleNumber: cycleInfo?.cycleNumber || 1,
          impressionId: question.impression_id || null,
          questionText: question.question || question.text || '',
          options: question.options || [],
          correctOptionId: correctOptId,
          explanation: explanation,
          cloudSynced: Boolean(question.impression_id)
        });

        mockDb.recordQuestionAnswer({
          question,
          isCorrect: false,
          selectedOption: null,
          source: 'normal_quiz_timeout'
        });
      }
    } catch (err) {
      console.error('[Quiz] Unexpected error during handleTimeout:', err);
    } finally {
      // 100% guarantee scheduleNextQuestion is always called even if errors occurred
      scheduleNextQuestion(explanation ? 3200 : 2500);
    }
  };

  // Step 2 & 16: Handle option selection with Secure RPC Grading & Shuffled Option IDs
  const handleSelectOption = async (optionObj) => {
    if (feedback !== null || status !== 'playing') return;

    const optId = optionObj.id;
    const optText = optionObj.text;
    setSelectedOption(optText);
    setSelectedOptionId(optId);

    const question = questions[currentIndex];
    const responseTimeMs = Math.max(100, Date.now() - questionStartTime);

    let isCorrect = false;
    let correctOptId = null;
    let explanation = '';

    if (question.impression_id) {
      // Step 2: Authoritative Cloud Server-Side Grading via submit_answer RPC
      try {
        setSubmitError(null);
        const res = await quizService.submitAnswerRPC({
          impressionId: question.impression_id,
          selectedOptionId: optId,
          responseTimeMs,
          sessionId: currentSessionIdRef.current
        });
        isCorrect = Boolean(res.is_correct);
        correctOptId = res.correct_option_id;
        explanation = res.explanation || '';
      } catch (err) {
        console.error('[Quiz] submit_answer RPC failed:', err);
        setSubmitError(err.message || '答案提交失败，请重试');
        setSelectedOption(null);
        setSelectedOptionId(null);
        return; // Pause on error so answer is not lost and not faked
      }
    } else {
      // Fallback local evaluation for offline/demo bank
      let fallbackCorrectOptId = question.correct_option_id || question.correctOptionId;
      if (!fallbackCorrectOptId && question._raw?.correct_option_id) {
        fallbackCorrectOptId = question._raw.correct_option_id;
      }
      if (!fallbackCorrectOptId && question.correctAnswer) {
        fallbackCorrectOptId = 'opt_1';
      }
      const evalResult = quizService.evaluateAnswer({
        selectedOptionId: optId,
        correctOptionId: fallbackCorrectOptId
      });
      isCorrect = evalResult.isCorrect;
      correctOptId = fallbackCorrectOptId;
      explanation = question.explanation || '';
    }

    // Attach revealed server grading result for UI rendering
    question.revealedCorrectOptionId = correctOptId;
    question.revealedExplanation = explanation;
    question.selectedOptionId = optId;
    question.selectedOptionText = optText;
    question.isUserCorrect = isCorrect;
    const correctOpt = shuffledOptions.find(o => o.id === correctOptId);
    if (correctOpt) {
      question.revealedCorrectText = `${correctOpt.letter}. ${correctOpt.text}`;
    }

    // Step 18: Record detailed answer event & cumulative wrong question history
    quizService.recordAnswer({
      playerId: currentUser?.id || 'guest',
      sessionId: currentSessionIdRef.current,
      chapterId: currentChapterIdRef.current || quizParams?.chapterId,
      questionId: String(question.question_id || question.id || `q_${currentIndex + 1}`),
      chapterVersion: quizParams?.versionNo || 1,
      selectedOptionId: optId,
      isCorrect: isCorrect,
      responseTimeMs: responseTimeMs,
      cycleNumber: cycleInfo?.cycleNumber || 1,
      impressionId: question.impression_id || null,
      questionText: question.question || question.text || '',
      options: question.options || [],
      correctOptionId: correctOptId,
      explanation: explanation,
      cloudSynced: Boolean(question.impression_id)
    });

    // Also record in mockDb for legacy UI backward compatibility (Garden, stats)
    mockDb.recordQuestionAnswer({
      question,
      isCorrect,
      selectedOption: optText,
      selectedOptionId: optId,
      correctOptionId: correctOptId,
      responseTimeMs,
      source: 'normal_quiz'
    });

    if (isCorrect) {
      setFeedback('correct');
      setSessionBP(prev => prev + scorePerQuestion);
      setCorrectCount(prev => prev + 1);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
    } else {
      setFeedback('wrong');
      setCombo(0);
    }

    scheduleNextQuestion(isCorrect ? 1800 : (explanation ? 3200 : 2500));
  };

  const scheduleNextQuestion = useCallback((delayMs = 2000) => {
    setTimeout(async () => {
      const activeQuestions = questionsRef.current?.length > 0 ? questionsRef.current : questions;
      const nextIndex = currentIndex + 1;
      if (nextIndex < activeQuestions.length) {
        setCurrentIndex(nextIndex);
        setupQuestion(activeQuestions[nextIndex]);
      } else {
        // 1. 第10题完成：计算本局最终Stats
        const totalDuration = Math.floor((Date.now() - startTime) / 1000);
        setTimeTaken(totalDuration);

        const computedCorrect = activeQuestions.filter(q => q.isUserCorrect === true).length;
        const currentWrong = activeQuestions.length - computedCorrect - skippedCount;
        const currentAccuracy = Math.round((computedCorrect / activeQuestions.length) * 100);

        const finalStats = {
          sessionBP,
          correctCount: computedCorrect,
          wrongCount: currentWrong,
          skippedCount,
          accuracy: currentAccuracy,
          maxCombo,
          timeTaken: totalDuration,
          questions: activeQuestions
        };
        pendingFinalStatsRef.current = finalStats;

        // 2. 设置页面状态为 saving 并完赛保存
        setStatus('saving');

        // 3. await finalizeGameSession(finalStats)
        // 必须确认Supabase返回该Session的 status = completed 后，再进行 Boss 评估与取题
        await finalizeGameSession(finalStats);
      }
    }, delayMs);
  }, [currentIndex, questions, startTime, onEvaluateBossTrigger, onCheckBossTrigger, sessionBP, skippedCount, maxCombo, finalizeGameSession]);

  if (saveError) {
    return (
      <div className="view-content flex-center flex-column" style={{ padding: '32px 20px', textAlign: 'center', minHeight: '80vh', justifyContent: 'center' }}>
        <div style={{ background: '#FEE2E2', padding: '16px', borderRadius: '50%', marginBottom: '16px', border: '2px solid #EF4444', display: 'inline-flex' }}>
          <AlertCircle size={44} color="#EF4444" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', color: '#000' }}>结算保存失败</h2>
        <p style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '8px', maxWidth: '320px', lineHeight: 1.5, fontWeight: 700 }}>
          {saveError}
        </p>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '24px', maxWidth: '300px', lineHeight: 1.4 }}>
          对局数据已保留。请点击下方按钮重新保存，成功后即可进入结算页与历史记录。
        </p>
        <button
          onClick={() => finalizeGameSession(pendingFinalStatsRef.current, pendingBossTriggerRef.current)}
          style={{
            padding: '12px 32px',
            background: '#000',
            color: '#FFBC00',
            fontWeight: 900,
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: 'var(--card-shadow-sm)'
          }}
        >
          重新保存结算 (Retry Save)
        </button>
        <button
          onClick={() => onBack(sessionBP, currentSessionIdRef.current)}
          style={{
            marginTop: '12px',
            padding: '8px 20px',
            background: 'transparent',
            color: '#666',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          返回主页
        </button>
      </div>
    );
  }

  if (status === 'saving' || isSaving) {
    return (
      <div className="view-content flex-center flex-column" style={{ minHeight: '80vh', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <RefreshCw size={40} color="#000" style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#000', margin: '0 0 8px 0' }}>正在保存成绩与对局记录...</h3>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>正在向云端数据库提交完赛结算，请稍候</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="view-content flex-center flex-column" style={{ padding: '32px 20px', textAlign: 'center', minHeight: '80vh', justifyContent: 'center' }}>
        <div style={{ background: '#FFEFE5', padding: '16px', borderRadius: '50%', marginBottom: '16px', border: '2px solid #FF5722', display: 'inline-flex' }}>
          <AlertCircle size={44} color="#FF5722" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', color: '#000' }}>题目加载失败</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', maxWidth: '300px', lineHeight: 1.5 }}>
          {loadError}
        </p>
        <button
          onClick={loadQuizQuestions}
          style={{
            padding: '12px 28px',
            background: '#000',
            color: '#FFBC00',
            fontWeight: 800,
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: 'var(--card-shadow-sm)'
          }}
        >
          重新加载 (Retry)
        </button>
        <button
          onClick={() => onBack(0)}
          style={{
            marginTop: '12px',
            padding: '8px 20px',
            background: 'transparent',
            color: '#666',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          返回关卡选择
        </button>
      </div>
    );
  }

  if (isLoadingQuestions || questions.length === 0) {
    return (
      <div className="view-content flex-center flex-column" style={{ minHeight: '80vh', justifyContent: 'center' }}>
        <RefreshCw size={36} color="#000" style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 800, fontSize: '15px' }}>正在加载章节题目...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (status === 'countdown') {
    return (
      <div className="view-content flex-center flex-column" style={{ background: 'var(--brand-primary)', color: '#000' }}>
        <h2 key={countdown} style={{ fontSize: '120px', fontWeight: 800, animation: 'pop 0.5s ease-out' }}>
          {countdown > 0 ? countdown : 'GO!'}
        </h2>
        <style>{`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'result') {
    const formatTime = (secs) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    
    // Derive question details list for this session
    const displayQuestions = (sessionQuestionsDetails && sessionQuestionsDetails.length > 0)
      ? sessionQuestionsDetails
      : (questionsRef.current && questionsRef.current.length > 0 ? questionsRef.current : questions).map((q, idx) => {
          const rawOpts = q.options || [];
          const selectedOpt = rawOpts.find(o => o.id === q.selectedOptionId);
          const correctOpt = rawOpts.find(o => o.id === (q.revealedCorrectOptionId || q.correct_option_id));
          const isUserCorrect = q.isUserCorrect !== undefined
            ? q.isUserCorrect
            : (q.revealedCorrectOptionId ? q.revealedCorrectOptionId === q.selectedOptionId : false);

          let selectedText = q.selectedOptionText || selectedOpt?.text || null;
          if (!selectedText || q.selectedOptionId === 'timeout' || q.selectedOptionId === 'unanswered' || !q.selectedOptionId) {
            selectedText = '未作答 / Time Out';
          }

          let correctText = correctOpt?.text || q.revealedCorrectText || q.correctAnswer || '正确答案';
          if (typeof correctText === 'string' && correctText.startsWith('opt_')) {
            correctText = '正确答案';
          }

          return {
            question_no: idx + 1,
            question_text: q.question || q.text || `题目 #${idx + 1}`,
            selected_option_text: selectedText,
            correct_option_text: correctText,
            explanation: q.revealedExplanation || q.explanation || '',
            is_correct: isUserCorrect,
            response_time_ms: q.responseTimeMs || 2000
          };
        });

    const actualCorrect = displayQuestions.filter(q => q.is_correct).length;
    const totalCount = displayQuestions.length || questions.length || 1;
    const accuracy = Math.round((actualCorrect / totalCount) * 100);

    const handleClaimClick = () => {
      if (isAnimating) return;
      if (!bpTextRef.current || !claimBtnRef.current) {
        if (currentUser) {
          mockDb.logQuizAttempt(currentUser.id, questions[0]?.subject || 'mixed', sessionBP);
        }
        onComplete(sessionBP);
        return;
      }
      const startRect = bpTextRef.current.getBoundingClientRect();
      const endRect = claimBtnRef.current.getBoundingClientRect();
      
      const deltaX = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
      const deltaY = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);
      
      setAnimVars({
        '--start-x': `${startRect.left}px`,
        '--start-y': `${startRect.top}px`,
        '--delta-x': `${deltaX}px`,
        '--delta-y': `${deltaY}px`,
        '--start-w': `${startRect.width}px`
      });
      setIsAnimating(true);
      
      if (currentUser) {
        mockDb.logQuizAttempt(currentUser.id, questions[0]?.subject || 'mixed', sessionBP);
      }
      setTimeout(() => {
        onComplete(sessionBP);
      }, 1200);
    };

    return (
      <div style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFBC00', padding: '16px', position: 'relative' }}>
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} colors={['#ffffff', '#000000', '#FFBC00', '#FF5722']} />
        
        {/* Top Header Bar with tactile back button & title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 16px', zIndex: 10 }}>
          <button
            type="button"
            onClick={handleClaimClick}
            disabled={isAnimating}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2.5px solid #000000',
              boxShadow: '0 3.5px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isAnimating ? 'wait' : 'pointer',
              outline: 'none',
              transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              flexShrink: 0
            }}
            title="返回主页"
            aria-label="Back"
          >
            <ArrowLeft size={20} color="#000000" strokeWidth={2.5} />
          </button>

          <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: 0, letterSpacing: '-0.3px' }}>
              本局答题历史总结
            </h1>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#4A3B00', margin: '2px 0 0' }}>
              {quizParams?.chapterTitle || quizParams?.chapterName || 'Sejarah'} · 历史作答明细
            </p>
          </div>

          <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlayBankMiniLogo />
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px' }}>
          
          {/* BP & Performance Hero Card */}
          <div className="animate-slide-up" style={{ borderRadius: '24px', background: '#FFF', padding: '20px 16px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', border: '2.5px solid #000' }}>
            <div style={{ textAlign: 'center' }}>
              <p 
                ref={bpTextRef} 
                style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1, color: '#F2B400', margin: 0, opacity: isAnimating ? 0 : 1 }}
              >
                +{sessionBP} BP
              </p>

              <div style={{ margin: '12px auto 0', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '9999px', border: '1.5px solid #F4DFA0', background: '#FFF8E1', padding: '4px 14px' }}>
                <span style={{ display: 'flex', height: '18px', width: '18px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#FFBC00', fontSize: '10px', fontWeight: 900, color: '#FFF' }}>
                  ★
                </span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#5D4A00' }}>
                  {accuracy >= 80 ? "太棒了！状态极佳！ 🔥" : (accuracy >= 60 ? "表现不错！继续加油！ 💪" : "再接再厉！多复习巩固！ 📚")}
                </span>
              </div>
            </div>

            {/* Quick 4 Metrics Grid */}
            <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', borderTop: '1px solid #F0F0F0', paddingTop: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#7B7B7B', margin: 0 }}>正确率</p>
                <p style={{ marginTop: '4px', fontSize: '17px', fontWeight: 900, color: '#000', margin: 0 }}>{accuracy}%</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#7B7B7B', margin: 0 }}>答对/总题</p>
                <p style={{ marginTop: '4px', fontSize: '17px', fontWeight: 900, color: '#16A34A', margin: 0 }}>{actualCorrect}/{totalCount}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#7B7B7B', margin: 0 }}>最高连击</p>
                <p style={{ marginTop: '4px', fontSize: '17px', fontWeight: 900, color: '#EA580C', margin: 0 }}>x{maxCombo}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#7B7B7B', margin: 0 }}>答题用时</p>
                <p style={{ marginTop: '4px', fontSize: '17px', fontWeight: 900, color: '#000', margin: 0 }}>{formatTime(timeTaken)}</p>
              </div>
            </div>

            {/* Garden Missions Progress Notification */}
            <div 
              onClick={() => {
                if (onGoGarden) onGoGarden();
              }}
              style={{
                marginTop: '14px',
                background: '#F1F8E9',
                border: '1.5px solid #66BB6A',
                borderRadius: '16px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: onGoGarden ? 'pointer' : 'default',
                boxShadow: '0 2px 0px #2E7D32'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🌱</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#1B5E20', margin: 0 }}>
                    花园任务已同步！
                  </p>
                  <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#2E7D32', margin: '2px 0 0' }}>
                    +1 答题 · +{displayQuestions.length} 题作答 · +{actualCorrect} 题正确
                  </p>
                </div>
              </div>
              <div style={{
                background: '#2E7D32',
                color: '#FFF',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 900,
                whiteSpace: 'nowrap'
              }}>
                领取水滴 💧 →
              </div>
            </div>
          </div>

          {/* Section: Question History Breakdown */}
          <div style={{ marginTop: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '0 4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>
                  作答题目明细与解析
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#3A2E00' }}>
                共 {displayQuestions.length} 题
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayQuestions.map((q, qIdx) => {
                const isQCorrect = Boolean(q.is_correct);
                const respTimeText = q.response_time || (q.response_time_ms ? `${(q.response_time_ms / 1000).toFixed(1)}秒` : '2.0秒');

                return (
                  <div
                    key={q.question_no || qIdx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: isQCorrect ? '2px solid #86EFAC' : '2px solid #FCA5A5',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 3px 0 ' + (isQCorrect ? '#BBF7D0' : '#FECDD3')
                    }}
                  >
                    {/* Question Header & Result Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#111827' }}>
                          第 {q.question_no || qIdx + 1} 题
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 900,
                            backgroundColor: isQCorrect ? '#DCFCE7' : '#FEE2E2',
                            color: isQCorrect ? '#166534' : '#991B1B',
                            border: `1px solid ${isQCorrect ? '#86EFAC' : '#FCA5A5'}`
                          }}
                        >
                          {isQCorrect ? '✓ 答对 Correct' : '✗ 答错 Wrong'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280' }}>
                        用时: {respTimeText}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#111827', lineHeight: 1.5 }}>
                      题目：{q.question_text}
                    </div>

                    {/* Answers Comparison */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {!isQCorrect && (
                        <div
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#FEF2F2',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: '#B91C1C'
                          }}
                        >
                          你的答案：{q.selected_option_text || '未作答 / Time Out'}
                        </div>
                      )}

                      <div
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#F0FDF4',
                          borderRadius: '8px',
                          border: '1px solid #86EFAC',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#15803D'
                        }}
                      >
                        正确答案：{q.correct_option_text || '正确答案'}
                      </div>
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#FFFBEB',
                          borderRadius: '8px',
                          border: '1px solid #FDE68A',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#92400E',
                          lineHeight: 1.45
                        }}
                      >
                        💡 <strong>解析：</strong>{q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA Claim Button */}
          <div style={{ marginTop: '20px' }}>
            <button 
              ref={claimBtnRef}
              onClick={handleClaimClick}
              disabled={isAnimating}
              style={{
                display: 'flex',
                height: '52px',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                background: '#000000',
                fontSize: '16px',
                fontWeight: 900,
                color: '#FFBC00',
                border: '2.5px solid #000000',
                cursor: isAnimating ? 'wait' : 'pointer',
                boxShadow: '0 4px 0 #333333',
                gap: '8px'
              }}
            >
              <span>领取奖励并完成对局</span>
              <span>(+{sessionBP} BP)</span>
            </button>
          </div>
        </div>
        
        <style>{`
          .animate-slide-up {
            opacity: 0;
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-glow {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.5; }
          }
          @keyframes flyAndFade {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--delta-x), var(--delta-y)) scale(0.2); opacity: 0; }
          }
        `}</style>
        
        {/* Flying BP Animation */}
        {isAnimating && (
          <div style={{
            position: 'fixed', top: 'var(--start-y)', left: 'var(--start-x)', width: 'var(--start-w)',
            textAlign: 'center', fontSize: '46px', fontWeight: 900, color: '#F2B400',
            zIndex: 9999, pointerEvents: 'none',
            animation: 'flyAndFade 1.2s cubic-bezier(0.5, -0.5, 0.2, 1.3) forwards',
            ...animVars
          }}>
            +{sessionBP} BP
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = (timeLeft / 10) * 100;

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '0' }}>
      
      {/* Header */}
      <header className="flex-between" style={{ padding: '24px 20px 16px' }}>
        <button onClick={() => onBack(sessionBP, currentSessionIdRef.current)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-h4" style={{ margin: 0 }}>
            {quizParams?.babNumber ? `${quizParams.babNumber}: ${quizParams.chapterTitle || currentQ.subject}` : currentQ.subject}
          </h1>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', marginTop: '3px' }}>
            {quizParams?.versionNo && (
              <span style={{ fontSize: '10px', color: '#666', fontWeight: 700 }}>
                Published v{quizParams.versionNo}
              </span>
            )}
            {cycleInfo?.cycleNumber && (
              <>
                <span style={{ fontSize: '10px', color: '#888' }}>•</span>
                <span style={{ fontSize: '10px', background: '#000', color: '#FFBC00', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  Cycle {cycleInfo.cycleNumber} ({cycleInfo.servedInCycle || questions.length}/{cycleInfo.totalInCycle || questions.length})
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ width: '24px' }}></div> {/* Spacer for alignment */}
      </header>

      {/* Timer Bar */}
      <div style={{ padding: '0 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={18} />
          <span className="text-small-bold" style={{ fontSize: '16px' }}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'var(--brand-primary)', 
            borderRadius: '4px',
            transition: 'width 1s linear'
          }}></div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Submit Error Banner */}
        {submitError && (
          <div style={{
            background: '#FFEFE5',
            border: '2px solid #FF5722',
            color: '#D84315',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} color="#FF5722" style={{ flexShrink: 0 }} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Question Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          boxShadow: 'var(--card-shadow-sm)',
          marginBottom: '24px'
        }}>
          <h2 className="text-h2" style={{ marginBottom: '24px', fontSize: '22px' }}>
            {currentQ.question || currentQ.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shuffledOptions.map((opt, idx) => {
              const optId = opt.id || `opt_${idx + 1}`;
              const optText = opt.text || (typeof opt === 'string' ? opt : '');
              const optLetter = opt.letter || String.fromCharCode(65 + idx);

              const isSelected = selectedOptionId === optId || selectedOption === optText;
              const correctOptId = currentQ.revealedCorrectOptionId || currentQ.correct_option_id || currentQ.correctOptionId || currentQ._raw?.correctOptionId;
              const isCorrectAnswer = (correctOptId && optId === correctOptId) || optText === currentQ.correctAnswer;
              
              let bg = 'var(--bg-primary)';
              let border = 'var(--border-color)';
              let textColor = 'var(--text-primary)';

              if (feedback !== null) {
                if (isCorrectAnswer) {
                  bg = isSelected ? 'var(--brand-primary)' : '#E8F5E9';
                  border = isSelected ? 'var(--brand-primary)' : '#4CAF50';
                  textColor = '#000';
                } else if (isSelected) {
                  bg = '#FFEFE5';
                  border = 'var(--error)';
                }
              }

              return (
                <button 
                  key={optId}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback !== null}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${border}`,
                    background: bg,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'left',
                    cursor: feedback !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    fontWeight: 900, 
                    fontSize: '15px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isSelected ? '#000' : '#E0E0E0',
                    color: isSelected ? '#FFBC00' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #000'
                  }}>
                    {optLetter}
                  </div>
                  <span className="text-body-bold" style={{ flex: 1 }}>{optText}</span>
                  
                  {feedback !== null && isCorrectAnswer && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#2E7D32', fontWeight: 800, fontSize: '13px' }}>
                      <Check size={18} color="#2E7D32" strokeWidth={3} />
                      <span>正确</span>
                    </div>
                  )}
                  {feedback !== null && isSelected && !isCorrectAnswer && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#D32F2F', fontWeight: 800, fontSize: '13px' }}>
                      <XCircle size={18} color="#D32F2F" strokeWidth={2.5} />
                      <span>错误</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Target Card */}
        {feedback && (
          <div style={{
            background: feedback === 'correct' ? 'var(--brand-primary)' : 'var(--error)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            animation: 'slideUp 0.3s ease-out',
            color: feedback === 'correct' ? '#000' : '#FFF'
          }}>
            <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
              <img src={`${import.meta.env.BASE_URL}target_bullseye.png`} alt="Target" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: 'inherit', lineHeight: 1 }}>
                  {feedback === 'correct' ? `+${scorePerQuestion}` : '+0'}
                </span>
                {feedback === 'correct' && (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'inherit', lineHeight: 1, marginBottom: '2px' }}>Combo</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'inherit', lineHeight: 1 }}>x{combo}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '15px', color: 'inherit', fontWeight: 800, margin: 0 }}>
                {feedback === 'correct' ? (combo >= 3 ? "太棒了！连击暴击！🔥" : "回答正确！") : feedback === 'timeout' ? "时间到！下次要更快哦。" : "回答错误！"}
              </p>
              {feedback !== 'correct' && currentQ.revealedCorrectText && (
                <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px', opacity: 0.95 }}>
                  正确答案: {currentQ.revealedCorrectText}
                </div>
              )}
              {feedback !== 'correct' && currentQ.revealedExplanation && (
                <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px', opacity: 0.9, lineHeight: 1.4 }}>
                  解析: {currentQ.revealedExplanation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="flex-between" style={{ padding: '20px', background: 'var(--bg-primary)' }}>
        <div className="text-small-bold">Question {currentIndex + 1}/{questions.length}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#000', border: '1px solid var(--brand-primary)', overflow: 'hidden' }}>
             <img src={`${import.meta.env.BASE_URL}playbanklogo.png`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span className="text-body-bold">{currentBP + sessionBP} BP</span>
        </div>
      </footer>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Quiz;
