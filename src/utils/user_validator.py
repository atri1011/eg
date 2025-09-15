"""
用户验证器 - 负责用户输入验证
"""

import re
from typing import Tuple, Optional


class UserValidator:
    """用户数据验证器"""

    @staticmethod
    def validate_email(email: str) -> bool:
        """验证邮箱格式"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_password(password: str) -> bool:
        """验证密码强度 (至少8位，包含字母和数字)"""
        if not password or len(password) < 8:
            return False
        return re.search(r'[A-Za-z]', password) and re.search(r'\d', password)

    @staticmethod
    def validate_username(username: str) -> bool:
        """验证用户名 (3-20位，只能包含字母、数字和下划线)"""
        if not username:
            return False
        if len(username) < 3 or len(username) > 20:
            return False
        return re.match(r'^[a-zA-Z0-9_]+$', username) is not None

    @staticmethod
    def validate_registration_data(data: dict) -> Tuple[bool, Optional[str]]:
        """验证注册数据"""
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        # 检查必填字段
        if not username or not email or not password:
            return False, "用户名、邮箱和密码都是必填项"

        # 验证用户名
        if not UserValidator.validate_username(username):
            return False, "用户名必须是3-20位字符，只能包含字母、数字和下划线"

        # 验证邮箱
        if not UserValidator.validate_email(email):
            return False, "邮箱格式不正确"

        # 验证密码
        if not UserValidator.validate_password(password):
            return False, "密码必须至少8位，包含字母和数字"

        return True, None

    @staticmethod
    def validate_login_data(data: dict) -> Tuple[bool, Optional[str]]:
        """验证登录数据"""
        # 支持多种字段名
        username_or_email = (
            data.get('identifier', '').strip() or  # 前端使用的字段名
            data.get('username', '').strip() or 
            data.get('email', '').strip() or
            data.get('usernameOrEmail', '').strip() or
            data.get('login', '').strip()
        )
        
        password = data.get('password', '')

        if not username_or_email or not password:
            return False, "用户名/邮箱和密码都是必填项"

        return True, None