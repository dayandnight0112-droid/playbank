// 2D 树木五阶段视觉渲染组件 (TreeRenderer.jsx)
// 支持 Apple Tree (苹果树), Sunflower (向日葵), Bean Plant (魔豆)

export const STAGE_CONFIG = [
  { stage: 1, minGrowth: 0, maxGrowth: 19, name: 'Seed', subtitle: '刚破土的小嫩芽' },
  { stage: 2, minGrowth: 20, maxGrowth: 39, name: 'Sprout', subtitle: '生机勃勃的幼苗' },
  { stage: 3, minGrowth: 40, maxGrowth: 59, name: 'Small Plant', subtitle: '初展新枝的植株' },
  { stage: 4, minGrowth: 60, maxGrowth: 79, name: 'Young Tree', subtitle: '含苞待放的丰盛植株' },
  { stage: 5, minGrowth: 80, maxGrowth: 100, name: 'Full Tree', subtitle: '硕果累累的大植物' }
];

export const getStageByGrowth = (growth) => {
  const g = Math.max(0, Math.min(100, growth || 0));
  if (g < 20) return STAGE_CONFIG[0];
  if (g < 40) return STAGE_CONFIG[1];
  if (g < 60) return STAGE_CONFIG[2];
  if (g < 80) return STAGE_CONFIG[3];
  return STAGE_CONFIG[4];
};

