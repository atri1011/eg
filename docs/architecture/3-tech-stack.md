# 3. 技术栈 (Tech Stack)
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