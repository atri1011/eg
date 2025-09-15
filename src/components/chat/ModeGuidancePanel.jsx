import React, { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Target,
  BookOpen,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Globe,
  PenTool
} from 'lucide-react';

// 模式提示和指导内容
const MODE_GUIDANCE = {
  free_chat: {
    title: '自由对话模式',
    tips: [
      '随意用英语表达你的想法，不用担心语法错误',
      'AI会提供自然友好的回复和即时翻译',
      '专注于对话流畅性，享受交流过程'
    ],
    starters: [
      "What's your favorite hobby?",
      "Tell me about your weekend plans",
      "What kind of movies do you like?",
      "How was your day today?"
    ],
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  writing_enhancement: {
    title: '写作提升模式',
    tips: [
      '分享你的英语写作，AI会提供结构化指导',
      '获得词汇选择、语法优化和风格建议',
      '逐步提升学术、商务等不同场景的写作能力'
    ],
    starters: [
      "Please review my essay about...",
      "Help me improve this email...",
      "I wrote a paragraph about...",
      "Can you check my report on..."
    ],
    icon: PenTool,
    color: 'bg-green-500'
  },
  grammar_focus: {
    title: '语法提升模式',
    tips: [
      '提交包含语法问题的句子，获得详细纠正',
      '学习语法规则和正确用法',
      '通过实例练习掌握复杂语法点'
    ],
    starters: [
      "I am going to shop yesterday",
      "She don't like coffee",
      "There is many people here",
      "I have went to the store"
    ],
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  role_playing: {
    title: '角色扮演模式',
    tips: [
      '选择场景进行实际对话练习',
      '学习场景特定的表达和词汇',
      '提升在真实情境中的英语应用能力'
    ],
    starters: [
      "Let's practice a job interview",
      "I want to practice ordering food",
      "Can we simulate a business meeting?",
      "Help me practice hotel check-in"
    ],
    icon: Briefcase,
    color: 'bg-orange-500'
  },
  topic_discussion: {
    title: '主题探讨模式',
    tips: [
      '选择感兴趣的话题进行深度讨论',
      '扩展话题相关的高级词汇',
      '练习逻辑论证和批判性思维表达'
    ],
    starters: [
      "What do you think about artificial intelligence?",
      "How can we protect the environment?",
      "Discuss the impact of social media",
      "What's your view on remote work?"
    ],
    icon: Globe,
    color: 'bg-indigo-500'
  },
  cet_preparation: {
    title: '四六级备考模式',
    tips: [
      '练习四六级考试相关的词汇和句型',
      '获得写作模板和翻译技巧指导',
      '模拟考试场景，提升应试能力'
    ],
    starters: [
      "Practice CET-4 writing about education",
      "Help me with translation exercises",
      "Explain this vocabulary word...",
      "Give me a reading comprehension practice"
    ],
    icon: GraduationCap,
    color: 'bg-red-500'
  }
};

const ModeGuidancePanel = ({ mode = 'free_chat', className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false); // 默认折叠以节省空间
  const guidance = MODE_GUIDANCE[mode] || MODE_GUIDANCE.free_chat;
  const IconComponent = guidance.icon;

  return (
    <Card className={`${className} bg-white/80 backdrop-blur-sm border-white/50`}>
      <div 
        className="px-4 py-2 cursor-pointer hover:bg-white/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${guidance.color} text-white`}>
              <IconComponent className="w-3 h-3" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{guidance.title}</h3>
              {!isExpanded && (
                <p className="text-xs text-gray-500">点击展开使用指南</p>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* 使用提示 */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700">使用提示</span>
            </div>
            <ul className="space-y-1">
              {guidance.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 对话开场白 */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="font-medium text-gray-700">建议开场白</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {guidance.starters.map((starter, index) => (
                <div
                  key={index}
                  className="text-sm bg-gray-50 rounded-lg p-2 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    // 这里可以添加点击复制到输入框的功能
                    navigator.clipboard.writeText(starter);
                  }}
                >
                  <span className="text-gray-700 italic">"{starter}"</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-2 border border-blue-200">
            💡 点击任意开场白可复制到剪贴板
          </div>
        </div>
      )}
    </Card>
  );
};

export default ModeGuidancePanel;