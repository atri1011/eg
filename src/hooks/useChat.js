import { useState, useRef, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';

export const useChat = (config, isConfigValid) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentMode, setCurrentMode] = useState('free_chat');
  const [modeConfig, setModeConfig] = useState({});
  const messagesEndRef = useRef(null);
  
  const { getAuthHeaders } = useAuth();

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentMode('free_chat');
    setModeConfig({});
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
        // 设置会话的模式信息
        if (data.conversation && data.conversation.mode) {
          setCurrentMode(data.conversation.mode);
          setModeConfig(data.conversation.mode_config || {});
        }
      } else {
        console.error('加载会话历史失败:', data.error);
        alert(data.error || '加载会话历史失败');
      }
    } catch (error) {
      console.error('加载会话历史网络错误:', error);
      alert('网络错误，无法加载会话历史');
    }
  };

  const startNewConversation = (mode = 'free_chat', config = {}) => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentMode(mode);
    setModeConfig(config);
    setInputText('');
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // 使用 isConfigValid 函数来检查配置是否有效
    if (isConfigValid && !isConfigValid()) {
      alert('Please configure your API key in the settings.');
      return;
    } else if (!isConfigValid && !config.apiKey) {
      // 向后兼容：如果没有传入 isConfigValid 函数，使用原来的检查方式
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
          conversation_id: currentConversationId,
          mode: currentMode,
          mode_config: modeConfig
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { english, chinese } = parseAIResponse(data.response);
        
        const aiMessage = {
          id: data.ai_message_id,
          type: 'ai',
          content: english,
          translation: chinese,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(currentMessages => {
          const updatedMessages = currentMessages.map(msg =>
            msg.id === userMessage.id 
              ? { 
                  ...msg, 
                  id: data.user_message_id, // 使用真实的数据库ID
                  corrections: data.grammar_corrections,
                  optimization: data.optimization
                }
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

  const editMessage = async (messageId, newContent) => {
    if (!newContent.trim()) return;

    // 使用 isConfigValid 函数来检查配置是否有效
    if (isConfigValid && !isConfigValid()) {
      alert('请先在设置中配置API密钥');
      return false;
    } else if (!isConfigValid && !config.apiKey) {
      // 向后兼容：如果没有传入 isConfigValid 函数，使用原来的检查方式
      alert('请先在设置中配置API密钥');
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/messages/${messageId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          content: newContent.trim(),
          config: {
            ...config,
            model: config.customModel.trim() || config.model
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const { english, chinese } = parseAIResponse(data.response);
        
        const aiMessage = {
          id: data.ai_message_id,
          type: 'ai',
          content: english,
          translation: chinese,
          timestamp: new Date().toLocaleTimeString()
        };

        // 更新消息列表：编辑的消息 + 新的AI回复
        setMessages(currentMessages => {
          const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);
          if (messageIndex === -1) return currentMessages;

          const updatedMessages = [...currentMessages];
          
          // 更新编辑的消息
          updatedMessages[messageIndex] = { 
            ...updatedMessages[messageIndex], 
            content: newContent.trim(), 
            isEdited: true 
          };

          // 移除编辑消息之后的所有消息，然后添加新的AI回复
          const messagesUpToEdited = updatedMessages.slice(0, messageIndex + 1);
          
          return [...messagesUpToEdited, aiMessage];
        });

        return true;
      } else {
        console.error('编辑消息失败:', data.error);
        alert(data.error || '编辑消息失败');
        return false;
      }
    } catch (error) {
      console.error('编辑消息网络错误:', error);
      alert('网络错误，无法编辑消息');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await response.json();

      if (data.success) {
        // 从本地状态中移除消息
        setMessages(currentMessages => 
          currentMessages.filter(msg => msg.id !== messageId)
        );
        return true;
      } else {
        console.error('删除消息失败:', data.error);
        alert(data.error || '删除消息失败');
        return false;
      }
    } catch (error) {
      console.error('删除消息网络错误:', error);
      alert('网络错误，无法删除消息');
      return false;
    }
  };

  // 新增：切换对话模式的函数
  const switchMode = (mode, config = {}) => {
    setCurrentMode(mode);
    setModeConfig(config);
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
    currentMode,
    modeConfig,
    switchMode,
    loadConversationHistory,
    startNewConversation,
    editMessage,
    deleteMessage,
  };
};