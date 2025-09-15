from src.models import db
from src.models.conversation import Conversation, Message
from datetime import datetime


class ConversationService:
    @staticmethod
    def get_conversations_by_user_id(user_id):
        """根据用户ID获取会话列表，并附带最后一条消息预览。"""
        conversations = Conversation.query.filter_by(
            user_id=user_id).order_by(Conversation.created_at.desc()).all()

        conversations_data = []
        for conv in conversations:
            last_message = Message.query.filter_by(
                conversation_id=conv.id, is_deleted=False).order_by(Message.created_at.desc()).first()
            last_message_content = ""
            if last_message:
                last_message_content = last_message.content[:50] + "..." if len(
                    last_message.content) > 50 else last_message.content

            conversations_data.append({
                'id': conv.id,
                'title': conv.title,
                'created_at': conv.created_at.isoformat(),
                'last_message': last_message_content,
                'message_count': Message.query.filter_by(conversation_id=conv.id, is_deleted=False).count()
            })

        return conversations_data

    @staticmethod
    def get_messages_by_conversation_id(conversation_id, user_id):
        """获取指定会话的所有消息，并验证所有权。"""
        conversation = Conversation.query.filter_by(
            id=conversation_id, user_id=user_id).first()
        if not conversation:
            return None, "Conversation not found or access denied."

        messages = Message.query.filter_by(
            conversation_id=conversation_id, is_deleted=False).order_by(Message.created_at.asc()).all()
        return messages, None

    @staticmethod
    def delete_conversation(conversation_id, user_id):
        """删除一个会话，并验证所有权。"""
        conversation = Conversation.query.filter_by(
            id=conversation_id, user_id=user_id).first()
        if not conversation:
            return False, "Conversation not found or access denied."

        try:
            db.session.delete(conversation)
            db.session.commit()
            return True, "Conversation deleted successfully."
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to delete conversation: {str(e)}"

    @staticmethod
    def create_or_get_conversation(user_id, conversation_id=None, first_message=""):
        """获取或创建会话。"""
        if conversation_id:
            return Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()

        title = first_message[:50] if first_message else "New Conversation"
        new_conversation = Conversation(user_id=user_id, title=title)
        db.session.add(new_conversation)
        db.session.commit()
        return new_conversation

    @staticmethod
    def add_message(conversation_id, role, content, corrections=None, optimization=None):
        """向会话中添加一条新消息。"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            corrections=corrections,
            optimization=optimization
        )
        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def update_message(message_id, user_id, new_content):
        """编辑用户消息内容。"""
        # 首先获取消息并验证权限
        message = Message.query.join(Conversation).filter(
            Message.id == message_id,
            Conversation.user_id == user_id,
            Message.role == 'user'  # 只允许编辑用户消息
        ).first()
        
        if not message:
            return None, "Message not found or access denied."
        
        if message.is_deleted:
            return None, "Cannot edit a deleted message."
            
        try:
            message.content = new_content
            message.updated_at = datetime.utcnow()
            db.session.commit()
            return message, None
        except Exception as e:
            db.session.rollback()
            return None, f"Failed to update message: {str(e)}"

    @staticmethod
    def delete_message(message_id, user_id):
        """软删除用户消息。"""
        # 获取消息并验证权限
        message = Message.query.join(Conversation).filter(
            Message.id == message_id,
            Conversation.user_id == user_id,
            Message.role == 'user'  # 只允许删除用户消息
        ).first()
        
        if not message:
            return False, "Message not found or access denied."
        
        if message.is_deleted:
            return False, "Message is already deleted."
            
        try:
            message.is_deleted = True
            message.updated_at = datetime.utcnow()
            db.session.commit()
            return True, "Message deleted successfully."
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to delete message: {str(e)}"

    @staticmethod
    def get_message_by_id(message_id, user_id):
        """根据ID获取消息并验证权限。"""
        message = Message.query.join(Conversation).filter(
            Message.id == message_id,
            Conversation.user_id == user_id
        ).first()
        
        if not message:
            return None, "Message not found or access denied."
            
        return message, None

    @staticmethod
    def delete_messages_after(message_id, user_id):
        """删除指定消息之后的所有消息。"""
        try:
            # 首先获取指定消息并验证权限
            message = Message.query.join(Conversation).filter(
                Message.id == message_id,
                Conversation.user_id == user_id
            ).first()
            
            if not message:
                return False, "Message not found or access denied."
            
            conversation_id = message.conversation_id
            
            # 删除该消息之后创建的所有消息
            messages_to_delete = Message.query.filter(
                Message.conversation_id == conversation_id,
                Message.created_at > message.created_at,
                Message.is_deleted == False
            ).all()
            
            for msg in messages_to_delete:
                msg.is_deleted = True
                msg.updated_at = datetime.utcnow()
            
            db.session.commit()
            return True, f"Deleted {len(messages_to_delete)} messages after the specified message."
            
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to delete messages: {str(e)}"
