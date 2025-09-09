from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import openai
import re
import json

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """处理AI聊天请求"""
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
        api_base = config.get('apiBase', 'https://api.openai.com/v1')
        model = config.get('model', 'gpt-3.5-turbo')
        language_preference = config.get('languagePreference', 'bilingual')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': '请配置API Key'
            }), 400
        
        # 配置OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=api_base
        )
        
        # 构建系统提示
        system_prompt = build_system_prompt(language_preference)
        
        # 调用AI API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        ai_response = response.choices[0].message.content
        
        # 检查语法错误
        grammar_corrections = check_grammar(message, client, model)
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'grammar_corrections': grammar_corrections
        })
        
    except openai.APIError as e:
        return jsonify({
            'success': False,
            'error': f'API错误: {str(e)}'
        }), 500
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
        config = data.get('config', {})
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': '文本不能为空'
            }), 400
            
        api_key = config.get('apiKey', '')
        api_base = config.get('apiBase', 'https://api.openai.com/v1')
        model = config.get('model', 'gpt-3.5-turbo')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': '请配置API Key'
            }), 400
        
        # 配置OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=api_base
        )
        
        # 检查语法错误
        grammar_corrections = check_grammar(text, client, model)
        
        return jsonify({
            'success': True,
            'grammar_corrections': grammar_corrections
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

def build_system_prompt(language_preference):
    """构建系统提示"""
    base_prompt = """你是一个专业的英语学习助手。用户会发送英语句子给你，你需要：

1. 如果句子有语法错误，先指出并纠正
2. 然后基于用户的句子进行自然的对话回应
3. 帮助用户提高英语水平

请注意：
- 保持友好和鼓励的语气
- 提供实用的学习建议
- 如果句子完全正确，要给予肯定"""

    if language_preference == 'bilingual':
        return base_prompt + "\n\n请使用中英双语回复，先用中文解释，然后用英文对话。"
    elif language_preference == 'chinese':
        return base_prompt + "\n\n请主要使用中文回复，适当加入英文例句。"
    elif language_preference == 'english':
        return base_prompt + "\n\n请主要使用英文回复，必要时可以用中文解释复杂概念。"
    else:
        return base_prompt + "\n\n请使用中英双语回复。"

def check_grammar(text, client, model):
    """检查语法错误"""
    try:
        grammar_prompt = f"""请检查以下英语句子的语法错误，如果有错误，请按照以下JSON格式返回：

[
  {{
    "original": "错误的部分",
    "corrected": "修正后的部分", 
    "explanation": "错误说明"
  }}
]

如果没有语法错误，请返回空数组 []

要检查的句子：{text}"""

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": grammar_prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        result = response.choices[0].message.content.strip()
        
        # 尝试解析JSON
        try:
            # 提取JSON部分
            json_match = re.search(r'\[.*\]', result, re.DOTALL)
            if json_match:
                corrections = json.loads(json_match.group())
                return corrections if isinstance(corrections, list) else []
            else:
                return []
        except json.JSONDecodeError:
            return []
            
    except Exception as e:
        print(f"语法检查错误: {e}")
        return []

@chat_bp.route('/config', methods=['GET'])
@cross_origin()
def get_config():
    """获取配置（这里可以扩展为从数据库读取用户配置）"""
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
    """保存配置（这里可以扩展为保存到数据库）"""
    try:
        data = request.json
        # 这里可以添加配置验证和保存逻辑
        return jsonify({
            'success': True,
            'message': '配置保存成功'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'保存配置失败: {str(e)}'
        }), 500

