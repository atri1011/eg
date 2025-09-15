-- Supabase迁移脚本：为消息编辑和删除功能添加字段
-- 执行日期：2025-09-15
-- 目的：为Message表添加updated_at和is_deleted字段以支持消息编辑和软删除功能

-- 1. 为Message表添加updated_at字段
ALTER TABLE message 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. 为Message表添加is_deleted字段  
ALTER TABLE message 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 3. 为现有记录设置updated_at值（与created_at相同）
UPDATE message 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 4. 创建更新updated_at的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 创建触发器，在更新记录时自动更新updated_at字段
DROP TRIGGER IF EXISTS update_message_updated_at ON message;
CREATE TRIGGER update_message_updated_at
    BEFORE UPDATE ON message
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_message_updated_at ON message(updated_at);
CREATE INDEX IF NOT EXISTS idx_message_is_deleted ON message(is_deleted);
CREATE INDEX IF NOT EXISTS idx_message_conversation_not_deleted ON message(conversation_id, is_deleted);

-- 7. 验证更改
DO $$
DECLARE
    updated_at_exists BOOLEAN;
    is_deleted_exists BOOLEAN;
BEGIN
    -- 检查updated_at字段是否存在
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' 
        AND column_name = 'updated_at'
    ) INTO updated_at_exists;
    
    -- 检查is_deleted字段是否存在
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' 
        AND column_name = 'is_deleted'
    ) INTO is_deleted_exists;
    
    -- 输出验证结果
    IF updated_at_exists AND is_deleted_exists THEN
        RAISE NOTICE '✓ 迁移成功完成：updated_at 和 is_deleted 字段已添加到 message 表';
    ELSE
        RAISE EXCEPTION '✗ 迁移失败：字段添加不完整';
    END IF;
END $$;

-- 8. 显示当前message表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'message' 
ORDER BY ordinal_position;