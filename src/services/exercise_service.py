import requests
import json
import re
import time
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class ExerciseService:
    """AI练习题生成服务"""

    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base
        self.api_key = api_key
        self.model = model
        self.chat_completions_url = f"{api_base}/chat/completions"

    def generate_exercises(self, grammar_point: Dict, count: int = 10, difficulty: str = "medium") -> List[Dict]:
        """使用AI生成语法练习题"""
        print(f"[DEBUG] 开始AI生成练习题，语法点: {grammar_point.get('name')}")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # 构建生成练习题的系统提示
        difficulty_map = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        }

        difficulty_cn = difficulty_map.get(difficulty, '中等')
        grammar_name = grammar_point.get('name', '')
        grammar_description = grammar_point.get('description', '')

        # 优化系统提示以提高题目质量和格式稳定性
        system_prompt = f"""你是一位专业的英语教学内容设计师。请为以下语法点生成 {count} 道高质量的英语练习题。

**语法点**: {grammar_name}
**描述**: {grammar_description}
**难度**: {difficulty_cn}

**输出要求**:
严格按照以下JSON格式返回一个包含 {count} 个练习题对象的数组。不要包含任何Markdown标记或解释性文字。

**JSON结构与示例**:
```json
[
  {{
    "id": "ai-ex-1",
    "type": "fill-blank", // 填空题
    "question": "The sun ___ in the east.",
    "answer": "rises",
    "explanation": "主语 'The sun' 是第三人称单数，因此动词 'rise' 需要使用第三人称单数形式 'rises'。",
    "difficulty": "{difficulty}"
  }},
  {{
    "id": "ai-ex-2",
    "type": "multiple-choice", // 选择题
    "question": "She ___ to the store every morning.",
    "options": ["go", "goes", "is going", "went"],
    "answer": 1, // 正确选项的索引 (0-based)
    "explanation": "句子描述的是一个日常习惯，应使用一般现在时。主语 'She' 是第三人称单数，所以动词用 'goes'。",
    "difficulty": "{difficulty}"
  }},
  {{
    "id": "ai-ex-3",
    "type": "correction", // 改错题
    "question": "找出并改正句子中的错误: He have two cats.",
    "sentence": "He have two cats.",
    "correctSentence": "He has two cats.",
    "explanation": "主语 'He' 是第三人称单数，助动词应使用 'has' 而不是 'have'。",
    "difficulty": "{difficulty}"
  }}
]
```

**质量要求**:
1.  **紧扣语法点**: 所有题目必须围绕核心语法点 "{grammar_name}" 设计。
2.  **场景化**: 题目应尽可能贴近日常生活或常见对话场景。
3.  **多样性**: 题型应在 "fill-blank", "multiple-choice", "correction" 中合理分布。
4.  **解释清晰**: `explanation` 必须清晰地解释为什么答案是正确的，对于选择题，最好能说明为什么其他选项不合适。
"""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"生成{count}道{grammar_name}练习题，JSON格式输出"
                }
            ],
            "max_tokens": 8192,  # 设置一个合理的默认值
            "temperature": 0.3   # 降低随机性以提高稳定性
        }

        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                print(
                    f"[DEBUG] 发送生成练习题请求到: {self.chat_completions_url} (尝试 {attempt + 1})")
                response = requests.post(
                    self.chat_completions_url, headers=headers, json=payload, timeout=30)

                if response.status_code == 429:
                    print(f"[WARN] 收到 429 速率限制错误。将在 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    continue
                elif response.status_code == 503:
                    print(f"[WARN] 收到 503 服务不可用错误。尝试降级请求参数...")
                    # 降级策略：减少token数量和简化请求
                    if payload["max_tokens"] > 800000:
                        payload["max_tokens"] = 800000
                        payload["temperature"] = 0.1
                        if attempt < max_retries - 1:
                            time.sleep(retry_delay * 2)  # 更长的重试间隔
                            continue

                print(f"[DEBUG] 练习题生成API响应状态码: {response.status_code}")
                response.raise_for_status()

                if not response.text.strip():
                    print("[ERROR] API响应内容为空")
                    raise Exception("API响应内容为空")

                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                print(f"[DEBUG] AI练习题生成原始响应: {content}")

                # 尝试直接解析JSON
                try:
                    exercises = json.loads(content)
                    if isinstance(exercises, list) and len(exercises) > 0:
                        print(f"[DEBUG] 成功生成 {len(exercises)} 道练习题")
                        return exercises
                    else:
                        print("[ERROR] AI返回的不是有效的练习题数组")
                        raise Exception("AI返回的不是有效的练习题数组")
                except json.JSONDecodeError:
                    # 如果直接解析失败，尝试提取JSON代码块
                    json_match = re.search(
                        r"```json\s*([\s\S]*?)\s*```", content)
                    if json_match:
                        json_str = json_match.group(1).strip()
                        exercises = json.loads(json_str)
                        if isinstance(exercises, list) and len(exercises) > 0:
                            print(f"[DEBUG] 从代码块中成功解析 {len(exercises)} 道练习题")
                            return exercises

                    # 如果还是失败，尝试提取数组部分
                    array_match = re.search(r'\[([\s\S]*)\]', content)
                    if array_match:
                        array_str = '[' + array_match.group(1) + ']'
                        exercises = json.loads(array_str)
                        if isinstance(exercises, list) and len(exercises) > 0:
                            print(f"[DEBUG] 从数组匹配中成功解析 {len(exercises)} 道练习题")
                            return exercises

                    print(f"[ERROR] 无法解析AI返回的JSON: {content}")
                    raise Exception(f"无法解析AI返回的练习题JSON: {content}")

            except requests.exceptions.RequestException as e:
                print(f"[ERROR] 练习题生成API请求失败: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    raise Exception(f"练习题生成API请求失败: {e}")
            except Exception as e:
                print(f"[ERROR] 练习题生成发生未知错误: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    raise Exception(f"练习题生成失败: {e}")

        print("[ERROR] 所有重试尝试均失败")
        raise Exception("所有重试尝试均失败")

    @staticmethod
    def verify_answer(user_answer: str, correct_answer: str) -> bool:
        """验证用户提交的答案"""
        if not user_answer or not correct_answer:
            return False

        # 预处理：忽略大小写、标点和首尾空格
        processed_user_answer = re.sub(
            r'[^\w\s]', '', user_answer).lower().strip()
        processed_correct_answer = re.sub(
            r'[^\w\s]', '', correct_answer).lower().strip()

        # 比较答案
        is_correct = processed_user_answer == processed_correct_answer

        print(
            f"[DEBUG] 答案验证: 用户答案='{user_answer}' (处理后: '{processed_user_answer}'), 正确答案='{correct_answer}' (处理后: '{processed_correct_answer}'), 结果: {is_correct}")

        return is_correct
