import os
import requests
from flask import Blueprint, request, jsonify
from src.models.user import db, Conversation, Message, User
import json
import re
import time

chat_bp = Blueprint("chat", __name__)

def ensure_user_exists(user_id=1):
    """确保指定用户存在，如果不存在则创建"""
    user = User.query.filter_by(id=user_id).first()
    if not user:
        user = User(id=user_id, username=f'user_{user_id}', email=f'user{user_id}@example.com')
        db.session.add(user)
        db.session.commit()
        print(f"[INFO] Created default user with ID: {user_id}")
    return user

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

            print(f"[DEBUG] 详细修正API响应状态码: {response.status_code}")
            print(f"[DEBUG] 详细修正API响应头: {response.headers}")
            print(f"[DEBUG] 详细修正API响应原始内容: {response.text}")
            
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
                # 在这种情况下，我们直接返回None，表示没有修正
                return None

            json_str = json_match.group(1).strip()
            
            try:
                # 解析提取出的JSON字符串
                correction_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"[ERROR] 从提取的字符串中解析JSON失败: {e}")
                print(f"[ERROR] 无法解析的JSON字符串: '{json_str}'")
                # 即使提取了，也可能因为截断等原因解析失败
                # 向上抛出异常，让外部错误处理逻辑捕获
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

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    config = data.get("config", {})
    conversation_id = data.get("conversation_id")
    
    print(f"[DEBUG] 收到用户消息: {user_message} (会话ID: {conversation_id})")

    user_id = 1  # 假设固定用户
    
    # 确保用户存在
    try:
        ensure_user_exists(user_id)
    except Exception as e:
        print(f"[ERROR] 创建或确认用户失败: {e}")
        return jsonify({"success": False, "error": f"用户初始化失败: {str(e)}"}), 500

    if not user_message or not user_message.strip():
        return jsonify({"success": False, "error": "Message content is required."}), 400

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("model")
    language_preference = config.get("languagePreference")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API Key, Base URL, or Model is missing."}), 400

    grammar_correction_result = None
    message_for_ai = user_message
    
    try:
        # 1. 获取语法修正
        detailed_corrections = get_detailed_corrections(user_message, api_base, api_key, model)
        if detailed_corrections:
            grammar_correction_result = detailed_corrections
            message_for_ai = detailed_corrections.get("corrected_sentence", user_message)
            print(f"[DEBUG] 修正完成，用于AI对话的消息: {message_for_ai}")

        # 2. 处理会话和保存用户消息
        if conversation_id:
            conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
            if not conversation:
                return jsonify({'success': False, 'error': 'Conversation not found or access denied'}), 404
        else:
            conversation = Conversation(user_id=user_id, title=user_message[:50])
            db.session.add(conversation)
            db.session.flush()
            conversation_id = conversation.id
            print(f"[DEBUG] 创建新会话，ID: {conversation_id}")
            
        user_msg_obj = Message(conversation_id=conversation.id, role='user', content=user_message, corrections=grammar_correction_result)
        db.session.add(user_msg_obj)
        db.session.commit()
        print(f"[DEBUG] 用户消息已保存到数据库 (消息ID: {user_msg_obj.id})")

        # 3. 构建发送给AI的聊天历史
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        history_messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
        messages_for_api = [{"role": msg.role, "content": msg.content} for msg in history_messages]

        chat_payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": build_system_prompt(language_preference)
                },
                *messages_for_api
            ],
            "max_tokens": 1000
        }

        chat_response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=chat_payload, timeout=30)
        chat_response.raise_for_status()
        chat_result = chat_response.json()
        ai_response_content = chat_result["choices"][0]["message"]["content"].strip()
        print(f"[DEBUG] 从API获取的AI回复: {ai_response_content}")

    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"无法连接到API服务器或API请求失败: {str(e)}"}), 500
    except Exception as e:
        print(f"[ERROR] 调用智能处理功能或API时发生未知错误: {e}")
        return jsonify({"success": False, "error": f"服务器内部错误: {str(e)}"}), 500

    try:
        ai_msg_obj = Message(conversation_id=conversation.id, role='assistant', content=ai_response_content)
        db.session.add(ai_msg_obj)
        db.session.commit()
        print(f"[DEBUG] AI回复已保存到数据库 (消息ID: {ai_msg_obj.id})")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] 保存AI回复失败: {e}")
        # 即使保存失败，也要将AI响应返回给用户
        pass

    return jsonify({
        "success": True,
        "response": ai_response_content,
        "grammar_corrections": grammar_correction_result,
        "conversation_id": conversation_id
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

@chat_bp.route("/conversations", methods=["GET"])
def get_conversations():
    """获取用户的会话列表"""
    user_id = 1  # 假设固定用户，与chat接口保持一致
    
    try:
        # 确保用户存在
        ensure_user_exists(user_id)
        
        # 测试数据库连接
        db.session.execute(db.text('SELECT 1'))
        
        conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).all()
        conversations_data = []
        
        for conv in conversations:
            # 获取最后一条消息作为预览
            last_message = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.desc()).first()
            last_message_content = ""
            if last_message:
                last_message_content = last_message.content[:50] + "..." if len(last_message.content) > 50 else last_message.content
            
            conversations_data.append({
                'id': conv.id,
                'title': conv.title,
                'created_at': conv.created_at.isoformat(),
                'last_message': last_message_content,
                'message_count': Message.query.filter_by(conversation_id=conv.id).count()
            })
        
        return jsonify({
            "success": True, 
            "conversations": conversations_data
        })
    
    except Exception as e:
        print(f"[ERROR] 获取会话列表失败: {type(e).__name__}: {str(e)}")
        
        # 检查是否是数据库连接问题
        if any(keyword in str(e).lower() for keyword in ['connection', 'connect', 'operational', 'network']):
            error_message = "数据库连接失败，请检查网络连接或稍后重试"
        else:
            error_message = f"获取会话列表失败: {str(e)}"
            
        return jsonify({
            "success": False, 
            "error": error_message,
            "error_type": type(e).__name__
        }), 500

