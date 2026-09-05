/**
 * Boss Character System (Art, Visual, Sound & Identity Layer)
 * 
 * DESIGN PRINCIPLE:
 * Boss Character governs only audiovisual assets, lore, theming, and sprite states.
 * It contains ZERO battle rules or mechanics.
 * A single character can be paired with any Boss Type (Speed, Shield, Elemental, etc.).
 */

export const BOSS_CHARACTERS = {
  /**
   * 0. Boss Prototype / Training Dummy (Placeholder for Step 4 Engine Verification)
   */
  placeholder_boss: {
    bossId: 'placeholder_boss',
    bossName: 'Boss Prototype',
    title: '战斗核心测试假人',
    lore: '专用于验证通用战斗状态机、时序锁定与伤害判定的训练机甲。',

    artwork: {
      avatarUrl: null,
      fullArtUrl: null,
      badgeIcon: '🤖',
      characterEmoji: '🤖',
      placeholderGradient: 'linear-gradient(135deg, #475569 0%, #334155 50%, #1E293B 100%)'
    },

    sprites: {
      idle: 'animate-boss-hover',
      attack: 'animate-boss-slash',
      hit: 'animate-boss-shake',
      block: 'animate-boss-block',
      defeat: 'animate-boss-dissolve'
    },

    theme: {
      primaryColor: '#38BDF8',       // Sky Blue
      accentColor: '#F59E0B',        // Amber
      dangerColor: '#EF4444',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      arenaGradient: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      arenaFloorColor: '#1E293B',
      particleType: 'sparks',

      dialogues: {
        intro: '战斗引擎自检就绪。请作答以启动打击测试！',
        playerHit: '检测到有效命中，机体护盾 -1。',
        bossBlock: '选项错误，格挡机制启动！',
        defeat: '测试目标血量清零，全流程验证成功！'
      }
    },

    sound: {
      bgmKey: 'test_battle',
      attackSfx: 'mech_whir',
      hitSfx: 'metal_hit',
      defeatSfx: 'power_down'
    }
  },
  chrono_lynx: {
    bossId: 'chrono_lynx',
    bossName: 'Chrono Lynx',
    title: '极影时空灵猫',
    lore: '游弋于 SPM 题库时空裂隙的敏捷领主，以超越光速的答题反射考验每一位试炼者。',
    
    artwork: {
      avatarUrl: '/bosses/speed_demon/idle.png',
      fullArtUrl: '/bosses/speed_demon/idle.png',
      badgeIcon: '🐱⚡',
      characterEmoji: '😼',
      placeholderGradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #4F46E5 100%)'
    },

    sprites: {
      idle: '/bosses/speed_demon/idle.png',
      taunt: '/bosses/speed_demon/taunt.png',
      block: '/bosses/speed_demon/taunt.png',
      defeat: '/bosses/speed_demon/defeat.png'
    },

    theme: {
      primaryColor: '#06B6D4',       // Neon Cyan
      accentColor: '#F59E0B',        // Electric Amber
      dangerColor: '#EF4444',
      glowColor: 'rgba(6, 182, 212, 0.45)',
      arenaBackground: '/bosses/speed_demon/arena_bg.png',
      arenaGradient: 'linear-gradient(180deg, #0B132B 0%, #172554 40%, #1E1B4B 80%, #0F172A 100%)',
      arenaFloorColor: '#1E293B',
      particleType: 'sparks',
      
      dialogues: {
        intro: '你的反应速度，追得上我的时空之影吗？',
        playerHit: '动作挺快的嘛...但这才刚刚开始！',
        bossAttack: '太慢了！犹豫就会败北！',
        defeat: '不可思议...这般惊人的手速与知识，你通过了！'
      }
    },

    sound: {
      bgmKey: 'fast_cyber_battle',
      attackSfx: 'electric_dash',
      hitSfx: 'crit_impact',
      defeatSfx: 'boss_explode'
    }
  },

  /**
   * 2. Pyro Golem (熔火巨像)
   * Heavy, imposing magma titan
   */
  pyro_golem: {
    bossId: 'pyro_golem',
    bossName: 'Pyro Golem',
    title: '熔岩考场巨像',
    lore: '沉睡在火山考卷深处的远古泰坦，全身由炙热符文与玄武岩铸造而成。',

    artwork: {
      avatarUrl: null,
      fullArtUrl: null,
      badgeIcon: '🌋',
      characterEmoji: '🗿🔥',
      placeholderGradient: 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #D97706 100%)'
    },

    sprites: {
      idle: 'animate-boss-pulse',
      attack: 'animate-boss-slam',
      hit: 'animate-boss-shake',
      defeat: 'animate-boss-crumble'
    },

    theme: {
      primaryColor: '#EF4444',       // Molten Red
      accentColor: '#F59E0B',        // Magma Amber
      dangerColor: '#991B1B',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      arenaGradient: 'linear-gradient(180deg, #2A0808 0%, #450A0A 40%, #180505 80%, #0A0A0A 100%)',
      arenaFloorColor: '#261212',
      particleType: 'embers',

      dialogues: {
        intro: '渺小的考生，也妄图撼动我的熔火阵地？！',
        playerHit: '唔...竟然能撼动我的玄武岩铠甲！',
        bossAttack: '承受炎狱审判吧！',
        defeat: '熔岩核心熄灭了...你赢了，年轻的勇者！'
      }
    },

    sound: {
      bgmKey: 'heavy_titan_battle',
      attackSfx: 'magma_slam',
      hitSfx: 'heavy_smash',
      defeatSfx: 'earth_crumble'
    }
  }
};

/**
 * Retrieve a Boss Character specification by its bossId
 * @param {string} bossId
 * @returns {Object} BossCharacter specification (defaults to chrono_lynx)
 */
export const getBossCharacter = (bossId = 'chrono_lynx') => {
  return BOSS_CHARACTERS[bossId] || BOSS_CHARACTERS.chrono_lynx;
};

/**
 * List all registered Boss Characters
 * @returns {Array} List of Boss Character configurations
 */
export const getAllBossCharacters = () => {
  return Object.values(BOSS_CHARACTERS);
};
