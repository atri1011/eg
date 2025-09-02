# 7. 数据库模式 (Database Schema)
```sql
-- 用户画像表
CREATE TABLE public.user_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_persona TEXT CHECK (user_persona IN ('备考学生', '职场人士'))
);
-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- RLS策略: 用户只能操作自己的画像
CREATE POLICY "Users can manage their own profile"
ON public.user_profiles FOR ALL
USING (auth.uid() = id);


-- 用户API配置表
CREATE TABLE public.user_api_configs (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_url TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  model_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 启用RLS
ALTER TABLE public.user_api_configs ENABLE ROW LEVEL SECURITY;
-- RLS策略: 用户只能操作自己的配置
CREATE POLICY "Users can manage their own API config"
ON public.user_api_configs FOR ALL
USING (auth.uid() = user_id);


-- 例句反馈表
CREATE TABLE public.sentence_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  sentence TEXT NOT NULL,
  feedback TEXT NOT NULL CHECK (feedback IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 启用RLS
ALTER TABLE public.sentence_feedback ENABLE ROW LEVEL SECURITY;
-- RLS策略: 用户可以插入自己的反馈
CREATE POLICY "Users can insert their own feedback"
ON public.sentence_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- (可选) RLS策略: 用户可以查看自己的反馈
CREATE POLICY "Users can view their own feedback"
ON public.sentence_feedback FOR SELECT
USING (auth.uid() = user_id);