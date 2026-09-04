// Tutorial Questions Database
// Stage 1: Universal Light Questions (Q1 - Q3) to teach basic interaction and feedback
// Stage 2: Path-specific and game mechanics (Q4 - Q10)

export const STAGE_1_QUESTIONS = [
  {
    step: 1,
    category: 'Basic Interaction',
    title: '热身运算',
    question: '2 + 3 = ?',
    visual: null,
    options: ['4', '5', '6', '7'],
    correctIndex: 1,
    rewardBP: 10,
    hint: '点击正确答案开始！'
  },
  {
    step: 2,
    category: 'Visual Match',
    title: '寻找相同图形',
    question: '找出与上方相同的图形：',
    visual: {
      type: 'target_shape',
      target: '⭐',
      label: '目标图形'
    },
    options: ['🔶', '⭐', '🔷', '🟢'],
    correctIndex: 1,
    rewardBP: 10,
    hint: '轻触与目标一样的图形'
  },
  {
    step: 3,
    category: 'Easy Logic',
    title: '数字规律',
    question: '仔细观察规律，问号处填什么？',
    sequence: ['2', '4', '6', '?'],
    options: ['7', '8', '9', '10'],
    correctIndex: 1,
    rewardBP: 10,
    milestone: 'bankpoint_intro', // Step 11: Milestone unlock for BankPoint
    hint: '每次都增加 2 喔！'
  }
];

