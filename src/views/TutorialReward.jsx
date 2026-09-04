const TutorialReward = ({ guest, onEnterLobby, onLoginAndSave }) => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '40px 24px',
      background: '#FFFFFF',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>TRAINING COMPLETE</h1>
        <p style={{ fontSize: '18px', fontWeight: 800, marginTop: '20px' }}>★★★</p>
        <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-primary, #FFBC00)' }}>
          +120 BankPoint
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onEnterLobby}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--brand-primary, #FFBC00)',
            border: '3px solid #000',
            fontWeight: 900,
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #000'
          }}
        >
          进入冒险 (Continue as Guest)
        </button>
        <button
          onClick={onLoginAndSave}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#666'
          }}
        >
          Login & Save Progress
        </button>
      </div>
    </div>
  );
};

export default TutorialReward;
