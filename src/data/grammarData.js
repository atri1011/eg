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
      },
      {
        id: 'present-perfect',
        name: '现在完成时',
        description: '表示过去发生但对现在有影响的动作，或从过去持续到现在的状态',
        level: 'intermediate',
        rules: [
          {
            id: 'present-perfect-structure',
            title: '基本结构',
            content: '主语 + have/has + 过去分词',
            examples: [
              'I have finished my homework.',
              'She has lived here for 5 years.',
              'They have never been to Japan.'
            ]
          },
          {
            id: 'present-perfect-usage',
            title: '使用场合',
            content: '1. 过去的动作对现在有影响\n2. 从过去持续到现在的状态\n3. 人生经历\n4. 与since/for连用',
            examples: [
              'I have lost my key. (对现在的影响：找不到钥匙)',
              'She has worked here since 2020.',
              'Have you ever visited Paris?',
              'We have been friends for 10 years.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I have go there yesterday.',
            correction: 'I went there yesterday.',
            explanation: '明确的过去时间点应该用一般过去时，不用现在完成时'
          },
          {
            mistake: 'She has went to school.',
            correction: 'She has gone to school.',
            explanation: '现在完成时需要使用过去分词gone，不是过去式went'
          }
        ]
      },
      {
        id: 'past-simple',
        name: '一般过去时',
        description: '表示过去某个时间发生的动作或存在的状态',
        level: 'beginner',
        rules: [
          {
            id: 'past-simple-structure',
            title: '基本结构',
            content: '主语 + 动词过去式',
            examples: [
              'I worked yesterday.',
              'She went to the store.',
              'They played football last week.'
            ]
          },
          {
            id: 'past-simple-regular-irregular',
            title: '规则和不规则动词',
            content: '规则动词加-ed，不规则动词需要记忆',
            examples: [
              '规则：work → worked, play → played',
              '不规则：go → went, see → saw, have → had',
              '特殊：study → studied, stop → stopped'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I goed to school yesterday.',
            correction: 'I went to school yesterday.',
            explanation: 'go的过去式是went，不是goed'
          }
        ]
      },
      {
        id: 'past-continuous',
        name: '过去进行时',
        description: '表示过去某个时间点正在进行的动作',
        level: 'intermediate',
        rules: [
          {
            id: 'past-continuous-structure',
            title: '基本结构',
            content: '主语 + was/were + 现在分词(-ing)',
            examples: [
              'I was reading when she called.',
              'They were playing football at 3 PM.',
              'She was not working yesterday.'
            ]
          },
          {
            id: 'past-continuous-usage',
            title: '使用场合',
            content: '1. 过去某时刻正在进行的动作\n2. 两个过去动作同时进行\n3. 为过去的动作提供背景',
            examples: [
              'At 8 PM, I was watching TV.',
              'While I was cooking, she was reading.',
              'It was raining when we arrived.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I was go there when it rained.',
            correction: 'I was going there when it rained.',
            explanation: '过去进行时需要使用动词的-ing形式'
          }
        ]
      },
      {
        id: 'future-simple',
        name: '一般将来时',
        description: '表示将来要发生的动作或状态',
        level: 'beginner',
        rules: [
          {
            id: 'future-simple-structure',
            title: '基本结构',
            content: 'will + 动词原形 或 be going to + 动词原形',
            examples: [
              'I will call you tomorrow.',
              'She is going to visit us next week.',
              'It will rain tomorrow.'
            ]
          },
          {
            id: 'will-vs-going-to',
            title: 'will与be going to的区别',
            content: 'will：临时决定、预测；be going to：已计划、有证据的预测',
            examples: [
              'I will help you. (临时决定)',
              'I am going to study abroad. (已计划)',
              'Look at the clouds! It\'s going to rain. (有证据)'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I will to go there tomorrow.',
            correction: 'I will go there tomorrow.',
            explanation: 'will后面直接跟动词原形，不需要to'
          }
        ]
      },
      {
        id: 'present-perfect-continuous',
        name: '现在完成进行时',
        description: '表示从过去开始一直持续到现在的动作',
        level: 'advanced',
        rules: [
          {
            id: 'present-perfect-continuous-structure',
            title: '基本结构',
            content: '主语 + have/has + been + 现在分词(-ing)',
            examples: [
              'I have been studying for 3 hours.',
              'She has been working here since 2020.',
              'They have been waiting for you.'
            ]
          },
          {
            id: 'present-perfect-continuous-usage',
            title: '使用场合',
            content: '强调动作的持续性和现在的相关性',
            examples: [
              'I have been reading this book. (还在读)',
              'It has been raining all day. (还在下)',
              'You look tired. Have you been working?'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I have been went there.',
            correction: 'I have been going there.',
            explanation: '现在完成进行时需要been + 动词-ing形式'
          }
        ]
      },
      {
        id: 'past-perfect',
        name: '过去完成时',
        description: '表示过去某个时间之前已经完成的动作',
        level: 'intermediate',
        rules: [
          {
            id: 'past-perfect-structure',
            title: '基本结构',
            content: '主语 + had + 过去分词',
            examples: [
              'I had finished my work before he arrived.',
              'She had already left when I got there.',
              'They had never seen such a beautiful place.'
            ]
          },
          {
            id: 'past-perfect-usage',
            title: '使用场合',
            content: '1. 过去的过去 2. 与过去时间搭配 3. 在间接引语中',
            examples: [
              'By the time I arrived, the meeting had started.',
              'He said he had been to Paris.',
              'I realized I had forgotten my keys.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I had went there before.',
            correction: 'I had gone there before.',
            explanation: '过去完成时需要使用过去分词gone，不是过去式went'
          }
        ]
      },
      {
        id: 'future-perfect',
        name: '将来完成时',
        description: '表示在将来某个时间之前将要完成的动作',
        level: 'advanced',
        rules: [
          {
            id: 'future-perfect-structure',
            title: '基本结构',
            content: '主语 + will/shall + have + 过去分词',
            examples: [
              'I will have finished the report by tomorrow.',
              'She will have graduated by next year.',
              'They will have completed the project by then.'
            ]
          },
          {
            id: 'future-perfect-usage',
            title: '使用场合',
            content: '表示在将来某时间点之前完成的动作，常与by连用',
            examples: [
              'By 2030, I will have worked here for 10 years.',
              'She will have left by the time you arrive.',
              'By next month, we will have moved to the new office.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I will have went there by tomorrow.',
            correction: 'I will have gone there by tomorrow.',
            explanation: '将来完成时需要使用过去分词gone'
          }
        ]
      },
      {
        id: 'past-future',
        name: '过去将来时',
        description: '表示从过去某个时间点看将要发生的动作',
        level: 'intermediate',
        rules: [
          {
            id: 'past-future-structure',
            title: '基本结构',
            content: '主语 + would/should + 动词原形',
            examples: [
              'He said he would come tomorrow.',
              'She knew it would rain.',
              'They thought the meeting would be cancelled.'
            ]
          },
          {
            id: 'past-future-usage',
            title: '使用场合',
            content: '1. 间接引语中 2. 虚拟语气中 3. 过去的计划或预测',
            examples: [
              'He promised he would help me.',
              'If I were you, I would go.',
              'She was sure she would succeed.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'He said he will come.',
            correction: 'He said he would come.',
            explanation: '间接引语中，将来时要变为过去将来时'
          }
        ]
      },
      {
        id: 'future-continuous',
        name: '将来进行时',
        description: '表示将来某个时间点正在进行的动作',
        level: 'advanced',
        rules: [
          {
            id: 'future-continuous-structure',
            title: '基本结构',
            content: '主语 + will/shall + be + 现在分词(-ing)',
            examples: [
              'I will be working at 8 PM tomorrow.',
              'She will be studying when you call.',
              'They will be traveling next week.'
            ]
          },
          {
            id: 'future-continuous-usage',
            title: '使用场合',
            content: '1. 将来某时刻正在进行的动作 2. 将来的计划安排',
            examples: [
              'At this time tomorrow, I will be flying to Tokyo.',
              'Don\'t call me at 9. I will be having dinner.',
              'We will be living in a new house next year.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I will be go there tomorrow.',
            correction: 'I will be going there tomorrow.',
            explanation: '将来进行时需要使用be + 动词-ing形式'
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
          },
          {
            id: 'noun-clauses',
            title: '名词性从句',
            content: '在句子中充当名词成分的从句',
            examples: [
              'I know what you mean. (宾语从句)',
              'What he said is true. (主语从句)',
              'The fact that he lied surprised me. (同位语从句)'
            ]
          },
          {
            id: 'adverbial-clauses',
            title: '状语从句',
            content: '修饰动词、形容词或副词的从句',
            examples: [
              'I will call you when I arrive. (时间状语从句)',
              'If it rains, we will stay home. (条件状语从句)',
              'Because he was tired, he went to bed early. (原因状语从句)'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'The book what I bought is good.',
            correction: 'The book that I bought is good.',
            explanation: '引导定语从句修饰物时用that或which，不用what'
          }
        ]
      },
      {
        id: 'passive-voice',
        name: '被动语态',
        description: '表示主语是动作的承受者，而不是执行者',
        level: 'intermediate',
        rules: [
          {
            id: 'passive-structure',
            title: '基本结构',
            content: '主语 + be动词 + 过去分词 + (by + 动作执行者)',
            examples: [
              'The book was written by him.',
              'The house is being built.',
              'The work has been finished.'
            ]
          },
          {
            id: 'passive-tenses',
            title: '各种时态的被动语态',
            content: '不同时态下被动语态的构成',
            examples: [
              '一般现在时：is/am/are + done',
              '一般过去时：was/were + done',
              '现在完成时：has/have been + done',
              '将来时：will be + done'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'The letter was wrote by me.',
            correction: 'The letter was written by me.',
            explanation: '被动语态需要使用过去分词written，不是过去式wrote'
          }
        ]
      },
      {
        id: 'conditionals',
        name: '虚拟语气/条件句',
        description: '表示假设、愿望或与事实相反的情况',
        level: 'advanced',
        rules: [
          {
            id: 'zero-conditional',
            title: '零条件句',
            content: '表示普遍真理或科学事实',
            examples: [
              'If you heat water, it boils.',
              'When it rains, the ground gets wet.'
            ]
          },
          {
            id: 'first-conditional',
            title: '第一条件句',
            content: '表示可能实现的条件',
            examples: [
              'If it rains tomorrow, I will stay home.',
              'If you study hard, you will pass the exam.'
            ]
          },
          {
            id: 'second-conditional',
            title: '第二条件句',
            content: '表示与现在事实相反的假设',
            examples: [
              'If I were rich, I would travel around the world.',
              'If I had time, I would help you.'
            ]
          },
          {
            id: 'third-conditional',
            title: '第三条件句',
            content: '表示与过去事实相反的假设',
            examples: [
              'If I had studied harder, I would have passed the exam.',
              'If she had left earlier, she wouldn\'t have been late.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'If I was you, I would go.',
            correction: 'If I were you, I would go.',
            explanation: '第二条件句中，be动词在所有人称后都用were'
          }
        ]
      },
      {
        id: 'reported-speech',
        name: '间接引语',
        description: '转述别人说过的话',
        level: 'intermediate',
        rules: [
          {
            id: 'reported-statements',
            title: '转述陈述句',
            content: '时态后移，人称和时间状语相应变化',
            examples: [
              '直接引语：He said, "I am busy."',
              '间接引语：He said (that) he was busy.',
              '直接引语：She said, "I will come tomorrow."',
              '间接引语：She said she would come the next day.'
            ]
          },
          {
            id: 'reported-questions',
            title: '转述疑问句',
            content: '疑问句转为陈述句语序',
            examples: [
              '直接引语：He asked, "Where do you live?"',
              '间接引语：He asked where I lived.',
              '直接引语：She asked, "Are you coming?"',
              '间接引语：She asked if/whether I was coming.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'He said that he is busy.',
            correction: 'He said that he was busy.',
            explanation: '间接引语中时态需要后移'
          }
        ]
      },
      {
        id: 'non-finite-verbs',
        name: '非谓语动词',
        description: '不定式、动名词、现在分词和过去分词的用法',
        level: 'advanced',
        rules: [
          {
            id: 'infinitives',
            title: '不定式 (to do)',
            content: '作主语、宾语、定语、状语、宾补等成分',
            examples: [
              'To learn English is important. (主语)',
              'I want to go home. (宾语)',
              'I have something to tell you. (定语)',
              'He came to help me. (目的状语)',
              'I saw him enter the room. (宾补，省略to)'
            ]
          },
          {
            id: 'gerunds',
            title: '动名词 (-ing)',
            content: '具有名词特征，可作主语、宾语、表语等',
            examples: [
              'Swimming is good exercise. (主语)',
              'I enjoy reading books. (宾语)',
              'My hobby is collecting stamps. (表语)',
              'Thank you for helping me. (介词宾语)'
            ]
          },
          {
            id: 'participles',
            title: '分词 (现在分词-ing/过去分词-ed)',
            content: '现在分词表示主动进行，过去分词表示被动完成',
            examples: [
              'The girl sitting there is my sister. (现在分词作定语)',
              'The book written by him is popular. (过去分词作定语)',
              'Seeing the teacher, the students stood up. (现在分词作状语)',
              'Moved by the story, she cried. (过去分词作状语)'
            ]
          },
          {
            id: 'absolute-construction',
            title: '独立主格结构',
            content: '名词/代词 + 非谓语动词，作状语',
            examples: [
              'Weather permitting, we will go camping.',
              'The work finished, we went home.',
              'He entered the room, his hands trembling.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I want go home.',
            correction: 'I want to go home.',
            explanation: 'want后面要用不定式to do'
          },
          {
            mistake: 'I enjoy to read books.',
            correction: 'I enjoy reading books.',
            explanation: 'enjoy后面要用动名词doing'
          },
          {
            mistake: 'The book writing by him is good.',
            correction: 'The book written by him is good.',
            explanation: '书是"被写"的，应该用过去分词written表示被动'
          }
        ]
      },
      {
        id: 'inversion',
        name: '倒装句',
        description: '为了强调或语法需要而改变正常语序的句子',
        level: 'advanced',
        rules: [
          {
            id: 'partial-inversion',
            title: '部分倒装',
            content: '助动词/情态动词提前到主语前',
            examples: [
              'Never have I seen such a beautiful sunset.',
              'Only when he arrived did we start the meeting.',
              'Not only does he speak English, but also French.',
              'So tired was he that he fell asleep immediately.'
            ]
          },
          {
            id: 'full-inversion',
            title: '完全倒装',
            content: '整个谓语动词提前到主语前',
            examples: [
              'Here comes the bus.',
              'There stands a tall building.',
              'Away flew the bird.',
              'In the room sat an old man.'
            ]
          },
          {
            id: 'conditional-inversion',
            title: '虚拟条件句倒装',
            content: '省略if，将were/had/should提前',
            examples: [
              'Were I you, I would accept the offer.',
              'Had he studied harder, he would have passed.',
              'Should you need help, please call me.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'Never I have seen such a thing.',
            correction: 'Never have I seen such a thing.',
            explanation: '否定副词开头要用部分倒装：助动词+主语+实义动词'
          }
        ]
      },
      {
        id: 'ellipsis',
        name: '省略句',
        description: '为了避免重复或简洁表达而省略某些成分的句子',
        level: 'intermediate',
        rules: [
          {
            id: 'simple-ellipsis',
            title: '简单省略',
            content: '省略主语、谓语或宾语等成分',
            examples: [
              'Glad to see you. (省略I am)',
              'What about a cup of coffee? (省略having)',
              'If necessary, I will help you. (省略it is)',
              'When in Rome, do as the Romans do. (省略you are)'
            ]
          },
          {
            id: 'comparative-ellipsis',
            title: '比较句中的省略',
            content: '比较结构中常省略重复部分',
            examples: [
              'Tom is taller than Jim (is tall).',
              'She works harder than I (work hard).',
              'He has more books than she (has books).'
            ]
          },
          {
            id: 'infinitive-ellipsis',
            title: '不定式的省略',
            content: '为了避免重复，保留to而省略动词',
            examples: [
              'I asked him to stay, but he didn\'t want to (stay).',
              'You can leave if you want to (leave).',
              'She didn\'t go, although she ought to (have gone).'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'When I was young, my father taught me how to swim.',
            correction: 'When young, my father taught me how to swim.',
            explanation: '状语从句中主从句主语一致时可省略从句的主语和be动词'
          }
        ]
      },
      {
        id: 'emphasis',
        name: '强调句型',
        description: '用来强调句子某一成分的特殊句型',
        level: 'intermediate',
        rules: [
          {
            id: 'it-cleft',
            title: 'It强调句',
            content: 'It is/was + 被强调部分 + that/who + 其他部分',
            examples: [
              'It was Tom who broke the window. (强调主语)',
              'It was yesterday that I met him. (强调时间状语)',
              'It is English that she teaches. (强调宾语)',
              'It was in the park that we met. (强调地点状语)'
            ]
          },
          {
            id: 'what-cleft',
            title: 'What强调句',
            content: 'What + 主语 + 谓语 + is/was + 被强调部分',
            examples: [
              'What I need is your help.',
              'What he said was true.',
              'What surprised me was his honesty.',
              'What matters most is your attitude.'
            ]
          },
          {
            id: 'auxiliary-do',
            title: '助动词do强调',
            content: '用do/does/did强调谓语动词',
            examples: [
              'I do love you. (强调love)',
              'She does speak English well. (强调speak)',
              'He did come yesterday. (强调come)'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'It was Tom which broke the window.',
            correction: 'It was Tom who broke the window.',
            explanation: '强调人时用who，强调物时用that'
          },
          {
            mistake: 'It is in the park where we met.',
            correction: 'It was in the park that we met.',
            explanation: '强调句型用that，不是where'
          }
        ]
      },
      {
        id: 'tag-questions',
        name: '反义疑问句',
        description: '在陈述句后加简短问句进行确认或征询意见',
        level: 'intermediate',
        rules: [
          {
            id: 'basic-rules',
            title: '基本规则',
            content: '前肯后否，前否后肯；时态、人称保持一致',
            examples: [
              'You are a student, aren\'t you?',
              'He doesn\'t like coffee, does he?',
              'They went home, didn\'t they?',
              'She can swim, can\'t she?'
            ]
          },
          {
            id: 'special-cases',
            title: '特殊情况',
            content: '祈使句、感叹句、存在句的反义疑问句',
            examples: [
              'Let\'s go, shall we?',
              'Let me help you, will you?',
              'Open the door, will you?',
              'There is nothing wrong, is there?'
            ]
          },
          {
            id: 'negative-words',
            title: '含否定意义的词',
            content: 'never, hardly, seldom等视为否定',
            examples: [
              'He never comes late, does he?',
              'She hardly speaks English, does she?',
              'You seldom go out, do you?'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'He is a teacher, isn\'t she?',
            correction: 'He is a teacher, isn\'t he?',
            explanation: '反义疑问句的人称要与陈述句主语一致'
          },
          {
            mistake: 'Let\'s go, will we?',
            correction: 'Let\'s go, shall we?',
            explanation: 'Let\'s开头的祈使句，反义疑问句用shall we'
          }
        ]
      },
      {
        id: 'comparison',
        name: '比较结构',
        description: '表示事物之间比较关系的各种句型结构',
        level: 'intermediate',
        rules: [
          {
            id: 'as-as',
            title: 'as...as结构',
            content: '表示同等程度的比较',
            examples: [
              'She is as tall as her sister.',
              'He doesn\'t work as/so hard as she does.',
              'This book is as interesting as that one.',
              'Run as fast as you can.'
            ]
          },
          {
            id: 'comparative-superlative',
            title: '比较级和最高级的特殊用法',
            content: '比较级表示最高级含义',
            examples: [
              'He is taller than any other student in his class.',
              'Nothing is more important than health.',
              'The more you practice, the better you become.',
              'He couldn\'t be happier. (= He is very happy)'
            ]
          },
          {
            id: 'multiple-comparison',
            title: '倍数比较',
            content: '表示倍数关系的比较结构',
            examples: [
              'This room is three times as large as that one.',
              'This room is three times larger than that one.',
              'This room is three times the size of that one.',
              'The population has increased by three times.'
            ]
          },
          {
            id: 'progressive-comparison',
            title: '递进比较',
            content: 'the more...the more结构',
            examples: [
              'The more you eat, the fatter you become.',
              'The harder you work, the more successful you will be.',
              'The more I know him, the more I like him.'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'He is more taller than me.',
            correction: 'He is taller than me.',
            explanation: '比较级前不能加more，tall的比较级是taller'
          },
          {
            mistake: 'This room is three times bigger as that one.',
            correction: 'This room is three times as big as that one.',
            explanation: '倍数比较要用three times as...as结构'
          }
        ]
      },
      {
        id: 'fixed-patterns',
        name: '固定句型与搭配',
        description: '英语中的常见固定句型和习惯搭配',
        level: 'intermediate',
        rules: [
          {
            id: 'it-patterns',
            title: 'It句型',
            content: 'It作形式主语或形式宾语的常见句型',
            examples: [
              'It is + adj. + (for sb.) + to do sth.',
              'It is + adj. + that从句',
              'It takes sb. + time + to do sth.',
              'It is + time + since/when/before从句',
              'It seems/appears + that从句',
              'It happens + that从句'
            ]
          },
          {
            id: 'there-be',
            title: 'There be句型',
            content: 'There be结构的各种变体和时态',
            examples: [
              'There is/are...',
              'There was/were...',
              'There will be...',
              'There has/have been...',
              'There seems/appears to be...',
              'There is no doubt that...'
            ]
          },
          {
            id: 'causative-verbs',
            title: '使役动词和感官动词',
            content: 'make, let, have, see, hear, watch等的用法',
            examples: [
              'make sb. do sth. / make sb./sth. done',
              'let sb. do sth.',
              'have sb. do sth. / have sth. done',
              'see/hear/watch sb. do sth. / doing sth.',
              'feel sb./sth. do sth. / doing sth.'
            ]
          },
          {
            id: 'common-patterns',
            title: '其他常见句型',
            content: '高频固定表达和句式结构',
            examples: [
              'It is/was + 序数词 + time + that从句 (现在/过去完成时)',
              'No sooner...than... / Hardly...when...',
              'would rather...than...',
              'prefer to do...rather than do...',
              'can\'t help doing / can\'t help but do',
              'be about to do...when...'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'It is easy for learn English.',
            correction: 'It is easy to learn English.',
            explanation: 'It is + adj. + to do句型中要用不定式'
          },
          {
            mistake: 'I saw him to enter the room.',
            correction: 'I saw him enter the room.',
            explanation: '感官动词后用动词原形作宾补'
          },
          {
            mistake: 'There have many students in the classroom.',
            correction: 'There are many students in the classroom.',
            explanation: 'There be句型不能用have替代'
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
          },
          {
            id: 'auxiliary-verbs',
            title: '助动词',
            content: 'be, do, have作为助动词的用法',
            examples: [
              'She is reading. (be作助动词)',
              'Do you like coffee? (do作助动词)',
              'I have finished. (have作助动词)'
            ]
          },
          {
            id: 'phrasal-verbs',
            title: '短语动词',
            content: '动词 + 介词/副词组成的短语',
            examples: [
              'turn on the light',
              'give up smoking',
              'look forward to meeting you'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I can to swim.',
            correction: 'I can swim.',
            explanation: '情态动词后直接跟动词原形，不需要to'
          }
        ]
      },
      {
        id: 'adjectives',
        name: '形容词',
        description: '修饰名词或代词，表示性质、特征的词',
        level: 'beginner',
        rules: [
          {
            id: 'adjective-position',
            title: '形容词的位置',
            content: '通常放在名词前或系动词后',
            examples: [
              'a beautiful girl (名词前)',
              'The girl is beautiful. (系动词后)',
              'something interesting (复合不定代词后)'
            ]
          },
          {
            id: 'adjective-comparison',
            title: '形容词比较级和最高级',
            content: '比较级：-er/more，最高级：-est/most',
            examples: [
              'tall → taller → tallest',
              'beautiful → more beautiful → most beautiful',
              'good → better → best (不规则)'
            ]
          },
          {
            id: 'adjective-order',
            title: '多个形容词的排列顺序',
            content: '观点→尺寸→年龄→形状→颜色→出处→材料→用途',
            examples: [
              'a beautiful small old round red Chinese wooden tea table',
              'a nice big new house',
              'some delicious hot Chinese food'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'She is more tall than me.',
            correction: 'She is taller than me.',
            explanation: '单音节形容词用-er形式，不用more'
          }
        ]
      },
      {
        id: 'adverbs',
        name: '副词',
        description: '修饰动词、形容词或其他副词的词',
        level: 'intermediate',
        rules: [
          {
            id: 'adverb-formation',
            title: '副词的构成',
            content: '大多数由形容词 + ly构成',
            examples: [
              'quick → quickly',
              'careful → carefully',
              'good → well (不规则)',
              'fast → fast (同形)'
            ]
          },
          {
            id: 'adverb-types',
            title: '副词的类型',
            content: '时间、地点、方式、程度、频率副词',
            examples: [
              '时间：yesterday, now, soon',
              '地点：here, there, everywhere',
              '方式：carefully, quickly, well',
              '程度：very, quite, extremely',
              '频率：always, often, never'
            ]
          },
          {
            id: 'adverb-position',
            title: '副词的位置',
            content: '根据副词类型和强调需要确定位置',
            examples: [
              'She speaks English fluently. (方式副词在句尾)',
              'I always get up early. (频率副词在实义动词前)',
              'Yesterday I went to school. (时间副词可在句首)'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'She sings beautiful.',
            correction: 'She sings beautifully.',
            explanation: '修饰动词应该用副词beautifully，不是形容词beautiful'
          }
        ]
      },
      {
        id: 'prepositions',
        name: '介词',
        description: '表示名词、代词与句中其他词关系的词',
        level: 'intermediate',
        rules: [
          {
            id: 'prepositions-of-time',
            title: '时间介词',
            content: 'at, on, in, for, since, during等',
            examples: [
              'at 3 o\'clock, at night',
              'on Monday, on May 1st',
              'in the morning, in 2023',
              'for 3 hours, since 2020'
            ]
          },
          {
            id: 'prepositions-of-place',
            title: '地点介词',
            content: 'at, on, in, under, over, between等',
            examples: [
              'at the bus stop, at home',
              'on the table, on the wall',
              'in the room, in the box',
              'under the chair, over the bridge'
            ]
          },
          {
            id: 'prepositions-of-movement',
            title: '方向介词',
            content: 'to, from, into, out of, through等',
            examples: [
              'go to school',
              'come from China',
              'walk into the room',
              'run out of the house'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I arrive to school at 8.',
            correction: 'I arrive at school at 8.',
            explanation: 'arrive后用at或in，不用to'
          }
        ]
      },
      {
        id: 'articles',
        name: '冠词',
        description: '限定名词的词：不定冠词a/an和定冠词the',
        level: 'beginner',
        rules: [
          {
            id: 'indefinite-articles',
            title: '不定冠词 a/an',
            content: 'a用于辅音音素前，an用于元音音素前',
            examples: [
              'a book, a university (u发/ju/音)',
              'an apple, an hour (h不发音)',
              'a one-year-old boy (o发/w/音)'
            ]
          },
          {
            id: 'definite-article',
            title: '定冠词 the',
            content: '特指、独一无二、上文提到过的事物',
            examples: [
              'the sun, the moon (独一无二)',
              'I bought a book. The book is interesting. (上文提到)',
              'the boy in red (特指)'
            ]
          },
          {
            id: 'zero-article',
            title: '零冠词',
            content: '复数名词泛指、不可数名词泛指、专有名词等',
            examples: [
              'Books are important. (复数泛指)',
              'Water is essential. (不可数名词泛指)',
              'China is a big country. (专有名词)'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'I want to be a engineer.',
            correction: 'I want to be an engineer.',
            explanation: 'engineer以元音音素开头，应该用an'
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
            id: 'period-usage',
            title: '句号 (.)',
            content: '用于陈述句和命令句的结尾',
            examples: [
              'I love English.',
              'Please close the door.',
              'The meeting starts at 9 a.m.'
            ]
          },
          {
            id: 'comma-usage',
            title: '逗号 (,)',
            content: '用于分隔句子成分、连接并列成分、分隔日期地址等',
            examples: [
              'I like apples, oranges, and bananas.',
              'After dinner, we watched TV.',
              'She is smart, kind, and beautiful.',
              'On March 15, 2023, we moved to New York.',
              'She lives in Paris, France.'
            ]
          },
          {
            id: 'question-mark',
            title: '问号 (?)',
            content: '用于疑问句的结尾',
            examples: [
              'What time is it?',
              'Are you coming to the party?',
              'Where did you go yesterday?'
            ]
          },
          {
            id: 'exclamation-mark',
            title: '感叹号 (!)',
            content: '用于表达强烈情感或感叹句',
            examples: [
              'What a beautiful day!',
              'Watch out!',
              'Congratulations on your success!'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'What time is it.',
            correction: 'What time is it?',
            explanation: '疑问句结尾应该用问号，不是句号'
          }
        ]
      },
      {
        id: 'advanced-punctuation',
        name: '高级标点',
        description: '分号、冒号、引号、省略号等的使用',
        level: 'intermediate',
        rules: [
          {
            id: 'semicolon-usage',
            title: '分号 (;)',
            content: '连接关系密切的两个独立句子，或分隔复杂列表项',
            examples: [
              'I have a meeting at 3 PM; I cannot join you for lunch.',
              'She studied hard; therefore, she passed the exam.',
              'We visited Paris, France; Rome, Italy; and Madrid, Spain.'
            ]
          },
          {
            id: 'colon-usage',
            title: '冒号 (:)',
            content: '用于引出解释、列表、引语或时间表示',
            examples: [
              'I need three things: patience, courage, and wisdom.',
              'The rule is simple: work hard and be kind.',
              'Dear Sir: (正式信件开头)',
              'The meeting starts at 2:30 PM.'
            ]
          },
          {
            id: 'quotation-marks',
            title: '引号 (" " 或 \' \')',
            content: '用于直接引语、书名、强调等',
            examples: [
              'She said, "I will be there soon."',
              'Have you read "Pride and Prejudice"?',
              'The word "beautiful" has many synonyms.',
              '"Hello," he said, "how are you?"'
            ]
          },
          {
            id: 'apostrophe-usage',
            title: '撇号 (\')',
            content: '用于缩写形式和所有格',
            examples: [
              'I can\'t go today. (can\'t = cannot)',
              'She\'s my best friend. (she\'s = she is)',
              'This is John\'s book.',
              'The students\' books are on the table.'
            ]
          },
          {
            id: 'ellipsis-usage',
            title: '省略号 (...)',
            content: '表示省略、停顿或未完成的想法',
            examples: [
              'I was thinking... maybe we should wait.',
              'To be or not to be...',
              'The recipe calls for flour, sugar, eggs...'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'Its a beautiful day.',
            correction: 'It\'s a beautiful day.',
            explanation: '缩写形式需要撇号：it\'s = it is'
          },
          {
            mistake: 'The dog\'s are playing.',
            correction: 'The dogs are playing.',
            explanation: '复数形式不需要撇号，撇号用于所有格'
          }
        ]
      },
      {
        id: 'specialized-punctuation',
        name: '特殊标点',
        description: '括号、破折号、连字符等特殊标点符号',
        level: 'advanced',
        rules: [
          {
            id: 'parentheses-usage',
            title: '圆括号 ( )',
            content: '用于插入补充信息、解释或例子',
            examples: [
              'The meeting (scheduled for 3 PM) has been postponed.',
              'Please bring your ID (driver\'s license or passport).',
              'Shakespeare (1564-1616) wrote many famous plays.'
            ]
          },
          {
            id: 'dash-usage',
            title: '破折号 (—)',
            content: '用于强调、插入语或表示突然转换',
            examples: [
              'The weather was perfect—sunny and warm.',
              'My favorite subjects—math, science, and English—are all challenging.',
              'I was about to leave—then the phone rang.'
            ]
          },
          {
            id: 'hyphen-usage',
            title: '连字符 (-)',
            content: '用于复合词、数字、单词拆分等',
            examples: [
              'twenty-one, thirty-five',
              'mother-in-law, well-known',
              'self-confidence, up-to-date',
              'The word is hyphen-ated at the end of the line.'
            ]
          },
          {
            id: 'brackets-usage',
            title: '方括号 [ ]',
            content: '用于编辑性插入或在引语中添加说明',
            examples: [
              'The report states: "Sales increased [by 15%] last quarter."',
              'She said, "I saw him [John] at the store."',
              '[sic] 表示原文就是这样写的'
            ]
          }
        ],
        commonMistakes: [
          {
            mistake: 'twenty one',
            correction: 'twenty-one',
            explanation: '21-99的数字需要用连字符连接'
          },
          {
            mistake: 'well known',
            correction: 'well-known',
            explanation: '复合形容词通常需要连字符'
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
  'present-perfect': [
    {
      id: 'pp-ex-1',
      type: 'fill-blank',
      question: 'I _____ (finish) my homework.',
      answer: 'have finished',
      explanation: '现在完成时的结构是 have/has + 过去分词',
      difficulty: 'medium'
    },
    {
      id: 'pp-ex-2',
      type: 'multiple-choice',
      question: 'Choose the correct sentence:',
      options: [
        'I have go there yesterday.',
        'I went there yesterday.',
        'I have went there yesterday.',
        'I go there yesterday.'
      ],
      answer: 1,
      explanation: '明确的过去时间点应该用一般过去时',
      difficulty: 'medium'
    },
    {
      id: 'pp-ex-3',
      type: 'correction',
      sentence: 'She has went to school.',
      correctSentence: 'She has gone to school.',
      explanation: '现在完成时需要过去分词gone，不是过去式went',
      difficulty: 'medium'
    }
  ],
  'past-simple': [
    {
      id: 'past-ex-1',
      type: 'fill-blank',
      question: 'I _____ (go) to the store yesterday.',
      answer: 'went',
      explanation: 'go的过去式是不规则变化went',
      difficulty: 'easy'
    },
    {
      id: 'past-ex-2',
      type: 'correction',
      sentence: 'I goed to school yesterday.',
      correctSentence: 'I went to school yesterday.',
      explanation: 'go的过去式是went，不是goed',
      difficulty: 'easy'
    }
  ],
  'future-simple': [
    {
      id: 'fs-ex-1',
      type: 'fill-blank',
      question: 'I _____ call you tomorrow.',
      answer: 'will',
      explanation: '将来时用will + 动词原形',
      difficulty: 'easy'
    },
    {
      id: 'fs-ex-2',
      type: 'correction',
      sentence: 'I will to go there tomorrow.',
      correctSentence: 'I will go there tomorrow.',
      explanation: 'will后面直接跟动词原形，不需要to',
      difficulty: 'easy'
    }
  ],
  'passive-voice': [
    {
      id: 'pv-ex-1',
      type: 'fill-blank',
      question: 'The book _____ (write) by him.',
      answer: 'was written',
      explanation: '被动语态需要be动词 + 过去分词',
      difficulty: 'medium'
    },
    {
      id: 'pv-ex-2',
      type: 'correction',
      sentence: 'The letter was wrote by me.',
      correctSentence: 'The letter was written by me.',
      explanation: '被动语态需要过去分词written，不是过去式wrote',
      difficulty: 'medium'
    }
  ],
  'conditionals': [
    {
      id: 'cond-ex-1',
      type: 'correction',
      sentence: 'If I was you, I would go.',
      correctSentence: 'If I were you, I would go.',
      explanation: '第二条件句中，be动词在所有人称后都用were',
      difficulty: 'hard'
    },
    {
      id: 'cond-ex-2',
      type: 'multiple-choice',
      question: 'Which is a first conditional sentence?',
      options: [
        'If I were rich, I would travel.',
        'If it rains tomorrow, I will stay home.',
        'If I had studied harder, I would have passed.',
        'If you heat water, it boils.'
      ],
      answer: 1,
      explanation: '第一条件句表示可能实现的条件：if + 现在时, will + 动词原形',
      difficulty: 'medium'
    }
  ],
  'reported-speech': [
    {
      id: 'rs-ex-1',
      type: 'fill-blank',
      question: 'He said, "I am busy." → He said that he _____ busy.',
      answer: 'was',
      explanation: '间接引语中时态需要后移',
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
  'clauses': [
    {
      id: 'cl-ex-1',
      type: 'correction',
      sentence: 'The book what I bought is good.',
      correctSentence: 'The book that I bought is good.',
      explanation: '引导定语从句修饰物时用that或which，不用what',
      difficulty: 'hard'
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
  ],
  'verbs': [
    {
      id: 'v-ex-1',
      type: 'correction',
      sentence: 'I can to swim.',
      correctSentence: 'I can swim.',
      explanation: '情态动词后直接跟动词原形，不需要to',
      difficulty: 'easy'
    },
    {
      id: 'v-ex-2',
      type: 'multiple-choice',
      question: 'Which is a modal verb?',
      options: [
        'work',
        'should',
        'beautiful',
        'quickly'
      ],
      answer: 1,
      explanation: 'should是情态动词，表示建议或义务',
      difficulty: 'easy'
    }
  ],
  'adjectives': [
    {
      id: 'adj-ex-1',
      type: 'correction',
      sentence: 'She is more tall than me.',
      correctSentence: 'She is taller than me.',
      explanation: '单音节形容词用-er形式，不用more',
      difficulty: 'medium'
    },
    {
      id: 'adj-ex-2',
      type: 'multiple-choice',
      question: 'What is the correct order of adjectives?',
      options: [
        'a Chinese beautiful small car',
        'a beautiful small Chinese car',
        'a small beautiful Chinese car',
        'a Chinese small beautiful car'
      ],
      answer: 1,
      explanation: '形容词排序：观点(beautiful) + 尺寸(small) + 出处(Chinese)',
      difficulty: 'hard'
    }
  ],
  'adverbs': [
    {
      id: 'adv-ex-1',
      type: 'correction',
      sentence: 'She sings beautiful.',
      correctSentence: 'She sings beautifully.',
      explanation: '修饰动词应该用副词beautifully，不是形容词beautiful',
      difficulty: 'medium'
    },
    {
      id: 'adv-ex-2',
      type: 'multiple-choice',
      question: 'Which word is a frequency adverb?',
      options: [
        'quickly',
        'here',
        'always',
        'very'
      ],
      answer: 2,
      explanation: 'always是频率副词，表示总是',
      difficulty: 'easy'
    }
  ],
  'prepositions': [
    {
      id: 'prep-ex-1',
      type: 'correction',
      sentence: 'I arrive to school at 8.',
      correctSentence: 'I arrive at school at 8.',
      explanation: 'arrive后用at或in，不用to',
      difficulty: 'medium'
    },
    {
      id: 'prep-ex-2',
      type: 'multiple-choice',
      question: 'Choose the correct preposition:',
      options: [
        'in Monday',
        'on Monday',
        'at Monday',
        'by Monday'
      ],
      answer: 1,
      explanation: '星期前用介词on',
      difficulty: 'easy'
    }
  ],
  'articles': [
    {
      id: 'art-ex-1',
      type: 'correction',
      sentence: 'I want to be a engineer.',
      correctSentence: 'I want to be an engineer.',
      explanation: 'engineer以元音音素开头，应该用an',
      difficulty: 'easy'
    },
    {
      id: 'art-ex-2',
      type: 'multiple-choice',
      question: 'Choose the correct article:',
      options: [
        'a university',
        'an university',
        'the university',
        'no article needed'
      ],
      answer: 0,
      explanation: 'university虽然以元音字母开头，但发音以辅音/j/开头，用a',
      difficulty: 'medium'
    }
  ],
  'basic-punctuation': [
    {
      id: 'bp-ex-1',
      type: 'correction',
      sentence: 'What time is it.',
      correctSentence: 'What time is it?',
      explanation: '疑问句结尾应该用问号，不是句号',
      difficulty: 'easy'
    },
    {
      id: 'bp-ex-2',
      type: 'multiple-choice',
      question: 'Which sentence uses commas correctly?',
      options: [
        'I like apples oranges and bananas.',
        'I like apples, oranges, and bananas.',
        'I like apples oranges, and bananas.',
        'I like, apples oranges and bananas.'
      ],
      answer: 1,
      explanation: '连接并列成分时，逗号放在每个成分后面',
      difficulty: 'easy'
    }
  ],
  'advanced-punctuation': [
    {
      id: 'ap-ex-1',
      type: 'correction',
      sentence: 'Its a beautiful day.',
      correctSentence: 'It\'s a beautiful day.',
      explanation: '缩写形式需要撇号：it\'s = it is',
      difficulty: 'easy'
    },
    {
      id: 'ap-ex-2',
      type: 'correction',
      sentence: 'The dog\'s are playing.',
      correctSentence: 'The dogs are playing.',
      explanation: '复数形式不需要撇号，撇号用于所有格',
      difficulty: 'medium'
    }
  ],
  'specialized-punctuation': [
    {
      id: 'sp-punc-ex-1',
      type: 'correction',
      sentence: 'twenty one',
      correctSentence: 'twenty-one',
      explanation: '21-99的数字需要用连字符连接',
      difficulty: 'easy'
    },
    {
      id: 'sp-punc-ex-2',
      type: 'correction',
      sentence: 'well known',
      correctSentence: 'well-known',
      explanation: '复合形容词通常需要连字符',
      difficulty: 'medium'
    }
  ],
  // 添加新语法点的练习题
  'past-perfect': [
    {
      id: 'ppf-ex-1',
      type: 'fill-blank',
      question: 'By the time I arrived, the meeting _____ (start).',
      answer: 'had started',
      explanation: '过去完成时表示过去的过去，用had + 过去分词',
      difficulty: 'medium'
    }
  ],
  'future-perfect': [
    {
      id: 'fp-grammar-ex-1',
      type: 'fill-blank',
      question: 'By tomorrow, I _____ (finish) the report.',
      answer: 'will have finished',
      explanation: '将来完成时表示将来某时间前完成的动作',
      difficulty: 'hard'
    }
  ],
  'past-future': [
    {
      id: 'paf-ex-1',
      type: 'fill-blank',
      question: 'He said he _____ (come) the next day.',
      answer: 'would come',
      explanation: '间接引语中，将来时要变为过去将来时',
      difficulty: 'medium'
    }
  ],
  'future-continuous': [
    {
      id: 'fc-ex-1',
      type: 'fill-blank',
      question: 'At this time tomorrow, I _____ (fly) to Tokyo.',
      answer: 'will be flying',
      explanation: '将来进行时表示将来某时刻正在进行的动作',
      difficulty: 'hard'
    }
  ],
  'non-finite-verbs': [
    {
      id: 'nfv-ex-1',
      type: 'correction',
      sentence: 'I want go home.',
      correctSentence: 'I want to go home.',
      explanation: 'want后面要用不定式to do',
      difficulty: 'easy'
    }
  ],
  'inversion': [
    {
      id: 'inv-ex-1',
      type: 'correction',
      sentence: 'Never I have seen such a thing.',
      correctSentence: 'Never have I seen such a thing.',
      explanation: '否定副词开头要用部分倒装：助动词+主语+实义动词',
      difficulty: 'hard'
    }
  ],
  'emphasis': [
    {
      id: 'emp-ex-1',
      type: 'correction',
      sentence: 'It was Tom which broke the window.',
      correctSentence: 'It was Tom who broke the window.',
      explanation: '强调人时用who，强调物时用that',
      difficulty: 'medium'
    }
  ],
  'tag-questions': [
    {
      id: 'tq-ex-1',
      type: 'correction',
      sentence: 'He is a teacher, isn\'t she?',
      correctSentence: 'He is a teacher, isn\'t he?',
      explanation: '反义疑问句的人称要与陈述句主语一致',
      difficulty: 'easy'
    }
  ],
  'comparison': [
    {
      id: 'comp-ex-1',
      type: 'correction',
      sentence: 'He is more taller than me.',
      correctSentence: 'He is taller than me.',
      explanation: '比较级前不能加more，tall的比较级是taller',
      difficulty: 'medium'
    }
  ],
  'fixed-patterns': [
    {
      id: 'fp-pattern-ex-1',
      type: 'correction',
      sentence: 'It is easy for learn English.',
      correctSentence: 'It is easy to learn English.',
      explanation: 'It is + adj. + to do句型中要用不定式',
      difficulty: 'medium'
    }
  ]
};

// 获取指定语法点的练习题
export const getExercisesByGrammarId = (grammarId) => {
  return practiceExercises[grammarId] || [];
};