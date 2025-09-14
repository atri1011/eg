import requests
import logging
from typing import List, Dict
from src.services.conversation_service import ConversationService
from src.services.translation_service import TranslationService
from src.config.prompts import build_system_prompt

logger = logging.getLogger(__name__)


class ChatService:
    """编排聊天流程的服务"""

    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base
        self.api_key = api_key
        self.model = model
        self.chat_completions_url = f"{api_base}/chat/completions"
        self.translation_service = TranslationService(api_base, api_key, model)

    def process_chat_message(self, user_id: int, user_message: str, conversation_id: int = None, language_preference: str = 'en'):
        """
        处理用户聊天消息的完整流程。
        1. 处理用户输入（翻译和语法纠错）。
        2. 获取或创建会话。
        3. 保存用户消息。
        4. 获取历史消息并请求 AI。
        5. 保存 AI 回复。
        """
        # 1. 处理用户输入
        message_for_ai, grammar_correction_result, optimization_result = self.translation_service.process_user_input(
            user_message)

        # 2. 获取或创建会话
        conversation = ConversationService.create_or_get_conversation(
            user_id, conversation_id, user_message)

        # 3. 保存用户消息
        ConversationService.add_message(
            conversation_id=conversation.id,
            role='user',
            content=user_message,
            corrections=grammar_correction_result,
            optimization=optimization_result
        )

        # 4. 获取历史消息并发送给AI
        messages_history, error = ConversationService.get_messages_by_conversation_id(
            conversation.id, user_id)
        if error:
            raise Exception(error)

        messages_for_api = [{"role": msg.role, "content": msg.content}
                            for msg in messages_history]
        system_prompt = build_system_prompt(language_preference)
        ai_response_content = self._send_chat_request(
            messages_for_api, system_prompt)

        # 5. 保存AI回复
        ConversationService.add_message(
            conversation_id=conversation.id,
            role='assistant',
            content=ai_response_content
        )

        return {
            "response": ai_response_content,
            "grammar_corrections": grammar_correction_result,
            "optimization": optimization_result,
            "conversation_id": conversation.id
        }

    def _send_chat_request(self, messages: List[Dict], system_prompt: str) -> str:
        """发送聊天请求到AI API（内部方法）"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        chat_payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                *messages
            ],
            "max_tokens": 100000
        }

        try:
            chat_response = requests.post(
                self.chat_completions_url, headers=headers, json=chat_payload, timeout=30)
            chat_response.raise_for_status()
            chat_result = chat_response.json()
            ai_response_content = chat_result["choices"][0]["message"]["content"].strip(
            )
            logger.info(f"Successfully received AI response.")
            return ai_response_content

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise Exception(
                f"Failed to connect to API server or API request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Chat service error: {e}")
            raise Exception(f"An error occurred in the chat service: {str(e)}")
