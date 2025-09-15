import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const DiffText = ({ original, corrected, type = 'correction' }) => {
  const segments = useMemo(() => {
    if (!original || !corrected || original === corrected) {
      return [{ text: original || corrected, type: 'unchanged' }];
    }

    const originalWords = original.split(/(\s+)/);
    const correctedWords = corrected.split(/(\s+)/);
    const segments = [];
    
    let oIndex = 0, cIndex = 0;
    
    while (oIndex < originalWords.length || cIndex < correctedWords.length) {
      const oWord = originalWords[oIndex] || '';
      const cWord = correctedWords[cIndex] || '';
      
      if (oWord === cWord) {
        if (oWord.trim()) {
          segments.push({ text: oWord, type: 'unchanged' });
        }
        oIndex++;
        cIndex++;
      } else {
        if (oIndex < originalWords.length) {
          if (oWord.trim()) {
            segments.push({ text: oWord, type: 'removed' });
          }
          oIndex++;
        }
        if (cIndex < correctedWords.length) {
          if (cWord.trim()) {
            segments.push({ text: cWord, type: 'added' });
          }
          cIndex++;
        }
      }
    }
    
    return segments;
  }, [original, corrected]);

  const getSegmentStyle = (segmentType) => {
    switch (segmentType) {
      case 'removed':
        return 'bg-red-100 text-red-800 line-through px-1 rounded';
      case 'added':
        return type === 'optimization' 
          ? 'bg-blue-100 text-blue-800 px-1 rounded font-medium'
          : 'bg-green-100 text-green-800 px-1 rounded font-medium';
      default:
        return '';
    }
  };

  return (
    <div className="text-sm leading-relaxed">
      {segments.map((segment, index) => (
        <span key={index} className={getSegmentStyle(segment.type)}>
          {segment.text}
        </span>
      ))}
    </div>
  );
};

