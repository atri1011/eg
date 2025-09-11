#!/usr/bin/env python3
"""
数据库迁移脚本 - 添加 corrections 字段
用于修复 Vercel 部署中 message 表缺少 corrections 字段的问题
"""

import os
import sys
from dotenv import load_dotenv
import psycopg2
import sqlite3
from urllib.parse import urlparse

# 加载环境变量
load_dotenv()

def run_migration():
    """运行数据库迁移"""
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("错误: 未设置 DATABASE_URL 环境变量")
        return False
    
    # 读取迁移脚本
    migration_file = os.path.join(os.path.dirname(__file__), 'database_migration_add_corrections.sql')
    
    try:
        with open(migration_file, 'r', encoding='utf-8') as f:
            migration_sql = f.read()
    except FileNotFoundError:
        print(f"错误: 找不到迁移文件 {migration_file}")
        return False
    
    try:
        if database_url.startswith(('postgres://', 'postgresql://')):
            return run_postgresql_migration(database_url, migration_sql)
        elif database_url.startswith('sqlite:///'):
            return run_sqlite_migration(database_url, migration_sql)
        else:
            print(f"错误: 不支持的数据库类型: {database_url}")
            return False
    except Exception as e:
        print(f"迁移失败: {str(e)}")
        return False

def run_postgresql_migration(database_url, migration_sql):
    """运行 PostgreSQL 迁移"""
    print("连接到 PostgreSQL 数据库...")
    
    # 解析数据库 URL
    parsed = urlparse(database_url)
    
    connection = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        database=parsed.path.lstrip('/'),
        user=parsed.username,
        password=parsed.password,
        sslmode='require'
    )
    
    try:
        with connection.cursor() as cursor:
            print("数据库连接成功")
            
            # 执行迁移脚本
            print("执行迁移脚本...")
            cursor.execute(migration_sql)
            
            # 获取执行结果
            if cursor.description:  # 有返回结果
                results = cursor.fetchall()
                if results:
                    print("字段验证结果:")
                    for row in results:
                        print(f"   表: {row[0]}, 字段: {row[1]}, 类型: {row[2]}, 可空: {row[3]}")
            
            connection.commit()
            print("迁移成功完成！")
            return True
            
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def run_sqlite_migration(database_url, migration_sql):
    """运行 SQLite 迁移"""
    print("连接到 SQLite 数据库...")
    
    db_path = database_url.replace('sqlite:///', '')
    
    connection = sqlite3.connect(db_path)
    
    try:
        cursor = connection.cursor()
        print("数据库连接成功")
        
        # 检查字段是否存在
        cursor.execute("PRAGMA table_info(message)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'corrections' not in columns:
            print("添加 corrections 字段...")
            cursor.execute("ALTER TABLE message ADD COLUMN corrections TEXT")
            print("corrections 字段添加成功")
        else:
            print("corrections 字段已存在")
        
        connection.commit()
        print("迁移成功完成！")
        return True
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def check_table_structure():
    """检查当前表结构"""
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("错误: 未设置 DATABASE_URL 环境变量")
        return
    
    print("检查当前表结构...")
    
    try:
        if database_url.startswith(('postgres://', 'postgresql://')):
            check_postgresql_structure(database_url)
        elif database_url.startswith('sqlite:///'):
            check_sqlite_structure(database_url)
    except Exception as e:
        print(f"检查失败: {str(e)}")

def check_postgresql_structure(database_url):
    """检查 PostgreSQL 表结构"""
    parsed = urlparse(database_url)
    connection = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        database=parsed.path.lstrip('/'),
        user=parsed.username,
        password=parsed.password,
        sslmode='require'
    )
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'message'
                ORDER BY ordinal_position
            """)
            
            results = cursor.fetchall()
            print("message 表结构:")
            for row in results:
                print(f"   {row[0]}: {row[1]} {'(nullable)' if row[2] == 'YES' else '(not null)'}")
    finally:
        connection.close()

def check_sqlite_structure(database_url):
    """检查 SQLite 表结构"""
    db_path = database_url.replace('sqlite:///', '')
    connection = sqlite3.connect(db_path)
    
    try:
        cursor = connection.cursor()
        cursor.execute("PRAGMA table_info(message)")
        
        results = cursor.fetchall()
        print("message 表结构:")
        for row in results:
            print(f"   {row[1]}: {row[2]} {'(nullable)' if not row[3] else '(not null)'}")
    finally:
        connection.close()

if __name__ == '__main__':
    print("数据库迁移工具")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        check_table_structure()
    else:
        print("开始数据库迁移...")
        success = run_migration()
        
        if success:
            print("\n迁移成功完成!")
            print("您现在可以重新部署应用到 Vercel")
        else:
            print("\n迁移失败，请检查错误信息")
            sys.exit(1)