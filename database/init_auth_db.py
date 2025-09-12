#!/usr/bin/env python3
"""
数据库初始化脚本 - 创建全新的用户认证系统
适用于全新部署的数据库

运行方式:
python database/init_auth_db.py
"""

import os
import sys
from datetime import datetime, timezone

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.models.user import db, User
from main import app

def init_database():
    """初始化数据库表结构"""
    try:
        with app.app_context():
            print("创建数据库表结构...")
            
            # 删除所有表并重新创建
            db.drop_all()
            db.create_all()
            
            print("✅ 数据库表结构创建完成")
            return True
            
    except Exception as e:
        print(f"❌ 初始化数据库失败: {e}")
        return False

def create_default_users():
    """创建默认用户"""
    try:
        with app.app_context():
            # 创建管理员用户
            admin_user = User(
                username='admin',
                email='admin@example.com',
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            admin_user.set_password('admin123')
            
            # 创建示例普通用户
            demo_user = User(
                username='demo',
                email='demo@example.com', 
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            demo_user.set_password('demo123')
            
            db.session.add(admin_user)
            db.session.add(demo_user)
            db.session.commit()
            
            print("✅ 默认用户创建完成:")
            print("   管理员 - admin@example.com / admin123")
            print("   示例用户 - demo@example.com / demo123")
            
            return True
            
    except Exception as e:
        print(f"❌ 创建默认用户失败: {e}")
        db.session.rollback()
        return False

def main():
    """主初始化流程"""
    print("开始初始化认证数据库...")
    print("=" * 50)
    
    # 确认操作
    confirm = input("此操作将删除所有现有数据并重新创建数据库。确认继续？(y/N): ")
    if confirm.lower() != 'y':
        print("操作已取消")
        return False
    
    # 1. 初始化数据库表
    if not init_database():
        return False
    
    # 2. 创建默认用户
    if not create_default_users():
        return False
    
    print("\n" + "=" * 50)
    print("✅ 认证数据库初始化完成！")
    print("\n默认账户信息:")
    print("管理员: admin@example.com / admin123")
    print("示例用户: demo@example.com / demo123")
    print("\n⚠️  请在生产环境中立即修改默认密码")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)