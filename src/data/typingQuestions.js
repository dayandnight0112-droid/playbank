/**
 * typingQuestions.js
 * Independent English Typing Game Question Bank
 * Graded for 4 Age Brackets:
 * - 7–9岁:   基础单词 (High-frequency vocabulary, phonics words)
 * - 10–12岁: 进阶单词与常用短语 (Medium vocabulary, short collocations)
 * - 13–15岁: 完整句与经典格言 (Complete sentences, common proverbs)
 * - 16–17岁: 长句与精选短文 (Complex compound sentences, inspiring passages)
 */

import { AGE_GROUP_KEYS, normalizeAgeGroupKey, getTypingAgeConfig } from './typingConfig.js';

export const TYPING_QUESTIONS = {
  // =========================================================================
  // 7–9 岁：基础单词 (Standard 1–3) - 32 题
  // =========================================================================
  [AGE_GROUP_KEYS.AGE_7_9]: [
    { id: 'tq_7_01', text: 'apple', translation: '苹果', category: 'Food' },
    { id: 'tq_7_02', text: 'happy', translation: '开心的', category: 'Emotion' },
    { id: 'tq_7_03', text: 'tiger', translation: '老虎', category: 'Animal' },
    { id: 'tq_7_04', text: 'school', translation: '学校', category: 'Places' },
    { id: 'tq_7_05', text: 'pencil', translation: '铅笔', category: 'Stationery' },
    { id: 'tq_7_06', text: 'water', translation: '水', category: 'Daily' },
    { id: 'tq_7_07', text: 'friend', translation: '朋友', category: 'People' },
    { id: 'tq_7_08', text: 'summer', translation: '夏天', category: 'Season' },
    { id: 'tq_7_09', text: 'rabbit', translation: '兔子', category: 'Animal' },
    { id: 'tq_7_10', text: 'yellow', translation: '黄色', category: 'Color' },
    { id: 'tq_7_11', text: 'garden', translation: '花园', category: 'Nature' },
    { id: 'tq_7_12', text: 'family', translation: '家庭', category: 'People' },
    { id: 'tq_7_13', text: 'orange', translation: '橙子', category: 'Food' },
    { id: 'tq_7_14', text: 'window', translation: '窗户', category: 'Daily' },
    { id: 'tq_7_15', text: 'planet', translation: '行星', category: 'Science' },
    { id: 'tq_7_16', text: 'monkey', translation: '猴子', category: 'Animal' },
    { id: 'tq_7_17', text: 'cookie', translation: '饼干', category: 'Food' },
    { id: 'tq_7_18', text: 'flower', translation: '花朵', category: 'Nature' },
    { id: 'tq_7_19', text: 'banana', translation: '香蕉', category: 'Food' },
    { id: 'tq_7_20', text: 'doctor', translation: '医生', category: 'Career' },
    { id: 'tq_7_21', text: 'kitten', translation: '小猫', category: 'Animal' },
    { id: 'tq_7_22', text: 'purple', translation: '紫色', category: 'Color' },
    { id: 'tq_7_23', text: 'music', translation: '音乐', category: 'Art' },
    { id: 'tq_7_24', text: 'sister', translation: '姐妹', category: 'People' },
    { id: 'tq_7_25', text: 'rocket', translation: '火箭', category: 'Science' },
    { id: 'tq_7_26', text: 'castle', translation: '城堡', category: 'Places' },
    { id: 'tq_7_27', text: 'winter', translation: '冬天', category: 'Season' },
    { id: 'tq_7_28', text: 'silver', translation: '银色', category: 'Color' },
    { id: 'tq_7_29', text: 'butter', translation: '黄油', category: 'Food' },
    { id: 'tq_7_30', text: 'bridge', translation: '桥梁', category: 'Places' },
    { id: 'tq_7_31', text: 'island', translation: '岛屿', category: 'Nature' },
    { id: 'tq_7_32', text: 'forest', translation: '森林', category: 'Nature' },
  ],

  // =========================================================================
  // 10–12 岁：进阶单词与常用短语 (Standard 4–6) - 32 题
  // =========================================================================
  [AGE_GROUP_KEYS.AGE_10_12]: [
    { id: 'tq_10_01', text: 'adventure', translation: '冒险，奇遇', category: 'Vocabulary' },
    { id: 'tq_10_02', text: 'stay positive', translation: '保持积极心态', category: 'Phrase' },
    { id: 'tq_10_03', text: 'dinosaur', translation: '恐龙', category: 'Science' },
    { id: 'tq_10_04', text: 'bright future', translation: '光明的前景', category: 'Phrase' },
    { id: 'tq_10_05', text: 'curious', translation: '好奇的', category: 'Vocabulary' },
    { id: 'tq_10_06', text: 'listen carefully', translation: '仔细倾听', category: 'Phrase' },
    { id: 'tq_10_07', text: 'elephant', translation: '大象', category: 'Animal' },
    { id: 'tq_10_08', text: 'work hard', translation: '努力奋斗', category: 'Phrase' },
    { id: 'tq_10_09', text: 'discover', translation: '发现，探索', category: 'Vocabulary' },
    { id: 'tq_10_10', text: 'protect nature', translation: '保护大自然', category: 'Phrase' },
    { id: 'tq_10_11', text: 'important', translation: '重要的', category: 'Vocabulary' },
    { id: 'tq_10_12', text: 'read every day', translation: '每天阅读', category: 'Phrase' },
    { id: 'tq_10_13', text: 'knowledge', translation: '知识', category: 'Vocabulary' },
    { id: 'tq_10_14', text: 'take your time', translation: '慢慢来，别着急', category: 'Phrase' },
    { id: 'tq_10_15', text: 'treasure', translation: '宝藏，珍品', category: 'Vocabulary' },
    { id: 'tq_10_16', text: 'never give up', translation: '永不放弃', category: 'Phrase' },
    { id: 'tq_10_17', text: 'fantastic', translation: '极好的，奇妙的', category: 'Vocabulary' },
    { id: 'tq_10_18', text: 'make a wish', translation: '许个愿望', category: 'Phrase' },
    { id: 'tq_10_19', text: 'mountain', translation: '高山', category: 'Nature' },
    { id: 'tq_10_20', text: 'team spirit', translation: '团队精神', category: 'Phrase' },
    { id: 'tq_10_21', text: 'challenge', translation: '挑战', category: 'Vocabulary' },
    { id: 'tq_10_22', text: 'help each other', translation: '互相帮助', category: 'Phrase' },
    { id: 'tq_10_23', text: 'delicious', translation: '美味的', category: 'Daily' },
    { id: 'tq_10_24', text: 'learn with joy', translation: '快乐学习', category: 'Phrase' },
    { id: 'tq_10_25', text: 'astronaut', translation: '宇航员', category: 'Career' },
    { id: 'tq_10_26', text: 'keep exploring', translation: '保持探索', category: 'Phrase' },
    { id: 'tq_10_27', text: 'butterfly', translation: '蝴蝶', category: 'Animal' },
    { id: 'tq_10_28', text: 'dream big', translation: '敢于梦想', category: 'Phrase' },
    { id: 'tq_10_29', text: 'wonderful', translation: '精彩的', category: 'Vocabulary' },
    { id: 'tq_10_30', text: 'shine bright', translation: '闪耀光芒', category: 'Phrase' },
    { id: 'tq_10_31', text: 'invention', translation: '发明，创造', category: 'Science' },
    { id: 'tq_10_32', text: 'step by step', translation: '一步一步来', category: 'Phrase' },
  ],

  // =========================================================================
  // 13–15 岁：完整句与经典格言 (Form 1–3) - 30 题
  // =========================================================================
  [AGE_GROUP_KEYS.AGE_13_15]: [
    { id: 'tq_13_01', text: 'Practice makes perfect.', translation: '熟能生巧。', category: 'Proverb' },
    { id: 'tq_13_02', text: 'Actions speak louder than words.', translation: '行动胜于空谈。', category: 'Proverb' },
    { id: 'tq_13_03', text: 'Where there is a will, there is a way.', translation: '有志者事竟成。', category: 'Proverb' },
    { id: 'tq_13_04', text: 'Honesty is always the best policy.', translation: '诚实始终是上策。', category: 'Proverb' },
    { id: 'tq_13_05', text: 'Knowledge is power and wisdom is freedom.', translation: '知识就是力量，智慧带来自由。', category: 'Inspirational' },
    { id: 'tq_13_06', text: 'Every cloud has a silver lining.', translation: '困境中总有一线光明。', category: 'Proverb' },
    { id: 'tq_13_07', text: 'Reading books opens the door to the universe.', translation: '阅读打开通向整个宇宙的大门。', category: 'Inspirational' },
    { id: 'tq_13_08', text: 'A gentle answer turns away anger.', translation: '温和的回答能平息愤怒。', category: 'Wisdom' },
    { id: 'tq_13_09', text: 'Kindness is a language everyone understands.', translation: '善良是每个人都能理解的语言。', category: 'Wisdom' },
    { id: 'tq_13_10', text: 'Failure is the mother of success.', translation: '失败乃成功之母。', category: 'Proverb' },
    { id: 'tq_13_11', text: 'Believe in yourself and you will be unstoppable.', translation: '相信自己，你将无可阻挡。', category: 'Inspirational' },
    { id: 'tq_13_12', text: 'Time and tide wait for no man.', translation: '岁月不等人。', category: 'Proverb' },
    { id: 'tq_13_13', text: 'Great things take time and dedication.', translation: '伟大的事物需要时间与投入。', category: 'Inspirational' },
    { id: 'tq_13_14', text: 'Curiosity is the key to all discovery.', translation: '好奇心是所有发现的钥匙。', category: 'Wisdom' },
    { id: 'tq_13_15', text: 'Better late than never.', translation: '迟做总比不做好。', category: 'Proverb' },
    { id: 'tq_13_16', text: 'Your only limit is your mind.', translation: '你唯一的限制是你的思维。', category: 'Inspirational' },
    { id: 'tq_13_17', text: 'Patience is bitter, but its fruit is sweet.', translation: '忍耐是苦涩的，但它的果实是甘甜的。', category: 'Wisdom' },
    { id: 'tq_13_18', text: 'Small daily improvements create huge results.', translation: '每天微小的进步带来巨大的收获。', category: 'Inspirational' },
    { id: 'tq_13_19', text: 'A friend in need is a friend indeed.', translation: '患难见真情。', category: 'Proverb' },
    { id: 'tq_13_20', text: 'Focus on progress, not perfection.', translation: '专注于进步，而不是完美。', category: 'Inspirational' },
    { id: 'tq_13_21', text: 'Creativity is intelligence having fun.', translation: '创造力是智慧在玩耍。', category: 'Wisdom' },
    { id: 'tq_13_22', text: 'The secret of getting ahead is getting started.', translation: '领先的秘诀在于立即开始。', category: 'Inspirational' },
    { id: 'tq_13_23', text: 'Learning is a treasure that will follow its owner everywhere.', translation: '学问是随身携带的珍宝。', category: 'Wisdom' },
    { id: 'tq_13_24', text: 'Do what is right, not what is easy.', translation: '做正确的事，而不是容易的事。', category: 'Wisdom' },
    { id: 'tq_13_25', text: 'Courage is grace under pressure.', translation: '勇气是压力之下的优雅。', category: 'Wisdom' },
    { id: 'tq_13_26', text: 'Stars cannot shine without darkness.', translation: '没有黑暗，群星便无法闪耀。', category: 'Inspirational' },
    { id: 'tq_13_27', text: 'A good beginning makes a good ending.', translation: '良好的开端是成功的一半。', category: 'Proverb' },
    { id: 'tq_13_28', text: 'Stay curious and keep asking questions.', translation: '保持好奇心，不断提出疑问。', category: 'Inspirational' },
    { id: 'tq_13_29', text: 'Opportunities don’t happen, you create them.', translation: '机会不是凭空出现的，是你创造出来的。', category: 'Inspirational' },
    { id: 'tq_13_30', text: 'Clear thinking leads to confident actions.', translation: '清晰的思考带来自信的行动。', category: 'Wisdom' },
  ],

  // =========================================================================
  // 16–17 岁：长句与精选短文 (Form 4–5 / SPM) - 30 题
  // =========================================================================
  [AGE_GROUP_KEYS.AGE_16_17]: [
    {
      id: 'tq_16_01',
      text: 'The future belongs to those who believe in the beauty of their dreams.',
      translation: '未来属于那些坚信自己梦想之美的人。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_02',
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      translation: '成功不是终点，失败也非末日：唯有勇往直前的勇气才是最重要的。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_03',
      text: 'Education is the most powerful weapon which you can use to change the world.',
      translation: '教育是你能用来改变世界的最强有力武器。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_04',
      text: 'In the middle of every difficulty lies a hidden opportunity waiting to be discovered.',
      translation: '在每一个困难之中，都潜藏着等待被发掘的机遇。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_05',
      text: 'Critical thinking and clear communication are the foundations of effective leadership.',
      translation: '批判性思维与清晰表达是有效领导力的坚实基石。',
      category: 'Essay & Academic'
    },
    {
      id: 'tq_16_06',
      text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
      translation: '与我们内心的力量相比，过去的经历和未来的挑战都显得微不足道。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_07',
      text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.',
      translation: '不要沿着既定的路走，而是要去往没有路的地方并开辟出一条路来。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_08',
      text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
      translation: '生命最大的光彩不在于从不跌倒，而在于每次跌倒后都能站起来。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_09',
      text: 'Technological innovation drives human progress, but empathy gives technology its true purpose.',
      translation: '技术创新推动人类进步，但同理心赋予了科技真正的意义。',
      category: 'Essay & Academic'
    },
    {
      id: 'tq_16_10',
      text: 'Consistency and discipline transform average talent into extraordinary achievement.',
      translation: '坚持不懈与自律，能够让平凡的才能蜕变为非凡的成就。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_11',
      text: 'Learning is not attained by chance; it must be sought for with ardour and diligence.',
      translation: '学识绝非偶然所得；它必须满怀热情且勤奋追求。',
      category: 'Academic'
    },
    {
      id: 'tq_16_12',
      text: 'A journey of a thousand miles begins with a single step taken with determination.',
      translation: '千里之行，始于足下充满坚定的一步。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_13',
      text: 'Preserving biodiversity is not just an environmental obligation, but a vital pledge for our survival.',
      translation: '保护生物多样性不仅是环境义务，更是关乎我们生存的至关重要的誓约。',
      category: 'Science & Society'
    },
    {
      id: 'tq_16_14',
      text: 'Character is what you do when no one is watching, built silently through everyday decisions.',
      translation: '品格是你在无人注视时的所作所为，由每一个日常决定默默铸就。',
      category: 'Philosophy'
    },
    {
      id: 'tq_16_15',
      text: 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.',
      translation: '学习的能力是恩赐；学习的本领是技巧；学习的意愿则是选择。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_16',
      text: 'True wisdom comes to each of us when we realize how little we understand about life and the world.',
      translation: '当我们意识到自己对生命与世界的认知是多么微薄时，真正的智慧方始降临。',
      category: 'Philosophy'
    },
    {
      id: 'tq_16_17',
      text: 'Courage does not always roar; sometimes courage is the quiet voice at the end of the day saying I will try again tomorrow.',
      translation: '勇气不总是咆哮呐喊；有时它是在一天结束时轻声说：明天我还要再试一次。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_18',
      text: 'Scientific discovery requires both the skepticism to question assumptions and the curiosity to explore new realms.',
      translation: '科学发现既需要质疑前提的审慎态度，也需要探索新领域的好奇心。',
      category: 'Science & Society'
    },
    {
      id: 'tq_16_19',
      text: 'If you want to live a happy life, tie it to a goal, not to people or things.',
      translation: '如果你想过幸福的生活，请将它与目标相系，而非托付于人或物。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_20',
      text: 'Mastery demands patience, unwavering dedication, and the willingness to learn from every mistake.',
      translation: '精通需要耐心、坚定不移的奉献，以及从每次错误中汲取教训的意愿。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_21',
      text: 'We are what we repeatedly do; excellence, then, is not an isolated act, but a lifelong habit.',
      translation: '我们日复一日的作为造就了我们；因此，优秀并非单一的举动，而是一种终身的习惯。',
      category: 'Philosophy'
    },
    {
      id: 'tq_16_22',
      text: 'Embrace constructive criticism, for it is the mirror that reveals blind spots in our understanding.',
      translation: '欣然接受建设性的批评，因为它是照出我们认知盲区的明镜。',
      category: 'Academic'
    },
    {
      id: 'tq_16_23',
      text: 'Resilience is not the absence of adversity, but the remarkable strength to rebound stronger after every setback.',
      translation: '韧性并非免于逆境，而是在每一次挫折之后更加顽强复原的非凡力量。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_24',
      text: 'The art of communication consists of listening with empathy as much as speaking with clarity.',
      translation: '沟通的艺术不仅在于表达清晰，更在于带着同理心去倾听。',
      category: 'Essay & Academic'
    },
    {
      id: 'tq_16_25',
      text: 'Knowledge without integrity is dangerous, but integrity combined with knowledge illuminates the world.',
      translation: '没有正直的学识是危险的，但正直与学识相融则能照亮世界。',
      category: 'Philosophy'
    },
    {
      id: 'tq_16_26',
      text: 'Every obstacle that challenges our perseverance ultimately refines the depth of our inner strength.',
      translation: '每一个考验我们毅力的阻碍，最终都在沉淀并淬炼我们内在力量的深度。',
      category: 'Inspirational'
    },
    {
      id: 'tq_16_27',
      text: 'Curiosity fuels the intellect, opening portals of discovery across literature, science, and the arts.',
      translation: '好奇心激发智识，为探索文学、科学与艺术打开大门。',
      category: 'Academic'
    },
    {
      id: 'tq_16_28',
      text: 'Balance ambition with gratitude, striving forward while cherishing every step of your personal voyage.',
      translation: '在雄心与感恩之间保持平衡，勇往直前的同时珍惜个人旅途中的每一步。',
      category: 'Wisdom'
    },
    {
      id: 'tq_16_29',
      text: 'Words have the profound energy to inspire hope, mend broken spirits, and ignite historic transformations.',
      translation: '文字蕴藏着深沉的力量，能点燃希望、抚慰创伤，并唤起历史性的变革。',
      category: 'Essay & Academic'
    },
    {
      id: 'tq_16_30',
      text: 'Your journey through learning will shape not only what you know, but the person you are destined to become.',
      translation: '你的求学求知之旅，不仅将塑造你的学识，更将铸就你注定成为的模样。',
      category: 'Inspirational'
    },
  ]
};

