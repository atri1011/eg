import requests
from flask import Blueprint, request, jsonify
from src.models.user import db, Conversation, Message, User
from src.utils.auth import auth_required, get_current_user
import json
import re
import time
import logging

chat_bp = Blueprint("chat", __name__)
logger = logging.getLogger(__name__)

def detect_api_provider(api_base):
    """根据API Base URL检测API提供商类型"""
    if not api_base:
        return 'openai'
    
    api_base_lower = api_base.lower()
    
    # OpenAI官方或兼容的API
    if 'openai.com' in api_base_lower or 'api.openai.com' in api_base_lower:
        return 'openai'
    
    # Anthropic Claude
    elif 'anthropic.com' in api_base_lower:
        return 'anthropic'
    
    # 智谱AI
    elif 'bigmodel.cn' in api_base_lower or 'zhipuai' in api_base_lower:
        return 'zhipu'
    
    # 月之暗面 Kimi
    elif 'moonshot.cn' in api_base_lower:
        return 'moonshot'
    
    # 豆包/字节跳动
    elif 'volcengine.com' in api_base_lower or 'doubao' in api_base_lower:
        return 'doubao'
    
    # DeepSeek
    elif 'deepseek' in api_base_lower:
        return 'deepseek'
    
    # Azure OpenAI
    elif 'azure' in api_base_lower and 'openai' in api_base_lower:
        return 'azure_openai'
    
    # 默认尝试OpenAI兼容格式
    else:
        return 'openai_compatible'

