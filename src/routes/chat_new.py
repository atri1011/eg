from flask import Blueprint, request, jsonify
from src.models.user import db, Conversation, Message, User
from src.utils.auth import auth_required, get_current_user
from src.utils.user_utils import ensure_user_exists
from src.services.api_provider_service import ApiProviderService
from src.services.translation_service import TranslationService
from src.services.chat_service import ChatService
from src.services.exercise_service import ExerciseService
from src.config.prompts import build_system_prompt

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
@auth_required
def chat():
    """聊天API端点"""
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

    try:
        # 初始化服务
        translation_service = TranslationService(api_base, api_key, model)
        chat_service = ChatService(api_base, api_key, model)
        
        # 1. 处理用户输入（翻译和语法纠错）
        message_for_ai, grammar_correction_result = translation_service.process_user_input(user_message)

        # 2. 处理会话
        conversation = chat_service.create_or_get_conversation(user_id, conversation_id, user_message)
        
        # 3. 保存用户消息
        chat_service.save_user_message(conversation, user_message, grammar_correction_result)

        # 4. 获取聊天历史并发送给AI
        messages_for_api = chat_service.get_conversation_messages(conversation.id)
        system_prompt = build_system_prompt(language_preference)
        ai_response_content = chat_service.send_chat_request(messages_for_api, system_prompt)

        # 5. 保存AI回复
        chat_service.save_ai_message(conversation, ai_response_content)

        return jsonify({
            "success": True,
            "response": ai_response_content,
            "grammar_corrections": grammar_correction_result,
            "conversation_id": conversation.id
        })

    except Exception as e:
        print(f"[ERROR] 聊天处理失败: {e}")
        return jsonify({"success": False, "error": f"服务器内部错误: {str(e)}"}), 500


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
    model = config.get("customModel") if config.get("customModel") else config.get("model")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API配置信息不完整"}), 400
    
    count = settings.get("count", 10)
    difficulty = settings.get("difficulty", "medium")
    
    try:
        exercise_service = ExerciseService(api_base, api_key, model)
        exercises = exercise_service.generate_exercises(grammar_point, count, difficulty)
        return jsonify({
            "success": True,
            "exercises": exercises,
            "count": len(exercises)
        })
    except Exception as e:
        print(f"[ERROR] 生成AI练习题失败: {e}")
        return jsonify({"success": False, "error": f"生成练习题失败: {str(e)}"}), 500


@chat_bp.route("/models", methods=["GET"])
def get_models():
    """获取可用模型列表的API端点"""
    api_key = request.args.get("apiKey")
    api_base = request.args.get("apiBase", "https://api.openai.com/v1")

    if not api_key:
        return jsonify({"success": False, "error": "API Key is missing."}), 400

    try:
        result = ApiProviderService.get_models(api_base, api_key)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": f"获取模型列表失败: {str(e)}"}), 500


@chat_bp.route("/verify-grammar-answer", methods=["POST"])
def verify_grammar_answer():
    """验证用户提交的语法练习答案"""
    data = request.get_json()
    user_answer = data.get("userAnswer", "")
    correct_answer = data.get("correctAnswer", "")

    if not user_answer or not correct_answer:
        return jsonify({"success": False, "error": "缺少答案信息"}), 400

    is_correct = ExerciseService.verify_answer(user_answer, correct_answer)

    return jsonify({
        "success": True,
        "is_correct": is_correct
    })