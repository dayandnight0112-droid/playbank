import { Bell, ArrowRight, Gift, Trophy, Star, Flame, Landmark, Microscope, Calculator, Lock } from 'lucide-react';
import { useDragScroll } from '../hooks/useDragScroll';
import { mockDb } from '../lib/mockDb';

const getSubjectIcon = (type) => {
  switch(type) {
    case 'microscope': return <Microscope size={40} color="var(--text-primary)" strokeWidth={1.5} />;
    case 'calculator': return <Calculator size={40} color="var(--text-primary)" strokeWidth={1.5} />;
    case 'landmark': default: return <Landmark size={40} color="var(--text-primary)" strokeWidth={1.5} />;
  }
};

const Home = ({ onStartChallenge, onGoMarket, userBP, playsToday }) => {
  const newsDragScroll = useDragScroll();
  const subjectsDragScroll = useDragScroll();

  return (
    <div className="view-content" style={{ padding: '24px 20px 100px 20px' }}>
      
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            border: '2px solid var(--brand-primary)',
            background: '#000'
          }}>
            <img src={`${import.meta.env.BASE_URL}playbanklogo.png`} alt="PlayBank Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 className="text-h3">Hello, Guest</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔥</span>
              <span className="text-small-bold">{5 - playsToday} attempts left today</span>
            </div>
          </div>
        </div>
        <button style={{ 
          background: 'transparent', border: 'none', cursor: 'pointer',
          position: 'relative', color: 'var(--text-primary)'
        }}>
          <Bell size={28} />
          <div style={{
            position: 'absolute', top: '-2px', right: '-2px',
            background: 'var(--brand-primary)', color: '#000',
            width: '16px', height: '16px', borderRadius: '50%',
            fontSize: '10px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>1</div>
        </button>
      </header>

      {/* Hero Card */}
      <section style={{
        background: 'var(--brand-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
        color: '#000000',
        minHeight: '220px'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '60%' }}>
          <h2 className="text-h1" style={{ marginBottom: '12px', fontSize: '32px' }}>10-Second<br/>Challenge</h2>
          <p style={{ fontSize: '14px', marginBottom: '20px', fontWeight: 500, lineHeight: 1.4 }}>
            Play, learn, and score across PlayBank subjects.
          </p>
          
          <button 
            className="btn btn-dark" 
            onClick={onStartChallenge} 
            style={{ marginBottom: '12px', width: '100%', justifyContent: 'space-between', opacity: playsToday >= 5 ? 0.5 : 1 }}
          >
            {playsToday >= 5 ? 'Limit Reached' : 'Start Now'} <ArrowRight size={18} />
          </button>
          
          <button className="btn" onClick={onGoMarket} style={{ 
            background: '#FFFFFF', color: '#000000', width: '100%', justifyContent: 'space-between' 
          }}>
            Redeem <Gift size={18} />
          </button>
        </div>
        
        {/* Stopwatch Image inside Hero */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '20px',
          width: '180px',
          height: '180px',
          zIndex: 1
        }}>
          <img src={`${import.meta.env.BASE_URL}clock.png`} alt="Clock" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </section>

      {/* Image Slider */}
      <section style={{ marginBottom: '32px' }}>
        {/* PROJECT HEADLINE DEFAULT FONT & SIZE */}
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h2 className="text-h3">News</h2>
        </div>
        <div 
          {...newsDragScroll}
          style={{ 
            display: 'flex', gap: '16px', overflowX: 'auto', 
            scrollSnapType: 'x mandatory', paddingBottom: '16px',
            ...newsDragScroll.style
          }}
        >
          {[
            `${import.meta.env.BASE_URL}slides/Untitled design (44).png`,
            `${import.meta.env.BASE_URL}slides/Untitled design (45).png`,
            `${import.meta.env.BASE_URL}slides/Untitled design (46).png`
          ].map((src, idx) => (
            <div key={idx} style={{ 
              scrollSnapAlign: 'start', flex: '0 0 85%', 
              aspectRatio: '16/9', borderRadius: '16px', 
              overflow: 'hidden', pointerEvents: 'none',
              boxShadow: 'var(--card-shadow-sm)' 
            }}>
              <img src={src} alt={`Slide ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section>
        {/* PROJECT HEADLINE DEFAULT FONT & SIZE */}
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h2 className="text-h3">What Subject We have</h2>
        </div>
        
        <div 
          {...subjectsDragScroll}
          style={{ 
            display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px',
            ...subjectsDragScroll.style 
          }}
        >
          {mockDb.getSubjects().map(subject => (
            <div key={subject.id} style={{
              minWidth: '130px',
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--card-shadow-sm)',
              opacity: subject.locked ? 0.6 : 1,
              position: 'relative'
            }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getSubjectIcon(subject.iconType)}
              </div>
              <h3 className="text-h4" style={{ marginBottom: '4px', textAlign: 'center' }}>{subject.title}</h3>
              {subject.locked ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Lock size={12} color="var(--text-secondary)" />
                  <span className="text-small" style={{ fontSize: '11px' }}>Coming soon</span>
                </div>
              ) : (
                <p className="text-small" style={{ textAlign: 'center' }}>{subject.subtitle}</p>
              )}
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default Home;
