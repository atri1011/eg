import React, { useState } from 'react';
import { MessageCircle, BookOpen, MessageSquare, User, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useConfig } from '../../hooks/useConfig';
import { useChat } from '../../hooks/useChat';
import { useWordQuery } from '../../hooks/useWordQuery';
import { useAuth } from '../../hooks/useAuth.jsx';
import SettingsDialog from '../common/SettingsDialog';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHistoryDialog from './ChatHistoryDialog';
import NewChatButton from './NewChatButton';
import ModeSelector from './ModeSelector';
import ModeIndicator, { SimpleModeIndicator } from './ModeIndicator';
import GrammarLearningModule from '../grammar/GrammarLearningModule';
import GrammarReferenceLibrary from '../grammar/GrammarReferenceLibrary';

const ChatPage = () => {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' 或 'grammar'
  const [showGrammarReference, setShowGrammarReference] = useState(false);
  
  const { user, logout } = useAuth();

  const { 
    config, 
    setConfig, 
    saveConfig, 
    availableModels, 
    isLoadingModels, 
    fetchModels,
    setDefaultModels,
    hasServerDefaults,
    isConfigValid
  } = useConfig();
  
  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    clearMessages,
    handleKeyPress,
    messagesEndRef,
    currentConversationId,
    currentMode,
    modeConfig,
    switchMode,
    loadConversationHistory,
    startNewConversation,
    editMessage,
    deleteMessage,
  } = useChat(config, isConfigValid);

  const { queryWord } = useWordQuery(config);

  const handleDeleteConversation = (deletedConversationId) => {
    // 如果删除的是当前正在显示的会话，则清空消息列表
    if (currentConversationId === deletedConversationId) {
      startNewConversation(currentMode, modeConfig);
    }
  };

  const handleModeChange = (newMode) => {
    switchMode(newMode, {});
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-indigo-400 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-400 rounded-full blur-2xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col p-2 md:p-4 relative z-10">
        {/* 顶部标题栏 - 紧凑型布局 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              AI英语学习助手
            </h1>
          </div>
          
          {/* 用户信息和主要控制按钮 */}
          <div className="flex items-center space-x-2">
            {/* 桌面端：用户信息 + 视图切换 + 设置 */}
            <div className="hidden md:flex items-center space-x-3">
            {/* 模式选择 */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-2 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <ModeSelector
                    currentMode={currentMode}
                    onModeChange={handleModeChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 主要工具按钮 */}
              <div className="flex items-center space-x-1 border-l border-slate-200/80 ml-3 pl-3">
                <NewChatButton
                  onNewChat={() => startNewConversation(currentMode, modeConfig)}
                  disabled={isLoading}
                  size="sm"
                />
                <Button
                  variant={currentView === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('chat')}
                  className="flex items-center px-3 py-1.5 text-sm"
                  title="对话视图"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  对话
                </Button>
                <ChatHistoryDialog
                  onLoadConversation={loadConversationHistory}
                  onDeleteConversation={handleDeleteConversation}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGrammarReference(true)}
                  className="px-2 py-1 bg-white/50 backdrop-blur-sm rounded-md border border-white/20 hover:bg-white/70"
                  title="语法参考"
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentView === 'grammar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('grammar')}
                  className="px-2 py-1"
                  title="语法视图"
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 设置和注销 */}
              <div className="flex items-center space-x-1 border-l border-slate-200/80 ml-3 pl-3">
                {/* 用户信息 */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-white/30 shadow-sm">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {user?.username || '用户'}
                  </span>
                </div>
                <SettingsDialog
                  config={config}
                  setConfig={setConfig}
                  saveConfig={saveConfig}
                  availableModels={availableModels}
                  isLoadingModels={isLoadingModels}
                  fetchModels={fetchModels}
                  setDefaultModels={setDefaultModels}
                  hasServerDefaults={hasServerDefaults}
                  isConfigValid={isConfigValid}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-600 hover:text-red-600 hover:bg-white/50 p-2"
                  title="注销"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* 移动端仅显示设置按钮 */}
            <div className="md:hidden">
              <SettingsDialog
                config={config}
                setConfig={setConfig}
                saveConfig={saveConfig}
                availableModels={availableModels}
                isLoadingModels={isLoadingModels}
                fetchModels={fetchModels}
                setDefaultModels={setDefaultModels}
                hasServerDefaults={hasServerDefaults}
                isConfigValid={isConfigValid}
              />
            </div>
          </div>
        </div>

        {/* 移动端导航 - 优化间距 */}
        <div className="md:hidden mb-2">
          {/* 移动端用户信息 */}
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {user?.username || '用户'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-600 hover:text-red-600 p-1 hover:bg-white/50"
              title="注销"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 当前模式指示器 - 简化 */}
          <div className="flex items-center justify-between mb-2 px-2">
            <SimpleModeIndicator mode={currentMode} />
            <ModeSelector 
              currentMode={currentMode} 
              onModeChange={handleModeChange}
              disabled={isLoading}
            />
          </div>
          
          {/* 视图切换 - 更紧凑 */}
          <div className="flex bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white/30 mb-2">
            <Button
              variant={currentView === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="flex-1 flex items-center justify-center rounded-lg py-1.5"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              对话
            </Button>
            <Button
              variant={currentView === 'grammar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('grammar')}
              className="flex-1 flex items-center justify-center rounded-lg py-1.5"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              语法
            </Button>
          </div>
          
          {/* 工具按钮 - 紧凑布局 */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrammarReference(true)}
              className="flex-1 flex items-center justify-center py-1.5 text-xs"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              参考
            </Button>
            <NewChatButton 
              onNewChat={() => startNewConversation(currentMode, modeConfig)}
              disabled={isLoading}
              className="flex-1"
              size="sm"
            />
            <ChatHistoryDialog
              onLoadConversation={loadConversationHistory}
              onDeleteConversation={handleDeleteConversation}
              className="flex-1"
              size="sm"
            />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden pt-4">
          {currentView === 'chat' ? (
            <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden h-full">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                onWordQuery={queryWord}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
              <ChatInput
                inputText={inputText}
                setInputText={setInputText}
                handleKeyPress={handleKeyPress}
                sendMessage={sendMessage}
                isLoading={isLoading}
                config={config}
                mode={currentMode}
                messages={messages}
              />
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden h-full">
              <GrammarLearningModule />
            </div>
          )}
        </div>
      </div>

      {/* 语法参考库对话框 */}
      <GrammarReferenceLibrary
        isOpen={showGrammarReference}
        onClose={() => setShowGrammarReference(false)}
      />
    </div>
  );
};

export default ChatPage;