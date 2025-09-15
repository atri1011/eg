import React, { useState, useEffect } from 'react';
import { Search, Book, Globe, Lightbulb, FileText, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import EnhancedMarkdown from './EnhancedMarkdown.jsx';

const WordQueryDialog = ({ 
  isOpen, 
  onClose, 
  selectedWord = '', 
  context = '',
  onWordQuery 
}) => {
  const [selectedText, setSelectedText] = useState(selectedWord);
  const [words, setWords] = useState([]);
  const [selectedVocab, setSelectedVocab] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentStep, setCurrentStep] = useState('vocab-selection'); // 'vocab-selection' | 'analysis'
  const [isQuickMode, setIsQuickMode] = useState(false); // 快速查询模式

  // 检测是否为单个单词
  const isSingleWord = (text) => {
    if (!text || text.trim().length === 0) return false;
    const trimmedText = text.trim();
    const singleWordRegex = /^[a-zA-Z]+(?:[-'][a-zA-Z]*)*$/;
    return singleWordRegex.test(trimmedText) && !trimmedText.includes(' ');
  };

  // 快速查询单个词汇
  const handleQuickQuery = async () => {
    if (!selectedText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await onWordQuery(selectedText, context, [selectedText.trim()]);
      setAnalysisResult(result);
      setCurrentStep('analysis');
    } catch (error) {
      console.error('快速查询失败:', error);
      setAnalysisResult({
        error: '查询失败，请稍后再试'
      });
      setCurrentStep('analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // 提取单词
  const extractWords = (text) => {
    if (!text) return [];
    // 提取英文单词，过滤掉标点符号和空格
    const wordMatches = text.match(/[a-zA-Z]+(?:[-'][a-zA-Z]+)*/g);
    if (!wordMatches) return [];
    
    // 去重并过滤掉单个字母和常见词汇
    const commonWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall']);
    const uniqueWords = [...new Set(wordMatches)]
      .filter(word => word.length > 1 && !commonWords.has(word.toLowerCase()))
      .slice(0, 20); // 最多显示20个单词
    
    return uniqueWords;
  };

  // 处理句子解析
  const handleAnalyzeSentence = async () => {
    if (selectedVocab.length === 0) {
      alert('请至少选择一个不认识的生词');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await onWordQuery(selectedText, context, selectedVocab);
      setAnalysisResult(result);
      setCurrentStep('analysis');
    } catch (error) {
      console.error('句子解析失败:', error);
      setAnalysisResult({
        error: '解析失败，请稍后再试'
      });
      setCurrentStep('analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换生词选择
  const toggleVocabSelection = (word) => {
    setSelectedVocab(prev => 
      prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  // 重置到第一步
  const resetToSelection = () => {
    setCurrentStep('vocab-selection');
    setAnalysisResult(null);
  };

  useEffect(() => {
    if (selectedWord && selectedWord !== selectedText) {
      setSelectedText(selectedWord);
      setWords(extractWords(selectedWord));
      setSelectedVocab([]);
      setAnalysisResult(null);
      setCurrentStep('vocab-selection');
    }
  }, [selectedWord]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {currentStep === 'vocab-selection' ? '句子解析 - 生词选择' : '句子解析 - 分析结果'}
          </DialogTitle>
        </DialogHeader>
        
        {/* 进度指示器 */}
        <div className="flex items-center justify-center mb-6 px-6 pt-6 md:px-6 md:pt-6 progress-indicator-mobile">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* 步骤1 */}
            <div className={`flex items-center progress-step-transition ${currentStep === 'vocab-selection' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 progress-circle-mobile rounded-full flex items-center justify-center border-2 progress-step-transition ${
                currentStep === 'vocab-selection' 
                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                  : 'border-green-600 bg-green-600 text-white'
              }`}>
                {currentStep === 'vocab-selection' ? '1' : <span className="progress-checkmark">✓</span>}
              </div>
              <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium progress-step-mobile">选择生词</span>
            </div>
            
            {/* 连接线 */}
            <div className={`w-12 md:w-16 h-0.5 transition-all duration-500 ${currentStep === 'analysis' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            {/* 步骤2 */}
            <div className={`flex items-center progress-step-transition ${
              currentStep === 'analysis' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 progress-circle-mobile rounded-full flex items-center justify-center border-2 progress-step-transition ${
                currentStep === 'analysis' 
                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 bg-gray-50 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium progress-step-mobile">查看解析</span>
            </div>
          </div>
        </div>
        
        {currentStep === 'vocab-selection' ? (
          // 第一步：生词选择界面
          <div className="p-4 md:p-6 step-transition-enter word-query-mobile">
            {/* 顶部选中文本显示 */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">选中文本</p>
                <p className="text-lg font-semibold text-gray-800">"{selectedText}"</p>
              </div>
            </div>

            {/* 句子解析标题区域 */}
            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">句子解析</h2>
              </div>
              <p className="text-gray-600 mb-6">选择你不认识的单词，我们将为你解析整个句子</p>
              
              {/* 如果是单个单词，显示快速查询选项 */}
              {isSingleWord(selectedText) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">快速查询单词</span>
                    </div>
                    <Button
                      onClick={handleQuickQuery}
                      disabled={isLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? '查询中...' : '直接查询'}
                    </Button>
                  </div>
                  <p className="text-blue-700 text-sm mt-2">
                    直接查询 "{selectedText}" 的意思和用法，无需选择生词
                  </p>
                </div>
              )}
            </div>

            {/* 生词选择区域 */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Book className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-800">选择生词 ({selectedVocab.length} 个已选)</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                {words.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => toggleVocabSelection(word)}
                    className={`px-3 py-2 md:px-4 md:py-2 vocab-button-mobile rounded-full text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedVocab.includes(word)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg border-2 border-blue-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {word}
                    {selectedVocab.includes(word) && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {words.length === 0 && (
                <p className="text-gray-500 text-center py-8">未找到可选择的单词</p>
              )}
            </div>

            {/* 解析按钮 */}
            <Button 
              onClick={handleAnalyzeSentence}
              disabled={selectedVocab.length === 0 || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm md:text-lg py-3 md:py-4 rounded-2xl shadow-lg word-query-button-mobile"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              {isLoading ? '解析中...' : `解析句子 (${selectedVocab.length} 个生词)`}
            </Button>
          </div>
        ) : (
          // 第二步：解析结果界面
          <div className="p-4 md:p-6 step-transition-enter word-query-mobile">
            {/* 返回按钮 */}
            <div className="mb-4">
              <Button
                onClick={resetToSelection}
                variant="outline"
                className="text-blue-600 hover:text-blue-700"
              >
                ← 重新选择生词
              </Button>
            </div>

            {analysisResult?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-600 text-center">{analysisResult.error}</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                {/* 句子解析标题 */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">句子解析</h1>
                    <p className="text-gray-600">详细的语法和翻译解释</p>
                  </div>
                </div>

                {/* 翻译部分 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">翻译</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <EnhancedMarkdown 
                      content={analysisResult.translation || '暂无翻译'} 
                      className="text-gray-700 leading-relaxed markdown-content"
                    />
                  </div>
                </div>

                {/* 语法解释部分 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-800">语法解释</h3>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <EnhancedMarkdown 
                      content={analysisResult.grammar || '暂无语法解释'} 
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap markdown-content"
                    />
                  </div>
                </div>

                {/* 生词释义部分 */}
                {analysisResult.vocabulary && analysisResult.vocabulary.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Book className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-800">生词释义</h3>
                    </div>
                    <div className="space-y-3">
                      {analysisResult.vocabulary.map((vocab, index) => (
                        <div key={index} className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-bold text-purple-900">{vocab.word}</span>
                            {vocab.phonetic && (
                              <span className="text-sm text-purple-700 font-mono">/{vocab.phonetic}/</span>
                            )}
                            {vocab.partOfSpeech && (
                              <Badge className="bg-purple-200 text-purple-800">{vocab.partOfSpeech}</Badge>
                            )}
                          </div>
                          <p className="text-purple-800 mb-1">{vocab.meaning}</p>
                          {vocab.translation && (
                            <p className="text-purple-700 text-sm">{vocab.translation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 类似例句部分 */}
                {analysisResult.examples && analysisResult.examples.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-800">类似例句</h3>
                    </div>
                    <div className="space-y-3">
                      {analysisResult.examples.map((example, index) => (
                        <div key={index} className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                          <p className="text-yellow-900 font-medium mb-2">
                            {example.sentence || example}
                          </p>
                          {example.translation && (
                            <p className="text-yellow-700 text-sm">
                              {example.translation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">正在解析中...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WordQueryDialog;