def get_default_models_for_provider(provider):
    """根据提供商返回默认模型列表"""
    if provider == 'anthropic':
        return [
            {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet'},
            {'id': 'claude-3-5-haiku-20241022', 'name': 'Claude 3.5 Haiku'},
            {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus'},
        ]
    elif provider == 'zhipu':
        return [
            {'id': 'glm-4-plus', 'name': 'GLM-4 Plus'},
            {'id': 'glm-4', 'name': 'GLM-4'},
            {'id': 'glm-4-air', 'name': 'GLM-4 Air'},
            {'id': 'glm-4-flash', 'name': 'GLM-4 Flash'},
        ]
    elif provider == 'moonshot':
        return [
            {'id': 'moonshot-v1-8k', 'name': 'Moonshot V1 8K'},
            {'id': 'moonshot-v1-32k', 'name': 'Moonshot V1 32K'},
            {'id': 'moonshot-v1-128k', 'name': 'Moonshot V1 128K'},
        ]
    elif provider == 'doubao':
        return [
            {'id': 'doubao-pro-32k', 'name': '豆包 Pro 32K'},
            {'id': 'doubao-pro-128k', 'name': '豆包 Pro 128K'},
            {'id': 'doubao-lite-32k', 'name': '豆包 Lite 32K'},
        ]
    elif provider == 'deepseek':
        return [
            {'id': 'deepseek-chat', 'name': 'DeepSeek Chat'},
            {'id': 'deepseek-coder', 'name': 'DeepSeek Coder'},
            {'id': 'deepseek-v3', 'name': 'DeepSeek V3'},
        ]
    else:
        # 默认OpenAI模型
        return [
            {'id': 'gpt-4', 'name': 'GPT-4'},
            {'id': 'gpt-4-turbo', 'name': 'GPT-4 Turbo'},
            {'id': 'gpt-4o', 'name': 'GPT-4o'},
            {'id': 'gpt-4o-mini', 'name': 'GPT-4o Mini'},
            {'id': 'gpt-3.5-turbo', 'name': 'GPT-3.5 Turbo'},
        ]

def try_fetch_models_from_api(api_base, api_key, provider):
    """尝试从API获取模型列表"""
    try:
        # 根据提供商构建正确的URL和headers
        if provider == 'anthropic':
            if not api_base.endswith('/'):
                api_base += '/'
            models_url = api_base + 'v1/models'
            headers = {
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        else:
            # OpenAI兼容格式
            if not api_base.endswith('/'):
                api_base += '/'
            if api_base.endswith('/v1/'):
                models_url = api_base + 'models'
            elif api_base.endswith('/'):
                models_url = api_base + 'v1/models'
            else:
                models_url = api_base + '/v1/models'
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        
        response = requests.get(models_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        models = []
        
        # 处理响应格式
        if 'data' in data and isinstance(data['data'], list):
            for model in data['data']:
                model_id = model.get('id', '')
                model_name = model.get('display_name') or model.get('name') or model_id
                
                # 过滤掉一些不常用的模型
                if not any(skip in model_id.lower() for skip in ['whisper', 'tts', 'dall-e', 'embedding', 'moderation']):
                    models.append({
                        'id': model_id,
                        'name': model_name
                    })
        
        return models
        
    except Exception as e:
        logger.warning(f"Failed to fetch models from API ({provider}): {str(e)}")
        return None

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
        return """你是一位友好且充满鼓励的英语对话伙伴。你的目标是帮助用户在轻松的氛围中练习和提高英语口语。

**核心任务:**
1.  **自然对话**: 像朋友一样用自然、地道的英语与用户交流。
2.  **引导对话**: 适当提出开放性问题，鼓励用户继续对话，例如询问对方的观点、经历或感受。
3.  **保持简洁**: 回复要简洁明了，避免使用过于复杂或冗长的句子。
4.  **专注对话**: 不要纠正用户的语法错误，你的重点是保持对话的流畅性。
5.  **提供翻译**: 在每一句英语回复后，必须使用 `|||` 作为分隔符，然后提供对应的中文翻译。

**回复格式:**
[你的英语回复] ||| [对应的中文翻译]

**示例:**
That sounds fascinating! What kind of books do you enjoy reading the most? ||| 那听起来太有趣了！你最喜欢读什么类型的书？"""
    elif language_preference == 'chinese':
        return """你是一位专业的英语学习助手。用户会用英语向你提问或与你对话，你的任务是：

1.  **中文回复**: 始终使用中文进行回复。
2.  **解答疑惑**: 针对用户的句子，提供清晰的解释，帮助他们理解单词、语法和文化背景。
3.  **鼓励学习**: 回复应包含鼓励和支持，帮助用户建立学习信心。
4.  **保持简洁**: 解释要通俗易懂，避免使用过多的专业术语。"""
    elif language_preference == 'english':
        return """You are a friendly and engaging English conversation partner. Your goal is to help the user practice their English in a relaxed and supportive environment.

**Your Core Tasks:**
1.  **Natural Conversation**: Respond in natural, conversational English, like you're talking to a friend.
2.  **Engage the User**: Ask open-ended questions to keep the conversation flowing and encourage the user to share more.
3.  **Keep it Concise**: Your replies should be clear and to the point.
4.  **Focus on Fluency**: Do not correct the user's grammar. Your priority is to maintain a smooth and encouraging conversation.
"""
    else:
        # 默认回退到双语模式
        return """你是一位友好且充满鼓励的英语对话伙伴。你的目标是帮助用户在轻松的氛围中练习和提高英语口语。

**核心任务:**
1.  **自然对话**: 像朋友一样用自然、地道的英语与用户交流。
2.  **引导对话**: 适当提出开放性问题，鼓励用户继续对话，例如询问对方的观点、经历或感受。
3.  **保持简洁**: 回复要简洁明了，避免使用过于复杂或冗长的句子。
4.  **专注对话**: 不要纠正用户的语法错误，你的重点是保持对话的流畅性。
5.  **提供翻译**: 在每一句英语回复后，必须使用 `|||` 作为分隔符，然后提供对应的中文翻译。

**回复格式:**
[你的英语回复] ||| [对应的中文翻译]

**示例:**
That sounds fascinating! What kind of books do you enjoy reading the most? ||| 那听起来太有趣了！你最喜欢读什么类型的书？"""

def is_chinese_text(text):
    """检测文本是否主要是中文"""
    import re
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

def get_translation_from_chinese(chinese_text, api_base, api_key, model):
    """将中文翻译成英文"""
    print(f"[DEBUG] 开始中文翻译，文本: {chinese_text}")
    headers = {
        "Authorization": f"Bearer {api_key}",
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
        "model": model,
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
        response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=payload, timeout=15)
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
        "max_tokens": 1000000,
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
@auth_required
def chat():
    data = request.get_json()
    user_message = data.get("message")
    config = data.get("config", {})
    conversation_id = data.get("conversation_id")
    
    current_user = get_current_user()
    user_id = current_user.id
    
    print(f"[DEBUG] 收到用户消息: {user_message} (会话ID: {conversation_id}, 用户ID: {user_id})")
    
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
        # 1. 首先检测输入语言类型
        print(f"[DEBUG] 检测输入语言: {user_message}")
        if is_chinese_text(user_message):
            print(f"[DEBUG] 检测到纯中文输入，进行翻译")
            # 纯中文输入：直接翻译
            translation_result = get_translation_from_chinese(user_message, api_base, api_key, model)
            if translation_result:
                grammar_correction_result = translation_result
                message_for_ai = translation_result.get("corrected_sentence", user_message)
                print(f"[DEBUG] 中文翻译完成，用于AI对话的消息: {message_for_ai}")
        else:
            print(f"[DEBUG] 检测到英文或中英混合输入，进行语法纠错")
            # 英文或中英混合输入：进行语法纠错和翻译
            detailed_corrections = get_detailed_corrections(user_message, api_base, api_key, model)
            if detailed_corrections:
                grammar_correction_result = detailed_corrections
                message_for_ai = detailed_corrections.get("corrected_sentence", user_message)
                print(f"[DEBUG] 语法纠错完成，用于AI对话的消息: {message_for_ai}")

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
            "max_tokens": 100000
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

@chat_bp.route("/generate-grammar-exercises", methods=["POST"])
def generate_grammar_exercises():
    """生成AI语法练习题"""
    data = request.get_json()
    grammar_point = data.get("grammarPoint")
    config = data.get("config", {})
    settings = data.get("settings", {})
    
    if not grammar_point or not config:
        return jsonify({"success": False, "error": "语法点或配置信息缺失"}), 400
        
    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    
    # 优先使用 customModel，如果不存在或为空，则使用 model
    model = config.get("customModel") if config.get("customModel") else config.get("model")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API配置信息不完整"}), 400
    
    count = settings.get("count", 10)
    difficulty = settings.get("difficulty", "medium")
    
    try:
        # 确保将 model 参数传递给 generate_exercises_with_ai 函数
        exercises = generate_exercises_with_ai(grammar_point, count, difficulty, api_base, api_key, model)
        return jsonify({
            "success": True,
            "exercises": exercises,
            "count": len(exercises)
        })
    except Exception as e:
        print(f"[ERROR] 生成AI练习题失败: {e}")
        return jsonify({"success": False, "error": f"生成练习题失败: {str(e)}"}), 500

def generate_exercises_with_ai(grammar_point, count, difficulty, api_base, api_key, model):
    """使用AI生成语法练习题"""
    print(f"[DEBUG] 开始AI生成练习题，语法点: {grammar_point.get('name')}")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
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
        "model": model,
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
            print(f"[DEBUG] 发送生成练习题请求到: {OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base)} (尝试 {attempt + 1})")
            response = requests.post(OPENAI_CHAT_COMPLETIONS_URL.format(api_base=api_base), headers=headers, json=payload, timeout=30)
            
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
                json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
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

@chat_bp.route("/models", methods=["GET"])
def get_models():
    """获取可用模型列表的API端点 - 改进版，支持多种API提供商"""
    api_key = request.args.get("apiKey")
    api_base = request.args.get("apiBase", "https://api.openai.com/v1")

    if not api_key:
        return jsonify({"success": False, "error": "API Key is missing."}), 400

    # 检测API提供商类型
    provider = detect_api_provider(api_base)
    logger.info(f"Detected API provider: {provider} for base URL: {api_base}")

    # 首先尝试从API获取模型列表
    models = try_fetch_models_from_api(api_base, api_key, provider)
    
    # 如果API调用失败，使用默认模型列表
    if models is None or len(models) == 0:
        logger.info(f"Using default models for provider: {provider}")
        models = get_default_models_for_provider(provider)
    
    # 确保至少有一个模型
    if not models:
        models = [{"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"}]
    
    return jsonify({
        "success": True, 
        "models": models,
        "provider": provider
    })

@chat_bp.route("/conversations", methods=["GET"])
@auth_required
def get_conversations():
    """获取用户的会话列表"""
    current_user = get_current_user()
    user_id = current_user.id
    
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
@auth_required
def get_conversation_messages(conversation_id):
    """获取指定会话的历史消息"""
    current_user = get_current_user()
    user_id = current_user.id
    
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
@auth_required
def delete_conversation(conversation_id):
    """删除指定的会话"""
    current_user = get_current_user()
    user_id = current_user.id
    
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

@chat_bp.route("/verify-grammar-answer", methods=["POST"])
def verify_grammar_answer():
    """验证用户提交的语法练习答案"""
    data = request.get_json()
    user_answer = data.get("userAnswer", "")
    correct_answer = data.get("correctAnswer", "")

    if not user_answer or not correct_answer:
        return jsonify({"success": False, "error": "缺少答案信息"}), 400

    # 预处理：忽略大小写、标点和首尾空格
    processed_user_answer = re.sub(r'[^\w\s]', '', user_answer).lower().strip()
    processed_correct_answer = re.sub(r'[^\w\s]', '', correct_answer).lower().strip()
    
    # 比较答案
    is_correct = processed_user_answer == processed_correct_answer
    
    print(f"[DEBUG] 答案验证: 用户答案='{user_answer}' (处理后: '{processed_user_answer}'), 正确答案='{correct_answer}' (处理后: '{processed_correct_answer}'), 结果: {is_correct}")

    return jsonify({
        "success": True,
        "is_correct": is_correct
    })