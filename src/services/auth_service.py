"""
认证服务 - 负责用户认证相关的业务逻辑
"""

import logging
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

from src.models.user import User, db
from src.utils.user_validator import UserValidator

logger = logging.getLogger(__name__)


class AuthService:
    """认证服务类"""

    @staticmethod
    def register_user(username: str, email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        注册新用户
        
        Returns:
            Tuple[bool, str, Optional[Dict]]: (是否成功, 消息, 用户数据)
        """
        try:
            # 检查用户名是否已存在
            if User.query.filter_by(username=username).first():
                return False, "用户名已存在", None

            # 检查邮箱是否已存在
            if User.query.filter_by(email=email).first():
                return False, "邮箱已被注册", None

            # 创建新用户
            new_user = User(username=username, email=email)
            new_user.set_password(password)
            new_user.created_at = datetime.utcnow()
            new_user.updated_at = datetime.utcnow()

            db.session.add(new_user)
            db.session.commit()

            logger.info(f"用户注册成功: {username} ({email})")

            # 返回用户数据（不包含敏感信息）
            user_data = {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'is_active': new_user.is_active,
                'created_at': new_user.created_at.isoformat()
            }

            return True, "注册成功", user_data

        except Exception as e:
            db.session.rollback()
            logger.error(f"用户注册失败: {e}")
            return False, f"注册失败: {str(e)}", None

    @staticmethod
    def authenticate_user(username_or_email: str, password: str) -> Tuple[bool, str, Optional[User]]:
        """
        用户认证
        
        Returns:
            Tuple[bool, str, Optional[User]]: (是否成功, 消息, 用户对象)
        """
        try:
            # 查找用户（支持用户名或邮箱登录）
            if UserValidator.validate_email(username_or_email):
                user = User.query.filter_by(email=username_or_email).first()
            else:
                user = User.query.filter_by(username=username_or_email).first()

            if not user:
                logger.warning(f"登录失败 - 用户不存在: {username_or_email}")
                return False, "用户名或密码错误", None

            if not user.is_active:
                logger.warning(f"登录失败 - 用户已禁用: {username_or_email}")
                return False, "账户已被禁用", None

            if not user.check_password(password):
                logger.warning(f"登录失败 - 密码错误: {username_or_email}")
                return False, "用户名或密码错误", None

            # 更新最后登录时间
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            db.session.commit()

            logger.info(f"用户登录成功: {user.username}")
            return True, "登录成功", user

        except Exception as e:
            logger.error(f"用户认证失败: {e}")
            return False, f"登录失败: {str(e)}", None

    @staticmethod
    def generate_token(user: User) -> str:
        """生成JWT令牌"""
        try:
            return user.generate_token()
        except Exception as e:
            logger.error(f"生成令牌失败: {e}")
            raise

    @staticmethod
    def get_user_profile(user: User) -> Dict[str, Any]:
        """获取用户个人资料"""
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }