import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasCorrections = corrections && Object.keys(corrections).length > 0 && corrections.corrections?.length > 0;
  const hasOptimization = optimization && Object.keys(optimization).length > 0;
  
  if (!hasCorrections && !hasOptimization) {
    return null;
  }



  return (
    <div className="mt-3 max-w-[85%] w-auto">
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm optimization-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {/* 折叠/展开头部 */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800">智能优化建议</span>
            </div>
            <div className="flex gap-2">
              {hasCorrections && (
                <Badge className="bg-red-100 text-red-600 text-xs">
                  {corrections.corrections.length} 项纠错
                </Badge>
              )}
              {hasOptimization && (
                <Badge className="bg-blue-100 text-blue-600 text-xs">
                  四级优化
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                查看详情
              </>
            )}
          </Button>
        </div>

        {/* 简化预览 - 未展开时 */}
        {!isExpanded && (
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
                  发现 {corrections.corrections.length} 处问题，点击查看详情
                </div>
              )}
            </div>
          </div>
        )}

        {/* 详细展示 - 展开时 */}
        {isExpanded && (
          <div className="border-t border-blue-100 bg-white/50">
            <Tabs defaultValue={hasOptimization ? "optimization" : "corrections"} className="w-full">
              <TabsList className="w-full bg-transparent border-b border-blue-100 rounded-none h-auto p-0">
                {hasOptimization && (
                  <TabsTrigger 
                    value="optimization" 
                    className="flex-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    四级优化
                  </TabsTrigger>
                )}
                {hasCorrections && (
                  <TabsTrigger 
                    value="corrections" 
                    className="flex-1 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    语法纠错 ({corrections.corrections.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* 四级优化标签页 */}
              {hasOptimization && (
                <TabsContent value="optimization" className="p-4 space-y-4 tab-content-enter">
                  <div className="bg-white rounded-lg border border-blue-200 p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-800">优化对比</h4>
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
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* 语法纠错标签页 */}
              {hasCorrections && (
                <TabsContent value="corrections" className="p-4 space-y-4 tab-content-enter">
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
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationPanel;