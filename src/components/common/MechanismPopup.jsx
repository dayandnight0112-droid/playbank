import React from 'react';
import { Coins, Flame, Zap, ArrowRight } from 'lucide-react';
import PrimaryButton from './PrimaryButton';

const MechanismPopup = ({ type, onClose }) => {
  if (!type) return null;

  const contentMap = {
    bankpoint: {
      iconBg: '#FEF3C7',
      iconBorder: '#F59E0B',
      icon: <Coins size={44} color="#D97706" strokeWidth={2.5} />,
      badge: '🪙 NEW REWARD UNLOCKED',
      badgeColor: '#D97706',
      title: '+10 BankPoint!',
      subtitle: '获得你的第一笔游戏积分！',
      description: '做题、连击、闯关都能持续赚取 BankPoint，未来可用于兑换真实奖品与建设家园。',
      buttonText: '太棒了！收下奖励',
      buttonVariant: 'primary'
    },
    combo: {
      iconBg: '#FEE2E2',
      iconBorder: '#EF4444',
      icon: <Flame size={44} color="#DC2626" fill="#EF4444" />,
      badge: '🔥 STREAK MULTIPLIER',
      badgeColor: '#DC2626',
      title: 'COMBO ×3 BURST!',
      subtitle: '连击火焰点燃！',
      description: '保持连续正确作答，即可激活 Combo 连击加成，获得额外点数与高能评价！',
      buttonText: '保持火热！继续',
      buttonVariant: 'primary'
    },
    speed_challenge: {
      iconBg: '#FEF3C7',
      iconBorder: '#F59E0B',
      icon: <Zap size={44} color="#D97706" fill="#F59E0B" />,
      badge: '⚡ SPEED CHALLENGE',
      badgeColor: '#D97706',
      title: '10 SECOND CHALLENGE',
      subtitle: '极速倒计时挑战来袭！',
      description: '在 10 秒之内凭借直觉和知识迅速答出正确选项，考验你的极速反应！',
      buttonText: '准备好了！开始',
      buttonVariant: 'primary'
    }
  };

  const item = contentMap[type] || contentMap.bankpoint;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '350px',
          borderRadius: '28px',
          border: '3px solid #000000',
          boxShadow: '0 10px 0px #000000',
          padding: '30px 24px 24px',
          textAlign: 'center',
          position: 'relative',
          animation: 'springPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Animated Icon Circle */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: item.iconBg,
            border: `3px solid #000000`,
            boxShadow: '0 5px 0px #000000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            animation: 'floatBob 2.5s ease-in-out infinite'
          }}
        >
          {item.icon}
        </div>

        {/* Small Category Badge */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              color: item.badgeColor,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {item.badge}
          </span>
        </div>

        {/* Big Title */}
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#000000',
            margin: '0 0 6px 0',
            lineHeight: 1.15
          }}
        >
          {item.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: item.badgeColor,
            margin: '0 0 14px 0'
          }}
        >
          {item.subtitle}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#4B5563',
            lineHeight: 1.5,
            margin: '0 0 24px 0',
            background: '#F9FAFB',
            padding: '12px 14px',
            borderRadius: '16px',
            border: '1.5px solid #E5E7EB'
          }}
        >
          {item.description}
        </p>

        {/* Action Button */}
        <PrimaryButton
          onClick={onClose}
          size="normal"
          variant={item.buttonVariant}
          style={{ width: '100%' }}
        >
          {item.buttonText}
        </PrimaryButton>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes springPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default MechanismPopup;
