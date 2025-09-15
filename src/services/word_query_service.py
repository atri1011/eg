"""
词汇查询服务 - 专门处理单词查询和句子分析
"""

import os
import requests
import json
import logging
from typing import Optional, Dict, List

from ..config.api_config import ApiConfig

logger = logging.getLogger(__name__)


class WordQueryPrompts:
    """词汇查询相关的提示模板"""

    @staticmethod
    def build_sentence_analysis_prompt(sentence: str, context: str, selected_vocab: List[str]) -> str:
        """构建句子解析的系统提示"""
        vocab_list = "、".join(selected_vocab)

        return f"""你是一个专业的英语教学助手。用户提供了一个英文句子，并选择了其中不认识的生词。

句子："{sentence}"
上下文："{context}"
用户不认识的生词：{vocab_list}

请提供详细的句子解析，包括以下内容：

1. 句子的中文翻译
2. 详细的语法解释（包括句子结构、语法知识点等）
3. 每个生词的详细释义（包括音标、词性、释义、在句子中的具体含义）
4. 2-3个使用了相似语法结构或生词的例句

请以JSON格式返回，格式如下：
{{
  "translation": "句子的完整中文翻译",
  "grammar": "详细的语法解释，包括句子结构分析、语法点说明等",
  "vocabulary": [
    {{
      "word": "生词",
      "phonetic": "音标",
      "part_of_speech": "词性",
      "definition": "基本释义",
      "meaning_in_context": "在句子中的具体含义",
      "synonyms": ["同义词1", "同义词2"]
    }}
  ],
  "examples": [
    {{
      "sentence": "例句",
      "translation": "例句翻译",
      "focus": "重点说明"
    }}
  ],
  "learning_tips": "学习建议和记忆方法"
}}

请确保返回有效的JSON格式，不要添加任何额外的文本或解释。"""

    @staticmethod
    def build_word_query_prompt(word: str, context: str) -> str:
        """构建单词查询的系统提示"""
        return f"""你是一个专业的英语教学助手。用户询问了一个英文单词的含义。

单词："{word}"
上下文："{context}"

请提供该单词的详细释义，包括以下内容：

1. 音标
2. 词性
3. 基本释义（中文）
4. 在给定上下文中的具体含义
5. 常见用法和搭配
6. 3-5个例句（带中文翻译）
7. 同义词和反义词
8. 词根词缀分析（如适用）

请以JSON格式返回，格式如下：
{{
  "word": "{word}",
  "phonetic": "音标",
  "part_of_speech": "词性",
  "basic_definition": "基本释义",
  "context_meaning": "在上下文中的含义",
  "usage_notes": "用法说明和常见搭配",
  "examples": [
    {{
      "sentence": "例句",
      "translation": "中文翻译"
    }}
  ],
  "synonyms": ["同义词1", "同义词2"],
  "antonyms": ["反义词1", "反义词2"],
  "etymology": "词根词缀分析（如适用）",
  "difficulty_level": "难度等级（初级/中级/高级）",
  "memory_tips": "记忆技巧"
}}

请确保返回有效的JSON格式，不要添加任何额外的文本或解释。"""


class WordQueryService:
    """词汇查询服务"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config

    def query_with_ai(self, text: str, context: str, query_type: str = 'word-query', selected_vocab: Optional[List[str]] = None) -> Optional[Dict]:
        """使用AI进行词汇查询"""
        try:
            if query_type == 'sentence-analysis' and selected_vocab:
                system_prompt = WordQueryPrompts.build_sentence_analysis_prompt(text, context, selected_vocab)
            else:
                system_prompt = WordQueryPrompts.build_word_query_prompt(text, context)

            headers = self.api_config.get_headers()
            payload = self.api_config.get_request_payload([
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": f"请分析: {text}"
                }
            ], max_tokens=2000, temperature=0.1)

            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            
            # 尝试解析JSON响应
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # 如果不是有效JSON，尝试提取JSON代码块
                import re
                json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
                if json_match:
                    return json.loads(json_match.group(1).strip())
                else:
                    logger.warning(f"无法解析AI响应为JSON: {content}")
                    return {"error": "AI响应格式错误", "raw_response": content}

        except Exception as e:
            logger.error(f"词汇查询失败: {e}")
            return {"error": str(e)}

    def query_word_with_ai(self, word: str, context: str) -> Optional[Dict]:
        """查询单个单词"""
        return self.query_with_ai(word, context, 'word-query')