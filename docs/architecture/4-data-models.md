# 4. 数据模型 (Data Models)
以下是应用所需的核心数据模型。

## 4.1 User
**用途**: 存储用户的认证信息。此表由Supabase Auth自动管理。

**TypeScript接口**:
```typescript
// packages/shared-types/src/index.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;
```

## 4.2 UserProfile
**用途**: 存储用户的应用特定信息，如选择的用户画像。

**关键属性**:
*   `id` (uuid, 主键): 关联到 auth.users.id。
*   `user_persona` (text): 用户选择的画像 (e.g., '备考学生', '职场人士')。

**TypeScript接口**:
```typescript
// packages/shared-types/src/index.ts
export interface UserProfile {
  id: string;
  user_persona: '备考学生' | '职场人士' | null;
}
```

## 4.3 UserApiConfig
**用途**: 安全地存储用户自己的API配置。

**关键属性**:
*   `user_id` (uuid, 主键): 关联到 auth.users.id。
*   `api_url` (text): 用户提供的API URL。
*   `encrypted_api_key` (text): 加密后的API密钥。
*   `model_name` (text): 用户指定的模型名称。

**TypeScript接口**:
```typescript
// packages/shared-types/src/index.ts
export interface UserApiConfig {
  user_id: string;
  api_url: string;
  // API Key is never exposed to the client
  model_name: string;
}
```

## 4.4 SentenceFeedback
**用途**: 存储用户对生成的例句的反馈。

**关键属性**:
*   `id` (uuid, 主键): 唯一标识。
*   `user_id` (uuid): 关联到 auth.users.id。
*   `word` (text): 目标单词。
*   `sentence` (text): 生成的例句。
*   `feedback` (text): 'like' 或 'dislike'。
*   `created_at` (timestamptz): 创建时间。

**TypeScript接口**:
```typescript
// packages/shared-types/src/index.ts
export interface SentenceFeedback {
  id: string;
  user_id: string;
  word: string;
  sentence: string;
  feedback: 'like' | 'dislike';
  created_at: string;
}