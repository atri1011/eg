import os
import sys
import sqlite3

# 将项目根目录添加到 sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from src.models.user import db
from src.models.conversation import Conversation, Message

def migrate():
    with app.app_context():
        print("Starting database migration...")
        
        # 检查 'conversations' 表是否存在
        inspector = db.inspect(db.engine)
        if not inspector.has_table('conversation'):
            print("Creating 'conversation' table...")
            Conversation.__table__.create(db.engine)
            print("'conversation' table created.")
        else:
            print("'conversation' table already exists.")
            
        # 检查 'messages' 表是否存在
        if not inspector.has_table('message'):
            print("Creating 'message' table...")
            Message.__table__.create(db.engine)
            print("'message' table created.")
        else:
            print("'message' table already exists.")
            
        print("Database migration finished.")

if __name__ == '__main__':
    migrate()