import React from 'react';

/**
 * TrainingCampArt
 * Vector illustration of Chapter 1: Training Camp (新兵训练营地).
 * Strict Design:
 * - Pure RPG Adventure Camp: Tent, Campfire, Stone Road, Distant Fortress Gate, Training Target.
 * - NO Mascots / Animals.
 * - NO Classroom / School elements.
 * - Subtle ambient animations: Clouds, Torches, Banner sway, Fireflies.
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
        @keyframes cloudFloatLeft {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(24px); }
        }
        @keyframes cloudFloatRight {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-20px); }
        }
        @keyframes torchPulse {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 8px #F59E0B); }
        }
        @keyframes fireflyDrift1 {
          0% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-40px) translateX(15px); opacity: 0.9; }
          100% { transform: translateY(-80px) translateX(-10px); opacity: 0; }
        }
        @keyframes fireflyDrift2 {
          0% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-35px) translateX(-18px); opacity: 0.85; }
          100% { transform: translateY(-70px) translateX(8px); opacity: 0; }
        }
        @keyframes bannerFlutter {
          0%, 100% { transform: rotate(0deg) skewY(0deg); }
          50% { transform: rotate(3deg) skewY(1.5deg); }
        }
        @keyframes campGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>

      <svg
        viewBox="0 0 400 640"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="tcSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="35%" stopColor="#1C2541" />
            <stop offset="65%" stopColor="#1E3A3B" />
            <stop offset="100%" stopColor="#0D2818" />
          </linearGradient>

          {/* Distant Mountain Gradients */}
          <linearGradient id="tcMountainFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="tcMountainNear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#162E2F" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Ground & Winding Road Gradients */}
          <linearGradient id="tcGround" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F2B1D" />
            <stop offset="60%" stopColor="#091A12" />
            <stop offset="100%" stopColor="#05100B" />
          </linearGradient>

          <linearGradient id="tcRoad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350F" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#92400E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0.9" />
          </linearGradient>

          {/* Torch / Fire Glow Radial Filter */}
          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#EF4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#DC2626" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. SKY BASE */}
        <rect width="400" height="640" fill="url(#tcSky)" />

        {/* Stars & Celestial Mist */}
        <g opacity="0.6">
          <circle cx="60" cy="45" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="120" cy="70" r="1" fill="#FFFFFF" opacity="0.5" />
          <circle cx="190" cy="35" r="1.8" fill="#FDE68A" opacity="0.9" />
          <circle cx="280" cy="60" r="1.2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="340" cy="30" r="2" fill="#FFFFFF" opacity="0.85" />
          <circle cx="95" cy="110" r="1" fill="#FFFFFF" opacity="0.4" />
          <circle cx="310" cy="95" r="1.2" fill="#FFFFFF" opacity="0.5" />
          {/* Crescent Moon */}
          <path
            d="M 330 50 A 18 18 0 0 0 348 68 A 20 20 0 1 1 330 50 Z"
            fill="#FEF08A"
            opacity="0.85"
            filter="drop-shadow(0 0 6px rgba(254, 240, 138, 0.6))"
          />
        </g>

        {/* 2. FLOATING CLOUDS (Subtle Ambient Motion) */}
        <g style={{ animation: 'cloudFloatLeft 14s ease-in-out infinite' }} opacity="0.25">
          <path
            d="M 30 110 Q 50 95 80 100 Q 110 90 130 105 Q 150 120 120 125 Q 60 130 30 110 Z"
            fill="#94A3B8"
          />
        </g>
        <g style={{ animation: 'cloudFloatRight 18s ease-in-out infinite' }} opacity="0.2">
          <path
            d="M 230 130 Q 260 115 290 120 Q 320 110 340 125 Q 360 140 330 145 Q 260 150 230 130 Z"
            fill="#94A3B8"
          />
        </g>

        {/* 3. DISTANT MOUNTAIN SILHOUETTES */}
        {/* Far Mountains */}
        <polygon
          points="-20,270 50,180 140,250 220,165 310,240 420,175 420,380 -20,380"
          fill="url(#tcMountainFar)"
        />

        {/* 4. DISTANT LOCKED BOSS CITADEL / STONE ARCH ON RIDGE */}
        <g transform="translate(160, 150)">
          {/* Distant Gate Silhouette */}
          <rect x="25" y="15" width="30" height="30" rx="4" fill="#0B132B" opacity="0.95" />
          {/* Gate Arch */}
          <path d="M 30 45 L 30 28 Q 40 20 50 28 L 50 45 Z" fill="#050814" />
          {/* Distant Lock / Warning Ruby Beacon */}
          <circle
            cx="40"
            cy="27"
            r="8"
            fill="url(#crystalGlow)"
            style={{ animation: 'torchPulse 3s ease-in-out infinite' }}
          />
          <circle cx="40" cy="27" r="2.5" fill="#EF4444" />
        </g>

        {/* Near Pine Tree Ridges */}
        <polygon
          points="-10,340 40,270 90,320 170,260 250,330 330,275 410,335 410,450 -10,450"
          fill="url(#tcMountainNear)"
        />

        {/* 5. FOREGROUND / MIDGROUND ROLLING HILLS */}
        <path
          d="M -20 380 Q 80 340 200 370 T 420 360 L 420 640 L -20 640 Z"
          fill="url(#tcGround)"
        />

        {/* 6. WINDING STONE ROAD (Extends into the distance) */}
        <path
          d="M 130 640 C 150 540 140 470 185 410 C 195 395 200 380 200 360 L 212 360 C 210 380 205 395 198 410 C 165 470 185 540 270 640 Z"
          fill="url(#tcRoad)"
        />

        {/* Stone pavers on road */}
        <g fill="#451A03" opacity="0.55">
          <ellipse cx="195" cy="400" rx="5" ry="2" />
          <ellipse cx="188" cy="425" rx="7" ry="2.5" />
          <ellipse cx="178" cy="455" rx="10" ry="3.5" />
          <ellipse cx="172" cy="495" rx="14" ry="4.5" />
          <ellipse cx="185" cy="545" rx="18" ry="5.5" />
          <ellipse cx="205" cy="600" rx="22" ry="7" />
        </g>

        {/* 7. ADVENTURE CAMP ELEMENTS */}

        {/* Left Side: Adventurer's Camp Tent */}
        <g transform="translate(18, 380)">
          {/* Tent Shadow */}
          <ellipse cx="50" cy="72" rx="42" ry="10" fill="#030712" opacity="0.7" />
          {/* Tent Canvas Body */}
          <polygon points="50,10 90,70 10,70" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          {/* Tent Front Flap Opening */}
          <polygon points="50,10 65,70 35,70" fill="#0F172A" />
          {/* Tent Inner Lantern Glow */}
          <ellipse cx="50" cy="65" rx="12" ry="6" fill="#F59E0B" opacity="0.75" />
          {/* Support Pegs */}
          <line x1="50" y1="10" x2="50" y2="4" stroke="#78350F" strokeWidth="2" />
          <line x1="10" y1="70" x2="2" y2="74" stroke="#78350F" strokeWidth="2" />
          <line x1="90" y1="70" x2="98" y2="74" stroke="#78350F" strokeWidth="2" />
        </g>

        {/* Right Side: Training Target / Wooden Dummy (Pure RPG Vibe, NO School) */}
        <g transform="translate(305, 395)">
          {/* Target Shadow */}
          <ellipse cx="25" cy="65" rx="18" ry="6" fill="#030712" opacity="0.6" />
          {/* Wooden Stand */}
          <line x1="25" y1="65" x2="25" y2="25" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="65" x2="25" y2="45" stroke="#92400E" strokeWidth="2.5" />
          <line x1="38" y1="65" x2="25" y2="45" stroke="#92400E" strokeWidth="2.5" />
          {/* Straw Archery Target */}
          <circle cx="25" cy="25" r="18" fill="#B45309" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="25" cy="25" r="12" fill="#DC2626" />
          <circle cx="25" cy="25" r="7" fill="#FEF08A" />
          <circle cx="25" cy="25" r="3" fill="#DC2626" />
        </g>

        {/* Center-Left: Campfire / Lantern Torch */}
        <g transform="translate(100, 440)">
          {/* Campfire Stone Ring */}
          <ellipse cx="25" cy="30" rx="16" ry="6" fill="#1F2937" stroke="#374151" strokeWidth="2" />
          {/* Firewood Logs */}
          <line x1="14" y1="32" x2="36" y2="28" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="28" x2="34" y2="32" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          {/* Ambient Warm Glow */}
          <circle
            cx="25"
            cy="24"
            r="38"
            fill="url(#fireGlow)"
            style={{ animation: 'campGlow 2.5s ease-in-out infinite' }}
          />
          {/* Flame Core */}
          <path
            d="M 25 10 Q 30 18 29 26 Q 25 30 21 26 Q 20 18 25 10 Z"
            fill="#F59E0B"
            style={{ animation: 'torchPulse 1.2s ease-in-out infinite', transformOrigin: '25px 26px' }}
          />
          <path
            d="M 25 16 Q 28 21 27 26 Q 25 28 23 26 Q 22 21 25 16 Z"
            fill="#FEF08A"
          />
        </g>

        {/* Left Guild Pennant / Banner Waving in Wind */}
        <g
          transform="translate(138, 350)"
          style={{ animation: 'bannerFlutter 4s ease-in-out infinite', transformOrigin: '138px 410px' }}
        >
          {/* Pole */}
          <line x1="0" y1="60" x2="0" y2="0" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3" fill="#FBBF24" />
          {/* Triangular Pennant */}
          <polygon points="0,4 28,14 0,26" fill="#DC2626" />
          <polygon points="0,7 20,14 0,22" fill="#EF4444" />
          {/* Gold Insignia on Pennant */}
          <circle cx="7" cy="14" r="2.5" fill="#FBBF24" />
        </g>

        {/* 8. FLOATING AMBIENT FIREFLIES / EMBERS */}
        <g>
          <circle
            cx="125"
            cy="450"
            r="2"
            fill="#FDE68A"
            style={{ animation: 'fireflyDrift1 4.5s ease-out infinite' }}
            filter="drop-shadow(0 0 4px #F59E0B)"
          />
          <circle
            cx="145"
            cy="465"
            r="1.8"
            fill="#FEF08A"
            style={{ animation: 'fireflyDrift2 5.5s ease-out 1.5s infinite' }}
            filter="drop-shadow(0 0 3px #FBBF24)"
          />
          <circle
            cx="210"
            cy="430"
            r="1.5"
            fill="#FDE68A"
            style={{ animation: 'fireflyDrift1 6s ease-out 2.5s infinite' }}
            filter="drop-shadow(0 0 3px #F59E0B)"
          />
          <circle
            cx="285"
            cy="480"
            r="1.8"
            fill="#FEF08A"
            style={{ animation: 'fireflyDrift2 5s ease-out 0.8s infinite' }}
            filter="drop-shadow(0 0 3px #F59E0B)"
          />
        </g>

        {/* 9. BOTTOM VIGNETTE / ATMOSPHERIC DEPTH */}
        {/* Soft dark vignette so text/buttons overlaid remain ultra-legible */}
        <rect
          x="0"
          y="420"
          width="400"
          height="220"
          fill="url(#bottomShadowGradient)"
          opacity="0.85"
        />
        <linearGradient id="bottomShadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" stopOpacity="0" />
          <stop offset="50%" stopColor="#091322" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#050B14" stopOpacity="0.95" />
        </linearGradient>
      </svg>
    </div>
  );
};

export default TrainingCampArt;
