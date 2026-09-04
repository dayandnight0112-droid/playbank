// Welcome screen background theme system
// Supports switching backgrounds (e.g. welcome-bg-01, welcome-bg-02, welcome-bg-event)

export const WELCOME_THEMES = {
  'welcome-bg-01': {
    id: 'welcome-bg-01',
    name: 'Adventure Dawn (Gold)',
    // Multi-layer procedural gaming background with atmospheric spatial depth
    baseGradient: 'radial-gradient(ellipse at 50% 30%, #FFE98A 0%, #F59E0B 45%, #D97706 75%, #92400E 100%)',
    overlayPattern: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%)',
    vignette: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50%, rgba(0, 0, 0, 0.25) 100%)',
    accentColor: '#FFD700',
    particleColor: 'rgba(255, 255, 255, 0.6)'
  },
  'welcome-bg-02': {
    id: 'welcome-bg-02',
    name: 'Mystic Night (Azure)',
    baseGradient: 'radial-gradient(ellipse at 50% 30%, #38BDF8 0%, #1D4ED8 45%, #1E1B4B 80%, #0F172A 100%)',
    overlayPattern: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 55%)',
    vignette: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(0, 0, 0, 0.4) 100%)',
    accentColor: '#38BDF8',
    particleColor: 'rgba(255, 255, 255, 0.5)'
  },
  'welcome-bg-event': {
    id: 'welcome-bg-event',
    name: 'Championship Arena (Violet)',
    baseGradient: 'radial-gradient(ellipse at 50% 30%, #F472B6 0%, #A855F7 45%, #6B21A8 80%, #3B0764 100%)',
    overlayPattern: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 55%)',
    vignette: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(0, 0, 0, 0.4) 100%)',
    accentColor: '#F472B6',
    particleColor: 'rgba(255, 255, 255, 0.5)'
  }
};

export const getWelcomeTheme = (themeId = 'welcome-bg-01') => {
  return WELCOME_THEMES[themeId] || WELCOME_THEMES['welcome-bg-01'];
};
