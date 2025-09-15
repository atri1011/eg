import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { PlusCircle } from 'lucide-react';

const NewChatButton = ({ onNewChat, disabled, className }) => {
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleNewChat}
      disabled={disabled}
      className={`bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 mobile-tap ${className || ''}`}
    >
      <PlusCircle className="w-4 h-4 mr-1 md:mr-2" />
      <span className="hidden sm:inline md:inline">新对话</span>
      <span className="sm:hidden">新建</span>
    </Button>
  );
};

export default NewChatButton;