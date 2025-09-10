import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Eye, EyeOff, Sparkles, MessageCircle } from 'lucide-react';

const MessageList = ({ messages, isLoading, messagesEndRef, showTranslations, toggleTranslation }) => {
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
          <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs lg:max-w-xl px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : message.isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-white text-gray-800 border border-gray-200'
              }`}>
              <div className={`prose prose-sm max-w-none ${message.sender === 'user' ? 'prose-user-message' : ''}`}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>

              {/* Translation and corrections logic will be simplified or removed for now */}
              {/* We can re-add it based on the new data structure from the hook */}
              
            </div>

            {/* Grammar suggestions are now part of the `useChat` hook's logic, not directly in the message object */}
            {message.sender === 'user' && message.corrections && message.corrections.corrections && message.corrections.corrections.length > 0 && (
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
                      <div className="border-t border-gray-200 mt-3 pt-3">
                        {message.corrections.corrections.map((correction, index) => (
                          <div key={`correction-${index}`} className="flex items-start text-xs text-gray-600 mb-1">
                            <Badge variant="default" className="mr-2 capitalize text-white">
                              {correction.type === 'grammar' ? '语法' : '翻译'}
                            </Badge>
                            <span className="line-through text-red-500">{correction.original}</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-600 font-semibold">{correction.corrected}</span>
                          </div>
                        ))}
                      </div>
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