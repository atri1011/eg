# AI场景化例句背单词网站 全栈技术架构文档

## 1. 引言 (Introduction)

本文档概述了 **AI场景化例句背单词网站** 的完整全栈架构，涵盖后端系统、前端实现及其集成方式。它将作为AI驱动开发过程的唯一技术蓝图，确保整个技术栈的一致性。

此统一架构整合了传统的后端和前端架构，以简化现代全栈应用的开发流程。所有设计决策均严格源自项目PRD v1.0版本。

### 1.1 启动模板或现有项目 (Starter Template or Existing Project)

N/A - 本项目为绿地（Greenfield）项目。

我们将不使用任何外部启动模板。架构将基于所选技术栈（Next.js, Supabase, Vercel）的最佳实践从零开始构建。这个技术组合本身就提供了一个强大的、集成度很高的项目起点。

### 1.2 变更日志 (Change Log)

| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025-09-01 | 1.0 | 初始架构草案创建 | Winston (Architect) |

---

## 2. 高层架构 (High Level Architecture)

### 2.1 技术摘要 (Technical Summary)

本系统将采用基于 **Jamstack 和 Serverless** 的现代Web架构。前端将使用 **Next.js** 构建，提供动态、高性能的用户体验，并托管在 **Vercel** 平台上。后端逻辑将通过 **Vercel Functions (Serverless)** 实现，负责处理API配置、代理AI请求等核心业务。用户认证和数据持久化将完全由 **Supabase** 提供，利用其内置的PostgreSQL数据库和Auth服务。这种架构具有极低的初始运营成本、卓越的可扩展性，并能实现快速的开发迭代，完美支持PRD中定义的目标。

### 2.2 平台与基础设施选择 (Platform and Infrastructure Choice)

*   **平台:** Vercel + Supabase
*   **关键服务:**
    *   **Vercel Hosting:** 全球CDN托管Next.js前端应用。
    *   **Vercel Functions:** 部署后端的Serverless API。
    *   **Supabase Auth:** 处理用户注册、登录和会话管理。
    *   **Supabase Database (PostgreSQL):** 存储用户数据和应用配置。
    *   **Supabase Row Level Security (RLS):** 实现数据隔离，确保用户安全。
*   **部署托管与区域:** Vercel全球边缘网络。

### 2.3 代码仓库结构 (Repository Structure)

*   **结构:** Monorepo
*   **Monorepo工具:** Npm Workspaces (轻量级，无需额外依赖)
*   **包组织:**
    *   `apps/web`: 包含核心的Next.js全栈应用。
    *   `packages/shared-types`: 存放前端和后端共享的TypeScript类型定义。
    *   `packages/ui`: (未来规划) 存放共享的UI组件。

### 2.4 高层架构图 (High Level Architecture Diagram)

```mermaid
graph TD
    subgraph "用户端 (Browser)"
        A[Next.js Frontend]
    end

    subgraph "Vercel平台"
        B[Serverless API (/api/*)]
    end

    subgraph "Supabase平台"
        C[Supabase Auth]
        D[PostgreSQL数据库]
    end

    subgraph "第三方AI服务"
        E[用户自配置的AI API]
    end

    A -- "HTTP请求 (tRPC/REST)" --> B
    A -- "Auth操作" --> C
    A -- "直接数据查询 (RLS)" --> D
    B -- "数据库操作" --> D
    B -- "安全代理请求" --> E
```

### 2.5 架构模式 (Architectural Patterns)

*   **Serverless架构**: 所有后端逻辑均通过按需执行的函数实现，无需管理服务器。
    *   **理由**: 符合PRD中低成本、高可扩展性的NFR6要求。
*   **Monorepo**: 在单一代码库中管理所有代码。
    *   **理由**: 简化了类型共享和依赖管理，提升了开发效率，符合PRD的技术假设。
*   **Repository模式**: 在后端抽象数据访问逻辑。
    *   **理由**: 使业务逻辑与数据持久化细节解耦，便于进行单元测试。
*   **API代理模式**: 后端函数作为安全代理，将请求转发给用户配置的外部AI服务。
    *   **理由**: 保护用户API密钥不暴露于前端，并允许我们在请求前后注入逻辑（如提示词工程）。

## 3. 技术栈 (Tech Stack)
这是整个项目的最终技术选型。所有开发工作必须严格遵守下表中列出的技术和版本。

