import React from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button.jsx';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatPage from './components/ChatPage';
import AuthForm from './components/AuthForm';

const WelcomeScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-center p-4 relative overflow-hidden">
    {/* 背景装饰 */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-300 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300 rounded-full blur-xl"></div>
    </div>
    
    <div className="relative z-10 max-w-2xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
          AI 英语学习助手
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          在这里，你可以通过与AI自由对话来练习和提高你的英语水平。获得即时的语法纠正和翻译，让学习变得更轻松有趣。
        </p>
        
        <Button 
          onClick={onStart} 
          size="lg" 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-4 rounded-xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          开始学习之旅
        </Button>
      </div>
    </div>
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