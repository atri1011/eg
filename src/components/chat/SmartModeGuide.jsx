import React, { useState, useEffect } from 'react';
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
  PenTool,
  X
} from 'lucide-react';

// 简化的模式指导内容
const MODE_GUIDANCE = {
  free_chat: {
    title: '自由对话模式',
    quickTips: '随意用英语表达想法，享受自然交流',
    starters: [
      "What's your favorite hobby?",
      "Tell me about your weekend plans",
      "How was your day today?"
    ],
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  writing_enhancement: {
    title: '写作提升模式', 
    quickTips: '分享英语写作，获得结构化指导和优化建议',
    starters: [
      "Please review my essay about...",
      "Help me improve this email...",
      "I wrote a paragraph about..."
    ],
    icon: PenTool,
    color: 'bg-green-500'
  },
  grammar_focus: {
    title: '语法提升模式',
    quickTips: '提交语法问题句子，获得详细纠正和规则学习',
    starters: [
      "I am going to shop yesterday",
      "She don't like coffee",
      "There is many people here"
    ],
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  role_playing: {
    title: '角色扮演模式',
    quickTips: '选择场景进行实际对话练习，学习情境表达',
    starters: [
      "Let's practice a job interview",
      "I want to practice ordering food",
      "Can we simulate a business meeting?"
    ],
    icon: Briefcase,
    color: 'bg-orange-500'
  },
  topic_discussion: {
    title: '主题探讨模式',
    quickTips: '选择话题进行深度讨论，扩展高级词汇',
    starters: [
      "What do you think about AI?",
      "How can we protect environment?",
      "Discuss the impact of social media"
    ],
    icon: Globe,
    color: 'bg-indigo-500'
  },
  cet_preparation: {
    title: '四六级备考模式',
    quickTips: '练习考试相关词汇句型，获得应试技巧',
    starters: [
      "Practice CET-4 writing about education",
      "Help me with translation exercises",
      "Give me reading comprehension practice"
    ],
    icon: GraduationCap,
    color: 'bg-red-500'
  }
};

const SmartModeGuide = ({ 
  mode = 'free_chat', 
  messages = [], 
  onStarterClick,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const guidance = MODE_GUIDANCE[mode] || MODE_GUIDANCE.free_chat;
  const IconComponent = guidance.icon;
  
  // 智能显示逻辑：无消息时显示，有消息后可选择性显示
  useEffect(() => {
    if (isDismissed) return;
    
    const shouldShow = messages.length === 0; // 只在无对话历史时自动显示
    setIsVisible(shouldShow);
    setIsExpanded(false); // 默认折叠
  }, [messages.length, mode, isDismissed]);

  // 如果被完全忽略或有消息时不可见，不渲染任何内容
  if (isDismissed || (messages.length > 0 && !isVisible)) {
    return null;
  }

  const handleStarterClick = (starter) => {
    if (onStarterClick) {
      onStarterClick(starter);
    }
    setIsExpanded(false); // 点击后折叠
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`${className} transition-all duration-300 ease-in-out`}>
      {/* 简化的提示栏 */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50 mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <div className={`p-1.5 rounded-md ${guidance.color} text-white`}>
            <IconComponent className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {guidance.title}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {guidance.quickTips}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-6 w-6 hover:bg-white/60"
            title={isExpanded ? "收起建议" : "查看建议"}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1 h-6 w-6 hover:bg-white/60 text-gray-400 hover:text-gray-600"
            title="关闭指导"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 展开的建议内容 */}
      {isExpanded && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3 mb-2 space-y-3">
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Target className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-700">试试这些开场白</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {guidance.starters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(starter)}
                  className="text-left text-xs bg-gray-50/80 hover:bg-blue-50/80 rounded-md p-2 border border-gray-200/50 hover:border-blue-300/50 transition-colors cursor-pointer"
                >
                  <span className="text-gray-600 italic">"{starter}"</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-blue-600 bg-blue-50/50 rounded-md p-2 border border-blue-200/30">
            💡 点击任意建议可直接使用，或作为灵感自由发挥
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartModeGuide;