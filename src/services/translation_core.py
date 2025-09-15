import requests
import re
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class TranslationCore:
    """核心翻译服务 - 负责基础的中英文互译功能"""

    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base
        self.api_key = api_key
        self.model = model
        self.chat_completions_url = f"{api_base}/chat/completions"

    @staticmethod
    def is_chinese_text(text: str) -> bool:
        """检测文本是否主要是中文"""
        # 移除标点符号和空格
        cleaned_text = re.sub(r'[^\w\s]', '', text)
        if not cleaned_text:
            return False

        # 统计中文字符数量
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', cleaned_text))
        # 统计英文字符数量
        english_chars = len(re.findall(r'[a-zA-Z]', cleaned_text))

        # 如果中文字符占大多数，判定为中文文本
        return chinese_chars > english_chars

    def get_translation_from_chinese(self, chinese_text: str) -> Optional[Dict]:
        """将中文翻译成英文"""
        print(f"[DEBUG] 开始中文翻译，文本: {chinese_text}")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        system_prompt = """你是一位专业的中英翻译专家。请将用户提供的中文句子翻译成地道的英文。

**翻译要求:**
1. 保持原意准确
2. 翻译要自然流畅，符合英语表达习惯
3. 只返回翻译后的英文句子，不要包含任何解释或其他内容

**重要指令:**
* 只返回翻译结果，不要添加任何解释或额外内容
* 不要使用引号或其他标记包裹翻译结果
* 确保翻译的准确性和自然度"""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": chinese_text
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1
        }

        try:
            response = requests.post(
                self.chat_completions_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            translation = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 翻译结果: {translation}")

            # 如果翻译结果与原文不同，返回翻译数据
            if translation and translation != chinese_text:
                return {
                    "original_sentence": chinese_text,
                    "corrected_sentence": translation,
                    "overall_comment": "中文翻译成功",
                    "corrections": [
                        {
                            "type": "translation",
                            "original": chinese_text,
                            "corrected": translation,
                            "explanation": f"将中文句子 '{chinese_text}' 翻译成英文"
                        }
                    ]
                }
            return None
        except Exception as e:
            print(f"[ERROR] 中文翻译失败: {e}")
            return None

    def translate_with_context(self, text: str, context_info: str = None) -> str:
        """根据上下文进行翻译优化"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        context_prompt = f"""
**对话上下文信息:**
{context_info or "当前是对话开始，没有历史上下文。"}
""" if context_info else ""

        system_prompt = f"""你是一位专业的中英翻译专家。请将用户提供的中文句子翻译成地道的英文。

{context_prompt}

**翻译要求:**
1. 保持原意准确
2. 翻译要自然流畅，符合英语表达习惯
3. 根据对话上下文选择最合适的表达方式
4. 只返回翻译后的英文句子，不要包含任何解释或其他内容

**重要指令:**
* 只返回翻译结果，不要添加任何解释或额外内容
* 不要使用引号或其他标记包裹翻译结果
* 确保翻译在当前语境下自然且准确"""

        payload = {
            "model": self.model,
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
                self.chat_completions_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            translation = result["choices"][0]["message"]["content"].strip()
            return translation
        except Exception as e:
            print(f"[ERROR] 上下文翻译失败: {e}")
            return text