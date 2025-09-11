import React, { useState } from 'react';
import { Search, Book, Globe, Lightbulb, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

const WordQueryDialog = ({ 
  isOpen, 
  onClose, 
  selectedWord = '', 
  context = '',
  onWordQuery 
}) => {
  const [queryWord, setQueryWord] = useState(selectedWord);
  const [isLoading, setIsLoading] = useState(false);
  const [wordResult, setWordResult] = useState(null);

  const handleQuery = async () => {
    if (!queryWord.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await onWordQuery(queryWord.trim(), context);
      setWordResult(result);
    } catch (error) {
      console.error('查询单词失败:', error);
      setWordResult({
        error: '查询失败，请稍后再试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  React.useEffect(() => {
    if (selectedWord && selectedWord !== queryWord) {
      setQueryWord(selectedWord);
      setWordResult(null);
    }
  }, [selectedWord]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!wordResult ? (
          // 查询界面 - 匹配截图样式
          <div className="p-6">
            {/* 顶部选中文本显示 */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">选中文本</p>
                <p className="text-lg font-semibold text-gray-800">"{selectedWord}"</p>
              </div>
            </div>

            {/* 单词查询标题区域 */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">单词查询</h2>
              </div>
              <p className="text-gray-600 mb-6">点击下方按钮查询这个单词的详细信息</p>
              
              {/* 查询按钮 */}
              <Button 
                onClick={handleQuery}
                disabled={!queryWord.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-4 rounded-2xl shadow-lg"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? '查询中...' : '查询单词'}
              </Button>
            </div>
          </div>
        ) : (
          // 结果显示界面 - 匹配截图样式
          <div className="p-6">
            {wordResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-600 text-center">{wordResult.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 单词头部信息 - 匹配截图布局 */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Book className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {wordResult.word || queryWord}
                      </h1>
                      {wordResult.phonetic && (
                        <span className="text-lg text-gray-500 font-mono">
                          /{wordResult.phonetic}/
                        </span>
                      )}
                    </div>
                    {wordResult.partOfSpeech && (
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full border-0"
                      >
                        {wordResult.partOfSpeech}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 释义部分 */}
                {wordResult.definition && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-bold text-gray-800">释义</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {wordResult.definition}
                      </p>
                    </div>
                  </div>
                )}

                {/* 翻译部分 */}
                {wordResult.translation && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">翻译</h3>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-gray-700 leading-relaxed">
                        {wordResult.translation}
                      </p>
                    </div>
                  </div>
                )}

                {/* 例句部分 */}
                {wordResult.examples && wordResult.examples.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-800">例句</h3>
                    </div>
                    <div className="space-y-3">
                      {wordResult.examples.map((example, index) => (
                        <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-blue-900 font-medium mb-2">
                            {example.sentence || example}
                          </p>
                          {example.translation && (
                            <p className="text-blue-700 text-sm">
                              {example.translation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WordQueryDialog;