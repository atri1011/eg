-- Supabase查询优化脚本：更新现有查询以支持软删除功能
-- 执行日期：2025-09-15
-- 目的：确保所有查询都过滤已删除的消息

-- 1. 创建视图以简化查询（只显示未删除的消息）
CREATE OR REPLACE VIEW active_messages AS
SELECT 
    id,
    conversation_id,
    role,
    content,
    corrections,
    optimization,
    created_at,
    updated_at,
    is_deleted
FROM message 
WHERE is_deleted = FALSE;

-- 2. 创建函数来获取会话的活跃消息数量
CREATE OR REPLACE FUNCTION get_conversation_message_count(conv_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    msg_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO msg_count
    FROM message 
    WHERE conversation_id = conv_id 
    AND is_deleted = FALSE;
    
    RETURN msg_count;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建函数来获取会话的最后一条消息
CREATE OR REPLACE FUNCTION get_last_message(conv_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    content TEXT,
    role VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.content, m.role, m.created_at
    FROM message m
    WHERE m.conversation_id = conv_id 
    AND m.is_deleted = FALSE
    ORDER BY m.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建函数来软删除消息之后的所有消息
CREATE OR REPLACE FUNCTION delete_messages_after(msg_id INTEGER, user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    target_message RECORD;
    deleted_count INTEGER := 0;
BEGIN
    -- 获取目标消息及其会话信息
    SELECT m.*, c.user_id INTO target_message
    FROM message m
    JOIN conversation c ON m.conversation_id = c.id
    WHERE m.id = msg_id AND c.user_id = user_id_param;
    
    -- 检查权限
    IF target_message IS NULL THEN
        RAISE EXCEPTION 'Message not found or access denied';
    END IF;
    
    -- 软删除该消息之后的所有消息
    UPDATE message 
    SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = target_message.conversation_id
    AND created_at > target_message.created_at
    AND is_deleted = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建函数来检查用户是否拥有消息的编辑权限
CREATE OR REPLACE FUNCTION can_edit_message(msg_id INTEGER, user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    message_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM message m
        JOIN conversation c ON m.conversation_id = c.id
        WHERE m.id = msg_id 
        AND c.user_id = user_id_param 
        AND m.role = 'user'
        AND m.is_deleted = FALSE
    ) INTO message_exists;
    
    RETURN message_exists;
END;
$$ LANGUAGE plpgsql;

-- 6. 为查询性能创建复合索引
CREATE INDEX IF NOT EXISTS idx_message_conversation_created_not_deleted 
ON message(conversation_id, created_at DESC) 
WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_message_user_access 
ON message(id) 
INCLUDE (conversation_id, role, is_deleted);

-- 7. 验证函数和视图
DO $$
BEGIN
    -- 测试视图
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'active_messages') THEN
        RAISE NOTICE '✓ active_messages 视图创建成功';
    END IF;
    
    -- 测试函数
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_conversation_message_count') THEN
        RAISE NOTICE '✓ get_conversation_message_count 函数创建成功';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'delete_messages_after') THEN
        RAISE NOTICE '✓ delete_messages_after 函数创建成功';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'can_edit_message') THEN
        RAISE NOTICE '✓ can_edit_message 函数创建成功';
    END IF;
END $$;

-- 8. 示例查询（用于测试）
-- 获取用户的所有会话及消息统计
/*
SELECT 
    c.id,
    c.title,
    c.created_at,
    get_conversation_message_count(c.id) as message_count,
    (SELECT content FROM get_last_message(c.id) LIMIT 1) as last_message
FROM conversation c 
WHERE c.user_id = 1  -- 替换为实际用户ID
ORDER BY c.created_at DESC;
*/

-- 获取会话的所有活跃消息
/*
SELECT * FROM active_messages 
WHERE conversation_id = 1  -- 替换为实际会话ID
ORDER BY created_at ASC;
*/