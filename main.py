import os
import sys
from dotenv import load_dotenv

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env file
load_dotenv()

# Apply network connectivity fixes BEFORE any imports that might use network
from src.utils.network_fix import apply_network_fixes, resolve_database_url_to_ipv4
apply_network_fixes()

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models import db
from src.api.user import user_bp
from src.api.auth import auth_bp
from src.api.chat import chat_bp
from src.api.exercise import exercise_bp
from src.api.models import models_bp
from src.api.word_query import word_query_bp
import logging

# 根据环境设置日志级别
if os.environ.get('VERCEL_ENV'):
    logging.basicConfig(level=logging.WARNING)
else:
    logging.basicConfig(level=logging.INFO)

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# 环境配置
ENVIRONMENT = os.environ.get('VERCEL_ENV', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

# Use SECRET_KEY from environment variables with fallback
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError("SECRET_KEY environment variable is required in production")
    # Use a more secure fallback key for development
    SECRET_KEY = 'dev-key-' + os.urandom(24).hex()
    
app.config['SECRET_KEY'] = SECRET_KEY

# 生产环境配置
if IS_PRODUCTION:
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
else:
    app.config['DEBUG'] = True

# 启用CORS支持
CORS(app, 
     origins=['*'] if not IS_PRODUCTION else ['https://*.vercel.app', 'https://your-domain.com'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(exercise_bp, url_prefix='/api')
app.register_blueprint(models_bp, url_prefix='/api')
app.register_blueprint(word_query_bp, url_prefix='/api')

# 应用数据库配置
from src.config.database_config import DatabaseConfig
db_config = DatabaseConfig(ENVIRONMENT)
db_config.configure_app(app)

db.init_app(app)

# 健康检查端点
@app.route('/api/health')
def health_check():
    try:
        # 测试数据库连接
        with app.app_context():
            db.session.execute(db.text('SELECT 1'))
            db.session.commit()
        return jsonify({
            'status': 'healthy',
            'environment': ENVIRONMENT,
            'database': 'connected'
        }), 200
    except Exception as e:
        app.logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e) if not IS_PRODUCTION else 'Database connection failed'
        }), 503

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # 在生产环境中，静态文件由Vercel的CDN处理
    # 这个路由主要用于开发环境和SPA路由
    if IS_PRODUCTION:
        # 生产环境中，让Vercel处理静态文件
        return "This endpoint should be handled by Vercel routing", 404
        
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# 全局错误处理
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    if IS_PRODUCTION:
        return jsonify({'error': 'Internal server error'}), 500
    else:
        return jsonify({'error': str(error)}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    if IS_PRODUCTION:
        return jsonify({'error': 'An unexpected error occurred'}), 500
    else:
        return jsonify({'error': str(e)}), 500

def create_tables_and_default_user():
    """在应用上下文中创建数据库表和默认用户。"""
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully.")

            # 创建默认用户
            from src.models.user import User
            if not User.query.filter_by(id=1).first():
                default_user = User(id=1, username='default_user', email='default@example.com')
                default_user.set_password('default123')
                db.session.add(default_user)
                db.session.commit()
                app.logger.info("Default user created successfully.")
            else:
                app.logger.info("Default user already exists.")

        except Exception as e:
            app.logger.error(f"Failed to create database tables or default user: {str(e)}")
            if IS_PRODUCTION:
                raise

# 在应用启动时调用
create_tables_and_default_user()

if __name__ == '__main__':
    # 只在直接运行时使用（开发环境）
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=not IS_PRODUCTION, host='0.0.0.0', port=port)