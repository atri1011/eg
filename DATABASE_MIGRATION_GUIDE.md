# 数据库迁移修复指南

## 问题描述

在 Vercel 部署环境中，数据库的 `message` 表缺少 `corrections` 字段，导致发送消息时出现以下错误：

```
psycopg2.errors.UndefinedColumn) column "corrections" of relation "message" does not exist
```

## 解决方案

### 1. 获取 Vercel 数据库连接字符串

在 Vercel 项目设置中找到 `DATABASE_URL` 环境变量，格式类似：
```
postgresql://username:password@host:port/database
```

### 2. 执行数据库迁移

**方法一：使用 Python 脚本（推荐）**

1. 在本地创建临时环境变量文件 `.env.vercel`：
```bash
DATABASE_URL="你的Vercel数据库连接字符串"
```

2. 执行迁移脚本：
```bash
# 使用 Vercel 数据库连接
export $(cat .env.vercel | xargs)
python migrate_database_simple.py
```

3. 验证迁移结果：
```bash
export $(cat .env.vercel | xargs)
python migrate_database_simple.py --check
```

**方法二：直接在 Supabase/PostgreSQL 控制台执行**

在你的数据库管理界面（如 Supabase Dashboard）执行以下 SQL：

```sql
-- 检查并添加 corrections 字段
DO $$ 
BEGIN
    -- 检查 corrections 列是否已存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' 
        AND column_name = 'corrections'
    ) THEN
        -- 添加 corrections 字段
        ALTER TABLE message ADD COLUMN corrections JSONB;
        
        RAISE NOTICE 'Added corrections column to message table';
    ELSE
        RAISE NOTICE 'Column corrections already exists in message table';
    END IF;
END $$;

-- 验证字段是否成功添加
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'message' 
AND column_name = 'corrections';
```

### 3. 重新部署应用

迁移完成后，重新部署 Vercel 应用：

```bash
# 如果使用 Vercel CLI
vercel --prod

# 或者在 Vercel Dashboard 中点击重新部署
```

## 预防措施

为避免将来出现类似问题：

1. **确保初始化脚本完整**：`supabase_init.sql` 包含了完整的表结构
2. **版本控制数据库 schema**：记录每次数据库结构变更
3. **测试环境同步**：确保测试和生产环境的数据库结构一致

## 文件说明

- `database_migration_add_corrections.sql` - PostgreSQL 迁移脚本
- `migrate_database_simple.py` - Python 迁移执行工具
- `supabase_init.sql` - 完整数据库初始化脚本

## 验证步骤

迁移完成后，可以通过以下方式验证：

1. 在 Vercel 应用中发送一条测试消息
2. 检查是否还出现 "corrections" 字段不存在的错误
3. 查看数据库中 message 表的结构是否包含 corrections 字段

## 故障排除

如果遇到问题：

1. 检查数据库连接字符串是否正确
2. 确认数据库用户有 ALTER TABLE 权限
3. 查看数据库日志获取详细错误信息
4. 使用 `--check` 参数验证当前表结构