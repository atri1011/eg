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
        
        inspector = db.inspect(db.engine)
        
        # 检查 'message' 表中是否存在 'corrections' 列
        has_corrections_column = False
        if inspector.has_table('message'):
            columns = [c['name'] for c in inspector.get_columns('message')]
            if 'corrections' in columns:
                has_corrections_column = True
                print("'corrections' column already exists in 'message' table.")

        if not has_corrections_column and inspector.has_table('message'):
            print("Adding 'corrections' column to 'message' table...")
            try:
                # 使用原生SQL添加列，因为Flask-SQLAlchemy没有直接的API
                with db.engine.connect() as connection:
                    connection.execute(db.text('ALTER TABLE message ADD COLUMN corrections JSON'))
                print("'corrections' column added successfully.")
            except Exception as e:
                print(f"Error adding 'corrections' column: {e}")
        
        # 确保所有表都已创建
        print("Creating all tables...")
        db.create_all()
        print("All tables created.")
            
        print("Database migration finished.")

if __name__ == '__main__':
    migrate()