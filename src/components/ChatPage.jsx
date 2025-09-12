import React, { useState } from 'react';
import { MessageCircle, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useConfig } from '../hooks/useConfig';
import { useChat } from '../hooks/useChat';
import { useWordQuery } from '../hooks/useWordQuery';
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex flex-col p-2 md:p-4">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex items-center space-x-2 md:space-x-3">
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">AI英语学习助手</h1>
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

        {/* 移动端导航 */}
        <div className="md:hidden mb-3">
          <div className="flex bg-white rounded-lg p-1 shadow-sm mb-2">
            <Button
              variant={currentView === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="flex-1 flex items-center justify-center"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              对话
            </Button>
            <Button
              variant={currentView === 'grammar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('grammar')}
              className="flex-1 flex items-center justify-center"
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
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <Button
                variant={currentView === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('chat')}
                className="flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                对话练习
              </Button>
              <Button
                variant={currentView === 'grammar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('grammar')}
                className="flex items-center"
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
            <div className="flex-1 flex flex-col bg-white/50 rounded-xl shadow-md overflow-hidden h-full">
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
            <div className="bg-white/50 rounded-xl shadow-md overflow-hidden h-full">
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