const TreeRenderer = ({ growth = 0, treeId = 'apple' }) => {
  const stageInfo = getStageByGrowth(growth);
  const stage = stageInfo.stage;

  return (
    <div style={{
      position: 'relative',
      width: '240px',
      height: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* 共同泥土底座 (Cozy 2D Mound) */}
        <g id="ground-mound">
          <ellipse cx="120" cy="195" rx="85" ry="24" fill="#E2D6C0" />
          <ellipse cx="120" cy="189" rx="72" ry="19" fill="#8D6E63" />
          <ellipse cx="120" cy="186" rx="64" ry="14" fill="#6D4C41" />
          {/* 小土粒 */}
          <circle cx="95" cy="187" r="3" fill="#4E342E" />
          <circle cx="140" cy="189" r="2.5" fill="#4E342E" />
          <circle cx="118" cy="191" r="2" fill="#5D4037" />
        </g>

        {/* ========================================================
            PLANT 1: APPLE TREE (苹果树)
            ======================================================== */}
        {treeId === 'apple' && (
          <>
            {/* Stage 1: Seed */}
            {stage === 1 && (
              <g transform="translate(120, 178)">
                <ellipse cx="0" cy="2" rx="12" ry="8" fill="#5D4037" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 0,-2 C -8,-18 0,-30 2,-36 C 4,-28 10,-16 0,-2 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 0,-14 C 12,-24 22,-20 24,-15 C 20,-8 10,-7 0,-14 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="18" cy="-15" r="2.5" fill="#E1F5FE" stroke="#0288D1" strokeWidth="1" />
              </g>
            )}

            {/* Stage 2: Sprout */}
            {stage === 2 && (
              <g transform="translate(120, 178)">
                <path d="M -3,0 Q -1,-35 0,-56 Q 3,-35 3,0 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M -1,-22 C -20,-30 -30,-22 -28,-14 C -18,-10 -6,-16 -1,-22 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 1,-30 C 22,-40 32,-32 30,-22 C 20,-18 8,-24 1,-30 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 0,-54 C -16,-68 -24,-58 -18,-50 C -10,-46 -2,-50 0,-54 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 0,-54 C 16,-68 24,-58 18,-50 C 10,-46 2,-50 0,-54 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-57" r="3" fill="#C8E6C9" stroke="#2B2B2B" strokeWidth="1.5" />
              </g>
            )}

            {/* Stage 3: Small Plant */}
            {stage === 3 && (
              <g transform="translate(120, 178)">
                <path d="M -6,0 L -4,-45 L -20,-75 L -14,-78 L 0,-52 L 14,-78 L 20,-75 L 4,-45 L 6,0 Z" fill="#8D6E63" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="-24" cy="-80" r="18" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="-32" cy="-72" r="12" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="24" cy="-80" r="18" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="32" cy="-72" r="12" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="0" cy="-92" r="22" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-96" r="15" fill="#81C784" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="-18" cy="-86" r="3.5" fill="#FFF59D" stroke="#2B2B2B" strokeWidth="1.5" />
                <circle cx="16" cy="-88" r="3.5" fill="#FFF59D" stroke="#2B2B2B" strokeWidth="1.5" />
              </g>
            )}

            {/* Stage 4: Young Tree */}
            {stage === 4 && (
              <g transform="translate(120, 178)">
                <path d="M -10,0 Q -8,-50 -12,-85 L 12,-85 Q 8,-50 10,0 Z" fill="#795548" stroke="#2B2B2B" strokeWidth="3" />
                <path d="M -2,-30 L -2,-55" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-35" cy="-115" r="30" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="35" cy="-115" r="30" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-135" r="36" fill="#43A047" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="-18" cy="-110" r="28" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="20" cy="-108" r="28" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-125" r="30" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <g transform="translate(-24, -100)">
                  <circle cx="0" cy="0" r="6" fill="#FF7043" stroke="#2B2B2B" strokeWidth="1.8" />
                  <path d="M 0,-6 Q 2,-9 4,-8" stroke="#2B2B2B" strokeWidth="1.5" fill="none" />
                </g>
                <g transform="translate(26, -112)">
                  <circle cx="0" cy="0" r="6" fill="#FF7043" stroke="#2B2B2B" strokeWidth="1.8" />
                  <path d="M 0,-6 Q 2,-9 4,-8" stroke="#2B2B2B" strokeWidth="1.5" fill="none" />
                </g>
              </g>
            )}

            {/* Stage 5: Full Tree */}
            {stage === 5 && (
              <g transform="translate(120, 178)">
                <path d="M -16,0 Q -10,-55 -16,-95 L 16,-95 Q 10,-55 16,0 Z" fill="#6D4C41" stroke="#2B2B2B" strokeWidth="3" />
                <path d="M -4,-25 L -4,-65" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 5,-40 L 5,-75" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="-45" cy="-125" r="36" fill="#388E3C" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="45" cy="-125" r="36" fill="#388E3C" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="0" cy="-155" r="42" fill="#2E7D32" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="-25" cy="-120" r="34" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="25" cy="-118" r="34" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="0" cy="-140" r="36" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="0" cy="-150" r="22" fill="#81C784" />
                
                {/* 5 个大苹果 */}
                <g transform="translate(-36, -115)">
                  <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
                  <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                </g>
                <g transform="translate(34, -125)">
                  <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
                  <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                </g>
                <g transform="translate(-10, -145)">
                  <circle cx="0" cy="0" r="8.5" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-3" cy="-3" r="2.2" fill="#FFCDD2" />
                  <path d="M 0,-8.5 Q 2,-12 4,-11" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                </g>
                <g transform="translate(18, -100)">
                  <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
                  <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                </g>
                <g transform="translate(-12, -95)">
                  <circle cx="0" cy="0" r="7.5" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-2" cy="-2" r="2" fill="#FFCDD2" />
                  <path d="M 0,-7.5 Q 2,-10 4,-9" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                </g>
                {/* 地面掉落苹果 */}
                <g transform="translate(48, 6)">
                  <circle cx="0" cy="0" r="7" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
                  <circle cx="-2" cy="-2" r="1.8" fill="#FFCDD2" />
                  <path d="M 0,-7 Q 2,-10 4,-9" stroke="#2B2B2B" strokeWidth="1.5" fill="none" />
                </g>
                {/* 金色闪烁星星 */}
                <g transform="translate(-55, -165)">
                  <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFD700" stroke="#B78103" strokeWidth="1" />
                </g>
                <g transform="translate(55, -155)">
                  <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#FFD700" stroke="#B78103" strokeWidth="1" />
                </g>
              </g>
            )}
          </>
        )}

        {/* ========================================================
            PLANT 2: SUNFLOWER (向日葵)
            ======================================================== */}
        {treeId === 'sunflower' && (
          <>
            {/* Stage 1: Seed */}
            {stage === 1 && (
              <g transform="translate(120, 178)">
                {/* 向日葵条纹黑葵花籽 */}
                <ellipse cx="0" cy="3" rx="11" ry="6" fill="#37474F" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M -8,3 L 8,3" stroke="#ECEFF1" strokeWidth="1.5" strokeLinecap="round" />
                {/* 金黄嫩芽 */}
                <path d="M 0,-1 C -6,-16 2,-28 4,-34 C 6,-26 12,-14 0,-1 Z" fill="#9CCC65" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="16" cy="-14" r="2.5" fill="#E1F5FE" stroke="#0288D1" strokeWidth="1" />
              </g>
            )}

            {/* Stage 2: Sprout */}
            {stage === 2 && (
              <g transform="translate(120, 178)">
                <path d="M -3,0 L -2,-62 L 2,-62 L 3,0 Z" fill="#7CB342" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 宽阔的向日葵心形大叶片 */}
                <path d="M -2,-25 C -24,-35 -32,-20 -24,-10 C -14,-6 -4,-16 -2,-25 Z" fill="#8BC34A" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 2,-35 C 24,-45 32,-30 24,-20 C 14,-16 4,-26 2,-35 Z" fill="#8BC34A" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-64" r="5" fill="#C0CA33" stroke="#2B2B2B" strokeWidth="2" />
              </g>
            )}

            {/* Stage 3: Flower Bud */}
            {stage === 3 && (
              <g transform="translate(120, 178)">
                <path d="M -4,0 L -3,-80 L 3,-80 L 4,0 Z" fill="#689F38" stroke="#2B2B2B" strokeWidth="3" />
                {/* 丰满大叶 */}
                <path d="M -3,-35 C -30,-48 -40,-30 -30,-16 C -18,-10 -5,-25 -3,-35 Z" fill="#7CB342" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 3,-48 C 30,-62 40,-42 30,-28 C 18,-22 5,-38 3,-48 Z" fill="#7CB342" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 顶端紧裹的花苞 */}
                <circle cx="0" cy="-90" r="18" fill="#558B2F" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-90" r="11" fill="#7CB342" stroke="#2B2B2B" strokeWidth="1.5" />
                <path d="M -12,-90 Q 0,-104 12,-90 Q 0,-76 -12,-90 Z" fill="#9E9D24" stroke="#2B2B2B" strokeWidth="1.5" />
              </g>
            )}

            {/* Stage 4: Opening Sunflower */}
            {stage === 4 && (
              <g transform="translate(120, 178)">
                <path d="M -5,0 L -4,-90 L 4,-90 L 5,0 Z" fill="#558B2F" stroke="#2B2B2B" strokeWidth="3" />
                <path d="M -4,-40 C -34,-54 -44,-34 -32,-18 C -18,-12 -6,-28 -4,-40 Z" fill="#689F38" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 4,-55 C 34,-70 44,-50 32,-32 C 18,-26 6,-42 4,-55 Z" fill="#689F38" stroke="#2B2B2B" strokeWidth="2.5" />
                
                {/* 半绽放的金黄花瓣圈 */}
                <g transform="translate(0, -105)">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                    <ellipse key={i} cx="0" cy="-22" rx="7" ry="14" fill="#FDD835" stroke="#2B2B2B" strokeWidth="2" transform={`rotate(${ang})`} />
                  ))}
                  <circle cx="0" cy="0" r="18" fill="#5D4037" stroke="#2B2B2B" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="12" fill="#795548" />
                </g>
              </g>
            )}

            {/* Stage 5: Radiant Full Sunflower */}
            {stage === 5 && (
              <g transform="translate(120, 178)">
                {/* 挺拔花茎 */}
                <path d="M -6,0 L -5,-95 L 5,-95 L 6,0 Z" fill="#33691E" stroke="#2B2B2B" strokeWidth="3.5" />
                {/* 粗壮大叶 */}
                <path d="M -5,-45 C -42,-65 -54,-40 -38,-20 C -22,-12 -7,-30 -5,-45 Z" fill="#558B2F" stroke="#2B2B2B" strokeWidth="3" />
                <path d="M 5,-60 C 42,-80 54,-55 38,-35 C 22,-27 7,-45 5,-60 Z" fill="#558B2F" stroke="#2B2B2B" strokeWidth="3" />
                
                {/* 巨大金黄盛开向日葵花盘 */}
                <g transform="translate(0, -118)">
                  {/* 外圈高亮大花瓣 16 片 */}
                  {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((ang, i) => (
                    <path
                      key={i}
                      d="M -9,-38 C -14,-56 0,-62 0,-62 C 0,-62 14,-56 9,-38 Z"
                      fill="#FFD54F"
                      stroke="#2B2B2B"
                      strokeWidth="2.5"
                      transform={`rotate(${ang})`}
                    />
                  ))}
                  {/* 内圈温暖金黄花瓣 */}
                  {[11.25, 33.75, 56.25, 78.75, 101.25, 123.75, 146.25, 168.75, 191.25, 213.75, 236.25, 258.75, 281.25, 303.75, 326.25, 348.75].map((ang, i) => (
                    <circle
                      key={`in-${i}`}
                      cx="0"
                      cy="-42"
                      r="9"
                      fill="#FFCA28"
                      stroke="#2B2B2B"
                      strokeWidth="2"
                      transform={`rotate(${ang})`}
                    />
                  ))}

                  {/* 饱满巧克力色花蕊圆盘 */}
                  <circle cx="0" cy="0" r="32" fill="#4E342E" stroke="#2B2B2B" strokeWidth="3" />
                  <circle cx="0" cy="0" r="28" fill="#5D4037" />
                  
                  {/* 葵花籽纹理小点 */}
                  <circle cx="-12" cy="-10" r="2.5" fill="#8D6E63" />
                  <circle cx="10" cy="-12" r="2.5" fill="#8D6E63" />
                  <circle cx="-10" cy="12" r="2.5" fill="#8D6E63" />
                  <circle cx="12" cy="10" r="2.5" fill="#8D6E63" />
                  <circle cx="0" cy="0" r="3" fill="#D7CCC8" />
                  <circle cx="0" cy="-18" r="2" fill="#8D6E63" />
                  <circle cx="0" cy="18" r="2" fill="#8D6E63" />
                  <circle cx="-18" cy="0" r="2" fill="#8D6E63" />
                  <circle cx="18" cy="0" r="2" fill="#8D6E63" />
                </g>

                {/* 阳光金星特效 */}
                <g transform="translate(-65, -155)">
                  <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFF176" stroke="#F57F17" strokeWidth="1" />
                </g>
                <g transform="translate(65, -145)">
                  <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#FFF176" stroke="#F57F17" strokeWidth="1" />
                </g>
              </g>
            )}
          </>
        )}

        {/* ========================================================
            PLANT 3: BEAN PLANT / MAGIC BEAN (魔豆)
            ======================================================== */}
        {treeId === 'bean' && (
          <>
            {/* Stage 1: Seed */}
            {stage === 1 && (
              <g transform="translate(120, 178)">
                {/* 饱满翡翠魔豆裂开 */}
                <path d="M -10,3 C -14,-4 -6,-10 2,-6 C 10,-2 12,8 4,8 C -4,8 -8,6 -10,3 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 卷曲的小萌苗 */}
                <path d="M 0,-4 Q -8,-22 0,-34 Q 4,-24 0,-4 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="14" cy="-16" r="2.5" fill="#E1F5FE" stroke="#0288D1" strokeWidth="1" />
              </g>
            )}

            {/* Stage 2: Sprout */}
            {stage === 2 && (
              <g transform="translate(120, 178)">
                {/* 蜿蜒向上的魔豆幼茎 */}
                <path d="M 0,0 Q -10,-25 0,-50 Q 10,-70 4,-80" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
                {/* 心形豆瓣叶 */}
                <path d="M -6,-28 C -22,-36 -28,-22 -20,-14 C -12,-8 -6,-18 -6,-28 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                <path d="M 5,-50 C 22,-58 28,-44 20,-36 C 12,-30 5,-40 5,-50 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 卷须 */}
                <path d="M 4,-80 Q 12,-88 10,-95 Q 6,-98 8,-102" fill="none" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* Stage 3: Climbing Vine on Stake */}
            {stage === 3 && (
              <g transform="translate(120, 178)">
                {/* 竹制园艺支撑木杆 */}
                <rect x="-3" y="-105" width="6" height="110" rx="2" fill="#D7CCC8" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 缠绕藤蔓 */}
                <path d="M -8,0 Q 10,-25 -8,-50 Q 10,-75 -8,-100 L 0,-102" fill="none" stroke="#388E3C" strokeWidth="4" strokeLinecap="round" />
                {/* 簇生绿叶 */}
                <circle cx="-16" cy="-45" r="11" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="16" cy="-70" r="11" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2" />
                <circle cx="-12" cy="-90" r="10" fill="#81C784" stroke="#2B2B2B" strokeWidth="2" />
                {/* 小白花蕾 */}
                <circle cx="10" cy="-55" r="4" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="1.5" />
                <circle cx="-8" cy="-78" r="4" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="1.5" />
              </g>
            )}

            {/* Stage 4: Trellis with Young Pods */}
            {stage === 4 && (
              <g transform="translate(120, 178)">
                {/* 木架 */}
                <rect x="-4" y="-130" width="8" height="135" rx="2" fill="#BCAAA4" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 茂密藤蔓主轴 */}
                <path d="M -10,0 Q 15,-35 -10,-70 Q 15,-105 -5,-130" fill="none" stroke="#2E7D32" strokeWidth="5" strokeLinecap="round" />
                {/* 浓密叶团 */}
                <circle cx="-22" cy="-60" r="15" fill="#43A047" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="24" cy="-85" r="16" fill="#43A047" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="-15" cy="-115" r="18" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
                {/* 细嫩小豆荚 */}
                <path d="M -22,-50 Q -32,-35 -24,-20" fill="none" stroke="#81C784" strokeWidth="4" strokeLinecap="round" />
                <path d="M 22,-75 Q 32,-60 24,-45" fill="none" stroke="#81C784" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}

            {/* Stage 5: The Enchanted Giant Beanstalk */}
            {stage === 5 && (
              <g transform="translate(120, 178)">
                {/* 木架基石 */}
                <rect x="-5" y="-155" width="10" height="160" rx="2" fill="#8D6E63" stroke="#2B2B2B" strokeWidth="3" />
                {/* 盘旋通天的魔藤巨干 */}
                <path d="M -14,0 Q 20,-45 -14,-90 Q 20,-135 -6,-165" fill="none" stroke="#1B5E20" strokeWidth="8" strokeLinecap="round" />
                <path d="M -12,-5 Q 16,-45 -12,-90 Q 16,-135 -6,-165" fill="none" stroke="#2E7D32" strokeWidth="5" strokeLinecap="round" />
                
                {/* 繁茂大叶丛 */}
                <circle cx="-35" cy="-80" r="22" fill="#2E7D32" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="35" cy="-110" r="24" fill="#2E7D32" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="-20" cy="-145" r="25" fill="#388E3C" stroke="#2B2B2B" strokeWidth="3" />
                <circle cx="20" cy="-155" r="20" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
                <circle cx="0" cy="-170" r="16" fill="#81C784" stroke="#2B2B2B" strokeWidth="2" />

                {/* 饱满垂挂的翡翠魔法大豆荚 1 */}
                <g transform="translate(-32, -65)">
                  <path d="M 0,0 Q -18,22 -6,44 Q -2,22 0,0 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                  <circle cx="-7" cy="14" r="3" fill="#A5D6A7" />
                  <circle cx="-9" cy="26" r="3" fill="#A5D6A7" />
                  <circle cx="-6" cy="36" r="2.5" fill="#A5D6A7" />
                </g>
                {/* 豆荚 2 */}
                <g transform="translate(30, -95)">
                  <path d="M 0,0 Q 18,22 6,44 Q 2,22 0,0 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
                  <circle cx="7" cy="14" r="3" fill="#A5D6A7" />
                  <circle cx="9" cy="26" r="3" fill="#A5D6A7" />
                  <circle cx="6" cy="36" r="2.5" fill="#A5D6A7" />
                </g>
                {/* 豆荚 3 */}
                <g transform="translate(-14, -125)">
                  <path d="M 0,0 Q -15,18 -4,36 Q -1,18 0,0 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
                  <circle cx="-6" cy="12" r="2.5" fill="#C8E6C9" />
                  <circle cx="-7" cy="22" r="2.5" fill="#C8E6C9" />
                </g>

                {/* 魔法发光小星芒 */}
                <g transform="translate(-55, -135)">
                  <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#B9F6CA" stroke="#00C853" strokeWidth="1" />
                </g>
                <g transform="translate(55, -165)">
                  <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#B9F6CA" stroke="#00C853" strokeWidth="1" />
                </g>
              </g>
            )}
          </>
        )}
      </svg>
    </div>
  );
};

export default TreeRenderer;
