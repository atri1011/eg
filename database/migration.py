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
        has_updated_at_column = False
        has_is_deleted_column = False
        
        if inspector.has_table('message'):
            columns = [c['name'] for c in inspector.get_columns('message')]
            if 'corrections' in columns:
                has_corrections_column = True
                print("'corrections' column already exists in 'message' table.")
            if 'updated_at' in columns:
                has_updated_at_column = True
                print("'updated_at' column already exists in 'message' table.")
            if 'is_deleted' in columns:
                has_is_deleted_column = True
                print("'is_deleted' column already exists in 'message' table.")

        # 添加 corrections 列
        if not has_corrections_column and inspector.has_table('message'):
            print("Adding 'corrections' column to 'message' table...")
            try:
                with db.engine.connect() as connection:
                    connection.execute(db.text('ALTER TABLE message ADD COLUMN corrections JSON'))
                    connection.commit()
                print("'corrections' column added successfully.")
            except Exception as e:
                print(f"Error adding 'corrections' column: {e}")

        # 添加 updated_at 列
        if not has_updated_at_column and inspector.has_table('message'):
            print("Adding 'updated_at' column to 'message' table...")
            try:
                with db.engine.connect() as connection:
                    connection.execute(db.text('ALTER TABLE message ADD COLUMN updated_at DATETIME'))
                    # 为现有记录设置updated_at值
                    connection.execute(db.text('UPDATE message SET updated_at = created_at WHERE updated_at IS NULL'))
                    connection.commit()
                print("'updated_at' column added successfully.")
            except Exception as e:
                print(f"Error adding 'updated_at' column: {e}")

        # 添加 is_deleted 列
        if not has_is_deleted_column and inspector.has_table('message'):
            print("Adding 'is_deleted' column to 'message' table...")
            try:
                with db.engine.connect() as connection:
                    connection.execute(db.text('ALTER TABLE message ADD COLUMN is_deleted BOOLEAN DEFAULT 0'))
                    connection.commit()
                print("'is_deleted' column added successfully.")
            except Exception as e:
                print(f"Error adding 'is_deleted' column: {e}")
        
        # 确保所有表都已创建
        print("Creating all tables...")
        db.create_all()
        print("All tables created.")
            
        print("Database migration finished.")

if __name__ == '__main__':
    migrate()