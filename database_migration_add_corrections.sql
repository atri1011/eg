-- 数据库迁移脚本：为 message 表添加 corrections 字段
-- 这个脚本用于修复 Vercel 部署中缺少 corrections 字段的问题
-- 
-- 安全执行：如果字段已存在则跳过，避免重复执行错误

-- 开始事务以确保原子性
BEGIN;

-- 检查列是否存在，如果不存在则添加
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

-- 提交事务
COMMIT;

-- 验证字段是否成功添加
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'message' 
AND column_name = 'corrections';