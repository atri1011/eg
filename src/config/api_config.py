"""
API配置管理 - 解决数据泥团问题
统一管理api_base, api_key, model三元组配置
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class ApiConfig:
    """API配置数据类，封装常用的API参数"""
    
    api_base: str
    api_key: str
    model: str
    
    def __post_init__(self):
        """初始化后验证配置"""
        if not self.api_base:
            raise ValueError("api_base不能为空")
        if not self.api_key:
            raise ValueError("api_key不能为空")
        if not self.model:
            raise ValueError("model不能为空")
            
        # 确保api_base格式正确
        if not self.api_base.startswith(('http://', 'https://')):
            raise ValueError("api_base必须以http://或https://开头")
    
    @property
    def chat_completions_url(self) -> str:
        """获取chat completions API端点URL"""
        return f"{self.api_base}/chat/completions"
    
    def get_headers(self, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """获取标准请求头"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers
    
    def get_request_payload(self, messages: list, **kwargs) -> Dict[str, Any]:
        """获取标准请求载荷"""
        payload = {
            "model": self.model,
            "messages": messages,
            **kwargs
        }
        return payload
    
    def validate(self) -> bool:
        """验证配置是否有效"""
        try:
            self.__post_init__()
            return True
        except ValueError as e:
            logger.error(f"API配置验证失败: {e}")
            return False
    
    def __str__(self) -> str:
        """安全的字符串表示（隐藏敏感信息）"""
        masked_key = f"{self.api_key[:8]}..." if len(self.api_key) > 8 else "***"
        return f"ApiConfig(api_base='{self.api_base}', model='{self.model}', api_key='{masked_key}')"


class ApiConfigFactory:
    """API配置工厂类，提供便捷的配置创建方法"""
    
    @staticmethod
    def from_dict(config_dict: Dict[str, str]) -> ApiConfig:
        """从字典创建API配置"""
        return ApiConfig(
            api_base=config_dict.get('api_base', ''),
            api_key=config_dict.get('api_key', ''),
            model=config_dict.get('model', '')
        )
    
    @staticmethod
    def from_env() -> ApiConfig:
        """从环境变量创建API配置"""
        import os
        
        # 按优先级获取环境变量
        api_base = (
            os.getenv('DEFAULT_API_BASE') or 
            os.getenv('API_BASE') or 
            ''
        )
        
        api_key = (
            os.getenv('DEFAULT_API_KEY') or 
            os.getenv('API_KEY') or 
            os.getenv('OPENAI_API_KEY') or 
            ''
        )
        
        model = (
            os.getenv('DEFAULT_MODEL') or 
            os.getenv('MODEL') or 
            'gpt-3.5-turbo'
        )
        
        return ApiConfig(
            api_base=api_base,
            api_key=api_key,
            model=model
        )
    
    @staticmethod
    def has_env_config() -> bool:
        """检查是否配置了有效的环境变量"""
        import os
        
        api_base = (
            os.getenv('DEFAULT_API_BASE') or 
            os.getenv('API_BASE') or 
            ''
        )
        
        api_key = (
            os.getenv('DEFAULT_API_KEY') or 
            os.getenv('API_KEY') or 
            os.getenv('OPENAI_API_KEY') or 
            ''
        )
        
        # 只要有api_base和api_key就认为有有效配置
        return bool(api_base and api_key)
    
    @staticmethod
    def get_env_config_safe() -> Optional['ApiConfig']:
        """安全地从环境变量获取配置，如果无效则返回None"""
        try:
            if ApiConfigFactory.has_env_config():
                return ApiConfigFactory.from_env()
        except ValueError:
            logger.warning("环境变量配置无效")
        return None
    
    @staticmethod
    def create_default() -> ApiConfig:
        """创建默认配置（仅用于开发/测试）"""
        return ApiConfig(
            api_base='https://api.openai.com/v1',
            api_key='test-key',
            model='gpt-3.5-turbo'
        )