export const PATH_QUESTIONS = {
  // Chinese Path: 基础词汇、轻双语词汇、成语趣味常识
  chinese: [
    {
      step: 4,
      category: 'Selected Path',
      title: '生活常识',
      question: '哪个是水果？',
      options: ['汽车', '苹果', '书本', '桌子'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '多汁甜美、可以吃的东西。'
    },
    {
      step: 5,
      category: 'Selected Path',
      title: '双语初探',
      question: '「太阳」的英文是什么？',
      options: ['Moon', 'Sun', 'Cloud', 'Star'],
      correctIndex: 1,
      rewardBP: 10,
      milestone: 'combo_intro',
      hint: '白天升起、温暖大地的天体。'
    },
    {
      step: 6,
      category: 'Selected Path',
      title: '词义认知',
      question: '成语「同心协力」的意思是？',
      options: ['独自一人解决', '齐心合力共同努力', '各自做各自的', '放弃目标'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '大家团结在一起的力量！'
    },
    {
      step: 7,
      category: 'Selected Path',
      title: '语境选择',
      question: '选出恰当的词语：「小鸟在天空中自由地___。」',
      options: ['奔跑', '飞翔', '游水', '跳绳'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '鸟儿展翅的动作。'
    },
    {
      step: 8,
      category: '10-Second Challenge',
      title: '急速双语',
      question: '【10秒挑战】「水」的英文是？',
      options: ['Fire', 'Water', 'Wind', 'Earth'],
      correctIndex: 1,
      rewardBP: 20,
      isTimed: true,
      timeLimit: 10,
      hint: '快速反应！倒计时已经开始！'
    },
    {
      step: 9,
      category: 'Combo Challenge',
      title: '名言启蒙',
      question: '「书籍是人类进步的___。」',
      options: ['阶梯', '障碍', '玩具', '包袱'],
      correctIndex: 0,
      rewardBP: 20,
      hint: '帮助我们一步步登高望远。'
    },
    {
      step: 10,
      category: 'Final Challenge',
      title: '终极试炼',
      question: '一年通常有几个季节？（春夏秋冬）',
      options: ['2个', '4个', '6个', '8个'],
      correctIndex: 1,
      rewardBP: 30,
      isBossPreview: true,
      hint: '春、夏、秋、冬共有几个？'
    }
  ],

  // English Path: Animal vocabulary, daily words, opposites, light reading
  english: [
    {
      step: 4,
      category: 'Selected Path',
      title: 'Vocabulary',
      question: 'Which one is an animal?',
      options: ['Chair', 'Cat', 'Book', 'Bag'],
      correctIndex: 1,
      rewardBP: 10,
      hint: 'It can meow and has four paws!'
    },
    {
      step: 5,
      category: 'Selected Path',
      title: 'Daily Words',
      question: 'What shines in the sky during the daytime?',
      options: ['The Moon', 'The Sun', 'The Stars', 'The Lamp'],
      correctIndex: 1,
      rewardBP: 10,
      milestone: 'combo_intro',
      hint: 'It gives us light and warmth.'
    },
    {
      step: 6,
      category: 'Selected Path',
      title: 'Opposites',
      question: 'What is the opposite of "Cold"?',
      options: ['Ice', 'Hot', 'Cool', 'Winter'],
      correctIndex: 1,
      rewardBP: 10,
      hint: 'Like a warm summer day or boiling soup.'
    },
    {
      step: 7,
      category: 'Selected Path',
      title: 'Action Words',
      question: 'Fish can swim in water, and birds can ___ in the sky.',
      options: ['Run', 'Fly', 'Drive', 'Sleep'],
      correctIndex: 1,
      rewardBP: 10,
      hint: 'With wings spread wide!'
    },
    {
      step: 8,
      category: '10-Second Challenge',
      title: 'Speed Quiz',
      question: '【10s Challenge】What color is an apple usually?',
      options: ['Blue', 'Red', 'Black', 'Purple'],
      correctIndex: 1,
      rewardBP: 20,
      isTimed: true,
      timeLimit: 10,
      hint: 'Think fast before the clock ticks down!'
    },
    {
      step: 9,
      category: 'Combo Challenge',
      title: 'Daily Greeting',
      question: 'Complete the sentence: "Good ___, have a great day!"',
      options: ['Morning', 'Sleep', 'Dark', 'Late'],
      correctIndex: 0,
      rewardBP: 20,
      hint: 'Said when the sun comes up!'
    },
    {
      step: 10,
      category: 'Final Challenge',
      title: 'Final Quest',
      question: '【Final Quest】How many days are there in a week?',
      options: ['5', '7', '10', '12'],
      correctIndex: 1,
      rewardBP: 30,
      isBossPreview: true,
      hint: 'Monday to Sunday!'
    }
  ],

  // Mixed Challenge: Numbers, bilingual pairs, logic, trivia
  mixed: [
    {
      step: 4,
      category: 'Selected Path',
      title: '双语识别',
      question: '「Apple」的中文是哪一个？',
      options: ['香蕉', '苹果', '西瓜', '草莓'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '红彤彤的常见水果。'
    },
    {
      step: 5,
      category: 'Selected Path',
      title: '科学常识',
      question: '哪个是恒温哺乳动物（非冷血）？',
      options: ['青蛙 (Frog)', '小狗 (Dog)', '蛇 (Snake)', '蜥蜴 (Lizard)'],
      correctIndex: 1,
      rewardBP: 10,
      milestone: 'combo_intro',
      hint: '身上有温暖的毛发。'
    },
    {
      step: 6,
      category: 'Selected Path',
      title: '趣味乘法',
      question: '1 只小猫有 4 条腿，3 只小猫共有多少条腿？',
      options: ['8', '12', '10', '16'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '4 + 4 + 4 = ?'
    },
    {
      step: 7,
      category: 'Selected Path',
      title: '双语色彩',
      question: '「Blue」代表彩虹里的哪种颜色？',
      options: ['红色', '蓝色', '黄色', '绿色'],
      correctIndex: 1,
      rewardBP: 10,
      hint: '如同晴朗的天空或大海。'
    },
    {
      step: 8,
      category: '10-Second Challenge',
      title: '急速心算',
      question: '【10秒挑战】5 × 2 = ?',
      options: ['8', '10', '12', '15'],
      correctIndex: 1,
      rewardBP: 20,
      isTimed: true,
      timeLimit: 10,
      hint: '快速心算！倒计时进行中！'
    },
    {
      step: 9,
      category: 'Combo Challenge',
      title: '地理认知',
      question: '地球表面覆盖面积最大的是？',
      options: ['海洋与水 (Water)', '沙漠', '高山', '城市'],
      correctIndex: 0,
      rewardBP: 20,
      hint: '占了地球表面约 71% 的面积。'
    },
    {
      step: 10,
      category: 'Final Challenge',
      title: '终极试炼',
      question: '【终极试炼】100 - 50 = ?',
      options: ['40', '50', '60', '70'],
      correctIndex: 1,
      rewardBP: 30,
      isBossPreview: true,
      hint: '正好是一半喔！'
    }
  ]
};

export const getTutorialQuestion = (stepNumber, selectedPath = 'chinese') => {
  if (stepNumber >= 1 && stepNumber <= 3) {
    return STAGE_1_QUESTIONS[stepNumber - 1];
  }

  const pathKey = PATH_QUESTIONS[selectedPath] ? selectedPath : 'chinese';
  const pathList = PATH_QUESTIONS[pathKey];
  const question = pathList.find(q => q.step === stepNumber);

  if (question) return question;

  // Fallback if step exceeds
  return pathList[pathList.length - 1];
};
