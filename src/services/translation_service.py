import requests
import json
import re
import time
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class TranslationService:
    """翻译和语法纠错服务"""

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

    def get_detailed_corrections(self, text: str) -> Optional[Dict]:
        """
        分析用户输入的翻译和语法错误，
        返回详细的修正说明。
        """
        print(f"[DEBUG] 开始详细语法检查和翻译，文本: {text}")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        system_prompt = """你是一位顶级的英语语法和翻译专家。你的任务是精确分析用户提供的句子，并始终返回一个结构化、详细的JSON对象。

**JSON结构要求:**
1.  `original_sentence`: 用户输入的原始句子。
2.  `corrected_sentence`: 修正后的最终英文句子。
3.  `overall_comment`: (可选) 一句中文总结，对句子进行总体评价或给予鼓励。
4.  `corrections`: 一个包含所有修改项的列表。

**`corrections` 列表的详细规则:**
*   每个修改项都是一个包含 `type`, `original`, `corrected`, `explanation` 的对象。
*   `type` 必须是 "translation" (翻译), "grammar" (语法), 或 "spelling" (拼写) 之一。
*   `explanation` 必须是详细且易于理解的中文解释。例如，解释为什么某个语法是错误的，并提供正确的用法。

**重要指令:**
*   **必须返回JSON:** 无论输入如何，都必须返回一个符合上述结构的有效JSON对象。
*   **宽容度要求**: 在进行语法分析时，请适当放宽标准。忽略单纯的大小写错误（例如，句子开头的'i'应视为'I'）和常见的标点符号遗漏（例如，句末的句号）。除非这些问题严重影响句子理解，否则不应将其标记为错误。
*   **无错误处理:** 如果句子在宽容标准下被视为正确，`corrected_sentence` 应与 `original_sentence` 相同，`corrections` 列表必须为空 `[]`，并可以提供一句鼓励性的 `overall_comment`。
*   **严禁额外文本:** 绝对不要在JSON对象之外返回任何文本、注释或解释。

**示例:**
输入: "i has a 苹果, i like it vary much."
返回:
```json
{
  "original_sentence": "i has a 苹果, i like it vary much.",
  "corrected_sentence": "I have an apple, I like it very much.",
  "overall_comment": "句子结构基本正确，注意主谓一致和单词拼写。",
  "corrections": [
    { "type": "translation", "original": "苹果", "corrected": "apple", "explanation": "将中文单词 '苹果' 翻译为对应的英文 'apple'。" },
    { "type": "grammar", "original": "i has", "corrected": "I have", "explanation": "当主语是第一人称 'I' 时，动词应使用原形 'have'，而不是第三人称单数形式 'has'。" },
    { "type": "grammar", "original": "a apple", "corrected": "an apple", "explanation": "当单词以元音开头时（如 'apple'），不定冠词应使用 'an'。" },
    { "type": "spelling", "original": "vary", "corrected": "very", "explanation": "单词 'vary' (变化) 拼写错误，应为 'very' (非常)。" }
  ]
}
```"""

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
            "max_tokens": 1000000,
            "temperature": 0.1
        }

        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                print(
                    f"[DEBUG] 发送详细修正请求到: {self.chat_completions_url} (尝试 {attempt + 1})")
                response = requests.post(
                    self.chat_completions_url, headers=headers, json=payload, timeout=20)

                if response.status_code == 429:
                    print(f"[WARN] 收到 429 速率限制错误。将在 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    continue

                print(f"[DEBUG] 详细修正API响应状态码: {response.status_code}")
                response.raise_for_status()

                # 检查响应内容是否为空
                if not response.text.strip():
                    print("[ERROR] API响应内容为空")
                    raise Exception("API响应内容为空")

                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                print(f"[DEBUG] 详细修正原始响应: {content}")

                # 使用正则表达式从响应中提取JSON
                json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)

                if not json_match:
                    print(f"[DEBUG] AI响应中未找到有效的JSON代码块。响应内容: '{content}'")
                    # 如果没有找到JSON，那么可能AI认为这句话不需要修正
                    return None

                json_str = json_match.group(1).strip()

                try:
                    # 解析提取出的JSON字符串
                    correction_data = json.loads(json_str)
                except json.JSONDecodeError as e:
                    print(f"[ERROR] 从提取的字符串中解析JSON失败: {e}")
                    print(f"[ERROR] 无法解析的JSON字符串: '{json_str}'")
                    raise Exception(f"JSON解析错误: {json_str}")

                if "original_sentence" in correction_data and "corrected_sentence" in correction_data and "corrections" in correction_data:
                    original = correction_data.get("original_sentence")
                    corrected = correction_data.get("corrected_sentence")
                    has_no_corrections = not correction_data.get("corrections")

                    if has_no_corrections and original == corrected:
                        print("[DEBUG] AI返回无错误且句子无变化")
                        return None

                    print(f"[DEBUG] 解析后的详细修正数据: {correction_data}")
                    return correction_data
                else:
                    print("[DEBUG] AI返回的JSON结构不符合预期")
                    raise Exception("AI返回的JSON结构不符合预期")

            except json.JSONDecodeError as e:
                print(f"[ERROR] JSON解析错误: {e}")
                print(f"[ERROR] 无法解析的原始AI响应内容: '{content}'")
                raise Exception(f"JSON解析错误: {content}")
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] 详细修正API请求失败: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    raise Exception(f"详细修正API请求失败: {e}")
            except Exception as e:
                print(f"[ERROR] 详细修正发生未知错误: {e}")
                raise Exception(f"详细修正发生未知错误: {e}")

        print("[ERROR] 所有重试尝试均失败")
        raise Exception("所有重试尝试均失败")

    def process_user_input(self, user_message: str) -> tuple[str, Optional[Dict]]:
        """
        处理用户输入，返回处理后的消息和纠错结果
        返回: (处理后的消息, 纠错结果)
        """
        grammar_correction_result = None
        message_for_ai = user_message

        try:
            # 1. 首先检测输入语言类型
            print(f"[DEBUG] 检测输入语言: {user_message}")
            if self.is_chinese_text(user_message):
                print(f"[DEBUG] 检测到纯中文输入，进行翻译")
                # 纯中文输入：直接翻译
                translation_result = self.get_translation_from_chinese(
                    user_message)
                if translation_result:
                    grammar_correction_result = translation_result
                    message_for_ai = translation_result.get(
                        "corrected_sentence", user_message)
                    print(f"[DEBUG] 中文翻译完成，用于AI对话的消息: {message_for_ai}")
            else:
                print(f"[DEBUG] 检测到英文或中英混合输入，进行语法纠错")
                # 英文或中英混合输入：进行语法纠错和翻译
                detailed_corrections = self.get_detailed_corrections(
                    user_message)
                if detailed_corrections:
                    grammar_correction_result = detailed_corrections
                    message_for_ai = detailed_corrections.get(
                        "corrected_sentence", user_message)
                    print(f"[DEBUG] 语法纠错完成，用于AI对话的消息: {message_for_ai}")

            return message_for_ai, grammar_correction_result

        except Exception as e:
            print(f"[ERROR] 处理用户输入失败: {e}")
            return user_message, None
