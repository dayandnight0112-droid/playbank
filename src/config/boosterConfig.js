/**
 * boosterConfig.js
 * PlayBank 一次性付费权益与体力系统业务规则配置文件
 * 
 * 集中管理定价、体力池上限、按小时恢复速率、文案规范、法律条款 (T&C) 与 PDPA 隐私合规配置。
 */

export const BOOSTER_CONFIG = {
  // 核心价格与货币
  PRICING: {
    AMOUNT: 20.00,
    CURRENCY: 'MYR',
    FORMATTED: 'RM 20.00',
    IS_ONE_TIME: true, // 一次性付费，永久生效，无按月订阅
  },

  // 游玩次数（体力池）规则
  ENERGY: {
    FREE_MAX: 5,             // 免费玩家储存上限
    PAID_MAX: 10,            // 付费玩家储存上限
    RECOVERY_HOURS: 1,       // 恢复速度：每 1 小时恢复 1 次
    RECOVERY_INTERVAL_MS: 3600000, // 1 小时 = 3,600,000 毫秒
    BONUS_ON_PURCHASE: 5,    // 购买时即时赠送次数 (最高补至 10 次)
    CONSUME_PER_GAME: 1,     // 每开局消耗 1 次
    NO_DAILY_RESET: true,    // 不做午夜清零，纯按小时恢复
  },

  // BP 积分权益
  BENEFITS: {
    BP_MULTIPLIER: 3,        // 游戏结算 3× BP 加成
    RETROACTIVE: false,      // 不追溯历史局数得分
    PERMANENT: true,         // 永久有效
  },

  // 默认支付通道与网关预留配置
  PAYMENT: {
    DEFAULT_CHANNEL: 'duitnow_qr',
    MERCHANT_NAME: 'PlayBank Edu',
    DUITNOW_ID: '1234567890',
    REFERENCE_PREFIX: 'PB',
    REFUND_WINDOW_DAYS: 7,   // 支持家长 7 天内无理由申请退款核查
  },

  // 法律条款、T&C 与隐私协议 (PDPA)
  COMPLIANCE: {
    TC_VERSION: 'v1.0-2026',
    PDPA_VERSION: '2026-MY',
    SUPPORT_CONTACT: 'support@playbank.edu.my',
    
    // 中英文双语条款摘要
    TERMS_SUMMARY: {
      zh: [
        '一次性购买，永久享有 10 次储存上限及答题/打字 3× BP 权益，无需月度续订。',
        '游玩次数采用按小时自然恢复机制（每小时恢复 1 次），储存上限由 5 次提升至 10 次，达到上限后停止累积。',
        '3× BP 加成仅适用于购买后完成的新局结算，不可追溯历史得分。',
        '本平台严格遵守马来西亚个人数据保护法 (PDPA 2010)，收集之家长联系方式仅用于订单凭证与账户安全服务，绝不储存银行卡或敏感金融信息。',
        '如遇误购或异常，家长可在 7 天内凭订单号与付款流水申请退款核实；退款完成后系统将自动收回额外上限与倍数权益。'
      ],
      en: [
        'One-time purchase for lifetime 10-energy capacity and 3× BP boost. No recurring subscription.',
        'Energy recovers naturally at 1 charge per hour up to the cap of 10. Accumulation pauses when cap is reached.',
        'The 3× BP boost applies strictly to games completed after activation and is not retroactive.',
        'PlayBank complies with the Personal Data Protection Act 2010 (PDPA). Parent contact data is used solely for order verification and account security. No payment card numbers are stored.',
        'Refund requests may be submitted within 7 days. Upon refund approval, the 10-energy cap and 3× BP benefits will be automatically revoked.'
      ]
    },

    // 严例文案指引 (保证团队与前端绝不使用歧义或违规文案)
    COPY_GUIDELINES: {
      FORBIDDEN_PHRASES: [
        '每天多玩一倍',
        '恢复速度加快一倍',
        '无限游玩',
        '每天刷新 10 次'
      ],
      RECOMMENDED_PHRASE: '储存上限由 5 增至 10，能连续挑战更多局，每小时恢复 1 次'
    }
  }
};

export default BOOSTER_CONFIG;
