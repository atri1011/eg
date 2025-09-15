import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import SmartModeGuide from './SmartModeGuide';

// 模式相关的输入提示
const MODE_PLACEHOLDERS = {
  free_chat: "输入你想练习的英语句子...",
  writing_enhancement: "分享你的英语写作，获得结构化指导...",
  grammar_focus: "输入需要语法检查的英语句子...",
  role_playing: "开始场景对话，比如：'Let's practice a job interview'...",
  topic_discussion: "选择一个话题开始深度讨论...",
  cet_preparation: "练习四六级相关内容，如词汇、写作、翻译..."
};

const ChatInput = ({ 
  inputText, 
  setInputText, 
  handleKeyPress, 
  sendMessage, 
  isLoading, 
  config,
  mode = 'free_chat',
  messages = [] // 新增：用于智能指导
}) => {
  const placeholder = MODE_PLACEHOLDERS[mode] || MODE_PLACEHOLDERS.free_chat;
  
  // 处理建议点击
  const handleStarterClick = (starter) => {
    setInputText(starter);
  };
  
  return (
    <div className="border-t border-gray-200 bg-white/60">
      {/* 智能模式指导 - 集成在输入区域上方 */}
      <SmartModeGuide 
        mode={mode}
        messages={messages}
        onStarterClick={handleStarterClick}
        className="mx-3 mt-3"
      />
      
      <div className="p-3 md:p-4">
        <div className="flex space-x-2">
          <Textarea
            placeholder={placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[50px] md:min-h-[60px] resize-none text-sm md:text-base mobile-input mobile-tap"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="self-end px-3 md:px-4 mobile-tap"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 text-xs md:text-sm text-gray-500 space-y-1 md:space-y-0">
          <span className="order-2 md:order-1">按 Enter 发送, Shift + Enter 换行</span>
          <div className="flex items-center space-x-2 md:space-x-4 order-1 md:order-2">
            {config.apiKey ? (
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                API已配置
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                请配置API
              </Badge>
            )}
            <span className="text-xs truncate max-w-[120px] md:max-w-none">
              {config.customModel || config.model}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;