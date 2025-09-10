import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const ChatInput = ({ 
  inputText, 
  setInputText, 
  handleKeyPress, 
  sendMessage, 
  isLoading, 
  config 
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white/60">
      <div className="flex space-x-2">
        <Textarea
          placeholder="输入你想练习的英语句子..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
       <span>按 Enter 发送, Shift + Enter 换行</span>
       <div className="flex items-center space-x-4">
          {config.apiKey ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              API已配置
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              请配置API
            </Badge>
          )}
          <span>{config.customModel || config.model}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;