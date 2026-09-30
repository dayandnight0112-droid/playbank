import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  MailOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Trash2,
  CheckCheck,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { notificationService, NOTIFICATION_TYPES } from '../lib/notificationService';
import { playTapSound, playModalSwooshSound } from '../lib/soundEffects';

const Notifications = ({ onBack, playerId = 'guest', onRequestBooster }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'payment' | 'unread'
  const [selectedNotif, setSelectedNotif] = useState(null);

  // 加载通知
  const loadNotifications = () => {
    const list = notificationService.getNotifications(playerId);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    // 订阅通知更新事件
    const unsubscribe = notificationService.subscribe(() => {
      loadNotifications();
    });

    const handleCustomEvent = () => loadNotifications();
    if (typeof window !== 'undefined') {
      window.addEventListener('playbank:notifications-updated', handleCustomEvent);
      window.addEventListener('playbank:booster-unlocked', handleCustomEvent);
      window.addEventListener('playbank:booster-refunded', handleCustomEvent);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('playbank:notifications-updated', handleCustomEvent);
        window.removeEventListener('playbank:booster-unlocked', handleCustomEvent);
        window.removeEventListener('playbank:booster-refunded', handleCustomEvent);
      }
    };
  }, [playerId]);

  // 全部已读
  const handleMarkAllRead = () => {
    playTapSound();
    notificationService.markAllAsRead(playerId);
    loadNotifications();
  };

  // 清空
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (window.confirm('确定要清空所有通知记录吗？')) {
      playTapSound();
      notificationService.clearAll(playerId);
      loadNotifications();
    }
  };

  // 点击单条通知
  const handleItemClick = (notif) => {
    playTapSound();
    if (!notif.read) {
      notificationService.markAsRead(notif.id, playerId);
      loadNotifications();
    }
    setSelectedNotif(notif);
  };

  // 格式化时间
  const formatTime = (isoString) => {
    if (!isoString) return '刚刚';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '刚刚';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return '刚刚';
      if (diffMins < 60) return `${diffMins} 分钟前`;
      if (diffHours < 24) return `${diffHours} 小时前`;
      return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '刚刚';
    }
  };

  // 过滤通知
  const filteredList = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'payment') {
      return [
        NOTIFICATION_TYPES.PAYMENT_SUCCESS,
        NOTIFICATION_TYPES.PAYMENT_FAILED,
        NOTIFICATION_TYPES.PAYMENT_REFUNDED
      ].includes(n.type);
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '90px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
          padding: 'calc(max(14px, env(safe-area-inset-top, 14px))) 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onBack();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>
                通知中心
              </h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    lineHeight: 1
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
              财务账单与特权到账通知
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              title="全部标为已读"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#CBD5E1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCheck size={14} color="#10B981" />
              <span>已读</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              title="清空记录"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <button
          type="button"
          onClick={() => { playTapSound(); setFilter('all'); }}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: filter === 'all' ? '#FFBC00' : 'rgba(255, 255, 255, 0.08)',
            color: filter === 'all' ? '#000000' : '#94A3B8',
            transition: 'all 0.15s ease'
          }}
        >
          全部 ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => { playTapSound(); setFilter('payment'); }}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: filter === 'payment' ? '#FFBC00' : 'rgba(255, 255, 255, 0.08)',
            color: filter === 'payment' ? '#000000' : '#94A3B8',
            transition: 'all 0.15s ease'
          }}
        >
          💰 账单与特权
        </button>

        <button
          type="button"
          onClick={() => { playTapSound(); setFilter('unread'); }}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: filter === 'unread' ? '#EF4444' : 'rgba(255, 255, 255, 0.08)',
            color: filter === 'unread' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.15s ease'
          }}
        >
          未读 ({unreadCount})
        </button>
      </div>

      {/* 3. Notifications List */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredList.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <MailOpen size={32} color="#475569" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#94A3B8' }}>
              暂无新通知
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', maxWidth: '240px', lineHeight: 1.4 }}>
              当您完成 DuitNow 付款、权益激活或退款处理时，系统通知将第一时间呈现在这里。
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isSuccess = item.type === NOTIFICATION_TYPES.PAYMENT_SUCCESS;
            const isRefund = item.type === NOTIFICATION_TYPES.PAYMENT_REFUNDED;
            const isFailed = item.type === NOTIFICATION_TYPES.PAYMENT_FAILED;

            let iconBadgeBg = '#334155';
            let iconColor = '#94A3B8';
            let IconComponent = Mail;

            if (isSuccess) {
              iconBadgeBg = 'rgba(16, 185, 129, 0.15)';
              iconColor = '#10B981';
              IconComponent = Zap;
            } else if (isRefund) {
              iconBadgeBg = 'rgba(239, 68, 68, 0.15)';
              iconColor = '#F87171';
              IconComponent = RotateCcw;
            } else if (isFailed) {
              iconBadgeBg = 'rgba(245, 158, 11, 0.15)';
              iconColor = '#F59E0B';
              IconComponent = AlertTriangle;
            }

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  backgroundColor: item.read ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.95)',
                  border: item.read ? '1.5px solid rgba(255, 255, 255, 0.06)' : '1.5px solid rgba(255, 188, 0, 0.35)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  boxShadow: item.read ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Left Icon Badge */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: iconBadgeBg,
                    border: `1.5px solid ${iconColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <IconComponent size={20} color={iconColor} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: item.read ? 700 : 900,
                          color: item.read ? '#E2E8F0' : '#FFFFFF',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            flexShrink: 0,
                            boxShadow: '0 0 6px #EF4444'
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatTime(item.createdAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '12px',
                      color: item.read ? '#94A3B8' : '#CBD5E1',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.message}
                  </p>

                  {/* Metadata Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {item.amount && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: isSuccess ? '#34D399' : '#F87171'
                        }}
                      >
                        RM {Number(item.amount).toFixed(2)}
                      </span>
                    )}

                    {item.transactionId && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#64748B'
                        }}
                      >
                        #{item.transactionId.slice(-6)}
                      </span>
                    )}

                    {isSuccess && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 188, 0, 0.15)',
                          color: '#FBBF24'
                        }}
                      >
                        ⚡ 10次上限 + 3× BP
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: '#475569' }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Notification Detail Modal */}
      {selectedNotif && (
        <div
          onClick={() => setSelectedNotif(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: selectedNotif.type === NOTIFICATION_TYPES.PAYMENT_SUCCESS ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {selectedNotif.type === NOTIFICATION_TYPES.PAYMENT_SUCCESS ? (
                  <Zap size={20} color="#10B981" />
                ) : (
                  <RotateCcw size={20} color="#F87171" />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                  {selectedNotif.title}
                </h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {formatTime(selectedNotif.createdAt)}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 16px' }}>
              {selectedNotif.message}
            </p>

            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '18px',
                fontSize: '11px',
                color: '#94A3B8',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {selectedNotif.amount && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>交易金额：</span>
                  <strong style={{ color: '#FFFFFF' }}>RM {Number(selectedNotif.amount).toFixed(2)}</strong>
                </div>
              )}
              {selectedNotif.transactionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>交易流水号：</span>
                  <span style={{ fontFamily: 'monospace', color: '#E2E8F0' }}>{selectedNotif.transactionId}</span>
                </div>
              )}
              {selectedNotif.details?.reason && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>原因说明：</span>
                  <span style={{ color: '#F87171' }}>{selectedNotif.details.reason}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>核验状态：</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>系统权威授时对齐</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotif(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: '#FFBC00',
                border: 'none',
                color: '#000000',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
