"""
数据库配置管理器 - 简化main.py中的数据库配置逻辑
"""

import os
import logging
from typing import Dict, Any, Optional

from src.utils.network_fix import resolve_database_url_to_ipv4

logger = logging.getLogger(__name__)


class DatabaseConfig:
    """数据库配置管理器"""

    def __init__(self, environment: str = 'development'):
        self.environment = environment
        self.is_production = environment == 'production'

    def get_database_url(self) -> str:
        """获取数据库URL"""
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            if self.is_production:
                logger.error("DATABASE_URL environment variable is missing in production")
                raise RuntimeError("DATABASE_URL environment variable is required in production")
            database_url = 'sqlite:///database/app.db'

        return self._process_database_url(database_url)

    def _process_database_url(self, database_url: str) -> str:
        """处理数据库URL"""
        logger.info(f"Processing database URL for environment: {self.environment}")
        
        # 处理PostgreSQL连接的IPv4兼容性
        if database_url.startswith(('postgres://', 'postgresql://')):
            database_url = resolve_database_url_to_ipv4(database_url)
            
            # Supabase特殊处理
            if self.is_production and 'supabase.co' in database_url:
                database_url = database_url.replace(':5432/', ':6543/')
                logger.info("Using Supabase connection pooler (IPv4) instead of direct connection")
        
        # 处理SQLite路径
        elif database_url.startswith('sqlite:///'):
            database_url = self._process_sqlite_path(database_url)
        
        return database_url

    def _process_sqlite_path(self, database_url: str) -> str:
        """处理SQLite数据库路径"""
        db_path = database_url.replace('sqlite:///', '')
        if not os.path.isabs(db_path):
            # 使用项目根目录作为基准
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            # 确保数据库目录存在
            db_dir = os.path.join(project_root, 'database')
            os.makedirs(db_dir, exist_ok=True)
            absolute_db_path = os.path.join(project_root, db_path)
            database_url = f'sqlite:///{absolute_db_path}'
        return database_url

    def get_sqlalchemy_config(self) -> Dict[str, Any]:
        """获取SQLAlchemy配置"""
        database_url = self.get_database_url()
        
        config = {
            'SQLALCHEMY_DATABASE_URI': database_url,
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        }

        # 生产环境的连接池配置
        if self.is_production and database_url.startswith(('postgres', 'postgresql')):
            config['SQLALCHEMY_ENGINE_OPTIONS'] = {
                'pool_size': 3,
                'pool_recycle': 300,
                'pool_pre_ping': True,
                'max_overflow': 5,
                'pool_timeout': 30,
                'connect_args': {
                    'sslmode': 'require',
                    'connect_timeout': 15
                }
            }
            logger.info("PostgreSQL connection pool configured for production")

        return config

    def configure_app(self, app) -> None:
        """配置Flask应用的数据库设置"""
        config = self.get_sqlalchemy_config()
        for key, value in config.items():
            app.config[key] = value
        
        logger.info(f"Database configuration applied for {self.environment} environment")