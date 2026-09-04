import { useState, useEffect } from 'react';
import { Droplet, Star, Sparkles, ChevronRight, CheckCircle2, Sprout } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import TreeRenderer, { getStageByGrowth } from '../components/TreeRenderer';

const Garden = ({ userBP = 0, onGoQuiz }) => {
  const treesConfig = mockDb.getTreesConfig();
  const [gardenState, setGardenState] = useState(() => mockDb.getGardenState());
  const [showMissionModal, setShowMissionModal] = useState(false);

  const currentTree = treesConfig.find(t => t.id === gardenState.currentTreeId) || treesConfig[0];
  const stageInfo = getStageByGrowth(gardenState.growth);
  const [toastMessage, setToastMessage] = useState(null);

  const handleWaterClick = () => {
    const result = mockDb.waterTree();
    if (result.error) {
      setToastMessage(result.error);
      setTimeout(() => setToastMessage(null), 3200);
    } else {
      setGardenState(result.gardenState);
    }
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
            {Number(userBP).toLocaleString()} BP
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
            <span style={{
              background: '#FFF3C4',
              color: '#B78103',
              fontSize: '11px',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '8px',
              border: '1px solid #FFE082'
            }}>
              0/3 Done
            </span>
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
            background: '#E8F5E9',
            border: '1.5px solid #66BB6A',
            borderRadius: '9999px',
            padding: '3px 12px'
          }}>
            <Sprout size={13} color="#2E7D32" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2E7D32' }}>
              Stage {stageInfo.stage}: {stageInfo.name} ({gardenState.growth}%)
            </span>
          </div>
        </div>

        {/* 2D 树木动态五阶段渲染器 */}
        <TreeRenderer growth={gardenState.growth} treeId={currentTree.id} />

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

      {/* 底部浇水操作区域（Water Button） */}
      <div style={{
        padding: '0 24px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button
          onClick={handleWaterClick}
          style={{
            width: '100%',
            maxWidth: '340px',
            padding: '16px 24px',
            backgroundColor: gardenState.water > 0 ? '#29B6F6' : '#B0BEC5',
            color: '#FFFFFF',
            border: '3px solid #2B2B2B',
            borderRadius: '24px',
            fontSize: '17px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: gardenState.water > 0 ? '0 5px 0px #0277BD, 0 8px 12px rgba(0,0,0,0.15)' : '0 4px 0px #78909C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            letterSpacing: '0.5px'
          }}
        >
          <Droplet size={24} fill="#FFFFFF" color="#FFFFFF" />
          <span>WATER TREE</span>
          <span style={{
            fontSize: '12px',
            background: 'rgba(0,0,0,0.2)',
            padding: '2px 8px',
            borderRadius: '9999px'
          }}>
            -1 💧
          </span>
        </button>

        <p style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#8A8A8A',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {gardenState.water > 0 
            ? 'Water your tree to help it grow (+10% Growth)' 
            : 'Complete Daily Missions to earn more Water!'}
        </p>
      </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2B2B2B' }}>Daily Missions</h3>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#777', marginTop: '2px' }}>
                  Resets daily at 00:00 (Malaysia Time)
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

            {/* 3 个每日任务卡片预览 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Mission 1 */}
              <div style={{
                background: '#FAF9F5',
                border: '2px solid #E0DCCD',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B' }}>Complete 1 Quiz</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginTop: '2px' }}>Progress: 0 / 1</p>
                </div>
                <div style={{
                  background: '#E8F4FD',
                  color: '#0288D1',
                  border: '1.5px solid #29B6F6',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Droplet size={14} fill="#29B6F6" /> +1
                </div>
              </div>

              {/* Mission 2 */}
              <div style={{
                background: '#FAF9F5',
                border: '2px solid #E0DCCD',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B' }}>Answer 10 Questions</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginTop: '2px' }}>Progress: 0 / 10</p>
                </div>
                <div style={{
                  background: '#E8F4FD',
                  color: '#0288D1',
                  border: '1.5px solid #29B6F6',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Droplet size={14} fill="#29B6F6" /> +1
                </div>
              </div>

              {/* Mission 3 */}
              <div style={{
                background: '#FAF9F5',
                border: '2px solid #E0DCCD',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B' }}>Get 5 Correct Answers</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginTop: '2px' }}>Progress: 0 / 5</p>
                </div>
                <div style={{
                  background: '#E8F4FD',
                  color: '#0288D1',
                  border: '1.5px solid #29B6F6',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Droplet size={14} fill="#29B6F6" /> +1
                </div>
              </div>
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
    </div>
  );
};

export default Garden;
