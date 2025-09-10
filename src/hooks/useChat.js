import { useState, useRef, useEffect } from 'react';

export const useChat = (config) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslations, setShowTranslations] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('aiEnglishMessages');
  };

  const parseAIResponse = (response) => {
    if (response.includes('|||')) {
      const [english, chinese] = response.split('|||').map(part => part.trim());
      return { english, chinese };
    }
    return { english: response, chinese: null };
  };

  const toggleTranslation = (messageId) => {
    setShowTranslations(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
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
        },
        body: JSON.stringify({
          message: inputText,
          config: {
            ...config,
            model: modelToUse
          }
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
    showTranslations,
    toggleTranslation,
  };
};