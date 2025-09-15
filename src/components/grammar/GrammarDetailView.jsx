import React, { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, Target } from 'lucide-react';

const GrammarDetailView = ({ grammarPoint, onBack, onStartPractice }) => {
  const [activeTab, setActiveTab] = useState('rules');

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const levelNames = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };

  return (
    <div className="space-y-6">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button onClick={onStartPractice}>
          <Target className="w-4 h-4 mr-2" />
          开始练习
        </Button>
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">{grammarPoint.name}</h1>
          <Badge className={levelColors[grammarPoint.level]}>
            {levelNames[grammarPoint.level]}
          </Badge>
        </div>
        <p className="text-gray-600 text-lg">{grammarPoint.description}</p>
        {grammarPoint.categoryName && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="text-sm text-gray-500">所属类别：</span>
            <span className="text-sm font-medium text-blue-600">{grammarPoint.categoryName}</span>
          </div>
        )}
      </div>

      {/* 内容标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">语法规则</TabsTrigger>
          <TabsTrigger value="mistakes">常见错误</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6 mt-6">
          {grammarPoint.rules && grammarPoint.rules.length > 0 ? (
            <div className="space-y-6">
              {grammarPoint.rules.map((rule, index) => (
                <Card key={rule.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{rule.title}</h3>
                      
                      {/* 规则内容 */}
                      <div className="mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-800 whitespace-pre-line">{rule.content}</p>
                        </div>
                      </div>

                      {/* 例句 */}
                      {rule.examples && rule.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            例句
                          </h4>
                          <div className="space-y-2">
                            {rule.examples.map((example, idx) => (
                              <div key={idx} className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                                <p className="text-gray-800 font-medium">{example}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无详细规则说明</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-6 mt-6">
          {grammarPoint.commonMistakes && grammarPoint.commonMistakes.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">常见错误分析</h3>
                <p className="text-gray-600">学习这些常见错误，避免在实际使用中犯同样的错误</p>
              </div>

              {grammarPoint.commonMistakes.map((mistake, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    {/* 错误示例 */}
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        错误示例
                      </h4>
                      <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                        <p className="text-red-800 font-medium line-through">{mistake.mistake}</p>
                      </div>
                    </div>

                    {/* 正确示例 */}
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        正确示例
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <p className="text-green-800 font-medium">{mistake.correction}</p>
                      </div>
                    </div>

                    {/* 解释 */}
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">解释</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">{mistake.explanation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无常见错误分析</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrammarDetailView;