import React from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button.jsx';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatPage from './components/ChatPage';
import AuthForm from './components/AuthForm';

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

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <ChatPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;