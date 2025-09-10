import React from 'react';
import { MessageCircle, History } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { useChat } from '../hooks/useChat';
import SettingsDialog from './SettingsDialog';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Button } from './ui/button';

const ChatPage = ({ conversationId, onShowHistory, onNewChat }) => {
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
  } = useChat(config, conversationId, onNewChat);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI英语学习助手</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onShowHistory}>
              <History className="w-5 h-5" />
            </Button>
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