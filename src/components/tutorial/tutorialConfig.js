/**
 * Home Tutorial Configuration & Step Metadata
 * Shared across HomeTutorialOverlay component and test suites.
 */

export const TIMEOUT_SAFETY_MS = 2500; // 2.5s safety timeout

export const HOME_TUTORIAL_STEPS = {
  1: {
    id: 'daily',
    stepNumber: 1,
    title: '每日任务 · 稳定成长',
    description: '完成每日指定任务，即可稳步赚取大量 BankPoint！点击进入查看今日任务吧！',
    targetSelector: '[data-tutorial-target="lobby-daily"]',
    expectedView: 'home',
    mascotVariant: 'wave',
    modalTitle: '查看任务与奖励',
    modalDescription: '这里实时展示任务进度与可得 BP。了解后点击「下一步」继续！',
    nextButtonText: '下一步 →'
  },
  2: {
    id: 'streak',
    stepNumber: 2,
    title: '7 天连续打卡 · 连胜加成',
    description: '每日打卡签到，连胜奖励层层递进！点击查看你的连续打卡进度与实际奖励！',
    targetSelector: '[data-tutorial-target="lobby-streak"]',
    expectedView: 'home',
    mascotVariant: 'cheer',
    modalTitle: '7 天打卡进度',
    modalDescription: '打卡奖励需每天手动领取。观看引导不会代领奖励，保持探索热情！',
    nextButtonText: '下一步 →'
  },
  3: {
    id: 'shop',
    stepNumber: 3,
    title: '真实商城 · 兑换好礼',
    description: '答题累积的 BankPoint 可在这里兑换真实的实体文具与学习好礼！点击进入商店！',
    targetSelector: '[data-tutorial-target="nav-marketplace"]',
    expectedView: 'home',
    inShopView: 'marketplace',
    mascotVariant: 'wave',
    shopTitle: '探索真实文具好物',
    shopDescription: (bp) => `你当前拥有 ${bp} BP！每件商品都清晰标明所需 BP，做题闯关即可攒够兑换！无需购买，点击返回继续完成新手引导。`,
    returnButtonText: '返回大厅，继续 →'
  },
  4: {
    id: 'start_game',
    stepNumber: 4,
    title: '准备就绪 · 开始探险',
    description: '大厅核心功能已全部了解！点击「CONTINUE」开始你的第一场知识冒险吧！',
    targetSelector: '[data-tutorial-target="home-continue-button"]',
    expectedView: 'home',
    mascotVariant: 'cheer'
  }
};

/**
 * Intelligent Mascot Bubble Placement Calculation
 * Returns 'above' or 'below' based on targetRect and viewportHeight
 */
export function calculateBubblePlacement(targetRect, viewportHeight) {
  if (!targetRect) return 'below';
  const spaceAbove = targetRect.top;
  const spaceBelow = viewportHeight - targetRect.bottom;
  if (spaceAbove >= 180 && spaceAbove > spaceBelow) {
    return 'above';
  }
  return 'below';
}

/**
 * Generate Cutout Polygon Clip-Path for CSS
 */
export function generateCutoutClipPath(rect) {
  if (!rect) return 'none';
  return `polygon(
    0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
    ${rect.left}px ${rect.top}px,
    ${rect.left}px ${rect.bottom}px,
    ${rect.right}px ${rect.bottom}px,
    ${rect.right}px ${rect.top}px,
    ${rect.left}px ${rect.top}px
  )`.replace(/\s+/g, ' ').trim();
}
