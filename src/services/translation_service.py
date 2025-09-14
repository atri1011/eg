import requests
import json
import re
import time
import logging
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional, Dict, Tuple

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

    def optimize_for_cet4(self, text: str) -> Optional[Dict]:
        """
        优化用户输入文本，使其更适合四级水平
        处理中英混合输入，将其转换为四级水平的英文句子
        """
        print(f"[DEBUG] 开始四级优化，文本: {text}")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        system_prompt = """你是一位专业的英语四级考试写作指导老师。你的任务是将用户输入的句子优化为更符合英语四级水平的表达。

**优化任务:**
1. 将中英混合的句子转换为纯英文句子
2. 将中文词汇替换为合适的四级水平英文单词
3. 调整句式结构，使其符合四级写作要求
4. 确保语法正确、表达自然

**优化标准:**
- 使用四级词汇范围内的单词
- 句式不要过于复杂，但要符合英语表达习惯
- 保持原句的核心意思
- 语法结构清晰正确

**返回格式:**
只返回优化后的英文句子，不要包含任何解释或其他内容。

**示例:**
输入: "i want to buy a 电脑 for study"
输出: "I want to buy a computer for studying."

输入: "这个problem很difficult"  
输出: "This problem is very difficult."

**重要指令:**
* 只返回优化后的句子，不要添加引号或其他标记
* 确保句子符合四级英语水平
* 保持句子的完整性和自然度"""

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
            "temperature": 0.2
        }

        try:
            response = requests.post(
                self.chat_completions_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            optimized_text = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 四级优化结果: {optimized_text}")

            # 如果有优化结果，返回优化数据
            if optimized_text:
                # 对比原文，如果确实不同才返回
                if optimized_text.strip().lower() != text.strip().lower():
                    return {
                        "original_sentence": text,
                        "optimized_sentence": optimized_text,
                        "optimization_type": "cet4_level"
                    }
                else:
                    print(f"[DEBUG] 优化结果与原文相同，不返回优化数据")
            return None
        except Exception as e:
            print(f"[ERROR] 四级优化失败: {e}")
            return None

    def _make_request_sync(self, payload: Dict, request_type: str) -> Optional[Dict]:
        """同步执行单个请求的通用方法"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            print(f"[DEBUG] 开始 {request_type} 请求")
            response = requests.post(
                self.chat_completions_url, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] {request_type} 请求完成，结果: {content[:100]}...")
            return {"content": content, "type": request_type}
        except Exception as e:
            print(f"[ERROR] {request_type} 请求失败: {e}")
            return None

    def process_user_input_parallel(self, user_message: str) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        并行处理用户输入：同时进行翻译/纠错和优化
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        print(f"[DEBUG] 开始并行处理用户输入: {user_message}")
        
        grammar_correction_result = None
        optimization_result = None
        message_for_ai = user_message
        
        # 准备并行请求
        requests_to_make = []
        
        # 1. 检测语言类型并准备相应的请求
        if self.is_chinese_text(user_message):
            print(f"[DEBUG] 检测到纯中文输入，准备翻译请求")
            # 中文翻译请求
            translation_payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": """你是一位专业的中英翻译专家。请将用户提供的中文句子翻译成地道的英文。

**翻译要求:**
1. 保持原意准确
2. 翻译要自然流畅，符合英语表达习惯
3. 只返回翻译后的英文句子，不要包含任何解释或其他内容

**重要指令:**
* 只返回翻译结果，不要添加任何解释或额外内容
* 不要使用引号或其他标记包裹翻译结果
* 确保翻译的准确性和自然度"""
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.1
            }
            requests_to_make.append(("translation", translation_payload))
        else:
            print(f"[DEBUG] 检测到英文或中英混合输入，准备语法纠错请求")
            # 语法纠错请求
            grammar_payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": """你是一位顶级的英语语法和翻译专家。你的任务是精确分析用户提供的句子，并始终返回一个结构化、详细的JSON对象。

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
*   **严禁额外文本:** 绝对不要在JSON对象之外返回任何文本、注释或解释。"""
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "max_tokens": 1000000,
                "temperature": 0.1
            }
            requests_to_make.append(("grammar", grammar_payload))
        
        # 2. 四级优化请求（总是执行）
        optimization_payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": """你是一位专业的英语四级考试写作指导老师。你的任务是将用户输入的句子优化为更符合英语四级水平的表达。

**优化任务:**
1. 将中英混合的句子转换为纯英文句子
2. 将中文词汇替换为合适的四级水平英文单词
3. 调整句式结构，使其符合四级写作要求
4. 确保语法正确、表达自然

**优化标准:**
- 使用四级词汇范围内的单词
- 句式不要过于复杂，但要符合英语表达习惯
- 保持原句的核心意思
- 语法结构清晰正确

**返回格式:**
只返回优化后的英文句子，不要包含任何解释或其他内容。

**示例:**
输入: "i want to buy a 电脑 for study"
输出: "I want to buy a computer for studying."

输入: "这个problem很difficult"  
输出: "This problem is very difficult."

**重要指令:**
* 只返回优化后的句子，不要添加引号或其他标记
* 确保句子符合四级英语水平
* 保持句子的完整性和自然度"""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.2
        }
        requests_to_make.append(("optimization", optimization_payload))
        
        # 3. 使用线程池并行执行请求
        results = {}
        try:
            with ThreadPoolExecutor(max_workers=3) as executor:
                # 提交所有任务
                future_to_type = {
                    executor.submit(self._make_request_sync, payload, req_type): req_type 
                    for req_type, payload in requests_to_make
                }
                
                # 等待所有任务完成
                for future in as_completed(future_to_type):
                    req_type = future_to_type[future]
                    try:
                        result = future.result()
                        if result:
                            results[req_type] = result
                    except Exception as e:
                        print(f"[ERROR] {req_type} 请求异常: {e}")
            
            print(f"[DEBUG] 并行请求完成，收到 {len(results)} 个结果")
            
            # 4. 处理结果
            # 处理翻译/语法纠错结果
            if "translation" in results:
                translation_content = results["translation"]["content"]
                if translation_content and translation_content != user_message:
                    grammar_correction_result = {
                        "original_sentence": user_message,
                        "corrected_sentence": translation_content,
                        "overall_comment": "中文翻译成功",
                        "corrections": [
                            {
                                "type": "translation",
                                "original": user_message,
                                "corrected": translation_content,
                                "explanation": f"将中文句子 '{user_message}' 翻译成英文"
                            }
                        ]
                    }
                    message_for_ai = translation_content
                    
            elif "grammar" in results:
                grammar_content = results["grammar"]["content"]
                # 解析语法纠错的JSON结果
                try:
                    json_match = re.search(r"```json\s*([\s\S]*?)\s*```", grammar_content)
                    if json_match:
                        json_str = json_match.group(1).strip()
                        grammar_correction_result = json.loads(json_str)
                        if grammar_correction_result and grammar_correction_result.get("corrected_sentence"):
                            corrected = grammar_correction_result.get("corrected_sentence")
                            original = grammar_correction_result.get("original_sentence")
                            # 只有在确实有修正时才使用纠错结果
                            if corrected != original:
                                message_for_ai = corrected
                except Exception as e:
                    print(f"[ERROR] 解析语法纠错JSON失败: {e}")
            
            # 处理优化结果
            if "optimization" in results:
                optimization_content = results["optimization"]["content"]
                if optimization_content and optimization_content.strip().lower() != user_message.strip().lower():
                    optimization_result = {
                        "original_sentence": user_message,
                        "optimized_sentence": optimization_content,
                        "optimization_type": "cet4_level"
                    }
                    # 如果有优化结果，使用优化后的文本作为AI对话输入
                    message_for_ai = optimization_content
                    print(f"[DEBUG] 四级优化完成，最终用于AI对话的消息: {message_for_ai}")
            
            print(f"[DEBUG] 并行处理完成，最终消息: {message_for_ai}")
            return message_for_ai, grammar_correction_result, optimization_result
            
        except Exception as e:
            print(f"[ERROR] 并行处理失败: {e}")
            return user_message, None, None

    def process_user_input(self, user_message: str) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        处理用户输入，使用并行方式提高效率
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        return self.process_user_input_parallel(user_message)
