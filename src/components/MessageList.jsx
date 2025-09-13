import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles, MessageCircle, Search } from 'lucide-react';
import WordQueryDialog from './WordQueryDialog.jsx';

// Function to render AI messages sentence by sentence with translation
const renderSegmentedMessage = (content, translation) => {
  if (!translation) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  const englishSentences = content.match(/(\S.+?[.?!])(?=\s+|$)/g) || [content];
  const chineseSentences = translation.match(/([^。？！]+[。？！])/g) || [translation];

  const chunks = [];
  let tempEnglish = [];
  let tempChinese = [];
  let tempWordCount = 0;

  englishSentences.forEach((sentence, index) => {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return;

    const sentenceWordCount = trimmedSentence.split(/\s+/).length;
    const chineseSentence = chineseSentences[index] ? chineseSentences[index].trim() : '';

    if (sentenceWordCount > 8) {
      if (tempEnglish.length > 0) {
        chunks.push({ english: tempEnglish.join(' '), chinese: tempChinese.join(' ') });
        tempEnglish = [];
        tempChinese = [];
        tempWordCount = 0;
      }
      chunks.push({ english: trimmedSentence, chinese: chineseSentence });
    } else {
      tempEnglish.push(trimmedSentence);
      tempChinese.push(chineseSentence);
      tempWordCount += sentenceWordCount;

      if (tempWordCount > 8) {
        chunks.push({ english: tempEnglish.join(' '), chinese: tempChinese.join(' ') });
        tempEnglish = [];
        tempChinese = [];
        tempWordCount = 0;
      }
    }
  });

  if (tempEnglish.length > 0) {
    chunks.push({ english: tempEnglish.join(' '), chinese: tempChinese.join(' ') });
  }
  
  if (chunks.length <= 1) {
    return (
     <div className="prose prose-sm max-w-none">
       <ReactMarkdown>{content}</ReactMarkdown>
       {translation && (
          <div className="mt-1">
           <div className="translation-container">
             <div className="translation-content text-sm text-black p-2 rounded mt-1">
               {translation}
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }

  return chunks.map((chunk, index) => (
    <div key={index} className="mb-2 last:mb-0">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{chunk.english}</ReactMarkdown>
      </div>
      {chunk.chinese && (
        <div className="mt-1">
          <div className="translation-container">
            <div className="translation-content text-sm text-black p-2 rounded mt-1">
              {chunk.chinese}
            </div>
          </div>
        </div>
      )}
    </div>
  ));
};

const MessageList = ({ messages, isLoading, messagesEndRef, onWordQuery }) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showQueryButton, setShowQueryButton] = useState(false);
  const [showWordDialog, setShowWordDialog] = useState(false);
  const [selectedContext, setSelectedContext] = useState('');
  const selectionTimeoutRef = useRef(null);

  // 检测选中的文本是否为英文单词或词组
  const isEnglishText = useCallback((text) => {
    if (!text || text.trim().length === 0) return false;
    const trimmedText = text.trim();
    // 支持多个单词、句子（允许连字符、撇号、空格、标点符号）
    const textRegex = /^[a-zA-Z]+(?:[-'\s.,!?;:][a-zA-Z]*)*$/;
    return textRegex.test(trimmedText) && trimmedText.length > 1;
  }, []);

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && isEnglishText(selectedText)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 获取选中文本的上下文（前后各50个字符）
      const parentElement = range.commonAncestorContainer.parentElement;
      const fullText = parentElement ? parentElement.textContent : '';
      const startIndex = Math.max(0, fullText.indexOf(selectedText) - 50);
      const endIndex = Math.min(fullText.length, fullText.indexOf(selectedText) + selectedText.length + 50);
      const context = fullText.substring(startIndex, endIndex);
      
      setSelectedText(selectedText);
      setSelectedContext(context);
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowQueryButton(true);
      
      // 3秒后自动隐藏按钮
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        setShowQueryButton(false);
      }, 3000);
    } else {
      setShowQueryButton(false);
    }
  }, [isEnglishText]);

  // 处理查询按钮点击
  const handleQueryClick = useCallback(() => {
    setShowQueryButton(false);
    setShowWordDialog(true);
    window.getSelection().removeAllRanges();
  }, []);

  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setShowWordDialog(false);
    setSelectedText('');
    setSelectedContext('');
  }, []);

  return (
    <div 
      className="flex-1 p-3 md:p-6 overflow-y-auto space-y-4 mobile-scroll selectable-text" 
      onMouseUp={handleTextSelection}
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>开始你的英语学习之旅吧！</p>
          <p className="text-sm mt-2">在下方输入框中输入内容开始对话</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] md:max-w-xs lg:max-w-xl px-4 py-3 ${
              message.type === 'user'
                ? 'bg-gray-200 [color:#000] rounded-2xl'
                : message.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200 rounded-lg'
                : 'bg-white text-gray-800 border border-gray-200 rounded-lg'
              }`}>
              {message.type === 'ai'
                ? renderSegmentedMessage(message.content, message.translation)
                : (
                  <div className={`prose prose-sm max-w-none ${message.type === 'user' ? 'prose-user-message prose-invert' : ''}`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )
              }
            </div>

            {/* 优化与纠错显示 - 新样式 */}
            {message.type === 'user' && message.corrections && Object.keys(message.corrections).length > 0 && (
              <div className="mt-3 max-w-[85%] w-auto">
                <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500">✨</span>
                    <span className="text-gray-700 font-medium text-sm">语法纠错：</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* 错误和正确的对比 */}
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-medium">错误</span>
                        <span className="text-gray-800 text-sm">{message.corrections.original_sentence}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-medium">正确</span>
                        <span className="text-gray-800 text-sm font-medium">{message.corrections.corrected_sentence}</span>
                      </div>
                    </div>
                    
                    {/* 单词级别的纠错 */}
                    {message.corrections.corrections && message.corrections.corrections.length > 0 && (
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-medium">错误</span>
                            <span className="text-red-600 text-sm font-medium">
                              {message.corrections.corrections[0]?.original || message.corrections.original_sentence.split(' ').find(word => 
                                message.corrections.corrected_sentence.indexOf(word) === -1
                              ) || '苹果'}
                            </span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-medium">正确</span>
                            <span className="text-green-600 text-sm font-medium">
                              {message.corrections.corrections[0]?.corrected || 'apple'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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

      {/* 悬浮查询按钮 */}
      {showQueryButton && (
        <div
          className="fixed z-50 animate-in fade-in-50 zoom-in-95"
          style={{
            left: `${Math.min(Math.max(selectionPosition.x, 80), window.innerWidth - 80)}px`,
            top: `${Math.max(selectionPosition.y, 60)}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <Button
            size="sm"
            onClick={handleQueryClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border border-white/20 backdrop-blur-sm text-xs"
          >
            <Search className="w-3 h-3 mr-1" />
            查询词汇
          </Button>
        </div>
      )}

      {/* 单词查询对话框 */}
      <WordQueryDialog
        isOpen={showWordDialog}
        onClose={handleDialogClose}
        selectedWord={selectedText}
        context={selectedContext}
        onWordQuery={onWordQuery}
      />
    </div>
  );
};

export default MessageList;