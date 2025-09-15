from flask import Blueprint, request, jsonify
from src.models.user import User, db
from datetime import datetime
import re
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """验证密码强度 (至少8位，包含字母和数字)"""
    if len(password) < 8:
        return False
    return re.search(r'[A-Za-z]', password) and re.search(r'\d', password)


@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '缺少请求数据'}), 400

        # 获取并验证输入
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({'success': False, 'error': '用户名、邮箱和密码不能为空'}), 400

        # 验证用户名长度
        if len(username) < 2 or len(username) > 50:
            return jsonify({'success': False, 'error': '用户名长度需在2-50个字符之间'}), 400

        # 验证邮箱格式
        if not validate_email(email):
            return jsonify({'success': False, 'error': '邮箱格式不正确'}), 400

        # 验证密码强度
        if not validate_password(password):
            return jsonify({'success': False, 'error': '密码至少需要8位字符，包含字母和数字'}), 400

        # 检查用户名和邮箱是否已存在
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing_user:
            if existing_user.username == username:
                return jsonify({'success': False, 'error': '用户名已存在'}), 409
            else:
                return jsonify({'success': False, 'error': '邮箱已注册'}), 409

        # 创建新用户
        user = User(username=username, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        logger.info(f"新用户注册成功: {username} ({email})")

        # 生成令牌
        token = user.generate_token()

        return jsonify({
            'success': True,
            'message': '注册成功',
            'user': user.to_dict(),
            'token': token
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"注册过程中发生错误: {str(e)}")
        return jsonify({'success': False, 'error': '注册失败，请稍后重试'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '缺少请求数据'}), 400

        # 获取登录凭据 (支持用户名或邮箱登录)
        identifier = data.get('identifier', '').strip().lower()
        password = data.get('password', '')

        if not identifier or not password:
            return jsonify({'success': False, 'error': '用户名/邮箱和密码不能为空'}), 400

        # 查找用户 (通过用户名或邮箱)
        user = User.query.filter(
            (User.username == identifier) | (User.email == identifier)
        ).first()

        if not user or not user.check_password(password):
            return jsonify({'success': False, 'error': '用户名/邮箱或密码错误'}), 401

        if not user.is_active:
            return jsonify({'success': False, 'error': '账户已被禁用'}), 403

        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        db.session.commit()

        # 生成令牌
        token = user.generate_token()

        logger.info(f"用户登录成功: {user.username} ({user.email})")

        return jsonify({
            'success': True,
            'message': '登录成功',
            'user': user.to_dict(),
            'token': token
        }), 200

    except Exception as e:
        logger.error(f"登录过程中发生错误: {str(e)}")
        return jsonify({'success': False, 'error': '登录失败，请稍后重试'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户注销 (客户端处理令牌删除)"""
    return jsonify({
        'success': True,
        'message': '注销成功'
    }), 200


@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """验证令牌有效性"""
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

        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"令牌验证过程中发生错误: {str(e)}")
        return jsonify({'success': False, 'error': '认证失败'}), 500


@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """获取用户资料"""
    try:
        # 从请求头获取令牌
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': '缺少认证令牌'}), 401

        token = auth_header.split(' ')[1]
        user = User.verify_token(token)

        if not user:
            return jsonify({'success': False, 'error': '令牌无效或已过期'}), 401

        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"获取用户资料时发生错误: {str(e)}")
        return jsonify({'success': False, 'error': '获取用户信息失败'}), 500


@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """更新用户资料"""
    try:
        # 从请求头获取令牌
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': '缺少认证令牌'}), 401

        token = auth_header.split(' ')[1]
        user = User.verify_token(token)

        if not user:
            return jsonify({'success': False, 'error': '令牌无效或已过期'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '缺少请求数据'}), 400

        # 更新用户名 (可选)
        new_username = data.get('username', '').strip()
        if new_username and new_username != user.username:
            # 检查用户名是否已被使用
            existing = User.query.filter(
                User.username == new_username, User.id != user.id).first()
            if existing:
                return jsonify({'success': False, 'error': '用户名已存在'}), 409

            if len(new_username) < 2 or len(new_username) > 50:
                return jsonify({'success': False, 'error': '用户名长度需在2-50个字符之间'}), 400

            user.username = new_username

        # 更新密码 (可选)
        new_password = data.get('password')
        if new_password:
            if not validate_password(new_password):
                return jsonify({'success': False, 'error': '密码至少需要8位字符，包含字母和数字'}), 400
            user.set_password(new_password)

        db.session.commit()

        logger.info(f"用户资料更新成功: {user.username}")

        return jsonify({
            'success': True,
            'message': '资料更新成功',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"更新用户资料时发生错误: {str(e)}")
        return jsonify({'success': False, 'error': '更新失败，请稍后重试'}), 500
