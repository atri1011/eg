from flask import g, request
from src.models.user import User
import logging

logger = logging.getLogger(__name__)


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
