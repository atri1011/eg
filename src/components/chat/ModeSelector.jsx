import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { 
  MessageCircle, 
  PenTool, 
  BookOpen, 
  Users, 
  Globe, 
  GraduationCap,
  Settings,
  ChevronRight
} from 'lucide-react';

// 模式配置数据
const CONVERSATION_MODES = {
  free_chat: {
    name: '自由对话',
    description: '轻松自然的英语对话练习',
    icon: MessageCircle,
    color: 'bg-blue-500',
    badge: '基础'
  },
  writing_enhancement: {
    name: '写作提升',
    description: 'AI写作导师，提供结构化写作指导',
    icon: PenTool,
    color: 'bg-green-500',
    badge: '进阶'
  },
  grammar_focus: {
    name: '语法提升',
    description: '针对性语法练习和实时纠错',
    icon: BookOpen,
    color: 'bg-purple-500',
    badge: '基础'
  },
  role_playing: {
    name: '角色扮演',
    description: '商务、面试、旅游等场景模拟',
    icon: Users,
    color: 'bg-orange-500',
    badge: '进阶'
  },
  topic_discussion: {
    name: '主题探讨',
    description: '科技、文化等专业话题深度讨论',
    icon: Globe,
    color: 'bg-indigo-500',
    badge: '高级'
  },
  cet_preparation: {
    name: '四六级备考',
    description: 'CET-4/CET-6考试针对性练习',
    icon: GraduationCap,
    color: 'bg-red-500',
    badge: '考试'
  }
};

const ModeSelector = ({ currentMode = 'free_chat', onModeChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(currentMode);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    onModeChange(mode);
    setIsOpen(false);
  };

  const currentModeData = CONVERSATION_MODES[currentMode];
  const CurrentIcon = currentModeData?.icon || MessageCircle;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/80"
        >
          <div className={`p-1 rounded ${currentModeData?.color} text-white`}>
            <CurrentIcon className="w-3 h-3" />
          </div>
          <span className="hidden md:inline">{currentModeData?.name}</span>
          <Settings className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>选择对话模式</span>
          </DialogTitle>
          <DialogDescription>
            选择适合你当前学习目标的对话模式，AI将根据模式提供不同的指导方式。
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Object.entries(CONVERSATION_MODES).map(([modeKey, modeData]) => {
            const IconComponent = modeData.icon;
            const isSelected = selectedMode === modeKey;
            const isCurrentMode = currentMode === modeKey;
            
            return (
              <Card
                key={modeKey}
                className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : isCurrentMode
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleModeSelect(modeKey)}
              >
                {/* 当前模式标识 */}
                {isCurrentMode && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                      当前
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-lg ${modeData.color} text-white flex-shrink-0`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{modeData.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {modeData.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{modeData.description}</p>
                    
                    {/* 模式特色功能 */}
                    <div className="space-y-1">
                      {modeKey === 'free_chat' && (
                        <div className="text-xs text-gray-500">• 自然对话 • 即时翻译 • 流畅练习</div>
                      )}
                      {modeKey === 'writing_enhancement' && (
                        <div className="text-xs text-gray-500">• 结构指导 • 词汇提升 • 风格建议</div>
                      )}
                      {modeKey === 'grammar_focus' && (
                        <div className="text-xs text-gray-500">• 语法纠错 • 规则解释 • 练习建议</div>
                      )}
                      {modeKey === 'role_playing' && (
                        <div className="text-xs text-gray-500">• 场景模拟 • 实用表达 • 文化指导</div>
                      )}
                      {modeKey === 'topic_discussion' && (
                        <div className="text-xs text-gray-500">• 深度讨论 • 词汇扩展 • 逻辑训练</div>
                      )}
                      {modeKey === 'cet_preparation' && (
                        <div className="text-xs text-gray-500">• 考试技巧 • 词汇训练 • 题型练习</div>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isSelected ? 'rotate-90' : ''
                  }`} />
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong>每个模式都有专门设计的AI指导方式。你可以随时切换模式，新的对话将使用新模式的指导风格。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeSelector;