"""
CET4优化分析器 - 专门处理详细分析功能
"""

import requests
import json
import re
import logging
from typing import Optional, Dict

from ..config.api_config import ApiConfig
from .cet4_prompts import CET4PromptTemplates

logger = logging.getLogger(__name__)


class CET4Analyzer:
    """CET4优化分析器 - 负责详细的四级写作分析"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config

    def get_detailed_analysis(self, text: str) -> Optional[Dict]:
        """
        提供详细的四级优化分析，包括评分细则和改进建议
        返回结构化的优化结果，包含评分分析
        """
        print(f"[DEBUG] 开始四级详细分析，文本: {text}")

        headers = self.api_config.get_headers()
        system_prompt = CET4PromptTemplates.get_detailed_analysis_prompt()

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
            "max_tokens": 2000,
            "temperature": 0.1
        }

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=40)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 四级详细分析原始响应: {content}")

            # 提取并解析JSON
            json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
            if json_match:
                json_str = json_match.group(1).strip()
                try:
                    analysis_data = json.loads(json_str)
                    print(f"[DEBUG] 四级详细分析结果: {analysis_data}")
                    return analysis_data
                except json.JSONDecodeError as e:
                    print(f"[ERROR] JSON解析失败: {e}")
                    return None
            else:
                # 如果没有JSON格式，尝试直接解析
                try:
                    analysis_data = json.loads(content)
                    return analysis_data
                except json.JSONDecodeError:
                    print(f"[ERROR] 无法从响应中提取有效JSON: {content}")
                    return None

        except Exception as e:
            print(f"[ERROR] 四级详细分析失败: {e}")
            return None

    def analyze_context_optimization(self, text: str, context_info: str) -> Optional[str]:
        """
        根据上下文进行CET4优化分析
        """
        print(f"[DEBUG] 开始上下文CET4优化，文本: {text}")

        headers = self.api_config.get_headers()

        context_prompt = f"""
**对话上下文信息:**
{context_info}
"""

        system_prompt = CET4PromptTemplates.get_context_aware_prompt()
        full_prompt = system_prompt + context_prompt

        payload = {
            "model": self.api_config.model,
            "messages": [
                {
                    "role": "system", 
                    "content": full_prompt
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
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            optimized = result["choices"][0]["message"]["content"].strip()
            return optimized

        except Exception as e:
            print(f"[ERROR] 上下文CET4优化失败: {e}")
            return text