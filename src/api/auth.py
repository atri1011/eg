"""
认证API - 完整功能版本
"""

from flask import Blueprint, request, jsonify
import logging
import jwt
import os
from datetime import datetime, timedelta

from src.services.auth_service import AuthService
from src.utils.user_validator import UserValidator
from src.models.user import User

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


def safe_get_field(data, field_names):
    """安全获取字段值，支持多个字段名"""
    for field in field_names:
        value = data.get(field, '').strip()
        if value:
            return value
    return ''


@auth_bp.route('/test', methods=['GET'])
def test():
    """测试路由"""
    return jsonify({'message': 'Auth API is working', 'success': True})


@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """验证JWT令牌"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': '缺少或无效的Authorization头'}), 401

        token = auth_header.split(' ')[1]
        
        try:
            # 验证JWT令牌
            secret_key = os.environ.get('SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            if not user_id:
                return jsonify({'success': False, 'error': '令牌格式无效'}), 401
            
            # 查找用户
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'success': False, 'error': '用户不存在或已禁用'}), 401
            
            # 返回用户信息
            user_data = AuthService.get_user_profile(user)
            return jsonify({
                'success': True,
                'user': user_data
            })
            
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': '令牌无效'}), 401

    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return jsonify({'success': False, 'error': '令牌验证失败'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '请提供有效的JSON数据'}), 400

        # 验证输入数据
        is_valid, error_msg = UserValidator.validate_login_data(data)
        if not is_valid:
            return jsonify({'success': False, 'error': error_msg}), 400

        # 获取用户名/邮箱和密码
        username_or_email = safe_get_field(data, ['identifier', 'username', 'email', 'usernameOrEmail', 'login'])
        password = data.get('password', '')

        # 用户认证
        success, message, user = AuthService.authenticate_user(username_or_email, password)
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400

        # 生成JWT令牌
        token = AuthService.generate_token(user)
        user_data = AuthService.get_user_profile(user)

        return jsonify({
            'success': True,
            'message': message,
            'token': token,
            'user': user_data
        })

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'error': f'登录失败: {str(e)}'}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '请提供有效的JSON数据'}), 400

        # 验证输入数据
        is_valid, error_msg = UserValidator.validate_registration_data(data)
        if not is_valid:
            return jsonify({'success': False, 'error': error_msg}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        # 用户注册
        success, message, user_data = AuthService.register_user(username, email, password)
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400

        # 为新注册用户生成令牌
        user = User.query.filter_by(username=username).first()
        token = AuthService.generate_token(user)

        return jsonify({
            'success': True,
            'message': message,
            'token': token,
            'user': user_data
        })

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'success': False, 'error': f'注册失败: {str(e)}'}), 500