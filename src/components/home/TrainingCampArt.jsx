import React from 'react';

/**
 * TrainingCampArt
 * World Tree Floating Island & Castle Sanctuary.
 * Features:
 * - High-res fantasy background: Golden World Tree & floating citadel
 * - 树（The World Tree）: Celestial breathing halo & trunk rune pulse
 * - 树的门（The Tree's Doorway）: Radiant golden arched portal breathing light (matching the original beacon rhythm)
 * - Subtle ambient floating golden leaves
 */
const TrainingCampArt = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <style>{`
        /* 树的门：金色大门呼吸律动（呼应原版红点呼吸节奏） */
        @keyframes doorBreathGlow {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.92);
            filter: drop-shadow(0 0 10px rgba(255, 188, 0, 0.65));
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
            filter: drop-shadow(0 0 26px rgba(255, 215, 0, 0.95)) drop-shadow(0 0 42px rgba(245, 158, 11, 0.85));
          }
        }

        /* 树的门内核心光斑 */
        @keyframes doorCoreSparkle {
          0%, 100% {
            opacity: 0.7;
            transform: scale(0.88);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        /* 树的核心：树干符文与神圣光芒呼吸 */
        @keyframes treeRunePulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(0.94);
            filter: drop-shadow(0 0 8px rgba(255, 235, 150, 0.7));
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 36px rgba(255, 215, 0, 0.9));
          }
        }

        /* 树冠光环：神圣世界树天界光环缓释呼吸 */
        @keyframes treeHaloBreathe {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
            filter: drop-shadow(0 0 25px rgba(255, 220, 100, 0.8));
          }
        }

        /* 随风飘落的金色叶片微粒浮动 */
        @keyframes leafDrift1 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.95;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translate(-36px, 110px) rotate(60deg);
            opacity: 0;
          }
        }

        @keyframes leafDrift2 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translate(42px, 130px) rotate(-70deg);
            opacity: 0;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 941 1672"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          {/* 树的门呼吸渐变（金色温润光晕） */}
          <radialGradient id="doorGlowRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="25%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#D97706" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* 树干符文核心渐变 */}
          <radialGradient id="treeRuneRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* 世界树天界光环渐变 */}
          <radialGradient id="treeHaloRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#FEF08A" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* 圣光光柱渐变 */}
          <linearGradient id="celestialBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. 全屏高清背景艺术原图（世界树与浮空神殿） */}
        <image
          href="/backgrounds/home_world_tree.png"
          x="0"
          y="0"
          width="941"
          height="1672"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* 2. 【树】：世界树神圣光环呼吸光层 */}
        <g
          style={{
            transformOrigin: '470.5px 585px',
            animation: 'treeHaloBreathe 4.5s ease-in-out infinite'
          }}
        >
          {/* 天空垂直圣光光柱 */}
          <rect
            x="465"
            y="260"
            width="11"
            height="320"
            fill="url(#celestialBeam)"
            filter="blur(3px)"
          />

          {/* 树冠后方的金色圆环神圣光晕 */}
          <circle
            cx="470.5"
            cy="585"
            r="195"
            fill="url(#treeHaloRadial)"
          />
        </g>

        {/* 3. 【树】：树干中心菱形符文呼吸光（位置：X 470.5, Y 735） */}
        <g
          style={{
            transformOrigin: '470.5px 735px',
            animation: 'treeRunePulse 2.8s ease-in-out infinite'
          }}
        >
          {/* 符文外部放射暖光 */}
          <circle
            cx="470.5"
            cy="735"
            r="42"
            fill="url(#treeRuneRadial)"
          />

          {/* 符文外轮廓 */}
          <path
            d="M 470.5 712 L 487 735 L 470.5 758 L 454 735 Z"
            fill="#FEF08A"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* 符文白金高亮内芯 */}
          <path
            d="M 470.5 720 L 480 735 L 470.5 750 L 461 735 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* 4. 【树的门】：树下城堡大门核心呼吸光（位置：X 470.5, Y 856） */}
        <g
          style={{
            transformOrigin: '470.5px 856px',
            animation: 'doorBreathGlow 3s ease-in-out infinite'
          }}
        >
          {/* 门前广角柔和光雾 */}
          <circle
            cx="470.5"
            cy="856"
            r="68"
            fill="url(#doorGlowRadial)"
          />

          {/* 贴合大门拱形的明亮金色光弧 */}
          <path
            d="M 440 896 L 440 844 Q 470.5 814 501 844 L 501 896 Z"
            fill="url(#doorGlowRadial)"
            opacity="0.95"
          />

          {/* 门内灵动闪烁光核 */}
          <g
            style={{
              transformOrigin: '470.5px 856px',
              animation: 'doorCoreSparkle 1.8s ease-in-out infinite'
            }}
          >
            {/* 门中央小符文 */}
            <path
              d="M 470.5 842 L 478 854 L 470.5 866 L 463 854 Z"
              fill="#FFFFFF"
              filter="drop-shadow(0 0 6px #FFFFFF)"
            />
            {/* 耀眼焦点圆 */}
            <circle
              cx="470.5"
              cy="854"
              r="7"
              fill="#FFFFFF"
            />
            <circle
              cx="470.5"
              cy="854"
              r="14"
              fill="#FEF08A"
              opacity="0.8"
            />
          </g>
        </g>

        {/* 5. 飘散空中的动态金色灵叶微粒 */}
        <g style={{ animation: 'leafDrift1 7s ease-in-out infinite' }}>
          <circle cx="320" cy="540" r="3.5" fill="#FDE047" opacity="0.8" filter="blur(0.5px)" />
          <path d="M 318 538 Q 325 536 322 544 Q 316 542 318 538 Z" fill="#FACC15" />
        </g>
        <g style={{ animation: 'leafDrift2 8.5s ease-in-out infinite 2s' }}>
          <circle cx="610" cy="620" r="3" fill="#FDE047" opacity="0.75" filter="blur(0.5px)" />
          <path d="M 608 618 Q 615 616 612 624 Q 606 622 608 618 Z" fill="#FACC15" />
        </g>
        <g style={{ animation: 'leafDrift1 9s ease-in-out infinite 4s' }}>
          <circle cx="410" cy="780" r="2.8" fill="#FEF08A" opacity="0.7" />
        </g>
        <g style={{ animation: 'leafDrift2 6.5s ease-in-out infinite 1.5s' }}>
          <circle cx="530" cy="810" r="2.5" fill="#FEF08A" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
};

export default TrainingCampArt;
