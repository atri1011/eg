import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { History, MessageCircle, Trash2, Calendar } from 'lucide-react';

const ChatHistoryDialog = ({ onLoadConversation, onDeleteConversation, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        setError(data.error || '获取会话列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取会话列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('确定要删除这个对话吗？此操作无法撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 从本地列表中移除已删除的会话
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // 通知父组件
        if (onDeleteConversation) {
          onDeleteConversation(conversationId);
        }
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      alert('网络错误，删除失败');
      console.error('删除会话失败:', err);
    }
  };

  const handleLoadConversation = async (conversationId) => {
    if (onLoadConversation) {
      await onLoadConversation(conversationId);
      setIsOpen(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`mobile-tap ${className || ''}`}>
          <History className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline md:inline">聊天记录</span>
          <span className="sm:hidden">记录</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col mx-2 w-[calc(100vw-1rem)] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg md:text-xl">
            <MessageCircle className="w-5 h-5 mr-2" />
            聊天记录
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mobile-scroll">\
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          )}
          
          {!isLoading && !error && conversations.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无聊天记录</p>
              <p className="text-sm mt-2">开始对话后会显示在这里</p>
            </div>
          )}
          
          {!isLoading && !error && conversations.length > 0 && (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="group p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleLoadConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h4>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {conversation.last_message}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-400 mt-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(conversation.created_at)}
                        <span className="ml-3">
                          {conversation.message_count} 条消息
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatHistoryDialog;