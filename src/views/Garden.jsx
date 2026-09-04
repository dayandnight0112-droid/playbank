import { useState, useEffect } from 'react';
import { Droplet, Star, Sparkles, ChevronRight, CheckCircle2, Sprout, Award, Check } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { mockDb } from '../lib/mockDb';
import TreeRenderer, { getStageByGrowth } from '../components/TreeRenderer';

const Garden = ({ userBP = 0, onUpdateBP, onGoQuiz }) => {
  const treesConfig = mockDb.getTreesConfig();
  const [gardenState, setGardenState] = useState(() => mockDb.getGardenState());
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [localBP, setLocalBP] = useState(userBP);

  const { width, height } = useWindowSize();

  useEffect(() => {
    setLocalBP(userBP);
  }, [userBP]);

  const currentTree = treesConfig.find(t => t.id === gardenState.currentTreeId) || treesConfig[0];
  const stageInfo = getStageByGrowth(gardenState.growth);
  const [toastMessage, setToastMessage] = useState(null);
  const [dailyMissionsState, setDailyMissionsState] = useState(() => mockDb.getDailyMissions());
  const [countdown, setCountdown] = useState(() => mockDb.getTimeUntilMalaysiaMidnight().formatted);

  const isMature = (gardenState.growth || 0) >= 100;
  const isTreeRewardClaimed = gardenState.completedTrees?.includes(currentTree.id);

  // 若一进页面就已经是 100% 且尚未领取奖励，自动弹出成熟弹窗
  useEffect(() => {
    if (isMature && !isTreeRewardClaimed) {
      setShowCompleteModal(true);
    }
  }, []);

  // Step 6: 实时更新马来西亚 00:00 倒计时并在跨天时自动刷新重置
  useEffect(() => {
    const timer = setInterval(() => {
      const timeInfo = mockDb.getTimeUntilMalaysiaMidnight();
      setCountdown(timeInfo.formatted);

      // 当跨日时自动重置任务
      const freshMissions = mockDb.checkAndResetDailyMissions();
      if (freshMissions.date !== dailyMissionsState.date) {
        setDailyMissionsState({ ...freshMissions });
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const freshMissions = mockDb.checkAndResetDailyMissions();
        setDailyMissionsState({ ...freshMissions });
        setGardenState(mockDb.getGardenState());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dailyMissionsState.date]);

  // 统计完成与待领取数
  const missionsList = Object.values(dailyMissionsState.missions || {});
  const claimedCount = missionsList.filter(m => m.claimed).length;
  const claimableCount = missionsList.filter(m => m.progress >= m.target && !m.claimed).length;

  // Step 8: 浇水动画状态管理
  const [isWatering, setIsWatering] = useState(false);
  const [wateringPhase, setWateringPhase] = useState('idle'); // 'idle' | 'falling' | 'splashing'
  const [showFloatingText, setShowFloatingText] = useState(false);

  const handleWaterClick = () => {
    if (isWatering) return; // 播放动画期间防连点防狂刷
    if (gardenState.water <= 0) {
      setToastMessage('Complete Daily Missions to earn Water!');
      setTimeout(() => setToastMessage(null), 3200);
      return;
    }

    // Step 8: 触发纯 2D 浇水动效序列（总时长控制在 ~0.9s 以内）
    setIsWatering(true);
    setWateringPhase('falling');

    // 阶段 1：水滴从上方下落 (~0.35s)
    setTimeout(() => {
      // 阶段 2：击中泥土/植物，水滴溅散波纹 + 树木弹跳 + 飘出 +10% Growth
      setWateringPhase('splashing');
      setShowFloatingText(true);

      const result = mockDb.waterTree();
      let updatedGrowth = gardenState.growth;
      let isAlreadyFinished = false;

      if (!result.error) {
        setGardenState({ ...result.gardenState });
        updatedGrowth = result.gardenState.growth;
        isAlreadyFinished = result.gardenState.completedTrees?.includes(currentTree.id);
      }

      // 阶段 3：波纹平息 (0.35s)
      setTimeout(() => {
        setWateringPhase('idle');
      }, 350);

      // 阶段 4：成长徽章浮空淡出，解除按钮禁用，恢复可点击 (~0.9s 总时长)
      setTimeout(() => {
        setShowFloatingText(false);
        setIsWatering(false);

        // Step 9: 达到 100% 自动触发成熟庆祝弹窗
        if (updatedGrowth >= 100 && !isAlreadyFinished) {
          setShowCompleteModal(true);
        }
      }, 550);
    }, 350);
  };

  // Step 9: 领取成熟树木的 BP 奖励
  const handleCollectTreeReward = () => {
    const res = mockDb.claimTreeReward(currentTree.id);
    if (res.success) {
      setGardenState({ ...res.gardenState });
      setLocalBP(res.newTotalBP);
      if (onUpdateBP) onUpdateBP(res.newTotalBP);
      setToastMessage(`🎉 Congratulations! +${res.rewardBP} BP collected!`);
      setTimeout(() => setToastMessage(null), 3500);
      setShowCompleteModal(false);
    } else {
      setToastMessage(res.error);
      setTimeout(() => setToastMessage(null), 3000);
      setShowCompleteModal(false);
    }
  };

  // 测试辅助：一键模拟达到 100% 成熟，验证 Step 9 弹窗与结算
  const handleTestMaxGrowth = () => {
    const updated = mockDb.setTreeGrowthDirect(100);
    setGardenState({ ...updated });
    if (!updated.completedTrees?.includes(currentTree.id)) {
      setShowCompleteModal(true);
    }
  };

  // 一键重置树木状态至 Stage 1 种子初始态 (0% Growth, 3 💧 Water)
  const handleResetTree = () => {
    const fresh = mockDb.resetGardenState();
    setGardenState({ ...fresh });
    setShowCompleteModal(false);
    setToastMessage('🌱 Tree reset to Stage 1 Seed (0% Growth, 3 💧 Water)!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 手动点击 CLAIM 领取 Water
  const handleClaimReward = (missionKey) => {
    const res = mockDb.claimMissionReward(missionKey);
    if (res.success) {
      setDailyMissionsState({ ...res.missionsState });
      setGardenState({ ...res.gardenState });
      setToastMessage(`🎉 Claimed +${res.waterAdded} 💧 Water!`);
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      setToastMessage(res.error);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // 辅助测试完成任务（供在 Step 7 正式串联前直接快速验证 CLAIM 行为）
  const handleTestCompleteMission = (missionKey) => {
    const state = mockDb.setMissionProgressDirect(missionKey, 999);
    setDailyMissionsState({ ...state });
  };

  // Step 6: 供直接模拟 00:00 马来西亚时间跨日重置（保留 Water 与 Growth）
  const handleSimulateMidnightReset = () => {
    const resetMissions = mockDb.resetDailyMissionsForce();
    setDailyMissionsState({ ...resetMissions });
    const currentGarden = mockDb.getGardenState();
    setToastMessage(`🔄 00:00 Reset: Missions reset to 0/3. Water (${currentGarden.water}) & Tree (${currentGarden.growth}%) kept!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="view-content" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100vh',
      backgroundColor: '#FAF7F0',
      paddingBottom: '90px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 顶部状态栏：BankPoint & 💧 水滴数量 */}
      <header style={{
        padding: '18px 20px 12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* 左侧：BP 余额 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          border: '2px solid #2B2B2B',
          borderRadius: '9999px',
          padding: '6px 14px',
          boxShadow: '2px 2px 0px #2B2B2B'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Star size={12} fill="#000" color="#000" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B' }}>
            {Number(localBP).toLocaleString()} BP
          </span>
        </div>

        {/* 右侧：Water 专属资源 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#E8F4FD',
          border: '2px solid #1E88E5',
          borderRadius: '9999px',
          padding: '6px 14px',
          boxShadow: '2px 2px 0px #1E88E5'
        }}>
          <Droplet size={16} fill="#29B6F6" color="#0288D1" />
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#0277BD' }}>
            Water × {gardenState.water}
          </span>
        </div>
      </header>

      {/* 缺水提示 Toast Banner */}
      {toastMessage && (
        <div 
          onClick={() => setShowMissionModal(true)}
          style={{
            margin: '4px 20px 0 20px',
            background: '#FFF0F0',
            border: '2px solid #FF4D4F',
            borderRadius: '16px',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 99,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>💧</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#CF1322' }}>
              {toastMessage}
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#FF4D4F', textDecoration: 'underline' }}>
            View Missions →
          </span>
        </div>
      )}

      {/* 每日任务快捷入口浮条（Daily Mission Entry） */}
      <div style={{ padding: '0 20px', marginTop: '6px', zIndex: 10 }}>
        <div 
          onClick={() => setShowMissionModal(true)}
          style={{
            background: '#FFFFFF',
            border: '2px solid #2B2B2B',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #2B2B2B',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B', lineHeight: 1.2 }}>
                Daily Missions
              </p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#7C7C7C', marginTop: '2px' }}>
                Complete quizzes to earn 💧 Water
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {claimableCount > 0 ? (
              <span style={{
                background: '#E8F5E9',
                color: '#2E7D32',
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '8px',
                border: '1.5px solid #4CAF50',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                🎁 {claimableCount} Ready to Claim!
              </span>
            ) : (
              <span style={{
                background: claimedCount === missionsList.length ? '#E8F5E9' : '#FFF3C4',
                color: claimedCount === missionsList.length ? '#2E7D32' : '#B78103',
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '8px',
                border: `1px solid ${claimedCount === missionsList.length ? '#A5D6A7' : '#FFE082'}`
              }}>
                {claimedCount}/{missionsList.length} Done
              </span>
            )}
            <ChevronRight size={16} color="#2B2B2B" />
          </div>
        </div>
      </div>

      {/* 核心视觉中心：Tree 区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '340px',
        padding: '20px 0'
      }}>
        {/* 背景轻量装饰光环 */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 245, 233, 0.9) 0%, rgba(250, 247, 240, 0) 70%)',
          zIndex: 1
        }} />

        {/* 树名称与当前阶段徽章 */}
        <div style={{ zIndex: 2, textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#2B2B2B',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            {currentTree.name}
          </h2>
          <div style={{
            marginTop: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isMature ? '#FFF9C4' : '#E8F5E9',
            border: isMature ? '1.5px solid #FBC02D' : '1.5px solid #66BB6A',
            borderRadius: '9999px',
            padding: '3px 12px'
          }}>
            {isMature ? <Award size={13} color="#F57F17" /> : <Sprout size={13} color="#2E7D32" />}
            <span style={{ fontSize: '11px', fontWeight: 800, color: isMature ? '#E65100' : '#2E7D32' }}>
              {isMature 
                ? `Stage 5: Fully Grown (100%) ${isTreeRewardClaimed ? '✓ Claimed' : '🎉 Ready to Harvest'}` 
                : `Stage ${stageInfo.stage}: ${stageInfo.name} (${gardenState.growth}%)`}
            </span>
          </div>
        </div>

        {/* Step 8: 树木容器与弹跳动画 */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transformOrigin: 'bottom center',
          animation: wateringPhase === 'splashing' ? 'tree-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}>
          {/* 下落水滴 (Phase: falling, ~0.35s) */}
          {wateringPhase === 'falling' && (
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              zIndex: 25,
              pointerEvents: 'none',
              animation: 'drop-fall 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}>
              <svg width="24" height="34" viewBox="0 0 24 34">
                <path d="M 12,0 C 12,0 0,14 0,22 C 0,28.6 5.4,34 12,34 C 18.6,34 24,28.6 24,22 C 24,14 12,0 12,0 Z" fill="#29B6F6" stroke="#0277BD" strokeWidth="2" />
                <ellipse cx="8" cy="22" rx="3" ry="6" fill="#E1F5FE" opacity="0.75" transform="rotate(-20 8 22)" />
              </svg>
            </div>
          )}

          {/* 水花与波纹特效 (Phase: splashing) */}
          {wateringPhase === 'splashing' && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 扩散涟漪圈 */}
              <div style={{
                position: 'absolute',
                width: '64px',
                height: '24px',
                borderRadius: '50%',
                border: '2.5px solid #29B6F6',
                background: 'rgba(41, 182, 246, 0.25)',
                animation: 'splash-ripple 0.35s ease-out forwards'
              }} />
              {/* 左飞溅小水珠 */}
              <div style={{
                position: 'absolute',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#29B6F6',
                border: '1.5px solid #0277BD',
                animation: 'splash-left 0.35s ease-out forwards'
              }} />
              {/* 右飞溅小水珠 */}
              <div style={{
                position: 'absolute',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#29B6F6',
                border: '1.5px solid #0277BD',
                animation: 'splash-right 0.35s ease-out forwards'
              }} />
            </div>
          )}

          {/* 浮空飘动文字：“+10% Growth 🌿” */}
          {showFloatingText && (
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              zIndex: 35,
              pointerEvents: 'none',
              animation: 'float-up-growth 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards'
            }}>
              <div style={{
                background: '#2E7D32',
                color: '#FFFFFF',
                border: '2px solid #1B5E20',
                borderRadius: '9999px',
                padding: '5px 14px',
                fontSize: '13px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 10px rgba(46, 125, 50, 0.4)',
                whiteSpace: 'nowrap'
              }}>
                <span>+10% Growth</span>
                <span>🌿</span>
              </div>
            </div>
          )}

          {/* 2D 树木动态五阶段渲染器 */}
          <TreeRenderer growth={gardenState.growth} treeId={currentTree.id} />
        </div>

        {/* 成长百分比进度条（Growth Progress Bar） */}
        <div style={{
          width: '82%',
          maxWidth: '320px',
          marginTop: '12px',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#555'
          }}>
            <span>Tree Growth</span>
            <span style={{ color: '#2E7D32', fontWeight: 900 }}>{gardenState.growth}%</span>
          </div>

          <div style={{
            height: '14px',
            width: '100%',
            background: '#EAE5D9',
            borderRadius: '9999px',
            border: '2px solid #2B2B2B',
            overflow: 'hidden',
            padding: '2px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              height: '100%',
              width: `${gardenState.growth}%`,
              background: 'linear-gradient(90deg, #81C784 0%, #4CAF50 100%)',
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          </div>
        </div>
      </div>

      {/* 底部浇水 / 成熟结算操作区域 */}
      <div style={{
        padding: '0 24px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10
      }}>
        {isMature && !isTreeRewardClaimed ? (
          /* 成熟未领：高亮金色结算大按键 */
          <button
            onClick={() => setShowCompleteModal(true)}
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '16px 24px',
              backgroundColor: '#FFD54F',
              color: '#000000',
              border: '3px solid #2B2B2B',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 5px 0px #F57F17, 0 8px 16px rgba(245, 127, 23, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.3px',
              animation: 'pop 0.3s ease'
            }}
          >
            <Star size={22} fill="#FFB300" color="#000" />
            <span>CLAIM REWARD (+{currentTree.rewardBP} BP)</span>
            <span>🎉</span>
          </button>
        ) : isMature && isTreeRewardClaimed ? (
          /* 成熟且已领：提示准备进入下一棵树 */
          <div style={{
            width: '100%',
            maxWidth: '340px',
            padding: '14px 20px',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            border: '2px solid #66BB6A',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 3px 0px #388E3C'
          }}>
            <CheckCircle2 size={18} color="#2E7D32" />
            <span>Tree Completed & BP Claimed!</span>
          </div>
        ) : (
          /* 未成熟：常规 WATER TREE 按键 */
          <button
            onClick={handleWaterClick}
            disabled={isWatering || gardenState.water <= 0}
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '16px 24px',
              backgroundColor: isWatering ? '#0288D1' : gardenState.water > 0 ? '#29B6F6' : '#B0BEC5',
              color: '#FFFFFF',
              border: '3px solid #2B2B2B',
              borderRadius: '24px',
              fontSize: '17px',
              fontWeight: 900,
              cursor: isWatering || gardenState.water <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: isWatering ? '0 2px 0px #01579B' : gardenState.water > 0 ? '0 5px 0px #0277BD, 0 8px 12px rgba(0,0,0,0.15)' : '0 4px 0px #78909C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transform: isWatering ? 'translateY(3px)' : 'none',
              transition: 'all 0.15s ease',
              letterSpacing: '0.5px'
            }}
          >
            <Droplet size={24} fill="#FFFFFF" color="#FFFFFF" />
            <span>{isWatering ? 'WATERING...' : 'WATER TREE'}</span>
            <span style={{
              fontSize: '12px',
              background: 'rgba(0,0,0,0.2)',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              -1 💧
            </span>
          </button>
        )}

        {/* 辅助测试按键区（包含重置与一键满级） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
          <button
            onClick={handleResetTree}
            title="Reset tree to 0% seed"
            style={{
              background: '#FFF0F0',
              border: '1.5px solid #FFCDD2',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#D32F2F',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🔄 Reset Tree (0%)
          </button>

          {!isMature && (
            <button
              onClick={handleTestMaxGrowth}
              title="Simulate tree reaching 100% mature"
              style={{
                background: '#FFF8E1',
                border: '1.5px solid #FFE082',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#F57F17',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ⚡ Test 100% Mature
            </button>
          )}
        </div>

        <p style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#8A8A8A',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {isMature 
            ? 'Your tree is 100% grown! Harvest and earn BP.' 
            : gardenState.water > 0 
              ? 'Water your tree to help it grow (+10% Growth)' 
              : 'Complete Daily Missions to earn more Water!'}
        </p>
      </div>

      {/* Step 8: 浇水 2D 动画专有样式 */}
      <style>{`
        @keyframes drop-fall {
          0% {
            transform: translate(-50%, -80px) scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            transform: translate(-50%, 60px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 100px) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes splash-ripple {
          0% {
            transform: scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes splash-left {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-22px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes splash-right {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(22px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes tree-bounce {
          0% { transform: scale(1); }
          25% { transform: scale(1.08, 0.94) translateY(-5px); }
          50% { transform: scale(0.96, 1.04) translateY(0); }
          75% { transform: scale(1.02, 0.98); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes float-up-growth {
          0% {
            transform: translate(-50%, 10px) scale(0.6);
            opacity: 0;
          }
          30% {
            transform: translate(-50%, -20px) scale(1.1);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -40px) scale(1.0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -60px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>

      {/* Daily Mission 预览抽屉/模态框 */}
      {showMissionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '480px',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            border: '3px solid #2B2B2B',
            borderBottom: 'none',
            padding: '24px 20px calc(30px + env(safe-area-inset-bottom, 0px))',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2B2B2B' }}>Daily Missions</h3>
                  <span style={{
                    background: '#EDE7F6',
                    color: '#5E35B1',
                    border: '1px solid #D1C4E9',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    letterSpacing: '0.3px'
                  }}>
                    MYT (UTC+8)
                  </span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#666666', marginTop: '3px' }}>
                  Resets in: <span style={{ color: '#E65100', fontFamily: 'monospace', fontWeight: 900, fontSize: '13px' }}>{countdown}</span> (at 00:00)
                </p>
              </div>
              <button 
                onClick={() => setShowMissionModal(false)}
                style={{
                  background: '#F0F0F0',
                  border: '2px solid #2B2B2B',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Step 6: 00:00 重置机制提示与快捷测试卡片 */}
            <div style={{
              background: '#F3E5F5',
              border: '1.5px dashed #BA68C8',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#6A1B9A', lineHeight: 1.2 }}>
                  🌙 00:00 Auto Reset (MYT)
                </p>
                <p style={{ fontSize: '10px', color: '#7B1FA2', marginTop: '2px' }}>
                  Missions reset daily. Water & Tree growth are preserved!
                </p>
              </div>
              <button
                onClick={handleSimulateMidnightReset}
                title="Simulate 00:00 midnight reset"
                style={{
                  background: '#8E24AA',
                  color: '#FFFFFF',
                  border: '1.5px solid #4A148C',
                  borderRadius: '10px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 0 #4A148C'
                }}
              >
                🔄 Test Reset
              </button>
            </div>

            {/* 3 个每日任务卡片（动态渲染） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {missionsList.map(mission => {
                const isReadyToClaim = !mission.claimed && (mission.progress >= mission.target);
                const isDone = mission.claimed;
                const progressPercent = Math.min(100, Math.round((mission.progress / mission.target) * 100));

                return (
                  <div 
                    key={mission.id}
                    style={{
                      background: isReadyToClaim ? '#F1F8E9' : isDone ? '#F5F5F5' : '#FAF9F5',
                      border: isReadyToClaim ? '2px solid #4CAF50' : '2px solid #E0DCCD',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: isReadyToClaim ? '0 3px 0px #2E7D32' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            color: isDone ? '#888888' : '#2B2B2B',
                            lineHeight: 1.2
                          }}>
                            {mission.title}
                          </p>
                          {isDone && (
                            <span style={{
                              fontSize: '10px',
                              background: '#E0E0E0',
                              color: '#616161',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 800
                            }}>
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isDone ? '#9E9E9E' : '#666666',
                          marginTop: '3px'
                        }}>
                          Progress: {mission.progress} / {mission.target}
                        </p>
                      </div>

                      {/* 领取 / 状态区 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isDone ? (
                          <span style={{
                            background: '#EEEEEE',
                            color: '#757575',
                            border: '1.5px solid #BDBDBD',
                            borderRadius: '12px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 900,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✓ CLAIMED
                          </span>
                        ) : isReadyToClaim ? (
                          <button
                            onClick={() => handleClaimReward(mission.id)}
                            style={{
                              background: '#4CAF50',
                              color: '#FFFFFF',
                              border: '2px solid #2B2B2B',
                              borderRadius: '12px',
                              padding: '8px 14px',
                              fontSize: '12px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              boxShadow: '0 3px 0 #1B5E20',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              letterSpacing: '0.3px'
                            }}
                          >
                            <Droplet size={13} fill="#FFFFFF" color="#FFFFFF" />
                            CLAIM +{mission.reward}
                          </button>
                        ) : (
                          <>
                            <div style={{
                              background: '#E8F4FD',
                              color: '#0288D1',
                              border: '1.5px solid #29B6F6',
                              borderRadius: '12px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: 900,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Droplet size={13} fill="#29B6F6" /> +{mission.reward}
                            </div>
                            <button
                              onClick={() => handleTestCompleteMission(mission.id)}
                              title="Simulate completing this mission for testing"
                              style={{
                                background: '#FFF8E1',
                                color: '#F57F17',
                                border: '1px dashed #FFB300',
                                borderRadius: '8px',
                                padding: '5px 7px',
                                fontSize: '10px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              ⚡ Test
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 单个任务进度条 */}
                    <div style={{
                      height: '6px',
                      width: '100%',
                      background: '#EAE5D9',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: isDone ? '#BDBDBD' : isReadyToClaim ? '#4CAF50' : '#29B6F6',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowMissionModal(false);
                if (onGoQuiz) onGoQuiz();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--brand-primary)',
                color: '#000',
                border: '2px solid #2B2B2B',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #2B2B2B'
              }}
            >
              Go to Quiz to Earn Water →
            </button>
          </div>
        </div>
      )}

      {/* Step 9: 100% 树木成熟庆祝与 BP 发放弹窗 (Tree Complete Celebration Modal) */}
      {showCompleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.68)',
          backdropFilter: 'blur(6px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={360} colors={['#FFD54F', '#4CAF50', '#29B6F6', '#FF5722', '#FFFFFF']} />
          
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '380px',
            borderRadius: '28px',
            border: '3px solid #2B2B2B',
            padding: '28px 24px 24px 24px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* 顶部成熟勋章 */}
            <div style={{
              background: '#FFF9C4',
              border: '2px solid #FBC02D',
              borderRadius: '9999px',
              padding: '5px 16px',
              fontSize: '12px',
              fontWeight: 900,
              color: '#F57F17',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}>
              <Award size={16} color="#F57F17" />
              <span>TREE FULLY GROWN!</span>
            </div>

            {/* 成熟五阶段大树图示 */}
            <div style={{
              width: '160px',
              height: '160px',
              margin: '2px 0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TreeRenderer growth={100} treeId={currentTree.id} />
            </div>

            <h3 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#2B2B2B',
              lineHeight: 1.2
            }}>
              Congratulations!
            </h3>

            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#666',
              marginTop: '6px',
              lineHeight: 1.4
            }}>
              Your <strong style={{ color: '#2E7D32' }}>{currentTree.name}</strong> is 100% mature and ready to harvest!
            </p>

            {/* 奖励展示卡片 */}
            <div style={{
              marginTop: '16px',
              width: '100%',
              background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
              border: '2px solid #FBC02D',
              borderRadius: '20px',
              padding: '14px 16px',
              boxShadow: '0 4px 0px #FBC02D'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Star size={24} fill="#FFB300" color="#FF8F00" />
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#E65100' }}>
                  +{currentTree.rewardBP} BP
                </span>
              </div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#B78103', marginTop: '4px' }}>
                One-time Tree Completion Reward
              </p>
            </div>

            {/* 领取并继续按键 */}
            <button
              onClick={handleCollectTreeReward}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '16px',
                background: 'var(--brand-primary)',
                color: '#000000',
                border: '3px solid #2B2B2B',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 5px 0px #2B2B2B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.1s ease'
              }}
            >
              <span>Collect {currentTree.rewardBP} BP & Continue</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Garden;