/**
 * Modern Fisher-Yates array shuffle (pure and non-mutating)
 */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fetch randomized typing questions for a given age bracket.
 * 
 * @param {number|string} ageOrGroup - Age (e.g. 8) or bracket ('7-9')
 * @param {number} [customCount] - Optional custom count; defaults to rule question count
 * @returns {Array<{id: string, text: string, translation: string, category: string}>}
 */
export function getTypingQuestionsForAge(ageOrGroup, customCount = null) {
  const groupKey = normalizeAgeGroupKey(ageOrGroup);
  const config = getTypingAgeConfig(groupKey);
  const pool = TYPING_QUESTIONS[groupKey] || TYPING_QUESTIONS[AGE_GROUP_KEYS.AGE_10_12];
  
  const targetCount = customCount && customCount > 0 ? customCount : config.questionCount;
  const shuffled = shuffleArray(pool);

  // If requested count exceeds pool, repeat shuffled items to guarantee length
  if (targetCount > shuffled.length) {
    const extended = [...shuffled];
    while (extended.length < targetCount) {
      extended.push(...shuffleArray(pool));
    }
    return extended.slice(0, targetCount);
  }

  return shuffled.slice(0, targetCount);
}

/**
 * Returns total count of available questions in a given bracket
 */
export function getTypingQuestionPoolSize(ageOrGroup) {
  const groupKey = normalizeAgeGroupKey(ageOrGroup);
  return (TYPING_QUESTIONS[groupKey] || []).length;
}