| 类别 | 技术 | 版本 | 用途 | 理由 |
| :--- | :--- | :--- | :--- | :--- |
| **前端语言** | TypeScript | ~5.4.5 | 主要开发语言 | 强类型，提升代码健壮性和可维护性。 |
| **前端框架** | Next.js | ~14.2.3 | 全栈Web框架 | 强大的功能集（SSR, SSG, API路由），与Vercel完美集成。 |
| **UI组件库** | Shadcn/ui | ~0.8.0 | UI组件集合 | 现代化、可访问性好，基于Tailwind CSS，易于定制。 |
| **状态管理** | React Context/Hooks | 18+ | 客户端状态管理 | 对于MVP的复杂性足够，无需引入外部库。 |
| **后端语言** | TypeScript | ~5.4.5 | API开发语言 | 与前端统一，实现代码和类型共享。 |
| **后端框架** | Next.js API Routes | ~14.2.3 | Serverless函数框架 | 内置于Next.js，简化后端API开发。 |
| **API风格** | REST / tRPC | N/A | 前后端通信 | 初期使用简单的REST风格API路由，未来可考虑引入tRPC提升类型安全。 |
| **数据库** | Supabase (PostgreSQL) | 15+ | 数据存储 | 提供强大的关系型数据库、Auth及实时功能，免费套餐友好。 |
| **文件存储** | Supabase Storage | N/A | (未来)自定义词书存储 | (非MVP) 用于支持FR10功能。 |
| **认证** | Supabase Auth | N/A | 用户认证与授权 | 提供完整的用户管理解决方案，与数据库和RLS无缝集成。 |
| **前端测试** | Jest + RTL | ~29.7.0 | 单元/组件测试 | React官方推荐，专注于用户行为测试。符合PRD的测试需求。 |
| **后端测试** | Jest | ~29.7.0 | 单元测试 | 与前端统一，确保业务逻辑的正确性。 |
| **IaC工具** | N/A | N/A | 基础设施即代码 | Vercel通过其UI和vercel.json进行管理，无需外部IaC工具。 |
| **CI/CD** | Vercel | N/A | 持续集成与部署 | 与Git仓库深度集成，提供自动化、零配置的CI/CD流程。 |
| **CSS框架** | Tailwind CSS | ~3.4.3 | UI样式 | 高效的Utility-First框架，与Shadcn/ui配合使用。 |

## 4. 数据模型 (Data Models)
以下是应用所需的核心数据模型。

### 4.1 User
**用途**: 存储用户的认证信息。此表由Supabase Auth自动管理。

**TypeScript接口**:
```typescript
// packages/shared-types/src/index.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;
```

### 4.2 UserProfile
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

### 4.3 UserApiConfig
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

### 4.4 SentenceFeedback
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
```

## 5. API 规范 (API Specification)
所有API都将作为Next.js的API Routes实现，部署为Vercel Serverless Functions。

```yaml
openapi: 3.0.0
info:
  title: AI场景化例句背单词网站 API
  version: 1.0.0
servers:
  - url: /api
    description: 本地开发/生产环境

paths:
  /user/config:
    get:
      summary: 获取用户的API配置
      security:
        - cookieAuth: []
      responses:
        '200':
          description: 成功获取配置
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserApiConfig'
        '401':
          description: 未授权
    post:
      summary: 创建或更新用户的API配置
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                api_url: { type: string }
                api_key: { type: string }
                model_name: { type: string }
      responses:
        '200':
          description: 配置已保存
        '401':
          description: 未授权
        '400':
          description: 请求体无效

  /user/profile:
    post:
      summary: 更新用户的画像
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_persona: { type: string, enum: ['备考学生', '职场人士'] }
      responses:
        '200':
          description: 画像已更新
        '401':
          description: 未授权

  /generate-sentence:
    post:
      summary: 生成场景化例句
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                word: { type: string }
      responses:
        '200':
          description: 成功生成例句
          content:
            application/json:
              schema:
                type: object
                properties:
                  sentence: { type: string }
        '401':
          description: 未授权
        '500':
          description: 服务器内部错误（例如，代理请求失败）

  /feedback:
    post:
      summary: 记录用户对例句的反馈
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SentenceFeedback'
      responses:
        '201':
          description: 反馈已记录
        '401':
          description: 未授权

components:
  schemas:
    UserApiConfig:
      type: object
      properties:
        user_id: { type: string, format: uuid }
        api_url: { type: string }
        model_name: { type: string }
    SentenceFeedback:
      type: object
      properties:
        word: { type: string }
        sentence: { type: string }
        feedback: { type: string, enum: ['like', 'dislike'] }
  securitySchemes:
    cookieAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## 6. 核心工作流 (Core Workflows)
### 6.1 **用户请求AI例句**
```sequenceDiagram
    participant FE as 前端 (Next.js)
    participant BE as 后端 (/api/generate-sentence)
    participant DB as Supabase DB
    participant ExtAI as 外部AI API

    FE->>+BE: POST /api/generate-sentence (携带单词, Cookie认证)
    BE->>BE: 验证用户身份
    BE->>+DB: 获取用户的API配置 (api_url, encrypted_api_key)
    DB-->>-BE: 返回API配置
    BE->>BE: 解密API密钥 (仅在内存中)
    BE->>BE: 构建专业的Prompt (含单词, 用户画像等)
    BE->>+ExtAI: POST请求 (携带Prompt和解密后的密钥)
    ExtAI-->>-BE: 返回生成的例句
    BE->>BE: 解析响应
    BE-->>-FE: 返回例句 (200 OK)
```
### 6.2 外部AI服务接口示例
我们的后端代理需要调用的外部AI服务必须与OpenAI的 /v1/chat/completions 接口兼容。以下是一个具体的请求和响应示例，用于指导开发。

