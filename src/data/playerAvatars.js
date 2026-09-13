/**
 * playerAvatars.js
 * Centralized Single Source of Truth for PlayBank Player Avatars.
 * All views, HUDs, modals, and profiles MUST read from this configuration.
 */

const BASE = import.meta.env?.BASE_URL || '/';
const cleanBase = BASE.endsWith('/') ? BASE : `${BASE}/`;

export const DEFAULT_AVATAR_ID = 'tiger';

export const PLAYER_AVATARS = {
  tiger: {
    id: 'tiger',
    name: 'Tiger',
    chineseName: '经典小虎',
    src: `${cleanBase}avatars/avatar-tiger.png`,
    themeColor: '#FFBC00',
    description: 'PlayBank 官方经典象征，充满智慧与敏捷。'
  },
  redPanda: {
    id: 'redPanda',
    name: 'Red Panda',
    chineseName: '活力小熊猫',
    src: `${cleanBase}avatars/avatar-red-panda.png`,
    themeColor: '#F97316',
    description: '热情开朗的双爪探险家，时刻充满朝气。'
  },
  penguin: {
    id: 'penguin',
    name: 'Penguin',
    chineseName: '冰爽小企鹅',
    src: `${cleanBase}avatars/avatar-penguin.png`,
    themeColor: '#0EA5E9',
    description: '冷静沉着的极地学霸，憨厚呆萌却富有智慧。'
  },
  dino: {
    id: 'dino',
    name: 'Dino',
    chineseName: '探险小萌龙',
    src: `${cleanBase}avatars/avatar-dino.png`,
    themeColor: '#22C55E',
    description: '勇敢坚韧的远古探险家，勇往直前无所畏惧。'
  }
};

export const PLAYER_AVATAR_LIST = Object.values(PLAYER_AVATARS);

/**
 * Safely resolves avatar config with strict Tiger fallback
 * @param {string} avatarId
 * @returns {object} Avatar definition
 */
export const getPlayerAvatarConfig = (avatarId) => {
  if (avatarId && PLAYER_AVATARS[avatarId]) {
    return PLAYER_AVATARS[avatarId];
  }
  return PLAYER_AVATARS[DEFAULT_AVATAR_ID];
};
