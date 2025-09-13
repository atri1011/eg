from flask import Blueprint, request, jsonify
from src.models.user import db, Conversation, Message
from src.utils.auth import auth_required, get_current_user
from src.utils.user_utils import ensure_user_exists

conversation_bp = Blueprint("conversation", __name__)

@conversation_bp.route("/conversations", methods=["GET"])
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


@conversation_bp.route("/conversations/<int:conversation_id>/messages", methods=["GET"])
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


@conversation_bp.route("/conversations/<int:conversation_id>", methods=["DELETE"])
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