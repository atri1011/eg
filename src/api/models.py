from flask import Blueprint, request, jsonify
from src.services.api_provider_service import ApiProviderService
import logging

logger = logging.getLogger(__name__)
models_bp = Blueprint("models_api", __name__)


@models_bp.route("/models", methods=["GET"])
def get_models():
    """获取可用模型列表的API端点"""
    api_key = request.args.get("apiKey")
    api_base = request.args.get("apiBase", "https://api.openai.com/v1")

    if not api_key:
        return jsonify({"success": False, "error": "API Key is missing."}), 400

    try:
        result = ApiProviderService.get_models(api_base, api_key)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Failed to get model list: {e}")
        return jsonify({"success": False, "error": f"Failed to get model list: {str(e)}"}), 500
