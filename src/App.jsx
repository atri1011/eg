import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatPage from './components/ChatPage';
import HistoryPage from './components/HistoryPage';

const WelcomeScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-center p-4">
    <MessageCircle className="w-16 h-16 text-blue-600 mb-6" />
    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
      AI 英语学习助手
    </h1>
    <p className="text-lg text-gray-600 mb-8 max-w-md">
      在这里，你可以通过与AI自由对话来练习和提高你的英语水平。获得即时的语法纠正和翻译，让学习变得更轻松。
    </p>
    <Button onClick={onStart} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
      <Sparkles className="w-5 h-5 mr-2" />
      开始自由聊天
    </Button>
  </div>
);

function App() {
  const [view, setView] = useState('welcome'); // 'welcome', 'chat', 'history'
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setView('chat');
  };

  if (view === 'welcome') {
    return <WelcomeScreen onStart={() => setView('chat')} />;
  }

  if (view === 'history') {
    return <HistoryPage onBack={() => setView('chat')} onSelectConversation={handleSelectConversation} />;
  }

  return <ChatPage
           key={selectedConversationId}
           conversationId={selectedConversationId}
           onShowHistory={() => setView('history')}
           onNewChat={() => setSelectedConversationId(null)}
         />;
}

export default App;