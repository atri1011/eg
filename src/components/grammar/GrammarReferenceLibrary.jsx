import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Search, BookOpen, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { grammarCategories, getAllGrammarPoints } from '../../data/grammarData.js';
import EnhancedMarkdown from '../common/EnhancedMarkdown.jsx';

const GrammarReferenceLibrary = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedRules, setExpandedRules] = useState({});

  const allGrammarPoints = useMemo(() => getAllGrammarPoints(), []);

  const filteredGrammarPoints = useMemo(() => {
    return allGrammarPoints.filter(point => {
      const matchesSearch = !searchTerm || 
        point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        point.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (point.rules && point.rules.some(rule => 
          rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.content.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesLevel = selectedLevel === 'all' || point.level === selectedLevel;
      const matchesCategory = selectedCategory === 'all' || point.categoryId === selectedCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [allGrammarPoints, searchTerm, selectedLevel, selectedCategory]);

  const toggleRuleExpansion = (pointId, ruleId) => {
    const key = `${pointId}-${ruleId}`;
    setExpandedRules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const levelNames = {
    beginner: '初级',
    intermediate: '中级', 
    advanced: '高级'
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>语法规则参考库</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索语法规则..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">所有难度</option>
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">所有类别</option>
                {Object.values(grammarCategories).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="w-4 h-4 mr-1" />
                清除
              </Button>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {filteredGrammarPoints.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">没有找到匹配的语法规则</h3>
                <p className="text-gray-500">尝试调整搜索条件或清除筛选器</p>
              </div>
            ) : (
              filteredGrammarPoints.map((point) => (
                <Card key={point.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{point.categoryIcon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{point.name}</h3>
                        <EnhancedMarkdown 
                          content={point.description} 
                          className="text-sm text-gray-600 markdown-content"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {point.categoryName}
                      </Badge>
                      <Badge className={levelColors[point.level]}>
                        {levelNames[point.level]}
                      </Badge>
                    </div>
                  </div>

                  {/* 语法规则 */}
                  {point.rules && point.rules.length > 0 && (
                    <div className="space-y-3">
                      {point.rules.map((rule, index) => {
                        const key = `${point.id}-${rule.id}`;
                        const isExpanded = expandedRules[key];
                        
                        return (
                          <div key={rule.id} className="border rounded-lg">
                            <button
                              onClick={() => toggleRuleExpansion(point.id, rule.id)}
                              className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-800">{rule.title}</span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="px-6 pb-4 space-y-3">
                                {/* 规则内容 */}
                                <div className="bg-blue-50 p-3 rounded-md">
                                  <EnhancedMarkdown 
                                    content={rule.content} 
                                    className="text-gray-800 text-sm whitespace-pre-line markdown-content"
                                  />
                                </div>

                                {/* 例句 */}
                                {rule.examples && rule.examples.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2 text-sm">例句：</h5>
                                    <div className="space-y-1">
                                      {rule.examples.map((example, idx) => (
                                        <div key={idx} className="bg-green-50 p-2 rounded-md text-sm">
                                          <p className="text-gray-800">{example}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 常见错误 */}
                  {point.commonMistakes && point.commonMistakes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">常见错误：</h4>
                      <div className="space-y-2">
                        {point.commonMistakes.slice(0, 2).map((mistake, idx) => (
                          <div key={idx} className="text-xs bg-red-50 p-2 rounded-md">
                            <div className="flex items-start space-x-2">
                              <span className="text-red-600 font-medium">✗</span>
                              <span className="line-through text-red-700">{mistake.mistake}</span>
                            </div>
                            <div className="flex items-start space-x-2 mt-1">
                              <span className="text-green-600 font-medium">✓</span>
                              <span className="text-green-700">{mistake.correction}</span>
                            </div>
                          </div>
                        ))}
                        {point.commonMistakes.length > 2 && (
                          <p className="text-xs text-gray-500">
                            还有 {point.commonMistakes.length - 2} 个常见错误...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            共找到 {filteredGrammarPoints.length} 个语法规则
          </p>
          <Button onClick={onClose}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrammarReferenceLibrary;