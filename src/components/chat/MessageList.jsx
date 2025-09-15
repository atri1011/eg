import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles, MessageCircle, Search, Edit3, Trash2, Save, X } from 'lucide-react';
import WordQueryDialog from '../common/WordQueryDialog.jsx';
import OptimizationPanel from '../common/OptimizationPanel.jsx';

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

const MessageList = ({ messages, isLoading, messagesEndRef, onWordQuery, onEditMessage, onDeleteMessage }) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showQueryButton, setShowQueryButton] = useState(false);
  const [showWordDialog, setShowWordDialog] = useState(false);
  const [selectedContext, setSelectedContext] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const selectionTimeoutRef = useRef(null);

  // 检测选中的文本是否为英文单词或词组
  const isEnglishText = useCallback((text) => {
    if (!text || text.trim().length === 0) return false;
    const trimmedText = text.trim();
    // 支持多个单词、句子（允许连字符、撇号、空格、标点符号）
    const textRegex = /^[a-zA-Z]+(?:[-'\s.,!?;:][a-zA-Z]*)*$/;
    return textRegex.test(trimmedText) && trimmedText.length > 1;
  }, []);

  // 检测是否为单个单词
  const isSingleWord = useCallback((text) => {
    if (!text || text.trim().length === 0) return false;
    const trimmedText = text.trim();
    // 单个单词：只包含字母、连字符或撇号，没有空格
    const singleWordRegex = /^[a-zA-Z]+(?:[-'][a-zA-Z]*)*$/;
    return singleWordRegex.test(trimmedText) && !trimmedText.includes(' ');
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
      
      // 智能定位逻辑
      const buttonWidth = 120; // 估算按钮宽度
      const buttonHeight = 40; // 估算按钮高度
      const padding = 10; // 边距
      
      let x = rect.left + rect.width / 2;
      let y = rect.top - buttonHeight - padding;
      
      // 水平方向边界检查
      if (x - buttonWidth / 2 < padding) {
        x = buttonWidth / 2 + padding;
      } else if (x + buttonWidth / 2 > window.innerWidth - padding) {
        x = window.innerWidth - buttonWidth / 2 - padding;
      }
      
      // 垂直方向边界检查
      if (y < padding) {
        y = rect.bottom + padding; // 如果上方空间不足，显示在下方
      }
      
      setSelectedText(selectedText);
      setSelectedContext(context);
      setSelectionPosition({ x, y });
      setShowQueryButton(true);
      
      // 8秒后自动隐藏按钮
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        setShowQueryButton(false);
      }, 8000);
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

  // 处理快速单词查询
  const handleQuickWordQuery = useCallback(async () => {
    setShowQueryButton(false);
    window.getSelection().removeAllRanges();
    
    // 直接打开对话框并预设为快速查询模式
    setShowWordDialog(true);
  }, []);

  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setShowWordDialog(false);
    setSelectedText('');
    setSelectedContext('');
  }, []);

  // 开始编辑消息
  const handleStartEdit = useCallback((messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  }, []);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingContent('');
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(async () => {
    if (!editingContent.trim() || !editingMessageId) return;
    
    const success = await onEditMessage(editingMessageId, editingContent);
    if (success) {
      setEditingMessageId(null);
      setEditingContent('');
    }
  }, [editingMessageId, editingContent, onEditMessage]);

  // 删除消息
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (window.confirm('确定要删除这条消息吗？')) {
      await onDeleteMessage(messageId);
    }
  }, [onDeleteMessage]);

  // 处理编辑输入框的键盘事件
  const handleEditKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

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
            <div 
              className={`max-w-[85%] md:max-w-xs lg:max-w-xl px-4 py-3 relative group ${
                message.type === 'user'
                  ? 'bg-gray-200 text-black rounded-2xl'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200 rounded-lg'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-lg'
                }`}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* 用户消息编辑和删除按钮 */}
              {message.type === 'user' && hoveredMessageId === message.id && editingMessageId !== message.id && (
                <div className="absolute -top-2 -right-2 flex space-x-1 bg-white rounded-lg shadow-md border p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(message.id, message.content)}
                    className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                    title="编辑消息"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMessage(message.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    title="删除消息"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* 编辑模式 */}
              {editingMessageId === message.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onKeyDown={handleEditKeyPress}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                /* 正常消息显示 */
                <>
                  {message.type === 'ai'
                    ? renderSegmentedMessage(message.content, message.translation)
                    : (
                      <div className={`prose prose-sm max-w-none ${message.type === 'user' ? 'prose-user-message prose-invert' : ''}`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        {message.isEdited && (
                          <div className="text-xs text-gray-500 mt-1 italic">
                            已编辑
                          </div>
                        )}
                      </div>
                    )
                  }
                </>
              )}
            </div>

            {/* 优化面板显示 */}
            {message.type === 'user' && (message.corrections || message.optimization) && editingMessageId !== message.id && (
              <OptimizationPanel
                corrections={message.corrections}
                optimization={message.optimization}
              />
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
          className="fixed z-50 animate-in fade-in-50 zoom-in-95 duration-300"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* 指示箭头 - 根据位置动态调整 */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
              selectionPosition.y > 100 
                ? 'top-full border-t-6 border-t-blue-600' 
                : 'bottom-full border-b-6 border-b-blue-600'
            }`}
          ></div>
          
          {/* 根据选中文本类型显示不同按钮 */}
          {isSingleWord(selectedText) ? (
            // 单个单词：显示快速查询和详细解析两个选项
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleQuickWordQuery}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm text-xs transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-3 h-3 mr-1" />
                快速查询
              </Button>
              <Button
                size="sm"
                onClick={handleQueryClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm text-xs transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-3 h-3 mr-1" />
                句子解析
              </Button>
            </div>
          ) : (
            // 多个单词或句子：只显示句子解析选项
            <Button
              size="sm"
              onClick={handleQueryClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm text-xs transition-all duration-200 transform hover:scale-105"
            >
              <Search className="w-3 h-3 mr-1 animate-pulse" />
              句子解析
            </Button>
          )}
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