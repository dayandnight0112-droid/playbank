/**
 * Feature Flags Configuration
 * Used to temporarily pause / toggle features without deleting code or losing data.
 */
export const FEATURES = {
  // Garden / 庄园浇水与水滴系统
  // 当前状态：暂时暂停使用，隐藏入口、隐藏领取水滴文案、停止计算玩家水滴
  ENABLE_GARDEN: false,

  // Bottom Nav Battle / 底部导航栏 Battle 入口
  // 当前状态：隐藏底部 Battle 导航项，玩家唯一游戏入口为主页 START / CONTINUE 按钮
  ENABLE_BATTLE_NAV: false
};

export const ENABLE_GARDEN = FEATURES.ENABLE_GARDEN;
export const ENABLE_BATTLE_NAV = FEATURES.ENABLE_BATTLE_NAV;
