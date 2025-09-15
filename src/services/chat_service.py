import requests
import logging
from typing import List, Dict
from src.services.conversation_service import ConversationService
from src.services.translation_client import TranslationClient
from src.config.prompts import build_system_prompt
from ..config.api_config import ApiConfig, ApiConfigFactory

logger = logging.getLogger(__name__)


class ChatService:
    """编排聊天流程的服务"""

    def __init__(self, api_config: ApiConfig):
        self.api_config = api_config
        self.translation_client = TranslationClient(api_config)

    def process_chat_message(self, user_id: int, user_message: str, conversation_id: int = None, language_preference: str = 'en'):
        """
        处理用户聊天消息的完整流程。
        1. 获取或创建会话。
        2. 获取历史消息作为上下文。
        3. 处理用户输入（带上下文的翻译和语法纠错）。
        4. 保存用户消息。
        5. 获取历史消息并请求 AI。
        6. 保存 AI 回复。
        """
        # 1. 获取或创建会话
        conversation = ConversationService.create_or_get_conversation(
            user_id, conversation_id, user_message)

        # 2. 获取历史消息作为上下文（在处理用户输入前）
        messages_history, error = ConversationService.get_messages_by_conversation_id(
            conversation.id, user_id)
        if error:
            raise Exception(error)

        # 构建对话历史用于上下文感知
        conversation_context = []
        if messages_history:
            for msg in messages_history:
                conversation_context.append({
                    'role': msg.role,
                    'content': msg.content
                })

        # 3. 处理用户输入（带上下文感知）
        message_for_ai, grammar_correction_result, optimization_result = self.translation_client.process_user_input(
            user_message, conversation_context)

        # 4. 保存用户消息
        ConversationService.add_message(
            conversation_id=conversation.id,
            role='user',
            content=user_message,
            corrections=grammar_correction_result,
            optimization=optimization_result
        )

        # 5. 重新获取包含新用户消息的历史消息并发送给AI
        messages_history, error = ConversationService.get_messages_by_conversation_id(
            conversation.id, user_id)
        if error:
            raise Exception(error)

        messages_for_api = [{"role": msg.role, "content": msg.content}
                            for msg in messages_history]
        system_prompt = build_system_prompt(language_preference)
        ai_response_content = self._send_chat_request(
            messages_for_api, system_prompt)

        # 6. 保存AI回复
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
        headers = self.api_config.get_headers()

        chat_payload = self.api_config.get_request_payload([
            {"role": "system", "content": system_prompt},
            *messages
        ], max_tokens=100000)

        try:
            chat_response = requests.post(
                self.api_config.chat_completions_url, headers=headers, json=chat_payload, timeout=30)
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
