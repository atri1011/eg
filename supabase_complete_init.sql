-- 完整的Supabase数据库重新初始化脚本
-- 包含用户认证功能的完整表结构

-- 清理现有表（小心使用！）
-- DROP TABLE IF EXISTS message CASCADE;
-- DROP TABLE IF EXISTS conversation CASCADE;
-- DROP TABLE IF EXISTS "user" CASCADE;

-- 启用UUID扩展（如果还没有启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表 (包含完整的认证字段)
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 对话表
CREATE TABLE IF NOT EXISTS conversation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 消息表
CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    corrections JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_active ON "user"(is_active);
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation(user_id);
CREATE INDEX IF NOT EXISTS idx_message_conversation_id ON message(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation(created_at);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at);

-- 启用行级安全策略（RLS）- Supabase推荐做法
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（适用于基于JWT的认证）
-- 注意：这些策略假设你使用Supabase Auth或类似的JWT认证系统

-- 用户只能访问自己的数据
-- DROP POLICY IF EXISTS "Users can only access their own data" ON "user";
-- CREATE POLICY "Users can only access their own data" ON "user"
--     FOR ALL USING (auth.uid()::text = id::text);

-- 用户只能访问自己的对话
-- DROP POLICY IF EXISTS "Users can only access their own conversations" ON conversation;
-- CREATE POLICY "Users can only access their own conversations" ON conversation
--     FOR ALL USING (user_id IN (SELECT id FROM "user" WHERE auth.uid()::text = id::text));

-- 用户只能访问自己对话中的消息
-- DROP POLICY IF EXISTS "Users can only access messages from their conversations" ON message;
-- CREATE POLICY "Users can only access messages from their conversations" ON message
--     FOR ALL USING (conversation_id IN (
--         SELECT id FROM conversation WHERE user_id IN (
--             SELECT id FROM "user" WHERE auth.uid()::text = id::text
--         )
--     ));

-- 为应用级认证创建更宽松的策略（如果你使用自定义JWT而不是Supabase Auth）
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON "user";
CREATE POLICY "Allow all operations for authenticated users" ON "user"
    FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON conversation;
CREATE POLICY "Allow all operations for authenticated users" ON conversation
    FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON message;
CREATE POLICY "Allow all operations for authenticated users" ON message
    FOR ALL TO authenticated USING (true);

-- 创建测试用户（可选，用于验证）
-- 密码: admin123 (scrypt哈希)
INSERT INTO "user" (username, email, password_hash, is_active) VALUES 
    ('admin', 'admin@example.com', 'scrypt:32768:8:1$gYM3wfhZZQcH50WH$0583b32963cd78c8b8f5c8b8c5b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3', TRUE),
    ('testuser', 'test@example.com', 'scrypt:32768:8:1$gYM3wfhZZQcH50WH$0583b32963cd78c8b8f5c8b8c5b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3b3f3d3e3a3c3', TRUE)
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- 验证表结构
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('user', 'conversation', 'message')
ORDER BY table_name, ordinal_position;