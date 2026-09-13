import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { PLAYER_AVATAR_LIST, DEFAULT_AVATAR_ID } from '../data/playerAvatars';
import PlayerAvatar from './common/PlayerAvatar';
import { mockDb } from '../lib/mockDb';
import { playerAuthService } from '../lib/playerAuthService';

/**
 * AvatarPickerModal
 * Playful PlayBank modal for selecting and switching player avatar.
 * Supports Guests and Registered accounts with instant persistent updates.
 */
const AvatarPickerModal = ({
  isOpen,
  onClose,
  currentAvatarId = DEFAULT_AVATAR_ID,
  onAvatarUpdated = null
}) => {
  const [selectedId, setSelectedId] = useState(currentAvatarId || DEFAULT_AVATAR_ID);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentAvatarId || DEFAULT_AVATAR_ID);
    }
  }, [isOpen, currentAvatarId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // 1. Update avatar in mockDb (supports both Guest and Registered user)
      const res = mockDb.updatePlayerAvatar({
        avatarType: 'preset',
        avatarId: selectedId,
        avatarUrl: null
      });

      // 2. Sync to Supabase profile if registered
      try {
        const authUserId = playerAuthService.getUserId();
        if (authUserId) {
          await playerAuthService.syncProfileMetadata({
            avatar_id: selectedId,
            avatar_type: 'preset',
            avatar_url: null
          });
        }
      } catch (err) {
        console.warn('[AvatarPickerModal] Supabase sync note:', err);
      }

      if (typeof onAvatarUpdated === 'function') {
        onAvatarUpdated(selectedId, res);
      }
      onClose();
    } catch (e) {
      console.error('[AvatarPickerModal] Failed to update avatar:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '3.5px solid #000000',
          boxShadow: '0 8px 0 #000000',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'avatarModalPop 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFCE00 0%, #FFB800 100%)',
            padding: '18px 20px',
            borderBottom: '3px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} color="#FFCE00" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.2
                }}
              >
                选择你的头像
              </h2>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#5C4300',
                  margin: 0
                }}
              >
                Choose Your Avatar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #000000',
              boxShadow: '0 2.5px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <X size={18} color="#000000" strokeWidth={3} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          <p
            style={{
              fontSize: '13px',
              color: '#6B7280',
              fontWeight: 600,
              margin: '0 0 16px 0',
              textAlign: 'center',
              lineHeight: 1.4
            }}
          >
            挑选你最喜爱的代表形象，头像将在主页、排行榜及结算对局中统一同步显示。
          </p>

          {/* Avatar Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            {PLAYER_AVATAR_LIST.map((avatar) => {
              const isSelected = selectedId === avatar.id;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedId(avatar.id)}
                  style={{
                    position: 'relative',
                    backgroundColor: isSelected ? '#FFFBEB' : '#F9FAFB',
                    border: isSelected ? '3px solid #000000' : '2px solid #E5E7EB',
                    borderRadius: '18px',
                    boxShadow: isSelected ? '0 5px 0 #000000' : '0 2px 0 rgba(0,0,0,0.04)',
                    padding: '16px 12px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    userSelect: 'none'
                  }}
                >
                  {/* Selected checkmark indicator */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '2px solid #000000',
                        boxShadow: '0 1.5px 0 #000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3
                      }}
                    >
                      <Check size={14} color="#FFFFFF" strokeWidth={3.5} />
                    </div>
                  )}

                  {/* Avatar Circle Display */}
                  <PlayerAvatar
                    avatarId={avatar.id}
                    size={68}
                    borderWidth={isSelected ? 3 : 2}
                    borderColor={isSelected ? '#000000' : '#D1D5DB'}
                    shadow={false}
                  />

                  {/* Avatar Name */}
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#111827',
                      textAlign: 'center'
                    }}
                  >
                    {avatar.chineseName}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6B7280',
                      textAlign: 'center'
                    }}
                  >
                    {avatar.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: '#F3F4F6',
                border: '2.5px solid #000000',
                boxShadow: '0 3px 0 #000000',
                fontWeight: 800,
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              取消
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: '#FFCE00',
                border: '2.5px solid #000000',
                boxShadow: '0 4px 0 #000000',
                fontWeight: 900,
                fontSize: '15px',
                color: '#000000',
                cursor: isSaving ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(2px)')}
              onMouseUp={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Check size={18} strokeWidth={3} />
              {isSaving ? '保存中...' : '确认使用'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
