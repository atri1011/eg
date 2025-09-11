import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge.jsx';
import { Sparkles, MessageCircle } from 'lucide-react';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>开始你的英语学习之旅吧！</p>
          <p className="text-sm mt-2">在下方输入框中输入内容开始对话</p>
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
                  <span className="text-xs text-gray-400">中文意思</span>
                  <div className="translation-container mt-1">
                    <div className="translation-content text-sm text-black p-2 rounded">
                      {message.translation}
                    </div>
                  </div>
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
  );
};

export default MessageList;