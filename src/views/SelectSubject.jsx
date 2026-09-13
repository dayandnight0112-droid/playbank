import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Landmark, Microscope, Calculator, Lock, ArrowRight, 
  BookOpen, Languages, PenTool, Sparkles, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { quizService, FALLBACK_GRADES, FALLBACK_SUBJECTS } from '../lib/quizService';

const getSubjectIcon = (type) => {
  switch(type) {
    case 'microscope': return <Microscope size={28} color="var(--text-primary)" strokeWidth={2} />;
    case 'calculator': return <Calculator size={28} color="var(--text-primary)" strokeWidth={2} />;
    case 'book': return <BookOpen size={28} color="var(--text-primary)" strokeWidth={2} />;
    case 'languages': return <Languages size={28} color="var(--text-primary)" strokeWidth={2} />;
    case 'pen-tool': return <PenTool size={28} color="var(--text-primary)" strokeWidth={2} />;
    case 'landmark': default: return <Landmark size={28} color="var(--text-primary)" strokeWidth={2} />;
  }
};

const SelectSubject = ({ onBack, onStartQuiz, openModal }) => {
  // Navigation states
  const [grades, setGrades] = useState(FALLBACK_GRADES);
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  
  const [gradeCategory, setGradeCategory] = useState('secondary'); // 'primary' | 'secondary'
  const [selectedGrade, setSelectedGrade] = useState('form-4');
  const [selectedSubject, setSelectedSubject] = useState('sejarah');
  
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [chapterError, setChapterError] = useState(null);

  // 1. Initial Load of Grades & Subjects
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [loadedGrades, loadedSubjects] = await Promise.all([
          quizService.getGrades(),
          quizService.getSubjects(),
        ]);
        if (isMounted) {
          if (loadedGrades && loadedGrades.length > 0) setGrades(loadedGrades);
          if (loadedSubjects && loadedSubjects.length > 0) setSubjects(loadedSubjects);
        }
      } catch (e) {
        console.warn('Could not load dynamic grades/subjects:', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Published Chapters whenever Grade or Subject changes (Step 14)
  useEffect(() => {
    let isMounted = true;
    if (!selectedGrade || !selectedSubject) {
      setChapters([]);
      setSelectedChapter(null);
      return;
    }

    setIsLoadingChapters(true);
    setChapterError(null);
    setSelectedChapter(null);

    quizService.getPublishedChapters(selectedGrade, selectedSubject)
      .then((pubChapters) => {
        if (!isMounted) return;
        setChapters(pubChapters);
        if (pubChapters.length > 0) {
          setSelectedChapter(pubChapters[0]); // Auto-select first published chapter
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching published chapters:', err);
        setChapterError('Unable to load published chapters from server.');
        setChapters([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingChapters(false);
      });

    return () => { isMounted = false; };
  }, [selectedGrade, selectedSubject]);

  const handleSubjectSelect = (subj) => {
    if (subj.planning || subj.locked) {
      if (openModal) {
        openModal({
          title: 'Coming Soon',
          message: `${subj.title} is currently in planning stage. Please choose another subject!`,
          confirmText: 'Got It'
        });
      }
      return;
    }
    setSelectedSubject(subj.id);
  };

  const handleStart = () => {
    if (selectedGrade && selectedSubject && selectedChapter) {
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      const gradeObj = grades.find(g => g.id === selectedGrade);
      
      onStartQuiz({ 
        gradeId: selectedGrade,
        gradeName: gradeObj?.name || selectedGrade,
        form: parseInt(selectedGrade.replace(/\D+/g, ''), 10) || 4,
        subject: selectedSubject, 
        subjectTitle: subjectObj?.title || 'History',
        chapterId: selectedChapter.id,
        chapterTitle: selectedChapter.title,
        babNumber: selectedChapter.babNumber,
        versionNo: selectedChapter.versionNo,
        questionCount: 10,
        totalInChapter: selectedChapter.questionCount,
        randomQuestions: selectedChapter.randomQuestions
      });
    }
  };

  const activeGrades = grades.filter(g => 
    gradeCategory === 'primary' ? g.id.startsWith('year') : g.id.startsWith('form')
  );

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingBottom: '120px' }}>
      
      {/* Header */}
      <header className="flex-between" style={{ padding: '20px', background: 'var(--bg-primary)', borderBottom: '3px solid #000' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-h4" style={{ margin: 0, fontWeight: 900 }}>Select Challenge</h1>
          <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>Grade → Subject → Published Chapter</span>
        </div>
        <div style={{ width: '24px' }}></div>
      </header>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Step 1: Grade Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#000', color: '#FFBC00', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>1</span>
              Choose Grade
            </h2>
            {/* Category Toggle */}
            <div style={{ display: 'flex', background: '#e0e0e0', padding: '3px', borderRadius: '8px', border: '2px solid #000' }}>
              <button
                type="button"
                onClick={() => {
                  setGradeCategory('primary');
                  setSelectedGrade('year-1');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  background: gradeCategory === 'primary' ? '#FFBC00' : 'transparent',
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => {
                  setGradeCategory('secondary');
                  setSelectedGrade('form-4');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  background: gradeCategory === 'secondary' ? '#FFBC00' : 'transparent',
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px' }}>
            {activeGrades.map(g => {
              const isSelected = selectedGrade === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  style={{
                    background: isSelected ? '#FFBC00' : '#FFF',
                    color: '#000',
                    border: '2px solid #000',
                    borderRadius: '8px',
                    padding: '12px 6px',
                    fontWeight: 800,
                    fontSize: '13px',
                    textAlign: 'center',
                    boxShadow: isSelected ? '2px 2px 0px #000' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    transform: isSelected ? 'translate(-1px, -1px)' : 'none'
                  }}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject Selection */}
        <div>
          <h2 className="text-h3" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#000', color: '#FFBC00', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>2</span>
            Choose Subject
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {subjects.map(subj => {
              const isSelected = selectedSubject === subj.id;
              const isLocked = subj.planning || subj.locked;
              return (
                <button 
                  key={subj.id}
                  onClick={() => handleSubjectSelect(subj)}
                  style={{
                    background: isSelected ? '#FFF8E1' : '#FFF',
                    border: isSelected ? '3px solid #000' : '2px solid #000',
                    borderRadius: '10px',
                    padding: '14px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    opacity: isLocked ? 0.6 : 1,
                    boxShadow: isSelected ? '3px 3px 0px #000' : 'none',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    color: '#000',
                    transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {getSubjectIcon(subj.iconType)}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>{subj.title}</div>
                    {subj.titleZh && <div style={{ fontSize: '11px', color: '#666' }}>{subj.titleZh}</div>}
                  </div>
                  {isLocked && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                      <Lock size={14} color="#888" />
                    </div>
                  )}
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#FFBC00' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Published Chapter Selection (Step 14 Core) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#000', color: '#FFBC00', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>3</span>
              Select Chapter
            </h2>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#000', background: '#FFBC00', padding: '2px 8px', borderRadius: '4px', border: '1px solid #000' }}>
              Published Only
            </span>
          </div>

          {isLoadingChapters ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#FFF', border: '2px dashed #000', borderRadius: '10px' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#000' }} />
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Fetching published chapters...</div>
            </div>
          ) : chapterError ? (
            <div style={{ padding: '16px', background: '#FFEBEE', border: '2px solid #D32F2F', borderRadius: '10px', color: '#C62828', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{chapterError}</span>
            </div>
          ) : chapters.length === 0 ? (
            <div style={{ padding: '20px', background: '#F5F5F5', border: '2px solid #999', borderRadius: '10px', textAlign: 'center' }}>
              <Layers size={28} style={{ margin: '0 auto 8px', color: '#888' }} />
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#333' }}>No Published Chapters Yet</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Admin is drafting chapters for this subject. Try switching to <strong>Year 1 Sejarah</strong> to play live test chapters!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chapters.map(ch => {
                const isSelected = selectedChapter?.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch)}
                    style={{
                      background: isSelected ? '#FFF' : '#FAFAFA',
                      border: isSelected ? '3px solid #000' : '2px solid #000',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '4px 4px 0px #000' : 'none',
                      transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                      transition: 'all 0.1s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#000', color: '#FFF', fontSize: '11px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                          {ch.babNumber}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#000' }}>
                          {ch.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#555', fontWeight: 600 }}>
                        <span>Questions: <strong>{ch.questionCount}</strong></span>
                        <span>•</span>
                        <span>Version: <strong>v{ch.versionNo}</strong></span>
                        {ch.randomQuestions && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#E65100', fontWeight: 800 }}>⚡ Random Mode</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: '2px solid #000',
                      background: isSelected ? '#FFBC00' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Button */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <button 
            className="btn btn-dark" 
            onClick={handleStart}
            disabled={!selectedGrade || !selectedSubject || !selectedChapter}
            style={{ 
              width: '100%', 
              justifyContent: 'space-between', 
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: 900,
              background: (!selectedGrade || !selectedSubject || !selectedChapter) ? '#AAA' : '#000',
              color: '#FFBC00',
              border: '3px solid #000',
              boxShadow: (!selectedGrade || !selectedSubject || !selectedChapter) ? 'none' : '4px 4px 0px #FFBC00',
              cursor: (!selectedGrade || !selectedSubject || !selectedChapter) ? 'not-allowed' : 'pointer'
            }}
          >
            <span>
              {selectedChapter ? `Start ${selectedChapter.babNumber} Challenge` : 'Select a Published Chapter'}
            </span>
            <ArrowRight size={20} color="#FFBC00" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SelectSubject;
