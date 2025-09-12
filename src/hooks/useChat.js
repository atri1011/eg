import { useState, useRef, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';

export const useChat = (config) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const { getAuthHeaders } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem('aiEnglishMessages');
  };

  const parseAIResponse = (response) => {
    if (response.includes('|||')) {
      const [english, chinese] = response.split('|||').map(part => part.trim());
      return { english, chinese };
    }
    return { english: response, chinese: null };
  };

  const loadConversationHistory = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setCurrentConversationId(conversationId);
      } else {
        console.error('加载会话历史失败:', data.error);
        alert(data.error || '加载会话历史失败');
      }
    } catch (error) {
      console.error('加载会话历史网络错误:', error);
      alert('网络错误，无法加载会话历史');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputText('');
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!config.apiKey) {
      // This should be handled by the UI component, e.g., opening the settings dialog.
      // We can't directly open the dialog from the hook.
      // For now, we'll just prevent sending the message.
      alert('Please configure your API key in the settings.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString(),
      corrections: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const modelToUse = config.customModel.trim() || config.model;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          message: inputText,
          config: {
            ...config,
            model: modelToUse
          },
          conversation_id: currentConversationId
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { english, chinese } = parseAIResponse(data.response);
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: english,
          translation: chinese,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(currentMessages => {
          const updatedMessages = currentMessages.map(msg =>
            msg.id === userMessage.id && data.grammar_corrections
              ? { ...msg, corrections: data.grammar_corrections }
              : msg
          );
          return [...updatedMessages, aiMessage];
        });

        // 更新当前会话ID（如果是新会话）
        if (data.conversation_id && data.conversation_id !== currentConversationId) {
          setCurrentConversationId(data.conversation_id);
        }

      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: `错误: ${data.error}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(currentMessages => [...currentMessages, errorMessage]);
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `网络错误: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    clearMessages,
    handleKeyPress,
    messagesEndRef,
    currentConversationId,
    loadConversationHistory,
    startNewConversation,
  };
};