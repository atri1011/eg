import os
import requests
from flask import Blueprint, request, jsonify
import json
import re
import time

chat_bp = Blueprint("chat", __name__)

# 定义OpenAI API的URL和模型
OPENAI_CHAT_COMPLETIONS_URL = "{api_base}/chat/completions"
OPENAI_MODELS_URL = "{api_base}/models"

def build_system_prompt(language_preference):
    """构建系统提示"""
    if language_preference == 'bilingual':
        return """你是一个英语对话伙伴。用户会发送英语句子给你，你需要：

1. 用自然的英语回复，就像正常对话一样
2. 回复要简洁、自然，不要过于冗长
3. 不要提及语法错误或纠正，只需要自然对话
4. 在英语回复后，用 ||| 分隔符，然后提供中文翻译

回复格式：
英语回复内容 ||| 中文翻译

例如：
That sounds great! What do you like to do in your free time? ||| 听起来不错！你空闲时间喜欢做什么？"""
    elif language_preference == 'chinese':
        return """你是一个英语学习助手。用户会发送英语句子给你，请用中文回复，帮助他们理解和学习。回复要简洁自然。"""
    elif language_preference == 'english':
        return """You are an English conversation partner. Reply naturally in English to help the user practice. Keep your responses concise and conversational."""
    else:
        return """你是一个英语对话伙伴。用自然的英语回复用户，然后用 ||| 分隔符提供中文翻译。

回复格式：
英语回复内容 ||| 中文翻译"""

def get_detailed_corrections(text, api_base, api_key, model):
    """
    Analyzes user input for translation and grammar errors in one go,
    and returns a detailed breakdown of corrections.
    """
    print(f"[DEBUG] 开始详细语法检查和翻译，文本: {text}")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    system_prompt = """你是一位极其严谨的英语学习助手。你的任务是分析用户提供的句子，并始终返回一个结构完整的JSON对象。

**JSON结构要求:**
1.  `original_sentence`: 用户输入的原始句子。
2.  `corrected_sentence`: 修正后的最终英文句子。
3.  `corrections`: 一个包含所有修改项的列表。

**`corrections` 列表的详细规则:**
*   每个修改项都是一个包含 `type`, `original`, `corrected`, `explanation` 的对象。
*   `type` 必须是 "translation" 或 "grammar"。
*   `explanation` 必须是中文。

**重要指令:**
*   **必须返回JSON对象:** 无论输入内容多么不寻奇或无法完全解析，你都必须返回一个符合上述结构的有效JSON对象。
*   **无错误情况:** 如果句子完全正确且无需翻译，`corrected_sentence` 字段应与 `original_sentence` 相同，并且 `corrections` 列表必须是一个**空列表 `[]`**。
*   **不要返回空字符串或无效JSON:** 严禁返回任何JSON格式之外的文本、解释或空响应。

**示例:**
输入: "i has a 苹果"
返回:
```json
{
  "original_sentence": "i has a 苹果",
  "corrected_sentence": "I have an apple.",
  "corrections": [
    { "type": "translation", "original": "苹果", "corrected": "apple", "explanation": "将中文翻译为英文。" },
    { "type": "grammar", "original": "i has", "corrected": "I have", "explanation": "主语 'I' 应使用 'have'。" },
    { "type": "grammar", "original": "a apple", "corrected": "an apple", "explanation": "'apple' 以元音开头，应使用 'an'。" }
  ]
}
```"""

    payload = {
        "model": model,
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

    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            print(f"[DEBUG] 发送详细修正请求到: {OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base)} (尝试 {attempt + 1})")
            response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=payload, timeout=20)
            
            if response.status_code == 429:
                print(f"[WARN] 收到 429 速率限制错误。将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
                continue

            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 详细修正原始响应: {content}")

            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            correction_data = json.loads(content)
            
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
                return None

        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON解析错误: {e}")
            print(f"[ERROR] 无法解析的原始AI响应内容: '{content}'")
            return None
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] 详细修正API请求失败: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                return None
        except Exception as e:
            print(f"[ERROR] 详细修正发生未知错误: {e}")
            return None
    
    print("[ERROR] 所有重试尝试均失败")
    return None

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    print(f"[DEBUG] 收到用户消息: {user_message}")
    config = data.get("config", {})

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("model")
    language_preference = config.get("languagePreference")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API Key, Base URL, or Model is missing."}), 400

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    grammar_correction_result = None
    message_for_ai = user_message

    try:
        print(f"[DEBUG] 开始调用统一处理功能，文本: {user_message}")
        detailed_corrections = get_detailed_corrections(user_message, api_base, api_key, model)
        
        if detailed_corrections:
            grammar_correction_result = detailed_corrections
            message_for_ai = detailed_corrections.get("corrected_sentence", user_message)
            print(f"[DEBUG] 修正完成，用于AI对话的消息: {message_for_ai}")
        else:
            print(f"[DEBUG] 无需修正，使用原始消息进行AI对话")
            message_for_ai = user_message

    except Exception as e:
        print(f"[ERROR] 调用智能处理功能时发生未知错误: {e}")
        pass

    chat_payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": build_system_prompt(language_preference)
            },
            {
                "role": "user",
                "content": message_for_ai
            }
        ],
        "max_tokens": 1000
    }

    try:
        chat_response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=chat_payload, timeout=30)
        chat_response.raise_for_status()
        chat_result = chat_response.json()
        ai_response_content = chat_result["choices"][0]["message"]["content"].strip()
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"无法连接到API服务器或API请求失败: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"API调用失败: {str(e)}"}), 500

    print(f"[DEBUG] 最终返回给前端的修正结果: {grammar_correction_result}")
    return jsonify({
        "success": True,
        "response": ai_response_content,
        "grammar_corrections": grammar_correction_result
    })

@chat_bp.route("/models", methods=["GET"])
def get_models():
    api_key = request.args.get("apiKey")
    api_base = request.args.get("apiBase")

    if not api_key or not api_base:
        return jsonify({"success": False, "error": "API Key or Base URL is missing."}), 400

    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    try:
        response = requests.get(OPENAI_MODELS_URL.format(api_base=api_base), headers=headers, timeout=10)
        response.raise_for_status()
        models_data = response.json()
        
        available_models = []
        for model in models_data.get("data", []):
            if "gpt" in model["id"] or "claude" in model["id"] or "llama" in model["id"] or "mistral" in model["id"]:
                available_models.append({"id": model["id"], "name": model["id"]})
        
        return jsonify({"success": True, "models": available_models})
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"无法连接到API服务器: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"获取模型列表失败: {str(e)}"}), 500