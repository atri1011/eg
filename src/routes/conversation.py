from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.conversation import Conversation, Message

conversation_bp = Blueprint('conversation', __name__)

@conversation_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """获取当前用户的所有对话列表"""
    # 假设 user_id 固定为 1，实际应用中应从认证信息中获取
    user_id = 1
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).all()
    return jsonify([conv.to_dict() for conv in conversations])

@conversation_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """创建一个新的空对话"""
    # 假设 user_id 固定为 1
    user_id = 1
    new_conversation = Conversation(user_id=user_id, title="New Conversation")
    db.session.add(new_conversation)
    db.session.commit()
    return jsonify(new_conversation.to_dict()), 201

@conversation_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
def get_conversation_messages(conversation_id):
    """获取指定对话的所有消息"""
    # 假设 user_id 固定为 1
    user_id = 1
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation or conversation.user_id != user_id:
        return jsonify({'error': 'Conversation not found'}), 404
        
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
    return jsonify({
        'id': conversation.id,
        'title': conversation.title,
        'messages': [msg.to_dict() for msg in messages]
    })