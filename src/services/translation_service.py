"""
兼容性封装 - 保持原有接口不变
已重构为模块化架构，详见：
- translation_core.py: 核心翻译功能
- grammar_correction.py: 语法纠错功能  
- cet4_optimization.py: CET4优化功能
- translation_client.py: 统一客户端
"""

import logging
from typing import Optional, Dict, Tuple, List
from .translation_client import TranslationClient

logger = logging.getLogger(__name__)


class TranslationService:
    """
    翻译和语法纠错服务 - 兼容性封装
    内部使用模块化架构，保持对外接口不变
    """

    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base
        self.api_key = api_key
        self.model = model
        self.chat_completions_url = f"{api_base}/chat/completions"
        
        # 使用新的模块化客户端
        self._client = TranslationClient(api_base, api_key, model)

    def is_chinese_text(self, text: str) -> bool:
        """检测文本是否主要是中文"""
        return self._client.is_chinese_text(text)

    def get_translation_from_chinese(self, chinese_text: str) -> Optional[Dict]:
        """将中文翻译成英文"""
        return self._client.translation_core.get_translation_from_chinese(chinese_text)

    def get_detailed_corrections(self, text: str) -> Optional[Dict]:
        """
        分析用户输入的翻译和语法错误，
        返回详细的修正说明。
        """
        return self._client.get_detailed_corrections(text)

    def optimize_for_cet4(self, text: str) -> Optional[Dict]:
        """
        根据四级考试写作评分标准优化用户输入文本
        评分要点：清晰表达、文字连贯、语言错误少、切合题意
        """
        return self._client.cet4_optimization.optimize_for_cet4(text)

    def optimize_for_cet4_detailed(self, text: str) -> Optional[Dict]:
        """
        提供详细的四级优化分析，包括评分细则和改进建议
        返回结构化的优化结果，包含评分分析
        """
        return self._client.get_cet4_detailed_analysis(text)

    def process_user_input_parallel(self, user_message: str) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        并行处理用户输入：同时进行翻译/纠错和优化
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        return self._client.process_user_input_parallel(user_message)

    def process_user_input_with_context(self, user_message: str, conversation_history: List[Dict] = None) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        处理用户输入，带上下文感知的优化
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        return self._client.process_user_input_with_context(user_message, conversation_history)

    def process_user_input(self, user_message: str, conversation_history: List[Dict] = None) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        处理用户输入 - 新版本支持上下文感知
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        return self._client.process_user_input(user_message, conversation_history)

    def _build_context_info(self, conversation_history: List[Dict] = None) -> str:
        """
        构建对话上下文信息字符串
        """
        return self._client._build_context_info(conversation_history)

    def _make_request_sync(self, payload: Dict, request_type: str) -> Optional[Dict]:
        """同步执行单个请求的通用方法 - 已废弃，仅保持兼容性"""
        logger.warning("_make_request_sync 方法已废弃，请使用新的模块化接口")
        # 这个方法在新架构中不再需要，但保留以维持兼容性
        return None