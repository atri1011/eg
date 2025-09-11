-- 简单的数据库修复脚本
-- 直接在 Supabase 或其他 PostgreSQL 控制台中执行

-- 检查当前表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'message'
ORDER BY ordinal_position;

-- 如果上面的查询结果中没有 'corrections' 字段，执行以下命令：

ALTER TABLE message ADD COLUMN corrections JSONB;

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'message' 
AND column_name = 'corrections';