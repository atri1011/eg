# 4. 技术假设 (Technical Assumptions)

## 代码仓库结构 (Repository Structure): Monorepo

* 我们将采用 Monorepo（单一代码仓库）的结构。
    * **理由:** 这种结构非常适合全栈 TypeScript 项目，可以方便地在前端和后端之间共享代码（例如类型定义、工具函数），简化了构建流程和依赖管理，对于初期的小团队开发尤其高效。

## 服务架构 (Service Architecture): Serverless

* 我们将采用 Serverless（无服务器）架构。
    * **理由:** 这与项目简介中“低运营成本”的核心约束完全一致。Serverless 功能（例如 Vercel Functions）能够按需使用、自动扩展，并且与我们首选的托管平台（Vercel）无缝集成，极大地简化了后端部署和维护工作。

## 测试需求 (Testing Requirements)

* MVP 阶段的测试重点是**单元测试 (Unit Testing)**。
    * **理由:** 我们需要确保核心的业务逻辑（例如例句生成逻辑的封装）和关键的UI组件是可靠的。在MVP阶段，专注于单元测试是投入产出比最高的方式，能保证代码质量，同时不会过度增加开发负担。

## 其他技术假设与请求 (Additional Technical Assumptions and Requests)

* **前端:** Next.js (版本 14+) + TypeScript。
* **后端:** Node.js (LTS 版本) + TypeScript，以 Serverless Functions 的形式部署。
* **数据库:** Supabase (PostgreSQL)。
* **托管平台:** Vercel。
* **核心API集成:** 系统的核心是安全地代理用户请求到他们自己配置的、与 OpenAI API 兼容的 `v1/chat/completions` 接口。

---