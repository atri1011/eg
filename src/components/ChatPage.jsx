import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { useChat } from '../hooks/useChat';
import SettingsDialog from './SettingsDialog';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHistoryDialog from './ChatHistoryDialog';
import NewChatButton from './NewChatButton';

const ChatPage = () => {
  const { 
    config, 
    setConfig, 
    saveConfig, 
    availableModels, 
    isLoadingModels, 
    fetchModels 
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
    showTranslations,
    toggleTranslation,
    currentConversationId,
    loadConversationHistory,
    startNewConversation,
  } = useChat(config);

  const handleDeleteConversation = (deletedConversationId) => {
    // 如果删除的是当前正在显示的会话，则清空消息列表
    if (currentConversationId === deletedConversationId) {
      startNewConversation();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI英语学习助手</h1>
          </div>
          <div className="flex items-center space-x-3">
            <NewChatButton 
              onNewChat={startNewConversation}
              disabled={isLoading}
            />
            <ChatHistoryDialog
              onLoadConversation={loadConversationHistory}
              onDeleteConversation={handleDeleteConversation}
            />
            <SettingsDialog
              config={config}
              setConfig={setConfig}
              saveConfig={saveConfig}
              availableModels={availableModels}
              isLoadingModels={isLoadingModels}
              fetchModels={fetchModels}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white/50 rounded-xl shadow-md overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            showTranslations={showTranslations}
            toggleTranslation={toggleTranslation}
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
      </div>
    </div>
  );
};

export default ChatPage;