@chat_bp.route("/conversations/<int:conversation_id>/messages", methods=["GET"])
def get_conversation_messages(conversation_id):
    """获取指定会话的历史消息"""
    user_id = 1  # 假设固定用户
    
    try:
        # 确保用户存在
        ensure_user_exists(user_id)
        
        # 验证会话是否属于当前用户
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({"success": False, "error": "会话不存在或无访问权限"}), 404
        
        # 获取会话中的所有消息
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
        
        messages_data = []
        for message in messages:
            # 转换消息格式以匹配前端期望的格式
            message_data = {
                'id': message.id,
                'type': 'user' if message.role == 'user' else 'ai',
                'content': message.content,
                'corrections': message.corrections,
                'timestamp': message.created_at.strftime('%H:%M:%S'),
                'created_at': message.created_at.isoformat()
            }
            
            # 如果是AI回复且包含翻译分隔符，解析翻译
            if message.role == 'assistant' and '|||' in message.content:
                parts = message.content.split('|||')
                if len(parts) >= 2:
                    message_data['content'] = parts[0].strip()
                    message_data['translation'] = parts[1].strip()
            
            messages_data.append(message_data)
        
        return jsonify({
            "success": True,
            "conversation": conversation.to_dict(),
            "messages": messages_data
        })
    
    except Exception as e:
        print(f"[ERROR] 获取历史消息失败: {e}")
        return jsonify({"success": False, "error": f"获取历史消息失败: {str(e)}"}), 500

@chat_bp.route("/conversations/<int:conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    """删除指定的会话"""
    user_id = 1  # 假设固定用户
    
    try:
        # 确保用户存在
        ensure_user_exists(user_id)
        
        # 验证会话是否属于当前用户
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({"success": False, "error": "会话不存在或无访问权限"}), 404
        
        # 删除会话（级联删除会自动删除相关消息）
        db.session.delete(conversation)
        db.session.commit()
        
        print(f"[DEBUG] 会话已删除，ID: {conversation_id}")
        return jsonify({
            "success": True, 
            "message": "会话删除成功"
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] 删除会话失败: {e}")
        return jsonify({"success": False, "error": f"删除会话失败: {str(e)}"}), 500