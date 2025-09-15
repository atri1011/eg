-- Supabase数据库迁移脚本：添加对话模式支持
-- 执行日期：2025-09-16
-- 目的：为conversation表添加mode和mode_config字段以支持多种对话模式

-- 检查并添加mode字段
DO $$ 
BEGIN
    -- 检查mode字段是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation' AND column_name = 'mode'
    ) THEN
        -- 添加mode字段
        ALTER TABLE conversation 
        ADD COLUMN mode VARCHAR(50) DEFAULT 'free_chat' NOT NULL;
        
        RAISE NOTICE 'Added mode column to conversation table';
    ELSE
        RAISE NOTICE 'Mode column already exists in conversation table';
    END IF;
END $$;

-- 检查并添加mode_config字段
DO $$ 
BEGIN
    -- 检查mode_config字段是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation' AND column_name = 'mode_config'
    ) THEN
        -- 添加mode_config字段 (使用JSONB类型以获得更好的性能)
        ALTER TABLE conversation 
        ADD COLUMN mode_config JSONB;
        
        RAISE NOTICE 'Added mode_config column to conversation table';
    ELSE
        RAISE NOTICE 'Mode_config column already exists in conversation table';
    END IF;
END $$;

-- 为现有记录设置默认模式
UPDATE conversation 
SET mode = 'free_chat' 
WHERE mode IS NULL OR mode = '';

-- 添加索引以优化模式查询性能
CREATE INDEX IF NOT EXISTS idx_conversation_mode ON conversation(mode);

-- 创建模式配置的GIN索引以优化JSON查询
CREATE INDEX IF NOT EXISTS idx_conversation_mode_config ON conversation USING GIN(mode_config);

-- 验证更新结果
DO $$
DECLARE
    mode_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM conversation;
    SELECT COUNT(*) INTO mode_count FROM conversation WHERE mode = 'free_chat';
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total conversations: %, Default mode set: %', total_count, mode_count;
END $$;