import requests
import json
import re
import time
import logging
from typing import Optional, Dict

from ..config.api_config import ApiConfig

logger = logging.getLogger(__name__)


class GrammarCorrection:
    """语法纠错服务 - 负责英文语法检查和纠错"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config

    def get_detailed_corrections(self, text: str) -> Optional[Dict]:
        """
        分析用户输入的翻译和语法错误，
        返回详细的修正说明。
        """
        print(f"[DEBUG] 开始详细语法检查和翻译，文本: {text}")

        headers = self.api_config.get_headers()

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

        payload = self.api_config.get_request_payload([
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": text
                }
        ], max_tokens=1000000, temperature=0.1)

        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                print(
                    f"[DEBUG] 发送详细修正请求到: {self.api_config.chat_completions_url} (尝试 {attempt + 1})")
                response = requests.post(
                    self.api_config.chat_completions_url, headers=headers, json=payload, timeout=40)

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

    def get_context_aware_corrections(self, text: str, context_info: str) -> Optional[Dict]:
        """
        根据上下文进行语法纠错
        """
        print(f"[DEBUG] 开始上下文感知语法检查，文本: {text}")

        headers = self.api_config.get_headers()

        system_prompt = f"""你是一位顶级的英语语法和翻译专家。你的任务是根据对话上下文，精确分析用户提供的句子，并返回结构化的JSON对象。

**对话上下文信息:**
{context_info}

**JSON结构要求:**
1.  `original_sentence`: 用户输入的原始句子。
2.  `corrected_sentence`: 修正后的最终英文句子。
3.  `overall_comment`: (可选) 一句中文总结，对句子进行总体评价或给予鼓励。
4.  `corrections`: 一个包含所有修改项的列表。

**`corrections` 列表的详细规则:**
*   每个修改项都是一个包含 `type`, `original`, `corrected`, `explanation` 的对象。
*   `type` 必须是 "translation" (翻译), "grammar" (语法), "spelling" (拼写), 或 "context" (上下文优化) 之一。
*   `explanation` 必须是详细且易于理解的中文解释，特别是上下文相关的改进。

**上下文感知优化要点:**
* 根据对话主题调整词汇选择和表达方式
* 确保句子风格与对话语境一致
* 考虑对话的正式程度和语气
* 注意与前面对话内容的逻辑连贯性

**重要指令:**
*   **必须返回JSON:** 无论输入如何，都必须返回一个符合上述结构的有效JSON对象。
*   **上下文优化**: 优先考虑句子在当前对话语境下的适合性。
*   **无错误处理:** 如果句子在上下文中被视为合适，`corrected_sentence` 应与 `original_sentence` 相同，`corrections` 列表必须为空 `[]`。
*   **严禁额外文本:** 绝对不要在JSON对象之外返回任何文本、注释或解释。"""

        payload = self.api_config.get_request_payload([
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": text
                }
        ], max_tokens=1000000, temperature=0.1)

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=40)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()

            # 解析JSON结果
            json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
            if json_match:
                json_str = json_match.group(1).strip()
                return json.loads(json_str)
            return None

        except Exception as e:
            print(f"[ERROR] 上下文感知语法纠错失败: {e}")
            return None