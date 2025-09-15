import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional, Dict, Tuple, List

from .translation_core import TranslationCore
from .grammar_correction import GrammarCorrection
from .cet4_optimization import CET4Optimization
from ..config.api_config import ApiConfig

logger = logging.getLogger(__name__)


class TranslationClient:
    """
    翻译服务客户端 - 整合所有翻译相关功能
    负责协调翻译、语法纠错、CET4优化等服务
    """

    def __init__(self, api_config: ApiConfig):
        self.translation_core = TranslationCore(api_config)
        self.grammar_correction = GrammarCorrection(api_config)
        self.cet4_optimization = CET4Optimization(api_config)

    def is_chinese_text(self, text: str) -> bool:
        """检测文本是否主要是中文"""
        return self.translation_core.is_chinese_text(text)

    def process_user_input_parallel(self, user_message: str) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        并行处理用户输入：同时进行翻译/纠错和优化
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        print(f"[DEBUG] 开始并行处理用户输入: {user_message}")
        
        grammar_correction_result = None
        optimization_result = None
        message_for_ai = user_message
        
        try:
            # 使用线程池并行处理
            with ThreadPoolExecutor(max_workers=2) as executor:
                futures = []
                
                # 1. 提交翻译/语法纠错任务
                if self.is_chinese_text(user_message):
                    print(f"[DEBUG] 检测到纯中文输入，提交翻译任务")
                    future_translation = executor.submit(
                        self.translation_core.get_translation_from_chinese, 
                        user_message
                    )
                    futures.append(("translation", future_translation))
                else:
                    print(f"[DEBUG] 检测到英文或中英混合输入，提交语法纠错任务")
                    future_grammar = executor.submit(
                        self.grammar_correction.get_detailed_corrections, 
                        user_message
                    )
                    futures.append(("grammar", future_grammar))
                
                # 2. 提交CET4优化任务
                future_optimization = executor.submit(
                    self.cet4_optimization.optimize_for_cet4, 
                    user_message
                )
                futures.append(("optimization", future_optimization))
                
                # 3. 收集结果
                for task_type, future in futures:
                    try:
                        result = future.result()
                        if task_type == "translation" and result:
                            grammar_correction_result = result
                            message_for_ai = result.get("corrected_sentence", user_message)
                        elif task_type == "grammar" and result:
                            grammar_correction_result = result
                            corrected = result.get("corrected_sentence", user_message)
                            original = result.get("original_sentence", user_message)
                            if corrected != original:
                                message_for_ai = corrected
                        elif task_type == "optimization" and result:
                            optimization_result = result
                            # 优化结果用于最终的AI对话
                            message_for_ai = result.get("optimized_sentence", message_for_ai)
                            
                    except Exception as e:
                        print(f"[ERROR] {task_type} 任务执行失败: {e}")
            
            print(f"[DEBUG] 并行处理完成，最终消息: {message_for_ai}")
            return message_for_ai, grammar_correction_result, optimization_result
            
        except Exception as e:
            print(f"[ERROR] 并行处理失败: {e}")
            return user_message, None, None

    def process_user_input_with_context(self, user_message: str, conversation_history: List[Dict] = None) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        处理用户输入，带上下文感知的优化
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        print(f"[DEBUG] 开始上下文感知处理用户输入: {user_message}")
        print(f"[DEBUG] 对话历史条数: {len(conversation_history) if conversation_history else 0}")
        
        grammar_correction_result = None
        optimization_result = None
        message_for_ai = user_message
        
        # 构建上下文信息
        context_info = self._build_context_info(conversation_history)
        
        try:
            # 使用线程池并行处理
            with ThreadPoolExecutor(max_workers=2) as executor:
                futures = []
                
                # 1. 提交翻译/语法纠错任务
                if self.is_chinese_text(user_message):
                    print(f"[DEBUG] 检测到纯中文输入，提交上下文翻译任务")
                    future_translation = executor.submit(
                        self.translation_core.translate_with_context, 
                        user_message, context_info
                    )
                    futures.append(("translation", future_translation))
                else:
                    print(f"[DEBUG] 检测到英文或中英混合输入，提交上下文语法纠错任务")
                    future_grammar = executor.submit(
                        self.grammar_correction.get_context_aware_corrections, 
                        user_message, context_info
                    )
                    futures.append(("grammar", future_grammar))
                
                # 2. 提交上下文感知CET4优化任务
                future_optimization = executor.submit(
                    self.cet4_optimization.optimize_with_context, 
                    user_message, context_info
                )
                futures.append(("optimization", future_optimization))
                
                # 3. 收集结果
                for task_type, future in futures:
                    try:
                        result = future.result()
                        if task_type == "translation" and result:
                            # 翻译结果需要包装成纠错格式
                            grammar_correction_result = {
                                "original_sentence": user_message,
                                "corrected_sentence": result,
                                "overall_comment": "中文翻译成功，已根据对话上下文优化",
                                "corrections": [
                                    {
                                        "type": "translation",
                                        "original": user_message,
                                        "corrected": result,
                                        "explanation": f"将中文句子 '{user_message}' 翻译成适合当前对话语境的英文"
                                    }
                                ]
                            }
                            message_for_ai = result
                        elif task_type == "grammar" and result:
                            grammar_correction_result = result
                            corrected = result.get("corrected_sentence", user_message)
                            original = result.get("original_sentence", user_message)
                            if corrected != original:
                                message_for_ai = corrected
                        elif task_type == "optimization" and result:
                            optimization_result = result
                            # 优化结果用于最终的AI对话
                            message_for_ai = result.get("optimized_sentence", message_for_ai)
                            
                    except Exception as e:
                        print(f"[ERROR] {task_type} 任务执行失败: {e}")
            
            print(f"[DEBUG] 上下文感知处理完成，最终消息: {message_for_ai}")
            return message_for_ai, grammar_correction_result, optimization_result
            
        except Exception as e:
            print(f"[ERROR] 上下文感知处理失败: {e}")
            return user_message, None, None

    def process_user_input(self, user_message: str, conversation_history: List[Dict] = None) -> Tuple[str, Optional[Dict], Optional[Dict]]:
        """
        处理用户输入 - 新版本支持上下文感知
        返回: (处理后的消息, 纠错结果, 优化结果)
        """
        # 如果有对话历史，使用上下文感知版本
        if conversation_history and len(conversation_history) > 0:
            return self.process_user_input_with_context(user_message, conversation_history)
        else:
            # 对话开始时使用原版本
            return self.process_user_input_parallel(user_message)

    def get_detailed_corrections(self, text: str) -> Optional[Dict]:
        """获取详细的语法纠错结果"""
        return self.grammar_correction.get_detailed_corrections(text)

    def get_cet4_detailed_analysis(self, text: str) -> Optional[Dict]:
        """获取详细的CET4分析结果"""
        return self.cet4_optimization.get_detailed_analysis(text)

    def _build_context_info(self, conversation_history: List[Dict] = None) -> str:
        """
        构建对话上下文信息字符串
        """
        if not conversation_history or len(conversation_history) == 0:
            return "当前是对话开始，没有历史上下文。"
        
        # 取最近的几轮对话作为上下文（最多5轮）
        recent_messages = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
        
        context_parts = []
        context_parts.append(f"对话历史（最近{len(recent_messages)}条消息）：")
        
        for i, msg in enumerate(recent_messages):
            role = "用户" if msg.get('role') == 'user' else "AI助手"
            content = msg.get('content', '')[:100]  # 限制每条消息长度
            context_parts.append(f"{i+1}. {role}: {content}")
        
        # 分析对话主题
        if len(recent_messages) >= 2:
            topics = []
            for msg in recent_messages:
                content = msg.get('content', '').lower()
                # 简单的主题识别
                if any(word in content for word in ['study', 'learn', 'school', 'exam', 'book']):
                    topics.append('学习')
                elif any(word in content for word in ['travel', 'trip', 'vacation', 'visit']):
                    topics.append('旅行')
                elif any(word in content for word in ['work', 'job', 'career', 'office']):
                    topics.append('工作')
                elif any(word in content for word in ['food', 'eat', 'restaurant', 'cook']):
                    topics.append('美食')
                elif any(word in content for word in ['movie', 'film', 'music', 'book', 'art']):
                    topics.append('娱乐')
            
            if topics:
                main_topic = max(set(topics), key=topics.count)
                context_parts.append(f"\n主要话题: {main_topic}")
        
        context_parts.append(f"\n对话语气: {'正式' if len(recent_messages) > 0 and '您' in str(recent_messages) else '友好轻松'}")
        
        return "\n".join(context_parts)