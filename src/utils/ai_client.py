"""
统一HTTP客户端工具 - 减少重复的HTTP请求代码
"""

import requests
import json
import logging
import time
from typing import Dict, Any, Optional

from ..config.api_config import ApiConfig

logger = logging.getLogger(__name__)


class AIApiClient:
    """AI API统一客户端"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config

    def make_chat_request(
        self, 
        messages: list,
        system_prompt: str = None,
        max_tokens: int = 1000,
        temperature: float = 0.1,
        timeout: int = 15,
        max_retries: int = 3,
        retry_delay: int = 2
    ) -> Optional[str]:
        """
        统一的聊天API请求方法
        
        Args:
            messages: 消息列表
            system_prompt: 系统提示
            max_tokens: 最大token数
            temperature: 温度参数
            timeout: 超时时间
            max_retries: 最大重试次数
            retry_delay: 重试延迟
            
        Returns:
            API响应内容或None
        """
        headers = self.api_config.get_headers()
        
        # 构建消息列表
        request_messages = []
        if system_prompt:
            request_messages.append({
                "role": "system",
                "content": system_prompt
            })
        request_messages.extend(messages)
        
        payload = self.api_config.get_request_payload(
            request_messages,
            max_tokens=max_tokens,
            temperature=temperature
        )

        for attempt in range(max_retries):
            try:
                logger.debug(f"Making API request (attempt {attempt + 1}/{max_retries})")
                
                response = requests.post(
                    self.api_config.chat_completions_url,
                    headers=headers,
                    json=payload,
                    timeout=timeout
                )

                if response.status_code == 429:
                    logger.warning(f"Rate limit reached, retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    continue

                response.raise_for_status()
                
                # 检查响应内容
                if not response.text.strip():
                    logger.error("API response is empty")
                    continue

                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                
                logger.debug(f"API request successful, content length: {len(content)}")
                return content

            except requests.exceptions.RequestException as e:
                logger.error(f"API request failed (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    logger.error("All retry attempts failed")
                    raise

            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse API response: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    logger.error("All retry attempts failed")
                    raise

        return None

    def extract_json_from_response(self, content: str) -> Optional[Dict[str, Any]]:
        """
        从API响应中提取JSON
        
        Args:
            content: API响应内容
            
        Returns:
            解析后的JSON字典或None
        """
        import re
        
        # 首先尝试直接解析
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # 尝试从代码块中提取JSON
        json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
        if json_match:
            try:
                return json.loads(json_match.group(1).strip())
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from code block: {e}")
        
        # 尝试查找花括号包围的内容
        brace_match = re.search(r'\{[\s\S]*\}', content)
        if brace_match:
            try:
                return json.loads(brace_match.group(0))
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from braces: {e}")
        
        logger.warning(f"Could not extract JSON from response: {content}")
        return None