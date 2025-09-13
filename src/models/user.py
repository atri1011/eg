from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    conversations = db.relationship('Conversation', backref='user', lazy=True)

    def set_password(self, password):
        """设置密码哈希"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

    def generate_token(self):
        """生成JWT令牌"""
        payload = {
            'user_id': self.id,
            'email': self.email,
            'exp': datetime.utcnow().timestamp() + 24 * 60 * 60  # 24小时过期
        }
        secret_key = os.environ.get('SECRET_KEY', 'fallback-secret')
        return jwt.encode(payload, secret_key, algorithm='HS256')

    @staticmethod
    def verify_token(token):
        """验证JWT令牌"""
        try:
            secret_key = os.environ.get('SECRET_KEY', 'fallback-secret')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
            return None

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
