import React, { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { ChevronRight, BookOpen, Target, Award, ArrowLeft } from 'lucide-react';
import { grammarCategories, getGrammarByLevel } from '../../data/grammarData.js';
import { useConfig } from '../../hooks/useConfig.js';
import GrammarDetailView from './GrammarDetailView.jsx';
import GrammarPracticeView from '../practice/GrammarPracticeView.jsx';
import PracticeSelectionView from '../practice/PracticeSelectionView.jsx';

const GrammarLearningModule = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGrammarPoint, setSelectedGrammarPoint] = useState(null);
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'detail', 'selection', 'practice'
  const [practiceData, setPracticeData] = useState(null);
  const { config } = useConfig();
  
  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentView('detail');
  };

  const handleGrammarPointClick = (grammarPoint) => {
    setSelectedGrammarPoint(grammarPoint);
    setCurrentView('detail');
  };

  const handlePracticeClick = (grammarPoint) => {
    setSelectedGrammarPoint(grammarPoint);
    setCurrentView('selection');
  };

  const handleStartPractice = (practiceInfo) => {
    setPracticeData(practiceInfo);
    setCurrentView('practice');
  };

  const handleBackToOverview = () => {
    setSelectedCategory(null);
    setSelectedGrammarPoint(null);
    setPracticeData(null);
    setCurrentView('overview');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">语法学习中心</h1>
        <p className="text-gray-600">系统化学习英语语法，提升语言运用能力</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">按类别学习</TabsTrigger>
          <TabsTrigger value="level">按难度学习</TabsTrigger>
          <TabsTrigger value="progress">学习进度</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(grammarCategories).map((category) => (
              <Card 
                key={category.id} 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{category.icon}</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{category.subcategories.length} 个知识点</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="level" className="space-y-4">
          {['beginner', 'intermediate', 'advanced'].map((level) => {
            const levelName = { beginner: '初级', intermediate: '中级', advanced: '高级' };
            const grammarPoints = getGrammarByLevel(level);
            
            return (
              <div key={level} className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  {levelName[level]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grammarPoints.map((grammarPoint) => (
                    <Card 
                      key={grammarPoint.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleGrammarPointClick(grammarPoint)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{grammarPoint.categoryIcon}</span>
                        <Badge className={levelColors[grammarPoint.level]}>{levelName[grammarPoint.level]}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{grammarPoint.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{grammarPoint.description}</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGrammarPointClick(grammarPoint);
                          }}
                        >
                          学习
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePracticeClick(grammarPoint);
                          }}
                        >
                          练习
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">学习进度追踪</h3>
            <p className="text-gray-500">此功能将在后续版本中推出</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCategoryDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToOverview}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回总览
          </Button>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">{selectedCategory.icon}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedCategory.name}</h1>
        <p className="text-gray-600">{selectedCategory.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedCategory.subcategories.map((subcategory) => (
          <Card key={subcategory.id} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{subcategory.name}</h3>
              <Badge className={levelColors[subcategory.level]}>
                {subcategory.level === 'beginner' ? '初级' : 
                 subcategory.level === 'intermediate' ? '中级' : '高级'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">{subcategory.description}</p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleGrammarPointClick(subcategory)}
              >
                查看详情
              </Button>
              <Button 
                size="sm" 
                onClick={() => handlePracticeClick(subcategory)}
              >
                开始练习
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 h-full overflow-y-auto">
      {currentView === 'overview' && renderOverview()}
      {currentView === 'detail' && selectedCategory && renderCategoryDetail()}
      {currentView === 'detail' && selectedGrammarPoint && (
        <GrammarDetailView 
          grammarPoint={selectedGrammarPoint}
          onBack={handleBackToOverview}
          onStartPractice={() => handlePracticeClick(selectedGrammarPoint)}
        />
      )}
      {currentView === 'selection' && selectedGrammarPoint && (
        <PracticeSelectionView
          grammarPoint={selectedGrammarPoint}
          onBack={handleBackToOverview}
          onStartPractice={handleStartPractice}
          config={config}
        />
      )}
      {currentView === 'practice' && selectedGrammarPoint && (
        <GrammarPracticeView 
          grammarPoint={selectedGrammarPoint}
          onBack={handleBackToOverview}
          practiceData={practiceData}
        />
      )}
    </div>
  );
};

export default GrammarLearningModule;