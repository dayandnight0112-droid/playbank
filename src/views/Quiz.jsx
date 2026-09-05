import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Clock, Check, Trophy, Flame, ChevronRight, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import { getMatchingQuestions } from '../lib/bossTrigger';
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
  onCheckBossTrigger = null
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
  const [feedback, setFeedback] = useState(null); 
  
  const [sessionBP, setSessionBP] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // Animation Refs & State
  const bpTextRef = useRef(null);
  const claimBtnRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animVars, setAnimVars] = useState({});
  const hasRecordedMissionsRef = useRef(false);

  // Initialize quiz with questions matching selected subject & form
  useEffect(() => {
    const matched = getMatchingQuestions(
      quizParams?.subjectTitle || quizParams?.subject || 'History',
      quizParams?.form || 4
    );
    const sourceQuestions = matched && matched.length >= 5 ? matched : rawQuestions;
    const shuffledQ = shuffleArray(sourceQuestions).slice(0, 10);
    setQuestions(shuffledQ);
    setupQuestion(shuffledQ[0]);
    setStartTime(Date.now());
  }, []);

  // Step 7: Quiz 挑战完成进入结算时，自动推进 Daily Missions 进度（不直接给水，只推进度）
  useEffect(() => {
    if (status === 'result' && questions.length > 0 && !hasRecordedMissionsRef.current) {
      hasRecordedMissionsRef.current = true;
      mockDb.recordQuizForDailyMissions({
        quizCompleted: 1,
        questionsAnswered: questions.length,
        correctAnswers: correctCount
      });
    }
  }, [status, questions.length, correctCount]);

  const setupQuestion = (question) => {
    if (!question) return;
    const allOptions = [question.correctAnswer, ...question.incorrectAnswers];
    setShuffledOptions(shuffleArray(allOptions));
    setTimeLeft(10);
    setSelectedOption(null);
    setFeedback(null);
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

  const handleTimeout = () => {
    setFeedback('timeout');
    setSkippedCount(prev => prev + 1);
    setCombo(0);
    if (questions[currentIndex]) {
      mockDb.recordQuestionAnswer({
        question: questions[currentIndex],
        isCorrect: false,
        selectedOption: null,
        source: 'normal_quiz_timeout'
      });
    }
    scheduleNextQuestion();
  };

  const handleSelectOption = (option) => {
    if (feedback !== null || status !== 'playing') return;

    setSelectedOption(option);
    const question = questions[currentIndex];
    const isCorrect = option === question.correctAnswer;

    // Record question answer for permanent history and wrong question bank
    mockDb.recordQuestionAnswer({
      question,
      isCorrect,
      selectedOption: option,
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

    scheduleNextQuestion();
  };

  const scheduleNextQuestion = useCallback(() => {
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        setupQuestion(questions[nextIndex]);
      } else {
        const totalDuration = Math.floor((Date.now() - startTime) / 1000);
        setTimeTaken(totalDuration);

        // Check if Boss should trigger upon completing challenge
        if (onCheckBossTrigger) {
          const stats = {
            sessionBP,
            correctCount,
            wrongCount: questions.length - correctCount - skippedCount,
            skippedCount,
            accuracy: Math.round((correctCount / questions.length) * 100),
            maxCombo,
            timeTaken: totalDuration,
            questions
          };
          const triggered = onCheckBossTrigger(stats);
          if (triggered) {
            return; // Handled by App.jsx to show Boss Encounter
          }
        }

        setStatus('result');
      }
    }, 2000);
  }, [currentIndex, questions, startTime, onCheckBossTrigger, sessionBP, correctCount, skippedCount, maxCombo]);

  if (questions.length === 0) return <div className="view-content flex-center">Loading...</div>;

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
    
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const wrongCount = questions.length - correctCount - skippedCount;

    const handleClaimClick = () => {
      if (!bpTextRef.current || !claimBtnRef.current || isAnimating) return;
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
      <div style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFBC00', padding: '16px' }}>
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} colors={['#ffffff', '#000000', '#FFBC00', '#FF5722']} />
        
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px', paddingTop: '24px' }}>
          <PlayBankMiniLogo />

          <div className="animate-slide-up" style={{ marginTop: '12px', textAlign: 'center', animationDelay: '0.2s' }}>
            <h1 style={{ fontSize: '33px', fontWeight: 900, lineHeight: 1, color: '#000' }}>
              Quiz Completed!
            </h1>
            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#5E5E5E' }}>
              Here is your performance.
            </p>
          </div>

          <TrophyHero />

          <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1, marginTop: '-20px', borderRadius: '26px', background: '#FFF', padding: '20px 16px', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', animationDelay: '0.4s' }}>
            <div style={{ textAlign: 'center' }}>
              <p 
                ref={bpTextRef} 
                style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1, color: '#F2B400', opacity: isAnimating ? 0 : 1 }}
              >
                +{sessionBP} BP
              </p>

              <div style={{ margin: '12px auto 0', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '9999px', border: '1px solid #F4DFA0', background: '#FFF8E1', padding: '4px 12px' }}>
                <span style={{ display: 'flex', height: '20px', width: '20px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#FFBC00', fontSize: '11px', fontWeight: 900, color: '#FFF' }}>
                  ★
                </span>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#5D4A00' }}>
                  {accuracy >= 80 ? "Great Job! You're on fire! 🔥" : "Good Effort! Keep going! 💪"}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', borderBottom: '1px solid #EFEFEF', paddingBottom: '16px' }}>
              <MetricItem label="Accuracy" value={`${accuracy}%`} />
              <MetricItem label="Max Combo" value={maxCombo} />
              <MetricItem label="Time Taken" value={formatTime(timeTaken)} />
            </div>

            <ProgressCard />

            {/* Step 7: Garden Missions Progress Notification */}
            <div 
              onClick={() => {
                if (onGoGarden) onGoGarden();
              }}
              style={{
                marginTop: '12px',
                background: '#F1F8E9',
                border: '2px solid #66BB6A',
                borderRadius: '18px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: onGoGarden ? 'pointer' : 'default',
                boxShadow: '0 3px 0px #2E7D32'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#C8E6C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  🌱
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 900, color: '#1B5E20' }}>
                    Garden Missions Updated!
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#2E7D32', marginTop: '2px' }}>
                    +1 Quiz · +{questions.length} Qs · +{correctCount} Correct
                  </p>
                </div>
              </div>
              <div style={{
                background: '#2E7D32',
                color: '#FFF',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap'
              }}>
                CLAIM 💧 →
              </div>
            </div>

            <div style={{ marginTop: '16px', borderRadius: '18px', border: '1px solid #EEEEEE', background: '#FFF', padding: '12px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 900, color: '#000' }}>
                Performance Overview
              </h2>

              <SimpleChart />

              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', borderTop: '1px solid #EFEFEF', paddingTop: '12px' }}>
                <SummaryItem icon={<CheckCircle2 size={18} />} color="#34B450" label="Correct" value={correctCount} />
                <SummaryItem icon={<XCircle size={18} />} color="#E55353" label="Wrong" value={wrongCount} />
                <SummaryItem icon={<MinusCircle size={18} />} color="#F2B400" label="Skipped" value={skippedCount} />
              </div>
            </div>

            <button 
              ref={claimBtnRef}
              onClick={handleClaimClick}
              disabled={isAnimating}
              style={{ marginTop: '16px', display: 'flex', height: '48px', width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: '#000', fontSize: '15px', fontWeight: 900, color: '#FFF', border: 'none', cursor: isAnimating ? 'wait' : 'pointer', boxShadow: 'var(--card-shadow-sm)' }}
            >
              Claim BP!
            </button>

            <button 
              style={{ marginTop: '12px', display: 'flex', height: '44px', width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', border: '1px solid #E6E6E6', background: '#FFF', fontSize: '14px', fontWeight: 900, color: '#000', cursor: 'pointer' }}
            >
              Review Answers
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
        <button onClick={() => onBack(sessionBP)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-h4">{currentQ.subject}</h1>
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
        
        {/* Question Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          boxShadow: 'var(--card-shadow-sm)',
          marginBottom: '24px'
        }}>
          <h2 className="text-h2" style={{ marginBottom: '24px', fontSize: '22px' }}>
            {currentQ.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === currentQ.correctAnswer;
              
              let bg = 'var(--bg-primary)';
              let border = 'var(--border-color)';
              let textColor = 'var(--text-primary)';

              if (feedback !== null) {
                if (isCorrectAnswer && isSelected) {
                  bg = 'var(--brand-primary)';
                  border = 'var(--brand-primary)';
                  textColor = '#000';
                } else if (isSelected) {
                  bg = '#FFEFE5';
                  border = 'var(--error)';
                }
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback !== null}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${border}`,
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
                  <div style={{ fontWeight: 800, fontSize: '16px' }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-body-bold" style={{ flex: 1 }}>{opt}</span>
                  
                  {feedback !== null && isCorrectAnswer && isSelected && (
                    <Check size={20} color="#000" strokeWidth={3} />
                  )}
                </button>
              )
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
              <p style={{ fontSize: '14px', color: 'inherit', fontWeight: 500 }}>
                {feedback === 'correct' ? (combo >= 3 ? "Great job! You're on fire! 🔥" : "Good job!") : feedback === 'timeout' ? "Time's up! Be faster next time." : "Oops! Wrong answer."}
              </p>
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
