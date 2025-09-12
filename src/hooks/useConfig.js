import { useState, useEffect } from 'react';

export const useConfig = () => {
  const [config, setConfig] = useState({
    apiBase: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    customModel: '',
    languagePreference: 'bilingual'
  });
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('aiEnglishConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      // 如果有API配置，自动获取模型列表
      if (parsedConfig.apiKey && parsedConfig.apiBase) {
        fetchModelsWithConfig(parsedConfig.apiKey, parsedConfig.apiBase);
      } else {
        // 如果没有配置，设置默认模型列表
        setDefaultModels(parsedConfig.apiBase);
      }
    } else {
      // 新用户，设置默认模型列表
      setDefaultModels('https://api.openai.com/v1');
    }
  }, []);

  const setDefaultModels = (apiBase = 'https://api.openai.com/v1') => {
    // 根据API Base URL设置默认模型列表
    const apiBaseLower = apiBase.toLowerCase();
    
    if (apiBaseLower.includes('anthropic.com')) {
      setAvailableModels([
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      ]);
    } else if (apiBaseLower.includes('bigmodel.cn') || apiBaseLower.includes('zhipuai')) {
      setAvailableModels([
        { id: 'glm-4-plus', name: 'GLM-4 Plus' },
        { id: 'glm-4', name: 'GLM-4' },
        { id: 'glm-4-air', name: 'GLM-4 Air' },
        { id: 'glm-4-flash', name: 'GLM-4 Flash' },
      ]);
    } else if (apiBaseLower.includes('moonshot.cn')) {
      setAvailableModels([
        { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K' },
        { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K' },
        { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K' },
      ]);
    } else if (apiBaseLower.includes('volcengine.com') || apiBaseLower.includes('doubao')) {
      setAvailableModels([
        { id: 'doubao-pro-32k', name: '豆包 Pro 32K' },
        { id: 'doubao-pro-128k', name: '豆包 Pro 128K' },
        { id: 'doubao-lite-32k', name: '豆包 Lite 32K' },
      ]);
    } else if (apiBaseLower.includes('deepseek')) {
      setAvailableModels([
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
        { id: 'deepseek-coder', name: 'DeepSeek Coder' },
        { id: 'deepseek-v3', name: 'DeepSeek V3' },
      ]);
    } else {
      // 默认OpenAI模型
      setAvailableModels([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      ]);
    }
  };

  const fetchModelsWithConfig = async (apiKey, apiBase) => {
    setIsLoadingModels(true);
    try {
      const response = await fetch(`/api/models?apiKey=${encodeURIComponent(apiKey)}&apiBase=${encodeURIComponent(apiBase)}`);
      const data = await response.json();
      
      if (data.success && data.models && data.models.length > 0) {
        setAvailableModels(data.models);
      } else {
        // 如果API调用失败，使用默认模型列表
        setDefaultModels(apiBase);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 网络错误时使用默认模型列表
      setDefaultModels(apiBase);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const fetchModels = async () => {
    if (!config.apiKey || !config.apiBase) {
      return;
    }

    await fetchModelsWithConfig(config.apiKey, config.apiBase);
  };

  const saveConfig = () => {
    localStorage.setItem('aiEnglishConfig', JSON.stringify(config));
    if (config.apiKey && config.apiBase) {
      fetchModels();
    }
  };

  return {
    config,
    setConfig,
    saveConfig,
    availableModels,
    isLoadingModels,
    fetchModels,
    setDefaultModels,
  };
};