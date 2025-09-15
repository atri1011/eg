import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { MoreHorizontal, BookOpen, Plus, History, Zap } from 'lucide-react';
import NewChatButton from './NewChatButton';
import ChatHistoryDialog from './ChatHistoryDialog';
import ModeSelector from './ModeSelector';

const CompactToolbar = ({
  currentMode,
  onModeChange,
  onNewChat,
  onLoadConversation,
  onDeleteConversation,
  onShowGrammarReference,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="hidden md:flex items-center space-x-2">
      {/* 简化的模式选择器 */}
      <div className="flex items-center space-x-2 px-2 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
        <Zap className="w-4 h-4 text-blue-600" />
        <ModeSelector 
          currentMode={currentMode} 
          onModeChange={onModeChange}
          disabled={isLoading}
        />
      </div>

      {/* 工具按钮 - 展开/收起 */}
      <div className="flex items-center space-x-1">
        {isExpanded && (
          <>
            <NewChatButton 
              onNewChat={onNewChat}
              disabled={isLoading}
              size="sm"
            />
            <ChatHistoryDialog
              onLoadConversation={onLoadConversation}
              onDeleteConversation={onDeleteConversation}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowGrammarReference}
              className="px-2 py-1 bg-white/50 backdrop-blur-sm rounded-md border border-white/20 hover:bg-white/70"
              title="语法参考"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/70"
          title={isExpanded ? "收起工具" : "更多工具"}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CompactToolbar;