// 语法知识点数据结构
export const grammarCategories = {
  tenses: {
    id: 'tenses',
    name: '时态',
    description: '英语动词时态的使用规则和变化形式',
    icon: '🕐',
    subcategories: [
      {
        id: 'present-simple',
        name: '一般现在时',
        description: '表示经常性、习惯性的动作或状态',
        level: 'beginner',
        rules: [
          {
            id: 'present-simple-structure',
            title: '基本结构',
            content: '主语 + 动词原形/动词第三人称单数形式',
            examples: ['I work every day.', 'She works at home.', 'They play football.']
          },
          {
            id: 'present-simple-usage',
            title: '使用场合',
            content: '1. 经常性或习惯性的动作\n2. 客观事实或真理\n3. 时刻表或程序',
            examples: [
              'I brush my teeth twice a day.',
              'Water boils at 100°C.',
              'The train leaves at 8:00 AM.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I am go to school every day.',
            correction: 'I go to school every day.',
            explanation: '一般现在时不需要be动词辅助'
          }
        ]
      },
      {
        id: 'present-continuous',
        name: '现在进行时',
        description: '表示正在进行的动作或现阶段的状态',
        level: 'beginner',
        rules: [
          {
            id: 'present-continuous-structure',
            title: '基本结构',
            content: '主语 + be动词 + 现在分词(-ing)',
            examples: ['I am reading a book.', 'She is working.', 'They are playing.']
          }
        ],
        commonMistakes: [
          {
            mistake: 'I am work now.',
            correction: 'I am working now.',
            explanation: '现在进行时需要使用动词的-ing形式'
          }
        ]
      }
    ]
  },
  grammar_structures: {
    id: 'grammar_structures',
    name: '语法结构',
    description: '英语句子结构和语法规则',
    icon: '🏗️',
    subcategories: [
      {
        id: 'sentence-patterns',
        name: '句型结构',
        description: '基本句型和复杂句式的构造方法',
        level: 'intermediate',
        rules: [
          {
            id: 'basic-patterns',
            title: '五大基本句型',
            content: '1. 主+谓 2. 主+谓+宾 3. 主+谓+间宾+直宾 4. 主+谓+宾+宾补 5. 主+系+表',
            examples: [
              'Birds fly. (主+谓)',
              'I love music. (主+谓+宾)',
              'He gave me a book. (主+谓+间宾+直宾)'
            ]
          }
        ]
      },
      {
        id: 'clauses',
        name: '从句',
        description: '定语从句、名词性从句、状语从句的用法',
        level: 'advanced',
        rules: [
          {
            id: 'relative-clauses',
            title: '定语从句',
            content: '用来修饰名词或代词的从句',
            examples: [
              'The book that I bought is interesting.',
              'The man who came yesterday is my friend.'
            ]
          }
        ]
      }
    ]
  },
  parts_of_speech: {
    id: 'parts_of_speech',
    name: '词性',
    description: '名词、动词、形容词等词性的用法',
    icon: '📝',
    subcategories: [
      {
        id: 'nouns',
        name: '名词',
        description: '可数名词、不可数名词及其复数形式',
        level: 'beginner',
        rules: [
          {
            id: 'countable-uncountable',
            title: '可数与不可数名词',
            content: '可数名词有复数形式，不可数名词通常没有',
            examples: [
              'book → books (可数)',
              'water (不可数)',
              'information (不可数)'
            ]
          }
        ]
      },
      {
        id: 'verbs',
        name: '动词',
        description: '实义动词、助动词、情态动词的用法',
        level: 'intermediate',
        rules: [
          {
            id: 'modal-verbs',
            title: '情态动词',
            content: 'can, could, may, might, must, should, will, would等',
            examples: [
              'I can swim.',
              'You should study harder.',
              'She might come tomorrow.'
            ]
          }
        ]
      }
    ]
  },
  punctuation: {
    id: 'punctuation',
    name: '标点符号',
    description: '英语标点符号的正确使用',
    icon: '💬',
    subcategories: [
      {
        id: 'basic-punctuation',
        name: '基础标点',
        description: '句号、逗号、问号、感叹号的使用',
        level: 'beginner',
        rules: [
          {
            id: 'comma-usage',
            title: '逗号的使用',
            content: '用于分隔句子成分、连接并列成分等',
            examples: [
              'I like apples, oranges, and bananas.',
              'After dinner, we watched TV.',
              'She is smart, kind, and beautiful.'
            ]
          }
        ]
      }
    ]
  }
};

// 根据难度级别获取语法点
export const getGrammarByLevel = (level) => {
  const result = [];
  Object.values(grammarCategories).forEach(category => {
    category.subcategories.forEach(subcategory => {
      if (subcategory.level === level) {
        result.push({
          ...subcategory,
          categoryName: category.name,
          categoryIcon: category.icon
        });
      }
    });
  });
  return result;
};

// 获取所有语法点列表
export const getAllGrammarPoints = () => {
  const result = [];
  Object.values(grammarCategories).forEach(category => {
    category.subcategories.forEach(subcategory => {
      result.push({
        ...subcategory,
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon
      });
    });
  });
  return result;
};

// 练习题数据结构
export const practiceExercises = {
  'present-simple': [
    {
      id: 'ps-ex-1',
      type: 'fill-blank',
      question: 'She _____ (work) in a hospital.',
      answer: 'works',
      explanation: '第三人称单数形式需要在动词后加-s',
      difficulty: 'easy'
    },
    {
      id: 'ps-ex-2',
      type: 'multiple-choice',
      question: 'Choose the correct sentence:',
      options: [
        'I am go to school every day.',
        'I go to school every day.',
        'I going to school every day.',
        'I goes to school every day.'
      ],
      answer: 1,
      explanation: '一般现在时使用动词原形',
      difficulty: 'easy'
    },
    {
      id: 'ps-ex-3',
      type: 'correction',
      sentence: 'He don\'t like coffee.',
      correctSentence: 'He doesn\'t like coffee.',
      explanation: '第三人称单数的否定形式应该用doesn\'t',
      difficulty: 'medium'
    },
    {
      id: 'ps-ex-4',
      type: 'fill-blank',
      question: 'They _____ (play) football every weekend.',
      answer: 'play',
      explanation: '复数主语使用动词原形',
      difficulty: 'easy'
    }
  ],
  'present-continuous': [
    {
      id: 'pc-ex-1',
      type: 'fill-blank',
      question: 'She _____ (read) a book now.',
      answer: 'is reading',
      explanation: '现在进行时的结构是 be + 动词-ing',
      difficulty: 'easy'
    },
    {
      id: 'pc-ex-2',
      type: 'multiple-choice',
      question: 'What is the correct present continuous form?',
      options: [
        'I am work.',
        'I am working.',
        'I working.',
        'I work am.'
      ],
      answer: 1,
      explanation: '现在进行时需要be动词加上动词的-ing形式',
      difficulty: 'easy'
    },
    {
      id: 'pc-ex-3',
      type: 'correction',
      sentence: 'They are play football.',
      correctSentence: 'They are playing football.',
      explanation: '现在进行时需要动词的-ing形式，不是原形',
      difficulty: 'medium'
    }
  ],
  'sentence-patterns': [
    {
      id: 'sp-ex-1',
      type: 'multiple-choice',
      question: 'Which sentence follows the pattern: Subject + Verb + Object?',
      options: [
        'The birds fly.',
        'I love music.',
        'She is beautiful.',
        'He gave me a book.'
      ],
      answer: 1,
      explanation: 'I(主语) + love(动词) + music(宾语) 符合主+谓+宾结构',
      difficulty: 'medium'
    },
    {
      id: 'sp-ex-2',
      type: 'fill-blank',
      question: 'Complete the sentence pattern: He _____ me a gift. (Subject + Verb + Indirect Object + Direct Object)',
      answer: 'gave',
      explanation: '这是主+谓+间宾+直宾的句型结构',
      difficulty: 'medium'
    }
  ],
  'nouns': [
    {
      id: 'n-ex-1',
      type: 'multiple-choice',
      question: 'Which word is an uncountable noun?',
      options: [
        'books',
        'water',
        'cars',
        'students'
      ],
      answer: 1,
      explanation: 'water是不可数名词，不能用复数形式',
      difficulty: 'easy'
    },
    {
      id: 'n-ex-2',
      type: 'correction',
      sentence: 'I have many informations.',
      correctSentence: 'I have much information.',
      explanation: 'information是不可数名词，应该用much而不是many',
      difficulty: 'medium'
    }
  ]
};

// 获取指定语法点的练习题
export const getExercisesByGrammarId = (grammarId) => {
  return practiceExercises[grammarId] || [];
};