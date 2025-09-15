import requests
import json
import re
import logging
from typing import Optional, Dict

from ..config.api_config import ApiConfig

logger = logging.getLogger(__name__)


class CET4Optimization:
    """CET4优化服务 - 负责按照四级考试标准优化英文表达"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config

    def optimize_for_cet4(self, text: str) -> Optional[Dict]:
        """
        根据四级考试写作评分标准优化用户输入文本
        评分要点：清晰表达、文字连贯、语言错误少、切合题意
        """
        print(f"[DEBUG] 开始四级优化，文本: {text}")

        headers = self.api_config.get_headers()

        system_prompt = """你是一位专业的英语四级考试写作指导老师。根据四级写作评分标准，你需要将用户输入优化为符合高分要求的表达。

**四级写作评分标准（满分15分）:**
- 14分档(13-15分): 切合题意，清楚表达，文字连贯，语言错误极少
- 11分档(10-12分): 切合题意，表达清楚，文字基本连贯，有少量语言错误
- 8分档(7-9分): 基本切题，有些地方表达思想不够清楚，文字勉强连贯，语言错误相当多

**优化目标 - 达到14分档要求:**
1. **清晰表达**: 用词准确，表意清楚，避免模糊或歧义表达
2. **文字连贯**: 句子结构合理，逻辑清晰，使用恰当的连接词
3. **语言错误少**: 语法正确，拼写准确，时态一致
4. **词汇水平**: 使用四级词汇范围内的词汇，避免过于简单或过于复杂

**具体优化任务:**
1. 将中英混合句子转换为纯英文
2. 替换不合适的词汇为四级水平的表达
3. 优化句式结构，提高表达的清晰度和连贯性
4. 修正语法错误，确保表达准确

**返回格式:**
只返回一个优化后的英文句子，不添加引号、解释或其他内容。

**优化示例:**
输入: "i want to buy a 电脑 for study"
输出: "I want to purchase a computer for my studies."

输入: "这个problem很difficult"  
输出: "This problem is quite challenging."

输入: "teacher give us homework everyday"
输出: "The teacher assigns us homework every day."

**重要指令:**
* 确保优化后的句子符合四级高分标准
* 保持原意的同时提升表达质量
* 使用准确且适当的四级词汇"""

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
            "temperature": 0.2
        }

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=15)
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

    def optimize_with_context(self, text: str, context_info: str) -> Optional[Dict]:
        """
        根据上下文进行四级优化
        """
        print(f"[DEBUG] 开始上下文感知四级优化，文本: {text}")

        headers = self.api_config.get_headers()

        system_prompt = f"""你是一位专业的英语四级考试写作指导老师。根据四级写作评分标准和对话上下文，优化用户输入为符合高分要求的表达。

**对话上下文信息:**
{context_info}

**四级写作评分标准（满分15分）:**
- 14分档(13-15分): 切合题意，清楚表达，文字连贯，语言错误极少
- 11分档(10-12分): 切合题意，表达清楚，文字基本连贯，有少量语言错误
- 8分档(7-9分): 基本切题，有些地方表达思想不够清楚，文字勉强连贯，语言错误相当多

**上下文感知优化目标:**
1. **主题一致性**: 确保优化后的表达与对话主题高度相关
2. **语气连贯**: 保持与对话整体语气的一致性
3. **词汇适配**: 根据对话内容选择合适的四级词汇
4. **表达升级**: 在保持上下文连贯的基础上提升表达水平

**具体优化任务:**
1. 将中英混合句子转换为纯英文，符合对话语境
2. 根据对话主题选择最合适的四级词汇
3. 优化句式结构，提高在当前语境下的表达效果
4. 确保语法正确且符合对话的自然流畅度

**返回格式:**
只返回一个优化后的英文句子，确保它在当前对话语境下自然且符合四级高分标准。

**重要指令:**
* 必须考虑对话上下文，让优化结果更贴合当前话题和语境
* 保持对话的自然性和连贯性
* 使用准确且适当的四级词汇"""

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
            "temperature": 0.2
        }

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            optimized_text = result["choices"][0]["message"]["content"].strip()

            if optimized_text and optimized_text.strip().lower() != text.strip().lower():
                return {
                    "original_sentence": text,
                    "optimized_sentence": optimized_text,
                    "optimization_type": "cet4_context_aware"
                }
            return None
        except Exception as e:
            print(f"[ERROR] 上下文感知四级优化失败: {e}")
            return None

    def get_detailed_analysis(self, text: str) -> Optional[Dict]:
        """
        提供详细的四级优化分析，包括评分细则和改进建议
        返回结构化的优化结果，包含评分分析
        """
        print(f"[DEBUG] 开始详细四级优化分析，文本: {text}")

        headers = self.api_config.get_headers()

        system_prompt = """你是一位经验丰富的英语四级考试写作评卷老师。请对用户输入进行详细的四级写作分析和优化，并返回结构化的JSON结果。

**四级写作评分标准（满分15分）:**
- 14分档(13-15分): 切合题意，清楚表达，文字连贯，语言错误极少
- 11分档(10-12分): 切合题意，表达清楚，文字基本连贯，有少量语言错误  
- 8分档(7-9分): 基本切题，有些地方表达思想不够清楚，文字勉强连贯，语言错误相当多

**请返回以下JSON格式:**
```json
{
  "original_sentence": "原句",
  "optimized_sentence": "优化后的句子",
  "current_score_range": "8-11分", 
  "target_score_range": "13-15分",
  "improvements": [
    {
      "aspect": "词汇选择/语法结构/表达清晰度/连贯性",
      "issue": "具体问题描述",
      "improvement": "改进方法",
      "example": "改进示例"
    }
  ],
  "scoring_analysis": {
    "clarity": "表达清晰度评分(1-5)",
    "coherence": "连贯性评分(1-5)", 
    "accuracy": "语言准确性评分(1-5)",
    "vocabulary": "词汇水平评分(1-5)"
  },
  "tips": ["写作技巧建议1", "写作技巧建议2"]
}
```

**分析要点:**
1. 评估当前句子的四级评分水平
2. 指出具体的改进点
3. 提供优化后的高分表达
4. 给出针对性的学习建议

**重要指令:**
- 必须返回有效的JSON格式
- 分析要准确且具有指导意义
- 优化建议要符合四级水平"""

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
            "temperature": 0.2
        }

        try:
            response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 详细四级优化分析结果: {content}")

            # 解析JSON结果
            json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
            if json_match:
                json_str = json_match.group(1).strip()
                try:
                    analysis_data = json.loads(json_str)
                    return analysis_data
                except json.JSONDecodeError as e:
                    print(f"[ERROR] 解析详细分析JSON失败: {e}")
                    return None
            else:
                print(f"[DEBUG] 未找到JSON格式，尝试直接解析: {content}")
                # 尝试直接解析整个内容
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    print(f"[ERROR] 无法解析详细分析结果")
                    return None
                    
        except Exception as e:
            print(f"[ERROR] 详细四级优化分析失败: {e}")
            return None