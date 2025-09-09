import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Send, Settings, Trash2, MessageCircle, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Sparkles, Languages, Plus } from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState({
    apiBase: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    customModel: '',
    languagePreference: 'bilingual'
  })
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState([
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [grammarCorrections, setGrammarCorrections] = useState([])
  const [showTranslations, setShowTranslations] = useState({})
  const messagesEndRef = useRef(null)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('aiEnglishConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    fetchConversations()
  }, [])

  // 获取可用模型列表
  const fetchModels = async () => {
    if (!config.apiKey || !config.apiBase) {
      return
    }

    setIsLoadingModels(true)
    try {
      const response = await fetch(`/api/models?apiKey=${encodeURIComponent(config.apiKey)}&apiBase=${encodeURIComponent(config.apiBase)}`)
      const data = await response.json()
      
      if (data.success && data.models) {
        setAvailableModels(data.models)
      }
    } catch (error) {
      console.error('获取模型列表失败:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  // 保存配置到本地存储
  const saveConfig = () => {
    localStorage.setItem('aiEnglishConfig', JSON.stringify(config))
    setIsConfigOpen(false)
    
    // 如果配置了API Key，尝试获取模型列表
    if (config.apiKey && config.apiBase) {
      fetchModels()
    }
  }

  // 清空对话
  const clearMessages = () => {
    setMessages([])
    setGrammarCorrections([])
    localStorage.removeItem('aiEnglishMessages')
  }

  // 解析AI回复，分离英文和中文
  const parseAIResponse = (response) => {
    if (response.includes('|||')) {
      const [english, chinese] = response.split('|||').map(part => part.trim())
      return { english, chinese }
    }
    return { english: response, chinese: null }
  }

  // 切换翻译显示
  const toggleTranslation = (messageId) => {
    setShowTranslations(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (response.ok) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          handleSwitchConversation(data.id);
        }
      } else {
        console.error('Failed to fetch conversations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', { method: 'POST' });
      const newConversation = await response.json();
      if (response.ok) {
        setMessages([]);
        setActiveConversationId(newConversation.id);
        fetchConversations(); // Refresh list
      } else {
        console.error('Failed to create new conversation:', newConversation.error);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleSwitchConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      if (response.ok) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.id,
          type: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          corrections: msg.corrections || [],
          ...(msg.role === 'ai' && parseAIResponse(msg.content))
        }));
        setMessages(formattedMessages);
      } else {
        console.error('Failed to fetch messages for conversation:', data.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!config.apiKey) {
      setIsConfigOpen(true);
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
          conversation_id: activeConversationId,
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

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button onClick={handleNewConversation} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            新建对话
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.map((convo) => (
              <Button
                key={convo.id}
                variant={activeConversationId === convo.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left h-auto"
                onClick={() => handleSwitchConversation(convo.id)}
              >
                <div className="truncate">
                  <p className="font-semibold">{convo.title || 'New Conversation'}</p>
                  <p className="text-xs text-gray-500">{new Date(convo.created_at).toLocaleString()}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>配置设置</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="api" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="api">API配置</TabsTrigger>
                    <TabsTrigger value="chat">对话设置</TabsTrigger>
                  </TabsList>
                  <TabsContent value="api" className="space-y-4">
                    <div>
                      <Label htmlFor="apiBase">API Base URL</Label>
                      <Input
                        id="apiBase"
                        placeholder="https://api.openai.com/v1"
                        value={config.apiBase}
                        onChange={(e) => setConfig({...config, apiBase: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={config.apiKey}
                        onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="model">模型</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fetchModels}
                          disabled={isLoadingModels || !config.apiKey}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingModels ? 'animate-spin' : ''}`} />
                          刷新
                        </Button>
                      </div>
                      <Select value={config.model} onValueChange={(value) => setConfig({...config, model: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customModel">自定义模型 (可选)</Label>
                      <Input
                        id="customModel"
                        placeholder="输入自定义模型名称，如 claude-3-sonnet"
                        value={config.customModel}
                        onChange={(e) => setConfig({...config, customModel: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        如果填写，将优先使用自定义模型而不是上面选择的模型
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="chat" className="space-y-4">
                    <div>
                      <Label htmlFor="language">语言偏好</Label>
                      <Select value={config.languagePreference} onValueChange={(value) => setConfig({...config, languagePreference: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bilingual">中英双语</SelectItem>
                          <SelectItem value="chinese">主要中文</SelectItem>
                          <SelectItem value="english">主要英文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={saveConfig}>
                    保存
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI英语学习助手</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white/50 rounded-xl shadow-md overflow-hidden">
          {/* 对话区域 */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>开始你的英语学习之旅吧！</p>
                <p className="text-sm mt-2">点击 "新建对话" 或选择一个已有对话开始</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-xs lg:max-w-xl px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${message.type === 'user' ? 'prose-user-message' : ''}`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    
                    {message.type === 'ai' && message.translation && (
                      <div className="mt-2 pt-2 border-t border-blue-500/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">中文意思</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTranslation(message.id)}
                            className="h-6 px-2 text-gray-400 hover:text-white"
                          >
                            {showTranslations[message.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                        {showTranslations[message.id] && (
                          <div className="text-sm text-gray-200 mt-1 p-2 bg-blue-500/50 rounded">
                            {message.translation}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                  </div>

                  {/* 优化与纠错显示 */}
                  {message.type === 'user' && message.corrections && Object.keys(message.corrections).length > 0 && (
                    <div className="mt-2 max-w-xs lg:max-w-xl w-full">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div>
                          <div className="flex items-center text-sm text-yellow-600 mb-2">
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="font-semibold">语法建议</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="bg-red-50 p-2 rounded-md">
                              <span className="font-medium text-red-700">原文:</span>
                              <p className="mt-1 text-gray-700">{message.corrections.original_sentence}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-md">
                              <span className="font-medium text-green-700">建议:</span>
                              <p className="mt-1 text-gray-800">{message.corrections.corrected_sentence}</p>
                            </div>
                            {/* 渲染详细修正 */}
                            {message.corrections.corrections && message.corrections.corrections.length > 0 && (
                              <div className="border-t border-gray-200 mt-3 pt-3">
                                {/* 先渲染语法修正 */}
                                {message.corrections.corrections.filter(c => c.type !== 'translation').map((correction, index) => (
                                  <div key={`correction-${index}`} className="flex items-start text-xs text-gray-600 mb-1">
                                    <Badge variant="default" className="mr-2 capitalize text-white">
                                      语法
                                    </Badge>
                                    <span className="line-through text-red-500">{correction.original}</span>
                                    <span className="mx-1">→</span>
                                    <span className="text-green-600 font-semibold">{correction.corrected}</span>
                                  </div>
                                ))}
                                {/* 再渲染翻译 */}
                                {message.corrections.corrections.filter(c => c.type === 'translation').map((correction, index) => (
                                  <div key={`translation-${index}`} className="flex items-start text-xs text-gray-600 mb-1">
                                    <Badge variant="default" className="mr-2 capitalize text-white">
                                      翻译
                                    </Badge>
                                    <span className="line-through text-red-500">{correction.original}</span>
                                    <span className="mx-1">→</span>
                                    <span className="text-green-600 font-semibold">{correction.corrected}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>AI正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-200 bg-white/60">
            <div className="flex space-x-2">
              <Textarea
                placeholder="输入你想练习的英语句子..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading || !activeConversationId}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading || !activeConversationId}
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
        </div>
      </div>
    </div>
  )
}

export default App