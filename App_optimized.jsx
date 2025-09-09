import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Send, Settings, Trash2, MessageCircle, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react'
import './App.css'

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
    
    const savedMessages = localStorage.getItem('aiEnglishMessages')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
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

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    // 检查配置
    if (!config.apiKey) {
      setIsConfigOpen(true)
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)
    setGrammarCorrections([]) // 清空之前的语法纠错

    try {
      // 确定使用的模型
      const modelToUse = config.customModel.trim() || config.model

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
      })

      const data = await response.json()

      if (data.success) {
        const { english, chinese } = parseAIResponse(data.response)
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: english,
          translation: chinese,
          timestamp: new Date().toLocaleTimeString()
        }

        const updatedMessages = [...newMessages, aiMessage]
        setMessages(updatedMessages)
        localStorage.setItem('aiEnglishMessages', JSON.stringify(updatedMessages))

        // 显示语法纠错
        if (data.grammar_corrections && data.grammar_corrections.length > 0) {
          setGrammarCorrections(data.grammar_corrections)
        }
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: `错误: ${data.error}`,
          timestamp: new Date().toLocaleTimeString()
        }

        const updatedMessages = [...newMessages, errorMessage]
        setMessages(updatedMessages)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `网络错误: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }

      const updatedMessages = [...newMessages, errorMessage]
      setMessages(updatedMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI英语学习助手</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={clearMessages}>
              <Trash2 className="w-4 h-4 mr-2" />
              清空对话
            </Button>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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

        {/* 对话区域 */}
        <Card className="mb-4 h-96 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">对话历史</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>开始你的英语学习之旅吧！</p>
                <p className="text-sm mt-2">输入一个英语句子，AI会帮你纠正语法并进行对话</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* AI回复的中文翻译遮罩 */}
                    {message.type === 'ai' && message.translation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">中文意思</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTranslation(message.id)}
                            className="h-6 px-2"
                          >
                            {showTranslations[message.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        {showTranslations[message.id] && (
                          <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                            {message.translation}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                  </div>
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
          </CardContent>
        </Card>

        {/* 输入区域 */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
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
              
              {/* 语法纠错弹出框 */}
              {grammarCorrections.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="font-medium text-gray-800">语法纠错：</span>
                  </div>
                  <div className="space-y-3">
                    {grammarCorrections.map((correction, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive" className="text-xs">错误</Badge>
                          <span className="text-red-600 line-through">{correction.original}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="text-xs bg-green-600">正确</Badge>
                          <span className="text-green-600 font-medium">{correction.corrected}</span>
                        </div>
                        {correction.explanation && (
                          <div className="text-sm text-gray-600 ml-12">
                            {correction.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGrammarCorrections([])}
                    className="mt-3 text-gray-500"
                  >
                    关闭
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>按 Enter 发送，Shift + Enter 换行</span>
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
                <span>{config.languagePreference === 'bilingual' ? '双语' : config.languagePreference === 'chinese' ? '中文' : '英文'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 页脚 */}
        <div className="text-center text-sm text-gray-500 mt-4">
          Made with Manus
        </div>
      </div>
    </div>
  )
}

export default App

