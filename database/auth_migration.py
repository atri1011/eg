#!/usr/bin/env python3
"""
数据库迁移脚本 - 添加用户认证功能
用于为现有用户添加认证相关字段并创建新的用户认证体系

运行方式:
python database/auth_migration.py
"""

import os
import sys
from datetime import datetime

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.models.user import db, User
from werkzeug.security import generate_password_hash
from main import app

def create_migration_backup():
    """创建迁移前的数据备份"""
    backup_file = f'database/backup_before_auth_migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
    print(f"创建数据备份到: {backup_file}")
    
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith(('postgresql://', 'postgres://')):
        # PostgreSQL 备份
        import subprocess
        try:
            # 解析数据库连接信息
            from urllib.parse import urlparse
            parsed = urlparse(database_url)
            
            cmd = [
                'pg_dump',
                '-h', parsed.hostname,
                '-p', str(parsed.port or 5432),
                '-U', parsed.username,
                '-d', parsed.path[1:],  # 去掉开头的 '/'
                '-f', backup_file,
                '--no-password'
            ]
            
            env = os.environ.copy()
            if parsed.password:
                env['PGPASSWORD'] = parsed.password
            
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            if result.returncode == 0:
                print("PostgreSQL 数据库备份完成")
            else:
                print(f"备份失败: {result.stderr}")
                return False
        except Exception as e:
            print(f"备份过程中发生错误: {e}")
            return False
    else:
        print("SQLite 数据库无需备份，数据将直接迁移")
    
    return True

def add_auth_columns():
    """为现有User表添加认证相关列"""
    try:
        with app.app_context():
            # 检查列是否已存在
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('user')]
            
            print(f"当前User表的列: {columns}")
            
            # 对于SQLite，需要特殊处理
            is_sqlite = 'sqlite' in str(db.engine.url)
            
            if is_sqlite:
                # SQLite需要重建表来添加列
                print("检测到SQLite，使用表重建方式添加列...")
                
                # 1. 重命名原表
                db.session.execute(db.text('ALTER TABLE user RENAME TO user_old'))
                
                # 2. 创建新表结构
                db.session.execute(db.text('''
                    CREATE TABLE user (
                        id INTEGER PRIMARY KEY,
                        username VARCHAR(80) UNIQUE NOT NULL,
                        email VARCHAR(120) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL DEFAULT '',
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP NULL
                    )
                '''))
                
                # 3. 复制数据
                db.session.execute(db.text('''
                    INSERT INTO user (id, username, email, password_hash, is_active, created_at)
                    SELECT id, username, email, '' as password_hash, 1 as is_active, CURRENT_TIMESTAMP as created_at
                    FROM user_old
                '''))
                
                # 4. 删除旧表
                db.session.execute(db.text('DROP TABLE user_old'))
                
            else:
                # PostgreSQL可以直接添加列
                columns_to_add = [
                    ('password_hash', 'VARCHAR(255) NOT NULL DEFAULT \'\''),
                    ('is_active', 'BOOLEAN NOT NULL DEFAULT TRUE'),
                    ('created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
                    ('last_login', 'TIMESTAMP NULL')
                ]
                
                for col_name, col_def in columns_to_add:
                    if col_name not in columns:
                        print(f"添加列: {col_name}")
                        db.session.execute(db.text(f'ALTER TABLE "user" ADD COLUMN {col_name} {col_def}'))
                    else:
                        print(f"列 {col_name} 已存在，跳过")
            
            db.session.commit()
            print("认证相关列添加完成")
            return True
            
    except Exception as e:
        print(f"添加列时发生错误: {e}")
        db.session.rollback()
        return False

def migrate_existing_users():
    """为现有用户设置默认密码和认证状态"""
    try:
        with app.app_context():
            # 查找所有没有密码的用户
            users_without_password = User.query.filter(
                (User.password_hash == '') | (User.password_hash.is_(None))
            ).all()
            
            print(f"找到 {len(users_without_password)} 个需要迁移的用户")
            
            for user in users_without_password:
                # 设置默认密码 (需要用户首次登录时修改)
                default_password = f"temp{user.id}123"  # 临时密码
                user.password_hash = generate_password_hash(default_password)
                user.is_active = True
                user.created_at = datetime.utcnow()
                
                print(f"用户 {user.username} (ID: {user.id}) 已设置临时密码: {default_password}")
            
            db.session.commit()
            print("现有用户迁移完成")
            return True
            
    except Exception as e:
        print(f"迁移现有用户时发生错误: {e}")
        db.session.rollback()
        return False

def create_default_admin_user():
    """创建默认管理员用户"""
    try:
        with app.app_context():
            # 检查是否已有管理员用户
            admin_user = User.query.filter_by(email='admin@example.com').first()
            
            if not admin_user:
                admin_user = User(
                    username='admin',
                    email='admin@example.com',
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                admin_user.set_password('admin123')  # 默认密码，建议首次登录后修改
                
                db.session.add(admin_user)
                db.session.commit()
                
                print("默认管理员用户创建成功:")
                print("  用户名: admin")
                print("  邮箱: admin@example.com")
                print("  密码: admin123")
                print("  请在首次登录后修改密码")
            else:
                print("管理员用户已存在，跳过创建")
            
            return True
            
    except Exception as e:
        print(f"创建管理员用户时发生错误: {e}")
        db.session.rollback()
        return False

def verify_migration():
    """验证迁移结果"""
    try:
        with app.app_context():
            # 检查表结构
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('user')]
            
            required_columns = ['password_hash', 'is_active', 'created_at', 'last_login']
            missing_columns = [col for col in required_columns if col not in columns]
            
            if missing_columns:
                print(f"错误: 缺少列 {missing_columns}")
                return False
            
            # 检查用户数据
            total_users = User.query.count()
            active_users = User.query.filter_by(is_active=True).count()
            users_with_password = User.query.filter(User.password_hash != '').count()
            
            print("\n迁移验证结果:")
            print(f"总用户数: {total_users}")
            print(f"活跃用户数: {active_users}")
            print(f"已设置密码的用户数: {users_with_password}")
            
            if total_users > 0 and users_with_password == total_users:
                print("[OK] 迁移验证成功")
                return True
            else:
                print("[ERROR] 迁移验证失败")
                return False
                
    except Exception as e:
        print(f"验证迁移时发生错误: {e}")
        return False

def main():
    """主迁移流程"""
    print("开始数据库认证功能迁移...")
    print("=" * 50)
    
    # 1. 创建备份
    if not create_migration_backup():
        print("备份失败，终止迁移")
        return False
    
    # 2. 添加认证相关列
    if not add_auth_columns():
        print("添加列失败，终止迁移")
        return False
    
    # 3. 迁移现有用户
    if not migrate_existing_users():
        print("迁移现有用户失败")
        return False
    
    # 4. 创建默认管理员用户
    if not create_default_admin_user():
        print("创建管理员用户失败")
        return False
    
    # 5. 验证迁移结果
    if not verify_migration():
        print("迁移验证失败")
        return False
    
    print("\n" + "=" * 50)
    print("[OK] 数据库认证功能迁移完成！")
    print("\n重要提醒:")
    print("1. 现有用户的临时密码已在控制台显示，请记录并及时通知用户修改")
    print("2. 默认管理员账户: admin@example.com / admin123")
    print("3. 建议在生产环境中立即修改所有默认密码")
    print("4. 请重新启动应用以确保所有更改生效")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)