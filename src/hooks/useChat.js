import { useState, useRef, useEffect, useCallback } from 'react';

export const useChat = (config, conversationId, onNewChat) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);
  const [showTranslations, setShowTranslations] = useState({});

  useEffect(() => {
    setCurrentConversationId(conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const fetchMessages = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // You might want to set an error state here
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleTranslation = (id) => {
    setShowTranslations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;
    
    // If there's no conversation ID, it's a new chat.
    // The App component will handle resetting the state via the key prop on ChatPage
    // by calling onNewChat which sets the conversationId to null.
    if (!currentConversationId) {
      onNewChat();
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          config: config,
          conversation_id: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (data.success) {
        if (!currentConversationId) {
          setCurrentConversationId(data.conversation_id);
        }

        const aiMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
        };
        
        setMessages(prev => {
            const newMessages = [...prev];
            const userMessageIndex = newMessages.findIndex(m => m.id === userMessage.id);
            if (userMessageIndex !== -1 && data.grammar_corrections) {
                newMessages[userMessageIndex].corrections = data.grammar_corrections;
            }
            return [...newMessages, aiMessage];
        });

      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: 'ai',
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    onNewChat();
  }, [onNewChat]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    setMessages,
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