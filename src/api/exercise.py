from flask import Blueprint, request, jsonify
from src.services.exercise_service import ExerciseService
from src.config.api_config import ApiConfig
import logging

logger = logging.getLogger(__name__)
exercise_bp = Blueprint("exercise_api", __name__)


@exercise_bp.route("/generate-grammar-exercises", methods=["POST"])
def generate_grammar_exercises():
    """生成AI语法练习题"""
    data = request.get_json()
    grammar_point = data.get("grammarPoint")
    config = data.get("config", {})
    settings = data.get("settings", {})

    if not grammar_point or not config:
        return jsonify({"success": False, "error": "Grammar point or config is missing."}), 400

    api_key = config.get("apiKey")
    api_base = config.get("apiBase")
    model = config.get("customModel") or config.get("model")

    if not api_key or not api_base or not model:
        return jsonify({"success": False, "error": "API configuration is incomplete."}), 400

    count = settings.get("count", 10)
    difficulty = settings.get("difficulty", "medium")

    try:
        # 创建API配置对象
        api_config = ApiConfig(api_base=api_base, api_key=api_key, model=model)
        exercise_service = ExerciseService(api_config)
        exercises = exercise_service.generate_exercises(
            grammar_point, count, difficulty)
        return jsonify({
            "success": True,
            "exercises": exercises,
            "count": len(exercises)
        })
    except Exception as e:
        logger.error(f"Failed to generate AI exercises: {e}")
        return jsonify({"success": False, "error": f"Failed to generate exercises: {str(e)}"}), 500


@exercise_bp.route("/verify-grammar-answer", methods=["POST"])
def verify_grammar_answer():
    """验证用户提交的语法练习答案"""
    data = request.get_json()
    user_answer = data.get("userAnswer", "")
    correct_answer = data.get("correctAnswer", "")

    if not user_answer or not correct_answer:
        return jsonify({"success": False, "error": "Answer information is missing."}), 400

    is_correct = ExerciseService.verify_answer(user_answer, correct_answer)

    return jsonify({
        "success": True,
        "is_correct": is_correct
    })
