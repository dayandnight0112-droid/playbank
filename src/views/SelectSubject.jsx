import { useState } from 'react';
import { ArrowLeft, Landmark, Microscope, Calculator, Lock, ArrowRight } from 'lucide-react';
import { mockDb } from '../lib/mockDb';

const getSubjectIcon = (type) => {
  switch(type) {
    case 'microscope': return <Microscope size={32} color="var(--text-primary)" strokeWidth={1.5} />;
    case 'calculator': return <Calculator size={32} color="var(--text-primary)" strokeWidth={1.5} />;
    case 'landmark': default: return <Landmark size={32} color="var(--text-primary)" strokeWidth={1.5} />;
  }
};

const SelectSubject = ({ onBack, onStartQuiz, openModal }) => {
  const [selectedSubject, setSelectedSubject] = useState(null); // 'sejarah', 'science', 'math'
  const [selectedForm, setSelectedForm] = useState(null); // 1, 2, 3, 4, 5

  const subjects = mockDb.getSubjects();

  const forms = [1, 2, 3, 4, 5];

  const handleSubjectSelect = (subj) => {
    if (subj.locked) {
      if (openModal) {
        openModal({
          title: 'Coming Soon',
          message: 'This subject is currently locked. Stay tuned!',
          confirmText: 'OK'
        });
      }
      return;
    }
    setSelectedSubject(subj.id);
  };

  const handleStart = () => {
    if (selectedSubject && selectedForm) {
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      onStartQuiz({ 
        subject: selectedSubject, 
        subjectTitle: subjectObj?.title || 'History',
        form: selectedForm,
        chapter: 1
      });
    }
  };

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingBottom: '120px' }}>
      
      {/* Header */}
      <header className="flex-between" style={{ padding: '24px 20px 16px', background: 'var(--bg-primary)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-h4">Select Challenge</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Step 1: Subject */}
        <div>
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>1. Choose a Subject</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {subjects.map(subj => (
              <button 
                key={subj.id}
                onClick={() => handleSubjectSelect(subj)}
                style={{
                  flex: '1 1 30%',
                  background: 'var(--card-bg)',
                  border: selectedSubject === subj.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  opacity: subj.locked ? 0.6 : 1,
                  boxShadow: selectedSubject === subj.id ? '0 4px 12px rgba(255, 188, 0, 0.2)' : 'var(--card-shadow-sm)',
                  cursor: subj.locked ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  color: 'var(--text-primary)'
                }}
              >
                {getSubjectIcon(subj.iconType)}
                <span className="text-small-bold">{subj.title}</span>
                {subj.locked && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <Lock size={14} color="var(--text-secondary)" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Form */}
        <div style={{ opacity: selectedSubject ? 1 : 0.5, pointerEvents: selectedSubject ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>2. Choose your Form</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {forms.map(form => (
              <button
                key={form}
                onClick={() => setSelectedForm(form)}
                style={{
                  background: selectedForm === form ? 'var(--brand-primary)' : 'var(--card-bg)',
                  color: selectedForm === form ? '#000' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  fontWeight: 600, fontSize: '16px',
                  boxShadow: 'var(--card-shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Form {form}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <button 
            className="btn btn-dark" 
            onClick={handleStart}
            disabled={!selectedSubject || !selectedForm}
            style={{ 
              width: '100%', 
              justifyContent: 'space-between', 
              padding: '18px 24px',
              opacity: (!selectedSubject || !selectedForm) ? 0.5 : 1
            }}
          >
            Start Quiz <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSubject;