```
请求示例 (Request Example)：
curl https://用户提供的API地址/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 用户提供的API密钥" \
  -d '{
    "model": "用户指定的模型名称",
    "messages": [
      {
        "role": "system",
        "content": "你是一个有帮助的英语学习助手，专门为用户生成符合特定场景的例句。"
      },
      {
        "role": "user",
        "content": "请为单词 '\''ubiquitous'\'' 创建一个符合 '\''职场人士'\'' 场景的例句。"
      }
    ]
  }'
响应示例：
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1741569952,
  "model": "gpt-4.1-...",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "In today'\''s remote-first work culture, Slack notifications have become a ubiquitous part of the corporate environment."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 25,
    "total_tokens": 75
  }
}
```  

## 7. 数据库模式 (Database Schema)
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
```

## 8. 统一项目结构 (Unified Project Structure)
```plaintext
ai-sentence-app/
├── apps/
│   └── web/                     # Next.js全栈应用
│       ├── app/
│       │   ├── (auth)/          # 路由组: 注册/登录页面
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (main)/          # 路由组: 核心应用 (需要登录)
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx     # 核心学习页
│       │   │   └── settings/    # API设置页
│       │   ├── (setup)/         # 路由组: 首次设置流程
│       │   │   └── persona/     # 用户画像选择页
│       │   ├── api/             # 后端API路由
│       │   │   ├── generate-sentence/
│       │   │   └── user/
│       │   │       └── config/
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   └── ui/              # Shadcn/ui 组件
│       ├── lib/
│       │   ├── supabase/        # Supabase客户端配置
│       │   └── utils.ts
│       ├── public/
│       └── next.config.mjs
├── packages/
│   └── shared-types/            # 共享的TypeScript类型
│       └── src/
│           └── index.ts
├── .env.local.example           # 环境变量模板
├── package.json                 # 根package.json (含workspaces)
└── tsconfig.json                # 根TypeScript配置
```

## 9. 安全与性能 (Security and Performance)

### 9.1 安全需求 (Security Requirements)
*   **API密钥处理**:
    *   密钥绝不存储在前端或暴露给客户端。
    *   密钥通过安全的Serverless Function接收，并立即加密后存入数据库。
    *   在代理请求时，密钥在内存中解密，使用后立即丢弃，绝不记入日志。
*   **数据隔离**:
    *   严格使用Supabase的行级安全（RLS），确保用户只能访问和修改自己的数据。
*   **认证**:
    *   所有需要用户身份的API路由都必须通过Supabase Auth中间件进行保护。
*   **环境变量**:
    *   Supabase的`service_role_key`和用于加密API密钥的`ENCRYPTION_SECRET`等敏感信息必须通过环境变量管理，绝不硬编码。

### 9.2 性能优化 (Performance Optimization)
*   **前端**:
    *   利用Next.js的服务器组件（Server Components）和路由缓存来优化初始加载和导航速度。
    *   对静态页面（如首页、关于页）使用静态站点生成（SSG）。
    *   核心学习应用部分将使用客户端渲染（CSR）或服务器端渲染（SSR），以提供动态体验。
*   **后端**:
    *   Vercel Functions的冷启动时间是主要考量因素。保持函数轻量，最小化依赖。
    *   数据库查询将通过创建索引进行优化。

## 10. 测试策略 (Testing Strategy)
根据PRD的测试需求，MVP阶段将专注于**单元测试**。

*   **前端**:
    *   使用Jest和React Testing Library (RTL)对关键UI组件（如API设置表单）进行测试。
    *   测试将专注于组件的渲染和用户交互，并模拟API调用。
*   **后端**:
    *   使用Jest对核心业务逻辑（如提示词工程、加密/解密逻辑）进行单元测试。
    *   测试将模拟数据库交互和外部API调用，以隔离测试单元。
*   **测试组织**:
    *   测试文件将与源文件并置（例如 `component.tsx` 和 `component.test.tsx`）。

## 11. 编码标准 (Coding Standards)
*   **代码风格**:
    *   使用Prettier进行自动化代码格式化，确保代码风格一致。
*   **代码质量**:
    *   使用ESLint进行静态代码分析，启用推荐的TypeScript和React规则。
*   **类型共享**:
    *   所有在前端和后端之间共享的数据结构，其TypeScript类型**必须**在 `packages/shared-types` 中定义。
*   **环境变量**:
    *   严禁在代码中直接使用 `process.env`。应通过一个集中的配置模块来访问环境变量，以提供类型安全和默认值。