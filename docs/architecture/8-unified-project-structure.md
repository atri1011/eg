# 8. 统一项目结构 (Unified Project Structure)
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