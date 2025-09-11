import os
import requests
from flask import Blueprint, request, jsonify
import json

word_query_bp = Blueprint("word_query", __name__)

def build_word_query_prompt(word, context, language_preference='bilingual'):
    """构建单词查询的系统提示"""
    return f"""你是一个专业的英语词汇助手。用户询问单词"{word}"，上下文是："{context}"

请根据这个上下文提供以下信息：

1. 单词的音标（如果有的话）
2. 在此上下文中最合适的词性
3. 在此上下文中最准确的中文释义
4. 2-3个相关的例句，包括中文翻译

请以JSON格式返回，格式如下：
{{
  "word": "{word}",
  "phonetic": "音标（如：/ˈeksəmpl/）",
  "partOfSpeech": "词性（如：n., v., adj.等）",
  "definition": "英文释义",
  "translation": "中文翻译",
  "examples": [
    {{
      "sentence": "英文例句",
      "translation": "中文翻译"
    }}
  ]
}}

注意：
- 请根据上下文提供最准确的释义
- 例句应该与上下文相关
- 确保返回的是有效的JSON格式"""

def query_word_with_ai(word, context, api_base, api_key, model):
    """使用AI API查询单词"""
    url = f"{api_base}/chat/completions"
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': model,
        'messages': [
            {
                'role': 'system',
                'content': build_word_query_prompt(word, context)
            },
            {
                'role': 'user',
                'content': f'请查询单词"{word}"在以下上下文中的详细信息：{context}'
            }
        ],
        'temperature': 0.7,
        'max_tokens': 1000
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' in result and len(result['choices']) > 0:
            content = result['choices'][0]['message']['content']
            
            # 尝试解析JSON响应
            try:
                # 清理可能的markdown格式
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0]
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0]
                
                word_info = json.loads(content.strip())
                return word_info
            except json.JSONDecodeError:
                # 如果JSON解析失败，返回基本信息
                return {
                    "word": word,
                    "definition": content,
                    "translation": "解析失败，请重试"
                }
        else:
            return {"error": "API返回格式异常"}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"API请求失败: {str(e)}"}
    except Exception as e:
        return {"error": f"处理失败: {str(e)}"}

@word_query_bp.route('/word-query', methods=['POST'])
def word_query():
    """单词查询API端点"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': '请求数据为空'}), 400
        
        word = data.get('word', '').strip()
        context = data.get('context', '').strip()
        config = data.get('config', {})
        
        if not word:
            return jsonify({'success': False, 'error': '单词不能为空'}), 400
        
        # 获取API配置
        api_base = config.get('apiBase', '').strip()
        api_key = config.get('apiKey', '').strip()
        model = config.get('customModel', '').strip() or config.get('model', 'gpt-3.5-turbo')
        
        if not api_base or not api_key:
            return jsonify({
                'success': False, 
                'error': 'API配置不完整，请在设置中配置API密钥和服务器地址'
            }), 400
        
        # 查询单词信息
        result = query_word_with_ai(word, context, api_base, api_key, model)
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'服务器错误: {str(e)}'}), 500