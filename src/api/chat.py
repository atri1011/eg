from flask import Blueprint, request, jsonify
from src.utils.decorators import auth_required
from src.utils.auth import get_current_user
from src.services.chat_service import ChatService
from src.services.conversation_service import ConversationService
import logging

logger = logging.getLogger(__name__)
chat_bp = Blueprint("chat_api", __name__)


@chat_bp.route("/chat", methods=["POST"])
@auth_required
def chat():
    """聊天API端点"""
    data = request.get_json()
    user_message = data.get("message")
    config = data.get("config", {})
    conversation_id = data.get("conversation_id")

    if not user_message or not user_message.strip():
        return jsonify({"success": False, "error": "Message content is required."}), 400

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("model")
    language_preference = config.get("languagePreference")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API Key, Base URL, or Model is missing."}), 400

    current_user = get_current_user()

    try:
        chat_service = ChatService(api_base, api_key, model)
        result = chat_service.process_chat_message(
            user_id=current_user.id,
            user_message=user_message,
            conversation_id=conversation_id,
            language_preference=language_preference
        )
        return jsonify({"success": True, **result})

    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        return jsonify({"success": False, "error": f"Internal server error: {str(e)}"}), 500


@chat_bp.route("/conversations", methods=["GET"])
@auth_required
def get_conversations():
    """获取用户的会话列表"""
    current_user = get_current_user()
    try:
        conversations_data = ConversationService.get_conversations_by_user_id(
            current_user.id)
        return jsonify({"success": True, "conversations": conversations_data})
    except Exception as e:
        logger.error(f"Failed to get conversation list: {e}")
        return jsonify({"success": False, "error": "Failed to retrieve conversations."}), 500


@chat_bp.route("/conversations/<int:conversation_id>/messages", methods=["GET"])
@auth_required
def get_conversation_messages(conversation_id):
    """获取指定会话的历史消息"""
    current_user = get_current_user()
    try:
        messages, error = ConversationService.get_messages_by_conversation_id(
            conversation_id, current_user.id)
        if error:
            return jsonify({"success": False, "error": error}), 404

        # 格式化消息以适应前端
        messages_data = []
        for message in messages:
            message_data = {
                'id': message.id,
                'type': 'user' if message.role == 'user' else 'ai',
                'content': message.content,
                'corrections': message.corrections,
                'optimization': message.optimization,
                'timestamp': message.created_at.strftime('%H:%M:%S'),
                'created_at': message.created_at.isoformat()
            }
            if message.role == 'assistant' and '|||' in message.content:
                parts = message.content.split('|||')
                if len(parts) >= 2:
                    message_data['content'] = parts[0].strip()
                    message_data['translation'] = parts[1].strip()
            messages_data.append(message_data)

        return jsonify({"success": True, "messages": messages_data})
    except Exception as e:
        logger.error(
            f"Failed to get messages for conversation {conversation_id}: {e}")
        return jsonify({"success": False, "error": "Failed to retrieve messages."}), 500


@chat_bp.route("/conversations/<int:conversation_id>", methods=["DELETE"])
@auth_required
def delete_conversation(conversation_id):
    """删除指定的会话"""
    current_user = get_current_user()
    try:
        success, message = ConversationService.delete_conversation(
            conversation_id, current_user.id)
        if not success:
            return jsonify({"success": False, "error": message}), 404
        return jsonify({"success": True, "message": message})
    except Exception as e:
        logger.error(f"Failed to delete conversation {conversation_id}: {e}")
        return jsonify({"success": False, "error": "Failed to delete conversation."}), 500
