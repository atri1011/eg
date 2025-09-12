import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { ArrowLeft, Target, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { getExercisesByGrammarId } from '../data/grammarData.js';

const GrammarPracticeView = ({ grammarPoint, onBack }) => {
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);

  useEffect(() => {
    const grammarExercises = getExercisesByGrammarId(grammarPoint.id);
    setExercises(grammarExercises);
    setCurrentExerciseIndex(0);
    setScore(0);
    setCompletedExercises(0);
  }, [grammarPoint.id]);

  const currentExercise = exercises[currentExerciseIndex];

  const checkAnswer = () => {
    if (!currentExercise) return;

    let correct = false;
    
    switch (currentExercise.type) {
      case 'fill-blank':
        correct = userAnswer.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
        break;
      case 'multiple-choice':
        correct = selectedOption === currentExercise.answer;
        break;
      case 'correction':
        correct = userAnswer.toLowerCase().trim() === currentExercise.correctSentence.toLowerCase().trim();
        break;
      default:
        correct = false;
    }

    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(score + 1);
    }
    setCompletedExercises(completedExercises + 1);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetAnswerState();
    }
  };

  const resetAnswerState = () => {
    setUserAnswer('');
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const restartPractice = () => {
    setCurrentExerciseIndex(0);
    setScore(0);
    setCompletedExercises(0);
    resetAnswerState();
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

  const renderExercise = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              填空题：请填入正确的单词
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-lg">
              {currentExercise.question}
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="输入答案..."
              disabled={showResult}
              className="text-lg"
            />
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              选择题：请选择正确答案
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-lg mb-4">
              {currentExercise.question}
            </div>
            <div className="space-y-2">
              {currentExercise.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  disabled={showResult}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedOption === index
                      ? showResult
                        ? index === currentExercise.answer
                          ? 'bg-green-100 border-green-400 text-green-800'
                          : 'bg-red-100 border-red-400 text-red-800'
                        : 'bg-blue-100 border-blue-400'
                      : showResult && index === currentExercise.answer
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'correction':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              改错题：请修正下面句子中的错误
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
              <div className="text-red-800 font-medium">错误句子：</div>
              <div className="text-lg mt-1">{currentExercise.sentence}</div>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="输入修正后的句子..."
              disabled={showResult}
              className="text-lg"
            />
          </div>
        );
      
      default:
        return <div>不支持的练习类型</div>;
    }
  };

  if (!exercises || exercises.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
        
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无练习题</h3>
          <p className="text-gray-500">该语法点的练习题正在准备中</p>
        </div>
      </div>
    );
  }

  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isCompleted = completedExercises === exercises.length;

  return (
    <div className="space-y-6">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回学习
        </Button>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            进度: {completedExercises}/{exercises.length}
          </Badge>
          <Badge variant="secondary">
            得分: {score}/{completedExercises || 1}
          </Badge>
        </div>
      </div>

      {/* 标题 */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">{grammarPoint.name} - 练习</h1>
        </div>
        {currentExercise && (
          <Badge className={getDifficultyColor(currentExercise.difficulty)}>
            难度: {getDifficultyName(currentExercise.difficulty)}
          </Badge>
        )}
      </div>

      {isCompleted ? (
        /* 完成页面 */
        <Card className="p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">练习完成！</h2>
          <p className="text-lg text-gray-600 mb-4">
            你的得分：{score}/{exercises.length} ({Math.round((score / exercises.length) * 100)}%)
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={restartPractice} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新练习
            </Button>
            <Button onClick={onBack}>
              返回学习
            </Button>
          </div>
        </Card>
      ) : (
        /* 练习界面 */
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                题目 {currentExerciseIndex + 1} / {exercises.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {renderExercise()}

          {/* 结果展示 */}
          {showResult && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '回答正确！' : '回答错误'}
                </span>
              </div>
              
              {!isCorrect && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">正确答案：</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {currentExercise.type === 'multiple-choice' 
                      ? currentExercise.options[currentExercise.answer]
                      : currentExercise.type === 'correction'
                        ? currentExercise.correctSentence
                        : currentExercise.answer
                    }
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-700">
                <span className="font-medium">解释：</span>
                {currentExercise.explanation}
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex justify-between mt-6">
            <div></div>
            <div className="space-x-3">
              {!showResult ? (
                <Button 
                  onClick={checkAnswer}
                  disabled={
                    (currentExercise?.type === 'fill-blank' && !userAnswer.trim()) ||
                    (currentExercise?.type === 'multiple-choice' && selectedOption === null) ||
                    (currentExercise?.type === 'correction' && !userAnswer.trim())
                  }
                >
                  提交答案
                </Button>
              ) : (
                <Button onClick={nextExercise} disabled={isLastExercise}>
                  {isLastExercise ? '练习完成' : '下一题'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GrammarPracticeView;