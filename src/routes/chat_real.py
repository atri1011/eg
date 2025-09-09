import os
import requests
from flask import Blueprint, request, jsonify
import json

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

def check_grammar_with_ai(text, api_base, api_key, model):
    """使用AI检查语法错误"""
    print(f"[DEBUG] 开始语法检查，文本: {text}")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "你是一个专业的英语语法纠正助手。你的任务是：1. 检查用户提供的英语句子的语法错误。2. 严格按照指定的JSON格式返回结果。3. **`explanation`字段必须且只能使用简体中文进行解释**。如果句子没有错误，请回复'无语法错误'。\n\nJSON格式如下：\n{\n  \"corrections\": [\n    {\n      \"original\": \"原始句子或短语\",\n      \"corrected\": \"修正后的句子或短语\",\n      \"explanation\": \"此处为中文解释\"\n    }\n  ]\n}"
            },
            {
                "role": "user",
                "content": text
            }
        ],
        "max_tokens": 500
    }
    try:
        print(f"[DEBUG] 发送语法检查请求到: {OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base)}")
        response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()
        print(f"[DEBUG] 语法检查原始响应: {content}")

        # 清理AI返回内容中的Markdown代码块标记
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        if content == "无语法错误":
            print("[DEBUG] AI返回无语法错误")
            return []
        try:
            grammar_data = json.loads(content)
            corrections = grammar_data.get("corrections", [])
            print(f"[DEBUG] 解析后的语法纠错数据: {corrections}")
            return corrections
        except json.JSONDecodeError as e:
            print(f"[DEBUG] JSON解析错误: {e}")
            print(f"[DEBUG] 无法解析的内容: {content}")
            return [] # 如果AI没有返回正确的JSON格式，则认为没有纠错
    except requests.exceptions.RequestException as e:
        print(f"[DEBUG] 语法检查API请求失败: {e}")
        return []
    except Exception as e:
        print(f"[DEBUG] 语法检查发生错误: {e}")
        return []

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
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

    # 对话部分
    chat_payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": build_system_prompt(language_preference)
            },
            {
                "role": "user",
                "content": user_message
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

    # 语法检查部分
    grammar_corrections = []
    try:
        print(f"[DEBUG] 开始调用语法检查功能，用户消息: {user_message}")
        grammar_corrections = check_grammar_with_ai(user_message, api_base, api_key, model)
        print(f"[DEBUG] 语法检查完成，返回的纠错数量: {len(grammar_corrections)}")
    except Exception as e:
        print(f"[ERROR] 调用语法检查功能时发生未知错误: {e}")
        # 即使语法检查失败，也继续返回对话结果，不中断主流程
        pass

    return jsonify({
        "success": True,
        "response": ai_response_content,
        "grammar_corrections": grammar_corrections
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
        response.raise_for_status()  # Raise an exception for HTTP errors
        models_data = response.json()
        
        # 过滤并格式化模型列表
        available_models = []
        for model in models_data.get("data", []):
            if "gpt" in model["id"] or "claude" in model["id"] or "llama" in model["id"] or "mistral" in model["id"]:
                available_models.append({"id": model["id"], "name": model["id"]})
        
        return jsonify({"success": True, "models": available_models})
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"无法连接到API服务器: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"获取模型列表失败: {str(e)}"}), 500