const CorrectionItem = ({ correction, index }) => {
  const getTypeConfig = (type) => {
    switch (type) {
      case 'grammar':
        return { 
          color: 'bg-red-100 text-red-600', 
          icon: AlertCircle, 
          label: '语法' 
        };
      case 'spelling':
        return { 
          color: 'bg-orange-100 text-orange-600', 
          icon: AlertCircle, 
          label: '拼写' 
        };
      case 'translation':
        return { 
          color: 'bg-purple-100 text-purple-600', 
          icon: CheckCircle, 
          label: '翻译' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-600', 
          icon: AlertCircle, 
          label: '其他' 
        };
    }
  };

  const config = getTypeConfig(correction.type);
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 optimization-item hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} text-xs`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
        <span className="text-xs text-gray-500">#{index + 1}</span>
      </div>
      
      <DiffText 
        original={correction.original} 
        corrected={correction.corrected}
        type="correction"
      />
      
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        {correction.explanation}
      </div>
    </div>
  );
};

const OptimizationPanel = ({ corrections, optimization }) => {
  const [selectedTab, setSelectedTab] = useState(null);
  
  const hasCorrections = corrections && Object.keys(corrections).length > 0 && corrections.corrections?.length > 0;
  const hasOptimization = optimization && Object.keys(optimization).length > 0;
  
  if (!hasCorrections && !hasOptimization) {
    return null;
  }



  return (
    <div className="mt-3 max-w-[85%] w-auto">
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm optimization-panel ${selectedTab ? 'expanded' : 'collapsed'}`}>
        {/* 主标题和标签按钮 */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800">智能优化建议</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {hasCorrections && (
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedTab(selectedTab === 'corrections' ? null : 'corrections')}
                className={`text-xs px-3 py-1 h-auto rounded-full transition-all ${
                  selectedTab === 'corrections' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                纠错 ({corrections.corrections.length})
              </Button>
            )}
            {hasOptimization && (
              <Button
                variant="ghost"
                size="sm" 
                onClick={() => setSelectedTab(selectedTab === 'optimization' ? null : 'optimization')}
                className={`text-xs px-3 py-1 h-auto rounded-full transition-all ${
                  selectedTab === 'optimization'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                四级优化
              </Button>
            )}
          </div>
        </div>

        {/* 简化预览 - 未选中标签时 */}
        {!selectedTab && (
          <div className="px-4 pb-4 border-t border-blue-100 bg-white/50">
            <div className="mt-3">
              {hasOptimization && (
                <div className="mb-3">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">优化建议：</span>
                  </div>
                  <div className="text-sm text-blue-800 bg-blue-50 p-2 rounded">
                    {optimization.optimized_sentence}
                  </div>
                </div>
              )}
              
              {hasCorrections && (
                <div className="text-xs text-gray-600">
                  发现 {corrections.corrections.length} 处问题，点击"纠错"标签查看详情
                </div>
              )}
            </div>
          </div>
        )}

        {/* 详细展示 - 选中标签时 */}
        {selectedTab && (
          <div className="border-t border-blue-100 bg-white/50">
            {/* 四级优化内容 */}
            {selectedTab === 'optimization' && hasOptimization && (
              <div className="p-4 space-y-4 tab-content-enter">
                <div className="bg-white rounded-lg border border-blue-200 p-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800">四级写作优化建议</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">原句：</label>
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {optimization.original_sentence}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-blue-600 mb-1 block">优化后：</label>
                      <div className="text-sm text-blue-800 bg-blue-50 p-2 rounded font-medium">
                        {optimization.optimized_sentence}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">差异对比：</label>
                      <div className="bg-gray-50 p-2 rounded">
                        <DiffText 
                          original={optimization.original_sentence} 
                          corrected={optimization.optimized_sentence}
                          type="optimization"
                        />
                      </div>
                    </div>

                    {/* 四级评分分析 */}
                    {optimization.scoring_analysis && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-800 mb-2">四级评分分析</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">表达清晰度：</span>
                            <span className="font-medium text-blue-600">{optimization.scoring_analysis.clarity}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">连贯性：</span>
                            <span className="font-medium text-blue-600">{optimization.scoring_analysis.coherence}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">语言准确性：</span>
                            <span className="font-medium text-blue-600">{optimization.scoring_analysis.accuracy}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">词汇水平：</span>
                            <span className="font-medium text-blue-600">{optimization.scoring_analysis.vocabulary}/5</span>
                          </div>
                        </div>
                        
                        {optimization.current_score_range && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">当前预估分数：</span>
                              <span className="font-medium text-orange-600">{optimization.current_score_range}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">优化后分数：</span>
                              <span className="font-medium text-green-600">{optimization.target_score_range}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 改进建议 */}
                    {optimization.improvements && optimization.improvements.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-800 mb-2">具体改进建议</h5>
                        <div className="space-y-2">
                          {optimization.improvements.map((improvement, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {improvement.aspect}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-700 mb-1">
                                <strong>问题：</strong>{improvement.issue}
                              </div>
                              <div className="text-xs text-green-700 mb-1">
                                <strong>改进：</strong>{improvement.improvement}
                              </div>
                              {improvement.example && (
                                <div className="text-xs text-blue-700">
                                  <strong>示例：</strong>{improvement.example}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 写作技巧 */}
                    {optimization.tips && optimization.tips.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="text-sm font-medium text-green-800 mb-2">写作技巧建议</h5>
                        <ul className="text-xs text-green-700 space-y-1">
                          {optimization.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 语法纠错内容 */}
            {selectedTab === 'corrections' && hasCorrections && (
              <div className="p-4 space-y-4 tab-content-enter">
                <div className="bg-white rounded-lg border border-red-200 p-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-2">整句对比</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">原句：</label>
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {corrections.original_sentence}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-green-600 mb-1 block">修正后：</label>
                        <div className="text-sm text-green-800 bg-green-50 p-2 rounded font-medium">
                          {corrections.corrected_sentence}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">详细修正</h4>
                  {corrections.corrections.map((correction, index) => (
                    <CorrectionItem 
                      key={index} 
                      correction={correction} 
                      index={index}
                    />
                  ))}
                </div>
                
                {corrections.overall_comment && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <strong>总结：</strong> {corrections.overall_comment}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationPanel;