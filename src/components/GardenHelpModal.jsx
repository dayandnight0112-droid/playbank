import React from 'react';
import { HelpCircle, X, Droplet, Star, Sprout, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

const GardenHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      step: '1',
      icon: <HelpCircle size={18} color="#0288D1" />,
      title: 'Complete Daily Missions',
      desc: 'Answer quiz questions daily in PlayBank to progress your 3 daily missions.'
    },
    {
      step: '2',
      icon: <Droplet size={18} color="#0288D1" />,
      title: 'Claim Water 💧',
      desc: 'Visit Garden and click CLAIM on completed missions. Missions reset at 00:00 (MYT / UTC+8).'
    },
    {
      step: '3',
      icon: <Sprout size={18} color="#2E7D32" />,
      title: 'Water Your Plant (+10% Growth)',
      desc: 'Each watering consumes 1 💧 Water and advances your plant through 5 stages of growth.'
    },
    {
      step: '4',
      icon: <Star size={18} color="#F57F17" />,
      title: 'Harvest BP & Unlock Codex',
      desc: 'When growth reaches 100%, harvest one-time BP rewards (🍎 Apple 80 BP, 🌻 Sunflower 50 BP, 🫘 Bean 30 BP) and unlock the next plant!'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(8px)',
      zIndex: 330,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FAF7F0',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '90vh',
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
          padding: '18px 20px 14px 20px',
          background: '#FFFFFF',
          borderBottom: '2.5px solid #2B2B2B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#E1F5FE',
              border: '2px solid #0288D1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HelpCircle size={18} color="#0288D1" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#2B2B2B', margin: 0 }}>
                Garden Guide & Rules
              </h3>
              <p style={{ fontSize: '11px', color: '#757575', fontWeight: 700, margin: '2px 0 0 0' }}>
                PlayBank Garden V1 游戏指南
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

        {/* 步骤列表内容 */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {rules.map(item => (
            <div
              key={item.step}
              style={{
                background: '#FFFFFF',
                border: '2px solid #2B2B2B',
                borderRadius: '16px',
                padding: '12px 14px',
                boxShadow: '2px 2px 0px #2B2B2B',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#FAF7F0',
                border: '1.5px solid #2B2B2B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 900,
                color: '#2B2B2B',
                flexShrink: 0
              }}>
                {item.step}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#2B2B2B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '11px', color: '#616161', fontWeight: 600, margin: '4px 0 0 0', lineHeight: 1.35 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* 重点保证提示栏 */}
          <div style={{
            background: '#E8F5E9',
            border: '2px solid #4CAF50',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock size={20} color="#2E7D32" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1B5E20', margin: 0, lineHeight: 1.4 }}>
              <strong>Fair Play Guarantee</strong>: Daily missions reset at 00:00 (MYT), but your Water, Tree Growth, and BP are permanently saved and never lost!
            </p>
          </div>
        </div>

        {/* 底部确认按钮 */}
        <div style={{
          padding: '14px 20px',
          background: '#FFFFFF',
          borderTop: '2px solid #EAE5D9'
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '13px',
              background: '#4CAF50',
              color: '#FFFFFF',
              border: '2px solid #2B2B2B',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #2B2B2B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Got it, Let's Grow! 🌱</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GardenHelpModal;
