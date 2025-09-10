import { useState, useEffect } from 'react';

export const useConfig = () => {
  const [config, setConfig] = useState({
    apiBase: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    customModel: '',
    languagePreference: 'bilingual'
  });
  const [availableModels, setAvailableModels] = useState([
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('aiEnglishConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const fetchModels = async () => {
    if (!config.apiKey || !config.apiBase) {
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch(`/api/models?apiKey=${encodeURIComponent(config.apiKey)}&apiBase=${encodeURIComponent(config.apiBase)}`);
      const data = await response.json();
      
      if (data.success && data.models) {
        setAvailableModels(data.models);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setIsLoadingModels(false);
    }
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
  };
};