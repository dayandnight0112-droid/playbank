// Pluggable Home Adventure Scenes System
// Supports changing scenes via homeSceneId without rebuilding Home Lobby UI

export const HOME_SCENES = {
  trainingCamp: {
    id: 'trainingCamp',
    name: 'Training Camp',
    chineseName: '冒险新兵营地',
    chapter: 1,
    progress: '3/8',
    locked: false,
    theme: 'adventure-camp',
    backgroundImage: null, // Supports future external art asset URL
    foregroundImage: null,
    skyGradient: 'linear-gradient(180deg, #0B132B 0%, #1C2541 35%, #1F3A3B 70%, #0D2818 100%)',
    ambientColor: '#F59E0B',
    pathColor: '#B45309',
    gateStatus: 'open_path',
    particleEffect: 'fireflies',
    description: '通往初阶试炼的森林古道与营地帐篷。'
  },
  mysticLibrary: {
    id: 'mysticLibrary',
    name: 'Mystic Library',
    chineseName: '秘境古卷神殿',
    chapter: 2,
    progress: '0/10',
    locked: true,
    theme: 'arcane-library',
    backgroundImage: null,
    foregroundImage: null,
    skyGradient: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 40%, #1E293B 80%, #0F172A 100%)',
    ambientColor: '#818CF8',
    pathColor: '#6366F1',
    gateStatus: 'locked',
    particleEffect: 'runes',
    description: '远古学者遗留的浮空藏书阁。'
  },
  skyRuins: {
    id: 'skyRuins',
    name: 'Sky Ruins',
    chineseName: '苍穹空岛遗迹',
    chapter: 3,
    progress: '0/12',
    locked: true,
    theme: 'sky-ruins',
    backgroundImage: null,
    foregroundImage: null,
    skyGradient: 'linear-gradient(180deg, #082F49 0%, #0369A1 40%, #38BDF8 80%, #0284C7 100%)',
    ambientColor: '#38BDF8',
    pathColor: '#BAE6FD',
    gateStatus: 'locked',
    particleEffect: 'clouds',
    description: '云海之上断裂的泰坦神庙阶梯。'
  },
  scienceLab: {
    id: 'scienceLab',
    name: 'Alchemist Lab',
    chineseName: '元素炼金工坊',
    chapter: 4,
    progress: '0/12',
    locked: true,
    theme: 'alchemist-lab',
    backgroundImage: null,
    foregroundImage: null,
    skyGradient: 'linear-gradient(180deg, #14532D 0%, #166534 40%, #15803D 80%, #052E16 100%)',
    ambientColor: '#22C55E',
    pathColor: '#86EFAC',
    gateStatus: 'locked',
    particleEffect: 'sparks',
    description: '蒸馏瓶与能量水晶闪烁的科学秘境。'
  },
  bossGate: {
    id: 'bossGate',
    name: 'Boss Gate',
    chineseName: '领主封印巨门',
    chapter: 5,
    progress: '0/1',
    locked: true,
    theme: 'boss-citadel',
    backgroundImage: null,
    foregroundImage: null,
    skyGradient: 'linear-gradient(180deg, #450A0A 0%, #7F1D1D 40%, #991B1B 80%, #18181B 100%)',
    ambientColor: '#EF4444',
    pathColor: '#DC2626',
    gateStatus: 'locked_boss',
    particleEffect: 'embers',
    description: '岩浆环绕的远古巨门，等待勇者挑战。'
  }
};

export const getHomeScene = (sceneId = 'trainingCamp') => {
  return HOME_SCENES[sceneId] || HOME_SCENES.trainingCamp;
};
