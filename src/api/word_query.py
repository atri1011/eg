"""
单词查询API - 重构后的简化版本
"""

import os
from flask import Blueprint, request, jsonify

from src.services.word_query_service import WordQueryService
from src.config.api_config import ApiConfig

word_query_bp = Blueprint("word_query", __name__)


@word_query_bp.route("/query-word", methods=["POST"])
def query_word():
    """单词查询API端点"""
    data = request.get_json()
    word = data.get("word")
    context = data.get("context", "")
    config = data.get("config", {})

    if not word:
        return jsonify({"success": False, "error": "Word is required."}), 400

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("model")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API configuration is incomplete."}), 400

    try:
        # 创建API配置和服务
        api_config = ApiConfig(api_base=api_base, api_key=api_key, model=model)
        word_service = WordQueryService(api_config)
        
        result = word_service.query_word_with_ai(word, context)
        
        if result and "error" not in result:
            return jsonify({"success": True, "result": result})
        else:
            error_msg = result.get("error", "Unknown error") if result else "No result returned"
            return jsonify({"success": False, "error": error_msg}), 500

    except Exception as e:
        return jsonify({"success": False, "error": f"Internal server error: {str(e)}"}), 500


@word_query_bp.route("/analyze-sentence", methods=["POST"])
def analyze_sentence():
    """句子分析API端点"""
    data = request.get_json()
    sentence = data.get("sentence")
    context = data.get("context", "")
    selected_vocab = data.get("selectedVocab", [])
    config = data.get("config", {})

    if not sentence:
        return jsonify({"success": False, "error": "Sentence is required."}), 400

    if not selected_vocab:
        return jsonify({"success": False, "error": "Selected vocabulary is required."}), 400

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("model")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API configuration is incomplete."}), 400

    try:
        # 创建API配置和服务
        api_config = ApiConfig(api_base=api_base, api_key=api_key, model=model)
        word_service = WordQueryService(api_config)
        
        result = word_service.query_with_ai(
            sentence, context, 'sentence-analysis', selected_vocab)
        
        if result and "error" not in result:
            return jsonify({"success": True, "result": result})
        else:
            error_msg = result.get("error", "Unknown error") if result else "No result returned"
            return jsonify({"success": False, "error": error_msg}), 500

    except Exception as e:
        return jsonify({"success": False, "error": f"Internal server error: {str(e)}"}), 500