import React, { useState } from 'react';
import { Search, Book, Globe, Lightbulb } from 'lucide-react';
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
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                单词查询
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                点击下方按钮查询这个单词的详细信息
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* 查询界面 */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={queryWord}
              onChange={(e) => setQueryWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入要查询的单词..."
              className="flex-1 text-base"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleQuery}
            disabled={!queryWord.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="lg"
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? '查询中...' : '查询单词'}
          </Button>
        </div>

        {/* 结果显示区域 */}
        {wordResult && (
          <div className="mt-6 space-y-4">
            {wordResult.error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-600">{wordResult.error}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* 单词基本信息 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Book className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-800">
                        {wordResult.word || queryWord}
                      </h3>
                      {wordResult.phonetic && (
                        <span className="text-sm text-gray-500">
                          /{wordResult.phonetic}/
                        </span>
                      )}
                    </div>
                    
                    {wordResult.partOfSpeech && (
                      <Badge variant="default" className="mb-3 text-white">
                        {wordResult.partOfSpeech}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* 释义 */}
                {wordResult.definition && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Globe className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-800">释义</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {wordResult.definition}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 翻译 */}
                {wordResult.translation && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Globe className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-800">翻译</h4>
                      </div>
                      <p className="text-gray-700">
                        {wordResult.translation}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 例句 */}
                {wordResult.examples && wordResult.examples.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-semibold text-gray-800">例句</h4>
                      </div>
                      <div className="space-y-3">
                        {wordResult.examples.map((example, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-800 font-medium">
                              {example.sentence || example}
                            </p>
                            {example.translation && (
                              <p className="text-sm text-gray-600 mt-1">
                                {example.translation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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