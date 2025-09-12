import React, { useState } from 'react';
import { MessageCircle, BookOpen, MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useConfig } from '../hooks/useConfig';
import { useChat } from '../hooks/useChat';
import { useWordQuery } from '../hooks/useWordQuery';
import { useAuth } from '../hooks/useAuth.jsx';
import SettingsDialog from './SettingsDialog';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHistoryDialog from './ChatHistoryDialog';
import NewChatButton from './NewChatButton';
import GrammarLearningModule from './GrammarLearningModule';
import GrammarReferenceLibrary from './GrammarReferenceLibrary';

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
    setDefaultModels
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
    loadConversationHistory,
    startNewConversation,
  } = useChat(config);

  const { queryWord } = useWordQuery(config);

  const handleDeleteConversation = (deletedConversationId) => {
    // 如果删除的是当前正在显示的会话，则清空消息列表
    if (currentConversationId === deletedConversationId) {
      startNewConversation();
    }
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
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              AI英语学习助手
            </h1>
          </div>
          
          {/* 用户信息和操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 桌面端用户信息 */}
            <div className="hidden md:flex items-center space-x-2 mr-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {user?.username || '用户'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-red-600 hover:bg-white/50"
                title="注销"
              >
                <LogOut className="w-4 h-4" />
              </Button>
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
              />
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden mb-3">
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
          
          <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-white/30 mb-3">
            <Button
              variant={currentView === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="flex-1 flex items-center justify-center rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              对话
            </Button>
            <Button
              variant={currentView === 'grammar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('grammar')}
              className="flex-1 flex items-center justify-center rounded-xl"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              语法
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrammarReference(true)}
              className="flex-1 flex items-center justify-center"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              语法参考
            </Button>
            <NewChatButton 
              onNewChat={startNewConversation}
              disabled={isLoading}
              className="flex-1"
            />
            <ChatHistoryDialog
              onLoadConversation={loadConversationHistory}
              onDeleteConversation={handleDeleteConversation}
              className="flex-1"
            />
          </div>
        </div>

        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {/* 视图切换按钮 */}
            <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-white/30">
              <Button
                variant={currentView === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('chat')}
                className="flex items-center rounded-xl"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                对话练习
              </Button>
              <Button
                variant={currentView === 'grammar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('grammar')}
                className="flex items-center rounded-xl"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                语法学习
              </Button>
            </div>

            {/* 语法参考库按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrammarReference(true)}
              className="flex items-center"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              语法参考
            </Button>

            {/* 原有的按钮 */}
            <NewChatButton 
              onNewChat={startNewConversation}
              disabled={isLoading}
            />
            <ChatHistoryDialog
              onLoadConversation={loadConversationHistory}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
          <div>
            <SettingsDialog
              config={config}
              setConfig={setConfig}
              saveConfig={saveConfig}
              availableModels={availableModels}
              isLoadingModels={isLoadingModels}
              fetchModels={fetchModels}
              setDefaultModels={setDefaultModels}
            />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'chat' ? (
            <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden h-full">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                onWordQuery={queryWord}
              />
              <ChatInput
                inputText={inputText}
                setInputText={setInputText}
                handleKeyPress={handleKeyPress}
                sendMessage={sendMessage}
                isLoading={isLoading}
                config={config}
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