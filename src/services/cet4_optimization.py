"""
CET4优化服务 - 重构后的简化版本
负责按照四级考试标准优化英文表达
"""

import requests
import logging
from typing import Optional, Dict

from ..config.api_config import ApiConfig
from .cet4_prompts import CET4PromptTemplates
from .cet4_analyzer import CET4Analyzer

logger = logging.getLogger(__name__)


class CET4Optimization:
    """CET4优化服务 - 负责按照四级考试标准优化英文表达"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config
        self.analyzer = CET4Analyzer(api_config)

    def optimize_for_cet4(self, text: str) -> Optional[Dict]:
        """
        根据四级考试写作评分标准优化用户输入文本
        评分要点：清晰表达、文字连贯、语言错误少、切合题意
        """
        headers = self.api_config.get_headers()
        system_prompt = CET4PromptTemplates.get_basic_optimization_prompt()

        payload = {
            "model": self.api_config.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1
        }

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            optimized_text = result["choices"][0]["message"]["content"].strip()

            # 检查是否有实际优化
            if optimized_text and optimized_text != text:
                return {
                    "original_sentence": text,
                    "optimized_sentence": optimized_text,
                    "optimization_type": "cet4_writing",
                    "explanation": "根据四级考试写作评分标准进行优化，提升清晰度、连贯性和准确性"
                }
            return None

        except Exception as e:
            print(f"[ERROR] 四级优化失败: {e}")
            return None

    def optimize_with_context(self, text: str, context_info: str) -> Optional[Dict]:
        """
        根据上下文进行CET4优化
        """
        optimized_text = self.analyzer.analyze_context_optimization(text, context_info)
        
        # 检查是否有实际优化
        if optimized_text and optimized_text != text:
            return {
                "original_sentence": text,
                "optimized_sentence": optimized_text,
                "optimization_type": "cet4_context_aware",
                "explanation": "根据对话上下文和四级考试写作评分标准进行优化，提升表达的自然度和语境适配性"
            }
        
        return None

    def get_detailed_analysis(self, text: str) -> Optional[Dict]:
        """
        获取详细的CET4分析结果
        """
        return self.analyzer.get_detailed_analysis(text)