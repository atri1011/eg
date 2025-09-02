# 9. 安全与性能 (Security and Performance)

## 9.1 安全需求 (Security Requirements)
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

## 9.2 性能优化 (Performance Optimization)
*   **前端**:
    *   利用Next.js的服务器组件（Server Components）和路由缓存来优化初始加载和导航速度。
    *   对静态页面（如首页、关于页）使用静态站点生成（SSG）。
    *   核心学习应用部分将使用客户端渲染（CSR）或服务器端渲染（SSR），以提供动态体验。
*   **后端**:
    *   Vercel Functions的冷启动时间是主要考量因素。保持函数轻量，最小化依赖。
    *   数据库查询将通过创建索引进行优化。