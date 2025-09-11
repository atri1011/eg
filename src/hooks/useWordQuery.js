import { useState, useCallback } from 'react';

export const useWordQuery = (config) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryWord = useCallback(async (word, context = '') => {
    if (!word || !word.trim()) {
      throw new Error('单词不能为空');
    }

    if (!config?.apiKey || !config?.apiBase) {
      throw new Error('请先在设置中配置API密钥和服务器地址');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/word-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.trim(),
          context: context.trim(),
          config: {
            apiBase: config.apiBase,
            apiKey: config.apiKey,
            model: config.customModel || config.model || 'gpt-3.5-turbo'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP错误: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || '查询失败');
      }

      return data.data;

    } catch (err) {
      const errorMessage = err.message || '网络错误，请检查网络连接';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    queryWord,
    isLoading,
    error,
    clearError,
  };
};