import React from 'react';
import { BookOpen, Trophy, Award, Sparkles, CheckCircle2, X, Sprout, Droplet, Star } from 'lucide-react';
import TreeRenderer from './TreeRenderer';

const TreeCollectionView = ({ isOpen, onClose, collectionData, onSelectTree }) => {
  if (!isOpen) return null;

  const { trees = [], totalCompleted = 0, totalTrees = 3, totalBPFromGarden = 0, water = 0, currentTreeId } = collectionData || {};
  const progressPercent = Math.round((totalCompleted / totalTrees) * 100);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(8px)',
      zIndex: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FAF7F0',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '92vh',
        borderRadius: '28px',
        border: '3px solid #2B2B2B',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        animation: 'pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: '20px 20px 14px 20px',
          background: '#FFFFFF',
          borderBottom: '2.5px solid #2B2B2B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: '#E8F5E9',
              border: '2px solid #2E7D32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={20} color="#2E7D32" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2B2B2B', margin: 0 }}>
                Plant Codex (树木图鉴)
              </h3>
              <p style={{ fontSize: '11px', color: '#795548', fontWeight: 700, margin: '2px 0 0 0' }}>
                Complete trees to earn BP and expand your codex
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F5F5F5',
              border: '2px solid #2B2B2B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '1px 1px 0px #2B2B2B'
            }}
          >
            <X size={16} color="#2B2B2B" />
          </button>
        </div>

        {/* 滚动内容区 */}
        <div style={{
          padding: '16px 20px 24px 20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* 总收集进度成就卡片 */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%)',
            border: '2.5px solid #2B2B2B',
            borderRadius: '20px',
            padding: '14px 16px',
            boxShadow: '3px 3px 0px #2B2B2B'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={16} color="#F57F17" />
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#E65100' }}>
                  Garden Mastery
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B' }}>
                {totalCompleted} / {totalTrees} Plants ({progressPercent}%)
              </span>
            </div>

            {/* 成就总进度条 */}
            <div style={{
              height: '10px',
              background: '#FFFFFF',
              border: '1.5px solid #2B2B2B',
              borderRadius: '9999px',
              overflow: 'hidden',
              padding: '1.5px'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #FFB300 0%, #F57F17 100%)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* 统计指标行 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px dashed #FFE082'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#795548' }}>TOTAL HARVESTS</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#2B2B2B', marginTop: '1px' }}>
                  {totalCompleted} Plants
                </div>
              </div>
              <div style={{ width: '1px', height: '22px', background: '#FFE082' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#795548' }}>BP EARNED</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#E65100', marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <Star size={13} fill="#FFB300" color="#E65100" />
                  +{totalBPFromGarden} BP
                </div>
              </div>
            </div>
          </div>

          {/* 植物列表卡片 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trees.map((tree) => {
              const isCurrent = tree.id === currentTreeId;
              const isDone = tree.isCompleted;

              return (
                <div
                  key={tree.id}
                  style={{
                    background: '#FFFFFF',
                    border: isCurrent ? '2.5px solid #2E7D32' : '2px solid #2B2B2B',
                    borderRadius: '20px',
                    padding: '14px',
                    boxShadow: isCurrent ? '3px 3px 0px #2E7D32' : '2px 2px 0px #2B2B2B',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative'
                  }}
                >
                  {/* 卡片顶部：植物名字 + 状态徽章 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{tree.icon || '🌱'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#2B2B2B', margin: 0 }}>
                            {tree.name}
                          </h4>
                          {isDone && (
                            <span style={{
                              background: '#C8E6C9',
                              color: '#1B5E20',
                              border: '1px solid #4CAF50',
                              borderRadius: '9999px',
                              padding: '1px 7px',
                              fontSize: '10px',
                              fontWeight: 900,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              <CheckCircle2 size={10} color="#2E7D32" />
                              HARVESTED
                            </span>
                          )}
                          {isCurrent && !isDone && (
                            <span style={{
                              background: '#E8F5E9',
                              color: '#2E7D32',
                              border: '1px solid #81C784',
                              borderRadius: '9999px',
                              padding: '1px 7px',
                              fontSize: '10px',
                              fontWeight: 900
                            }}>
                              PLANTED
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#757575', fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1.3 }}>
                          {tree.description}
                        </p>
                      </div>
                    </div>

                    {/* 奖励 BP 标牌 */}
                    <div style={{
                      background: '#FFF8E1',
                      border: '1.5px solid #FFD54F',
                      borderRadius: '10px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                      <Star size={12} fill="#FFB300" color="#FFA000" />
                      <span style={{ fontSize: '12px', fontWeight: 900, color: '#E65100' }}>
                        +{tree.rewardBP} BP
                      </span>
                    </div>
                  </div>

                  {/* 卡片中部：小尺寸成熟全景缩略图 */}
                  <div style={{
                    background: '#FAF7F0',
                    border: '1.5px solid #E0DCD3',
                    borderRadius: '14px',
                    height: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      transform: 'scale(0.55)',
                      transformOrigin: 'center center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: isDone ? 'none' : isCurrent ? 'none' : 'grayscale(0.35) opacity(0.85)'
                    }}>
                      <TreeRenderer growth={100} treeId={tree.id} />
                    </div>

                    {/* 浮动当前成长提示 */}
                    {isCurrent && (
                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '8px',
                        background: 'rgba(46, 125, 50, 0.9)',
                        color: '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Sprout size={10} color="#FFFFFF" />
                        <span>Growth: {tree.currentGrowth}%</span>
                      </div>
                    )}
                  </div>

                  {/* 卡片底部操作按钮 */}
                  {isCurrent ? (
                    <div style={{
                      padding: '8px 12px',
                      background: '#E8F5E9',
                      border: '1.5px solid #81C784',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <Sprout size={14} color="#2E7D32" />
                      <span>Currently Growing in Your Garden</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectTree(tree.id);
                        onClose();
                      }}
                      style={{
                        padding: '9px 14px',
                        background: isDone ? '#FFFFFF' : '#4CAF50',
                        color: isDone ? '#2B2B2B' : '#FFFFFF',
                        border: '2px solid #2B2B2B',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #2B2B2B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'transform 0.1s ease'
                      }}
                    >
                      <Sprout size={14} color={isDone ? '#2B2B2B' : '#FFFFFF'} />
                      <span>{isDone ? `Replant ${tree.name} 🌱` : `Plant ${tree.name} Now 🌱`}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部关闭栏 */}
        <div style={{
          padding: '12px 20px',
          background: '#FFFFFF',
          borderTop: '2px solid #EAE5D9',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: '#FAF7F0',
              border: '2px solid #2B2B2B',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 900,
              color: '#2B2B2B',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #2B2B2B'
            }}
          >
            Back to Garden
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreeCollectionView;
