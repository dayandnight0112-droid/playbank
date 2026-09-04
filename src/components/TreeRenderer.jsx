// 2D 树木五阶段视觉渲染组件 (TreeRenderer.jsx)

export const STAGE_CONFIG = [
  { stage: 1, minGrowth: 0, maxGrowth: 19, name: 'Seed', subtitle: '刚破土的小嫩芽' },
  { stage: 2, minGrowth: 20, maxGrowth: 39, name: 'Sprout', subtitle: '生机勃勃的幼苗' },
  { stage: 3, minGrowth: 40, maxGrowth: 59, name: 'Small Plant', subtitle: '初展新枝的小灌木' },
  { stage: 4, minGrowth: 60, maxGrowth: 79, name: 'Young Tree', subtitle: '枝繁叶茂的幼树' },
  { stage: 5, minGrowth: 80, maxGrowth: 100, name: 'Full Tree', subtitle: '硕果累累的参天大树' }
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

        {/* ========== STAGE 1: SEED (0 - 19%) ========== */}
        {stage === 1 && (
          <g transform="translate(120, 178)">
            {/* 种子外壳 */}
            <ellipse cx="0" cy="2" rx="12" ry="8" fill="#5D4037" stroke="#2B2B2B" strokeWidth="2.5" />
            {/* 嫩芽主茎 */}
            <path d="M 0,-2 C -8,-18 0,-30 2,-36 C 4,-28 10,-16 0,-2 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            {/* 右侧小叶片 */}
            <path d="M 0,-14 C 12,-24 22,-20 24,-15 C 20,-8 10,-7 0,-14 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
            {/* 水滴 */}
            <circle cx="18" cy="-15" r="2.5" fill="#E1F5FE" stroke="#0288D1" strokeWidth="1" />
          </g>
        )}

        {/* ========== STAGE 2: SPROUT (20 - 39%) ========== */}
        {stage === 2 && (
          <g transform="translate(120, 178)">
            {/* 略显粗壮的主茎 */}
            <path d="M -3,0 Q -1,-35 0,-56 Q 3,-35 3,0 Z" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 下方左叶 */}
            <path d="M -1,-22 C -20,-30 -30,-22 -28,-14 C -18,-10 -6,-16 -1,-22 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            {/* 下方右叶 */}
            <path d="M 1,-30 C 22,-40 32,-32 30,-22 C 20,-18 8,-24 1,-30 Z" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 顶端嫩叶对生 */}
            <path d="M 0,-54 C -16,-68 -24,-58 -18,-50 C -10,-46 -2,-50 0,-54 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2.5" />
            <path d="M 0,-54 C 16,-68 24,-58 18,-50 C 10,-46 2,-50 0,-54 Z" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 顶端尖芽 */}
            <circle cx="0" cy="-57" r="3" fill="#C8E6C9" stroke="#2B2B2B" strokeWidth="1.5" />
          </g>
        )}

        {/* ========== STAGE 3: SMALL PLANT (40 - 59%) ========== */}
        {stage === 3 && (
          <g transform="translate(120, 178)">
            {/* 半木质化主干 */}
            <path d="M -6,0 L -4,-45 L -20,-75 L -14,-78 L 0,-52 L 14,-78 L 20,-75 L 4,-45 L 6,0 Z" fill="#8D6E63" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 分枝叶团 1（左） */}
            <circle cx="-24" cy="-80" r="18" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="-32" cy="-72" r="12" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
            
            {/* 分枝叶团 2（右） */}
            <circle cx="24" cy="-80" r="18" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="32" cy="-72" r="12" fill="#A5D6A7" stroke="#2B2B2B" strokeWidth="2" />
            
            {/* 顶端主叶团 */}
            <circle cx="0" cy="-92" r="22" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="0" cy="-96" r="15" fill="#81C784" stroke="#2B2B2B" strokeWidth="2" />
            
            {/* 小花蕾/小芽点 */}
            <circle cx="-18" cy="-86" r="3.5" fill="#FFF59D" stroke="#2B2B2B" strokeWidth="1.5" />
            <circle cx="16" cy="-88" r="3.5" fill="#FFF59D" stroke="#2B2B2B" strokeWidth="1.5" />
          </g>
        )}

        {/* ========== STAGE 4: YOUNG TREE (60 - 79%) ========== */}
        {stage === 4 && (
          <g transform="translate(120, 178)">
            {/* 扎实木质树干 */}
            <path d="M -10,0 Q -8,-50 -12,-85 L 12,-85 Q 8,-50 10,0 Z" fill="#795548" stroke="#2B2B2B" strokeWidth="3" />
            {/* 树纹 */}
            <path d="M -2,-30 L -2,-55" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
            
            {/* 树冠后层阴影 */}
            <circle cx="-35" cy="-115" r="30" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="35" cy="-115" r="30" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="0" cy="-135" r="36" fill="#43A047" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 树冠前层亮面 */}
            <circle cx="-18" cy="-110" r="28" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="20" cy="-108" r="28" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="2.5" />
            <circle cx="0" cy="-125" r="30" fill="#81C784" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* 少量小苹果（青涩微红） */}
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

        {/* ========== STAGE 5: FULL TREE (80 - 100%) ========== */}
        {stage === 5 && (
          <g transform="translate(120, 178)">
            {/* 壮硕树干与粗根 */}
            <path d="M -16,0 Q -10,-55 -16,-95 L 16,-95 Q 10,-55 16,0 Z" fill="#6D4C41" stroke="#2B2B2B" strokeWidth="3" />
            <path d="M -4,-25 L -4,-65" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 5,-40 L 5,-75" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* 蓬松丰满大树冠 */}
            <circle cx="-45" cy="-125" r="36" fill="#388E3C" stroke="#2B2B2B" strokeWidth="3" />
            <circle cx="45" cy="-125" r="36" fill="#388E3C" stroke="#2B2B2B" strokeWidth="3" />
            <circle cx="0" cy="-155" r="42" fill="#2E7D32" stroke="#2B2B2B" strokeWidth="3" />
            
            {/* 前层高光叶簇 */}
            <circle cx="-25" cy="-120" r="34" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="3" />
            <circle cx="25" cy="-118" r="34" fill="#4CAF50" stroke="#2B2B2B" strokeWidth="3" />
            <circle cx="0" cy="-140" r="36" fill="#66BB6A" stroke="#2B2B2B" strokeWidth="3" />
            <circle cx="0" cy="-150" r="22" fill="#81C784" />
            
            {/* 挂满成熟大红苹果 */}
            {/* 苹果 1 */}
            <g transform="translate(-36, -115)">
              <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
              <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            </g>
            {/* 苹果 2 */}
            <g transform="translate(34, -125)">
              <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
              <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            </g>
            {/* 苹果 3 */}
            <g transform="translate(-10, -145)">
              <circle cx="0" cy="0" r="8.5" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-3" cy="-3" r="2.2" fill="#FFCDD2" />
              <path d="M 0,-8.5 Q 2,-12 4,-11" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            </g>
            {/* 苹果 4 */}
            <g transform="translate(18, -100)">
              <circle cx="0" cy="0" r="8" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-2.5" cy="-2.5" r="2" fill="#FFCDD2" />
              <path d="M 0,-8 Q 2,-11 4,-10" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            </g>
            {/* 苹果 5 */}
            <g transform="translate(-12, -95)">
              <circle cx="0" cy="0" r="7.5" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-2" cy="-2" r="2" fill="#FFCDD2" />
              <path d="M 0,-7.5 Q 2,-10 4,-9" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            </g>

            {/* 地面上掉落的一颗成熟苹果 */}
            <g transform="translate(48, 6)">
              <circle cx="0" cy="0" r="7" fill="#E53935" stroke="#2B2B2B" strokeWidth="2" />
              <circle cx="-2" cy="-2" r="1.8" fill="#FFCDD2" />
              <path d="M 0,-7 Q 2,-10 4,-9" stroke="#2B2B2B" strokeWidth="1.5" fill="none" />
            </g>

            {/* 成熟金色闪烁星光 */}
            <g transform="translate(-55, -165)">
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFD700" stroke="#B78103" strokeWidth="1" />
            </g>
            <g transform="translate(55, -155)">
              <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#FFD700" stroke="#B78103" strokeWidth="1" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default TreeRenderer;
