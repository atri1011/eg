-- Supabase数据库初始化脚本
-- 为英语学习聊天应用创建必要的表结构

-- 启用UUID扩展（如果还没有启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation(user_id);
CREATE INDEX IF NOT EXISTS idx_message_conversation_id ON message(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation(created_at);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at);

-- 启用行级安全策略（RLS）- Supabase推荐做法
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（可根据实际需求调整）
-- 用户只能访问自己的数据
CREATE POLICY "Users can only access their own data" ON "user"
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can only access their own conversations" ON conversation
    FOR ALL USING (user_id IN (SELECT id FROM "user" WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can only access messages from their conversations" ON message
    FOR ALL USING (conversation_id IN (
        SELECT id FROM conversation WHERE user_id IN (
            SELECT id FROM "user" WHERE auth.uid()::text = id::text
        )
    ));

-- 插入示例用户（可选，用于测试）
-- INSERT INTO "user" (username, email) VALUES 
--     ('test_user', 'test@example.com'),
--     ('demo_user', 'demo@example.com')
-- ON CONFLICT (username) DO NOTHING;

COMMIT;