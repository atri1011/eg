import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, ArrowLeft } from 'lucide-react';

const HistoryPage = ({ onBack, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('无法获取对话历史');
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDelete = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      fetchConversations(); // Refresh list after deletion
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">对话历史</h1>
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回聊天
        </Button>
      </div>
      
      {isLoading && <p className="text-center text-gray-500">加载中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {conversations.map((conv) => (
          <div key={conv.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
            <div className="flex-1 cursor-pointer" onClick={() => onSelectConversation(conv.id)}>
              <p className="font-semibold text-gray-700">{conv.title}</p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1.5" />
                {new Date(conv.created_at).toLocaleString()}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDelete(conv.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;