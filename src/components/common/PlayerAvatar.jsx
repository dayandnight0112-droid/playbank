import React, { useState } from 'react';
import { getPlayerAvatarConfig, DEFAULT_AVATAR_ID, PLAYER_AVATARS } from '../../data/playerAvatars';

/**
 * PlayerAvatar
 * Unified, single source of truth avatar component for PlayBank.
 * Automatically resolves avatar assets, handles broken image fallbacks,
 * and maintains consistent PlayBank game aesthetics.
 */
const PlayerAvatar = ({
  avatarId = DEFAULT_AVATAR_ID,
  avatarUrl = null,
  size = 48,
  borderWidth = 2.5,
  borderColor = '#000000',
  showBorder = true,
  shadow = true,
  className = '',
  style = {},
  imgStyle = {},
  alt = 'Player Avatar',
  onClick = null,
  badge = null,
  badgePosition = 'bottom-right'
}) => {
  const [hasError, setHasError] = useState(false);
  const avatarConfig = getPlayerAvatarConfig(avatarId);

  // If custom avatarUrl is provided and has not errored, use it; otherwise use preset avatar config
  const imageSrc = !hasError && avatarUrl ? avatarUrl : avatarConfig.src;
  const fallbackSrc = PLAYER_AVATARS[DEFAULT_AVATAR_ID].src;

  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 48;
  const sizePx = typeof size === 'number' ? `${size}px` : size;

  // Scale shadow and border naturally with size if not explicitly custom
  const computedShadow = shadow === true
    ? numericSize >= 80 ? '0 4px 0 #000000' : '0 2.5px 0 #000000'
    : (shadow || 'none');

  const avatarCircle = (
    <div
      className={`player-avatar-frame ${className}`}
      onClick={onClick}
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        background: 'radial-gradient(circle, #FFFBEB 35%, #FEF08A 100%)',
        border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
        boxShadow: computedShadow,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      <img
        src={imageSrc}
        alt={alt || avatarConfig.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...imgStyle
        }}
        onError={(e) => {
          if (!hasError) {
            setHasError(true);
            e.currentTarget.src = fallbackSrc;
          }
        }}
        draggable={false}
      />
    </div>
  );

  if (!badge) {
    return avatarCircle;
  }

  // If badge is present, wrap in relative positioning container
  const badgePositionStyle = badgePosition === 'bottom-right'
    ? { bottom: 0, right: 0 }
    : badgePosition === 'bottom-left'
    ? { bottom: 0, left: 0 }
    : badgePosition === 'top-right'
    ? { top: 0, right: 0 }
    : { top: 0, left: 0 };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: sizePx,
        height: sizePx,
        flexShrink: 0
      }}
    >
      {avatarCircle}
      <div
        style={{
          position: 'absolute',
          ...badgePositionStyle,
          zIndex: 2,
          lineHeight: 0
        }}
      >
        {badge}
      </div>
    </div>
  );
};

export default PlayerAvatar;
