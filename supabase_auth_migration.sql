-- Supabase认证字段迁移脚本
-- 为现有的用户表添加认证相关字段

-- 添加密码哈希字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='password_hash') THEN
        ALTER TABLE "user" ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

-- 添加活跃状态字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='is_active') THEN
        ALTER TABLE "user" ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
    END IF;
END $$;

-- 添加最后登录时间字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='last_login') THEN
        ALTER TABLE "user" ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 为现有用户设置默认密码（临时密码，需要重置）
-- 注意：这只是为了让现有用户记录兼容新的表结构
UPDATE "user" 
SET password_hash = 'scrypt:32768:8:1$temp$temporary_hash_needs_reset'
WHERE password_hash IS NULL;

-- 设置密码字段为必填（在设置默认值后）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='password_hash' AND is_nullable='YES') THEN
        ALTER TABLE "user" ALTER COLUMN password_hash SET NOT NULL;
    END IF;
END $$;

-- 创建用户表的索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_active ON "user"(is_active);

COMMIT;

-- 验证迁移结果
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'user' 
ORDER BY ordinal_position;