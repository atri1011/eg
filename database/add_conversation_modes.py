"""
数据库迁移脚本：为conversation表添加mode和mode_config字段
执行日期：2025-09-16
目的：支持多种对话模式功能
"""

import os
import sys
import logging

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.models import db
from src.config.database_config import DatabaseConfig

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_conversation_modes():
    """为conversation表添加mode和mode_config字段"""
    try:
        # 直接使用Flask-SQLAlchemy的数据库连接
        with db.engine.connect() as connection:
            # 对于SQLite，使用PRAGMA table_info来检查字段是否存在
            check_mode_sql = text("PRAGMA table_info(conversation)")
            result = connection.execute(check_mode_sql)
            columns = [row[1] for row in result.fetchall()]  # column name is at index 1
            
            if 'mode' not in columns:
                logger.info("添加conversation.mode字段...")
                connection.execute(text("""
                    ALTER TABLE conversation 
                    ADD COLUMN mode VARCHAR(50) DEFAULT 'free_chat' NOT NULL
                """))
                
                logger.info("添加conversation.mode_config字段...")
                connection.execute(text("""
                    ALTER TABLE conversation 
                    ADD COLUMN mode_config TEXT
                """))
                
                # 为现有记录设置默认模式
                logger.info("为现有conversation记录设置默认模式...")
                connection.execute(text("""
                    UPDATE conversation 
                    SET mode = 'free_chat' 
                    WHERE mode IS NULL OR mode = ''
                """))
                
                connection.commit()
                logger.info("✅ conversation表模式字段迁移完成")
            else:
                logger.info("⚠️ conversation表模式字段已存在，跳过迁移")
                
    except Exception as e:
        logger.error(f"❌ 迁移失败: {str(e)}")
        raise

if __name__ == "__main__":
    # 需要Flask应用上下文
    from main import app
    with app.app_context():
        migrate_conversation_modes()