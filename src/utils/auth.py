from functools import wraps
from flask import request, jsonify, g
from src.models.user import User
import logging

logger = logging.getLogger(__name__)

def auth_required(f):
    """认证装饰器 - 要求用户登录"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # 从请求头获取令牌
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'success': False, 'error': '缺少认证令牌'}), 401
            
            token = auth_header.split(' ')[1]
            user = User.verify_token(token)
            
            if not user:
                return jsonify({'success': False, 'error': '令牌无效或已过期'}), 401
            
            if not user.is_active:
                return jsonify({'success': False, 'error': '账户已被禁用'}), 403
            
            # 将用户信息存储在全局上下文中
            g.current_user = user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"认证过程中发生错误: {str(e)}")
            return jsonify({'success': False, 'error': '认证失败'}), 500
    
    return decorated_function

def get_current_user():
    """获取当前认证用户"""
    return getattr(g, 'current_user', None)

def get_user_from_token():
    """从请求头中提取用户信息 (可选认证)"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        user = User.verify_token(token)
        
        if user and user.is_active:
            return user
        
        return None
        
    except Exception as e:
        logger.warning(f"可选认证过程中发生错误: {str(e)}")
        return None