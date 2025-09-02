# 2. 高层架构 (High Level Architecture)

## 2.1 技术摘要 (Technical Summary)

本系统将采用基于 **Jamstack 和 Serverless** 的现代Web架构。前端将使用 **Next.js** 构建，提供动态、高性能的用户体验，并托管在 **Vercel** 平台上。后端逻辑将通过 **Vercel Functions (Serverless)** 实现，负责处理API配置、代理AI请求等核心业务。用户认证和数据持久化将完全由 **Supabase** 提供，利用其内置的PostgreSQL数据库和Auth服务。这种架构具有极低的初始运营成本、卓越的可扩展性，并能实现快速的开发迭代，完美支持PRD中定义的目标。

## 2.2 平台与基础设施选择 (Platform and Infrastructure Choice)

*   **平台:** Vercel + Supabase
*   **关键服务:**
    *   **Vercel Hosting:** 全球CDN托管Next.js前端应用。
    *   **Vercel Functions:** 部署后端的Serverless API。
    *   **Supabase Auth:** 处理用户注册、登录和会话管理。
    *   **Supabase Database (PostgreSQL):** 存储用户数据和应用配置。
    *   **Supabase Row Level Security (RLS):** 实现数据隔离，确保用户安全。
*   **部署托管与区域:** Vercel全球边缘网络。

## 2.3 代码仓库结构 (Repository Structure)

*   **结构:** Monorepo
*   **Monorepo工具:** Npm Workspaces (轻量级，无需额外依赖)
*   **包组织:**
    *   `apps/web`: 包含核心的Next.js全栈应用。
    *   `packages/shared-types`: 存放前端和后端共享的TypeScript类型定义。
    *   `packages/ui`: (未来规划) 存放共享的UI组件。

## 2.4 高层架构图 (High Level Architecture Diagram)

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

## 2.5 架构模式 (Architectural Patterns)

*   **Serverless架构**: 所有后端逻辑均通过按需执行的函数实现，无需管理服务器。
    *   **理由**: 符合PRD中低成本、高可扩展性的NFR6要求。
*   **Monorepo**: 在单一代码库中管理所有代码。
    *   **理由**: 简化了类型共享和依赖管理，提升了开发效率，符合PRD的技术假设。
*   **Repository模式**: 在后端抽象数据访问逻辑。
    *   **理由**: 使业务逻辑与数据持久化细节解耦，便于进行单元测试。
*   **API代理模式**: 后端函数作为安全代理，将请求转发给用户配置的外部AI服务。
    *   **理由**: 保护用户API密钥不暴露于前端，并允许我们在请求前后注入逻辑（如提示词工程）。