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
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.chat_real import chat_bp
from src.routes.word_query import word_query_bp
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
app.register_blueprint(word_query_bp, url_prefix='/api')

# Enhanced database URL processing for IPv4 compatibility
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    if IS_PRODUCTION:
        app.logger.error("DATABASE_URL environment variable is missing in production")
        raise RuntimeError("DATABASE_URL environment variable is required in production")
    database_url = 'sqlite:///database/app.db'

if database_url:
    app.logger.info(f"Processing database URL for environment: {ENVIRONMENT}")
    
    # Apply IPv4 resolution for PostgreSQL connections
    if database_url.startswith(('postgres://', 'postgresql://')):
        database_url = resolve_database_url_to_ipv4(database_url)
    
    # Convert relative database path to absolute path for SQLite
    elif database_url.startswith('sqlite:///'):
        db_path = database_url.replace('sqlite:///', '')
        if not os.path.isabs(db_path):
            project_root = os.path.dirname(os.path.abspath(__file__))
            absolute_db_path = os.path.join(project_root, db_path)
            database_url = f'sqlite:///{absolute_db_path}'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 生产环境数据库连接池配置
if IS_PRODUCTION and database_url.startswith(('postgres', 'postgresql')):
    # 强制使用 Supabase 连接池来避免 IPv6 问题
    if 'supabase.co' in database_url:
        # 修改为连接池端口 (6543) 而不是直连端口 (5432)
        database_url = database_url.replace(':5432/', ':6543/')
        app.logger.info("Using Supabase connection pooler (IPv4) instead of direct connection")
    
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 3,  # 减少连接数适配连接池
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'max_overflow': 5,
        'pool_timeout': 30,
        'connect_args': {
            'sslmode': 'require',
            'connect_timeout': 15
        }
    }
    app.logger.info("PostgreSQL connection pool configured for production")

# 更新配置后的 database_url
app.config['SQLALCHEMY_DATABASE_URI'] = database_url

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

# 确保数据库表在启动时创建，并初始化默认数据
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Database tables created successfully")
        
        # 创建默认用户（如果不存在）
        from src.models.user import User
        default_user = User.query.filter_by(id=1).first()
        if not default_user:
            default_user = User(id=1, username='default_user', email='default@example.com')
            db.session.add(default_user)
            db.session.commit()
            app.logger.info("Default user created successfully")
        else:
            app.logger.info("Default user already exists")
            
    except Exception as e:
        app.logger.error(f"Failed to create database tables or default user: {str(e)}")
        if IS_PRODUCTION:
            raise  # 在生产环境中，这是致命错误

if __name__ == '__main__':
    # 只在直接运行时使用（开发环境）
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=not IS_PRODUCTION, host='0.0.0.0', port=port)