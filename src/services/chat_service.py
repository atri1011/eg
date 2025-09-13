import requests
import logging
from typing import List, Dict
from src.models.user import db, Conversation, Message

logger = logging.getLogger(__name__)

class ChatService:
    """聊天服务"""
    
    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base
        self.api_key = api_key
        self.model = model
        self.chat_completions_url = f"{api_base}/chat/completions"

    def send_chat_request(self, messages: List[Dict], system_prompt: str) -> str:
        """发送聊天请求到AI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        chat_payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                *messages
            ],
            "max_tokens": 100000
        }

        try:
            chat_response = requests.post(self.chat_completions_url, headers=headers, json=chat_payload, timeout=30)
            chat_response.raise_for_status()
            chat_result = chat_response.json()
            ai_response_content = chat_result["choices"][0]["message"]["content"].strip()
            print(f"[DEBUG] 从API获取的AI回复: {ai_response_content}")
            return ai_response_content
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"无法连接到API服务器或API请求失败: {str(e)}")
        except Exception as e:
            raise Exception(f"聊天服务发生错误: {str(e)}")

    def save_user_message(self, conversation: Conversation, content: str, corrections=None) -> Message:
        """保存用户消息到数据库"""
        user_msg_obj = Message(
            conversation_id=conversation.id, 
            role='user', 
            content=content, 
            corrections=corrections
        )
        db.session.add(user_msg_obj)
        db.session.commit()
        print(f"[DEBUG] 用户消息已保存到数据库 (消息ID: {user_msg_obj.id})")
        return user_msg_obj

    def save_ai_message(self, conversation: Conversation, content: str) -> Message:
        """保存AI回复到数据库"""
        try:
            ai_msg_obj = Message(
                conversation_id=conversation.id, 
                role='assistant', 
                content=content
            )
            db.session.add(ai_msg_obj)
            db.session.commit()
            print(f"[DEBUG] AI回复已保存到数据库 (消息ID: {ai_msg_obj.id})")
            return ai_msg_obj
        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] 保存AI回复失败: {e}")
            raise e

    def get_conversation_messages(self, conversation_id: int) -> List[Dict]:
        """获取会话的历史消息"""
        history_messages = Message.query.filter_by(
            conversation_id=conversation_id
        ).order_by(Message.created_at.asc()).all()
        
        messages_for_api = [
            {"role": msg.role, "content": msg.content} 
            for msg in history_messages
        ]
        return messages_for_api

    def create_or_get_conversation(self, user_id: int, conversation_id: int = None, title: str = None) -> Conversation:
        """创建新会话或获取现有会话"""
        if conversation_id:
            conversation = Conversation.query.filter_by(
                id=conversation_id, 
                user_id=user_id
            ).first()
            if not conversation:
                raise Exception('Conversation not found or access denied')
            return conversation
        else:
            conversation = Conversation(
                user_id=user_id, 
                title=title[:50] if title else "新对话"
            )
            db.session.add(conversation)
            db.session.flush()
            print(f"[DEBUG] 创建新会话，ID: {conversation.id}")
            return conversation