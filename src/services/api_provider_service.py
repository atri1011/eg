import requests
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class ApiProviderService:
    """API提供商检测和模型管理服务"""
    
    @staticmethod
    def detect_api_provider(api_base: str) -> str:
        """根据API Base URL检测API提供商类型"""
        if not api_base:
            return 'openai'
        
        api_base_lower = api_base.lower()
        
        # OpenAI官方或兼容的API
        if 'openai.com' in api_base_lower or 'api.openai.com' in api_base_lower:
            return 'openai'
        
        # Anthropic Claude
        elif 'anthropic.com' in api_base_lower:
            return 'anthropic'
        
        # 智谱AI
        elif 'bigmodel.cn' in api_base_lower or 'zhipuai' in api_base_lower:
            return 'zhipu'
        
        # 月之暗面 Kimi
        elif 'moonshot.cn' in api_base_lower:
            return 'moonshot'
        
        # 豆包/字节跳动
        elif 'volcengine.com' in api_base_lower or 'doubao' in api_base_lower:
            return 'doubao'
        
        # DeepSeek
        elif 'deepseek' in api_base_lower:
            return 'deepseek'
        
        # Azure OpenAI
        elif 'azure' in api_base_lower and 'openai' in api_base_lower:
            return 'azure_openai'
        
        # 默认尝试OpenAI兼容格式
        else:
            return 'openai_compatible'

    @staticmethod
    def get_default_models_for_provider(provider: str) -> List[Dict[str, str]]:
        """根据提供商返回默认模型列表"""
        model_configs = {
            'anthropic': [
                {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet'},
                {'id': 'claude-3-5-haiku-20241022', 'name': 'Claude 3.5 Haiku'},
                {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus'},
            ],
            'zhipu': [
                {'id': 'glm-4-plus', 'name': 'GLM-4 Plus'},
                {'id': 'glm-4', 'name': 'GLM-4'},
                {'id': 'glm-4-air', 'name': 'GLM-4 Air'},
                {'id': 'glm-4-flash', 'name': 'GLM-4 Flash'},
            ],
            'moonshot': [
                {'id': 'moonshot-v1-8k', 'name': 'Moonshot V1 8K'},
                {'id': 'moonshot-v1-32k', 'name': 'Moonshot V1 32K'},
                {'id': 'moonshot-v1-128k', 'name': 'Moonshot V1 128K'},
            ],
            'doubao': [
                {'id': 'doubao-pro-32k', 'name': '豆包 Pro 32K'},
                {'id': 'doubao-pro-128k', 'name': '豆包 Pro 128K'},
                {'id': 'doubao-lite-32k', 'name': '豆包 Lite 32K'},
            ],
            'deepseek': [
                {'id': 'deepseek-chat', 'name': 'DeepSeek Chat'},
                {'id': 'deepseek-coder', 'name': 'DeepSeek Coder'},
                {'id': 'deepseek-v3', 'name': 'DeepSeek V3'},
            ]
        }
        
        return model_configs.get(provider, [
            {'id': 'gpt-4', 'name': 'GPT-4'},
            {'id': 'gpt-4-turbo', 'name': 'GPT-4 Turbo'},
            {'id': 'gpt-4o', 'name': 'GPT-4o'},
            {'id': 'gpt-4o-mini', 'name': 'GPT-4o Mini'},
            {'id': 'gpt-3.5-turbo', 'name': 'GPT-3.5 Turbo'},
        ])

    @staticmethod
    def try_fetch_models_from_api(api_base: str, api_key: str, provider: str) -> Optional[List[Dict[str, str]]]:
        """尝试从API获取模型列表"""
        try:
            # 根据提供商构建正确的URL和headers
            if provider == 'anthropic':
                if not api_base.endswith('/'):
                    api_base += '/'
                models_url = api_base + 'v1/models'
                headers = {
                    'x-api-key': api_key,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            else:
                # OpenAI兼容格式
                if not api_base.endswith('/'):
                    api_base += '/'
                if api_base.endswith('/v1/'):
                    models_url = api_base + 'models'
                elif api_base.endswith('/'):
                    models_url = api_base + 'v1/models'
                else:
                    models_url = api_base + '/v1/models'
                
                headers = {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
            
            response = requests.get(models_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            models = []
            
            # 处理响应格式
            if 'data' in data and isinstance(data['data'], list):
                for model in data['data']:
                    model_id = model.get('id', '')
                    model_name = model.get('display_name') or model.get('name') or model_id
                    
                    # 过滤掉一些不常用的模型
                    if not any(skip in model_id.lower() for skip in ['whisper', 'tts', 'dall-e', 'embedding', 'moderation']):
                        models.append({
                            'id': model_id,
                            'name': model_name
                        })
            
            return models
            
        except Exception as e:
            logger.warning(f"Failed to fetch models from API ({provider}): {str(e)}")
            return None

    @classmethod
    def get_models(cls, api_base: str, api_key: str) -> Dict:
        """获取模型列表的主方法"""
        # 检测API提供商类型
        provider = cls.detect_api_provider(api_base)
        logger.info(f"Detected API provider: {provider} for base URL: {api_base}")

        # 首先尝试从API获取模型列表
        models = cls.try_fetch_models_from_api(api_base, api_key, provider)
        
        # 如果API调用失败，使用默认模型列表
        if models is None or len(models) == 0:
            logger.info(f"Using default models for provider: {provider}")
            models = cls.get_default_models_for_provider(provider)
        
        # 确保至少有一个模型
        if not models:
            models = [{"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"}]
        
        return {
            "success": True, 
            "models": models,
            "provider": provider
        }