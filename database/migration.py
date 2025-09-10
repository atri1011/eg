import os
import sys
import sqlite3

# 将项目根目录添加到 sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from src.models.user import db

def migrate():
    with app.app_context():
        print("Starting database migration...")
        
        # 检查 'conversations' 表是否存在
        inspector = db.inspect(db.engine)
        if inspector.has_table('conversation'):
            print("Dropping 'conversation' table...")
            Conversation.__table__.drop(db.engine)
            print("'conversation' table dropped.")
            
        # 检查 'messages' 表是否存在
        if inspector.has_table('message'):
            print("Dropping 'message' table...")
            Message.__table__.drop(db.engine)
            print("'message' table dropped.")
            
        print("Database migration finished.")

if __name__ == '__main__':
    migrate()