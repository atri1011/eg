import React, { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Label } from '@/components/ui/label.jsx';
import { ArrowLeft, Target, BookOpen, Zap, Settings } from 'lucide-react';
import { getExercisesByGrammarId } from '../../data/grammarData.js';

const PracticeSelectionView = ({ grammarPoint, onBack, onStartPractice, config }) => {
  const [practiceType, setPracticeType] = useState(null);
  const [aiSettings, setAiSettings] = useState({
    count: '10',
    difficulty: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);

  // 获取预设题目数量
  const presetExercises = getExercisesByGrammarId(grammarPoint.id);
  const presetCount = presetExercises.length;

  const handlePresetPractice = () => {
    onStartPractice({
      type: 'preset',
      exercises: presetExercises
    });
  };

  const handleAiPractice = async () => {
    if (!config?.apiKey) {
      alert('请先在设置中配置API密钥');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-grammar-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grammarPoint: grammarPoint,
          config: config,
          settings: {
            count: parseInt(aiSettings.count),
            difficulty: aiSettings.difficulty
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onStartPractice({
          type: 'ai',
          exercises: data.exercises
        });
      } else {
        throw new Error(data.error || 'AI生成练习题失败');
      }
    } catch (error) {
      console.error('生成AI练习题失败:', error);
      alert('生成AI练习题失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyName = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  if (practiceType === 'preset') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPracticeType(null)} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回选择
          </Button>
        </div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">预设练习题</h2>
            <p className="text-gray-600">使用精心准备的练习题进行训练</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">题目详情</span>
              <Badge variant="secondary">{presetCount} 道题目</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">语法点：</span>
                <span className="ml-2">{grammarPoint.name}</span>
              </div>
              <div>
                <span className="font-medium">难度级别：</span>
                <Badge className={getDifficultyColor(grammarPoint.level)} size="sm">
                  {getDifficultyName(grammarPoint.level)}
                </Badge>
              </div>
              <div>
                <span className="font-medium">题目类型：</span>
                <span className="ml-2">填空题、选择题、改错题</span>
              </div>
              <div>
                <span className="font-medium">估计时间：</span>
                <span className="ml-2">{Math.max(1, Math.ceil(presetCount * 1.5))} 分钟</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setPracticeType(null)}>
              重新选择
            </Button>
            <Button onClick={handlePresetPractice} disabled={presetCount === 0}>
              {presetCount === 0 ? '暂无题目' : '开始练习'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (practiceType === 'ai') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPracticeType(null)} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回选择
          </Button>
        </div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <Zap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">AI生成练习题</h2>
            <p className="text-gray-600">根据您的需求智能生成个性化练习题</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <Label htmlFor="exercise-count">题目数量</Label>
              <Select value={aiSettings.count} onValueChange={(value) => setAiSettings({...aiSettings, count: value})}>
                <SelectTrigger id="exercise-count">
                  <SelectValue placeholder="选择题目数量" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 道题目</SelectItem>
                  <SelectItem value="10">10 道题目</SelectItem>
                  <SelectItem value="15">15 道题目</SelectItem>
                  <SelectItem value="20">20 道题目</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="difficulty">难度级别</Label>
              <Select value={aiSettings.difficulty} onValueChange={(value) => setAiSettings({...aiSettings, difficulty: value})}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="选择难度级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      简单
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      中等
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      困难
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">生成设置</span>
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">语法点：</span>
                <span className="ml-2">{grammarPoint.name}</span>
              </div>
              <div>
                <span className="font-medium">题目数量：</span>
                <span className="ml-2">{aiSettings.count} 道</span>
              </div>
              <div>
                <span className="font-medium">难度级别：</span>
                <Badge className={getDifficultyColor(aiSettings.difficulty)} size="sm">
                  {getDifficultyName(aiSettings.difficulty)}
                </Badge>
              </div>
              <div>
                <span className="font-medium">估计时间：</span>
                <span className="ml-2">{Math.max(2, Math.ceil(parseInt(aiSettings.count) * 1.8))} 分钟</span>
              </div>
            </div>
          </div>

          {!config?.apiKey && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">需要配置API密钥</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                请先在设置中配置AI服务的API密钥才能生成练习题
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setPracticeType(null)}>
              重新选择
            </Button>
            <Button onClick={handleAiPractice} disabled={isLoading || !config?.apiKey}>
              {isLoading ? '正在生成...' : '生成并开始'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 主选择界面
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回学习
        </Button>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">{grammarPoint.name} - 选择练习模式</h1>
        </div>
        <p className="text-gray-600">选择适合您的练习模式开始语法训练</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 预设练习题选项 */}
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setPracticeType('preset')}>
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">预设练习题</h3>
            <p className="text-gray-600 mb-4">使用精心设计的标准练习题，内容丰富，覆盖全面</p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">题目数量：</span>
                <Badge variant="secondary">{presetCount} 道</Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                立即开始，无需等待
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                专业制作，质量保证
              </div>
              {presetCount === 0 && (
                <div className="flex items-center justify-center text-red-500">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  暂无可用题目
                </div>
              )}
            </div>

            <Button className="w-full" disabled={presetCount === 0}>
              {presetCount === 0 ? '暂无题目' : '选择预设练习'}
            </Button>
          </div>
        </Card>

        {/* AI生成练习题选项 */}
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setPracticeType('ai')}>
          <div className="text-center">
            <Zap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI生成练习题</h3>
            <p className="text-gray-600 mb-4">智能生成个性化练习题，可自定义数量和难度</p>
            
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">可选数量：</span>
                <Badge variant="secondary">5-20 道</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">难度选择：</span>
                <Badge variant="secondary">简单/中等/困难</Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                个性化定制
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                智能难度调节
              </div>
              {!config?.apiKey && (
                <div className="flex items-center justify-center text-yellow-600">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  需要配置API密钥
                </div>
              )}
            </div>

            <Button className="w-full" variant={config?.apiKey ? "default" : "secondary"}>
              选择AI生成
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PracticeSelectionView;