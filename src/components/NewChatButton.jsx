import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { PlusCircle } from 'lucide-react';

const NewChatButton = ({ onNewChat, disabled }) => {
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
      className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
    >
      <PlusCircle className="w-4 h-4 mr-2" />
      新对话
    </Button>
  );
};

export default NewChatButton;