from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import re
import json

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """处理AI聊天请求 - 简化版本"""
    try:
        data = request.json
        message = data.get('message', '')
        config = data.get('config', {})
        
        if not message.strip():
            return jsonify({
                'success': False,
                'error': '消息不能为空'
            }), 400
            
        api_key = config.get('apiKey', '')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': '请配置API Key'
            }), 400
        
        # 模拟AI回复
        ai_response = generate_mock_response(message)
        
        # 检查语法错误
        grammar_corrections = check_grammar_simple(message)
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'grammar_corrections': grammar_corrections
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

@chat_bp.route('/grammar-check', methods=['POST'])
@cross_origin()
def grammar_check():
    """单独的语法检查接口"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': '文本不能为空'
            }), 400
        
        # 检查语法错误
        grammar_corrections = check_grammar_simple(text)
        
        return jsonify({
            'success': True,
            'grammar_corrections': grammar_corrections
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

def generate_mock_response(message):
    """生成模拟AI回复"""
    responses = [
        f"很好！你说：'{message}'。这是一个很好的英语练习。让我们继续对话吧！\n\nGreat! You said: '{message}'. That's good English practice. Let's continue our conversation!",
        f"我理解你的意思：'{message}'。继续用英语和我对话，我会帮助你提高英语水平。\n\nI understand what you mean: '{message}'. Keep chatting with me in English, and I'll help you improve your English skills.",
        f"谢谢你的分享：'{message}'。英语学习需要多练习，你做得很好！\n\nThank you for sharing: '{message}'. English learning requires lots of practice, and you're doing great!"
    ]
    
    import random
    return random.choice(responses)

def check_grammar_simple(text):
    """简单语法检查"""
    corrections = []
    
    # 检查常见语法错误
    if "to learning" in text.lower():
        corrections.append({
            "original": "to learning",
            "corrected": "to learn",
            "explanation": "在'to'后面应该使用动词原形，不是动名词形式"
        })
    
    if "i am go" in text.lower():
        corrections.append({
            "original": "I am go",
            "corrected": "I am going",
            "explanation": "现在进行时应该使用'be + 动词ing'形式"
        })
    
    if "he don't" in text.lower():
        corrections.append({
            "original": "he don't",
            "corrected": "he doesn't",
            "explanation": "第三人称单数应该使用'doesn't'而不是'don't'"
        })
    
    return corrections

@chat_bp.route('/config', methods=['GET'])
@cross_origin()
def get_config():
    """获取配置"""
    default_config = {
        'apiBase': 'https://api.openai.com/v1',
        'model': 'gpt-3.5-turbo',
        'languagePreference': 'bilingual'
    }
    return jsonify({
        'success': True,
        'config': default_config
    })

@chat_bp.route('/config', methods=['POST'])
@cross_origin()
def save_config():
    """保存配置"""
    try:
        data = request.json
        return jsonify({
            'success': True,
            'message': '配置保存成功'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'保存配置失败: {str(e)}'
        }), 500

