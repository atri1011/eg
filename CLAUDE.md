# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React + Flask 的 AI 英语学习助手应用，部署在 Vercel 平台上。应用提供智能对话练习、语法纠错、单词查询和语法学习等功能，帮助用户提高英语水平。

## 架构设计

### 前后端分离架构
- **前端**: React 18 + Vite + TailwindCSS + shadcn/ui 组件库
- **后端**: Flask + SQLAlchemy + PostgreSQL (Supabase)
- **部署**: Vercel (前端静态文件 + Python serverless functions)
- **数据库**: Supabase PostgreSQL (用于用户会话和消息存储)

### 核心模块结构

```
├── src/                      # React 前端应用
│   ├── components/           # UI 组件
│   │   ├── ui/              # shadcn/ui 基础组件
│   │   ├── ChatPage.jsx     # 主聊天界面
│   │   ├── MessageList.jsx  # 消息列表组件
│   │   ├── WordQueryDialog.jsx  # 单词查询对话框
│   │   └── Grammar*         # 语法学习相关组件
│   ├── hooks/               # 自定义 React hooks
│   │   ├── useChat.js       # 聊天功能逻辑
│   │   ├── useConfig.js     # 配置管理
│   │   └── useWordQuery.js  # 单词查询功能
│   ├── data/               # 静态数据
│   │   └── grammarData.js  # 语法知识点数据
│   └── routes/             # Flask 后端路由
│       ├── chat_real.py    # 聊天 API (核心功能)
│       ├── word_query.py   # 单词查询 API
│       └── user.py         # 用户管理 API
├── api/                    # Vercel serverless functions
│   └── index.py            # 入口文件
├── database/               # 数据库相关
│   ├── app.db              # 本地 SQLite 数据库
│   └── migration.py        # 数据库迁移脚本
└── main.py                 # Flask 应用主文件
```

## 核心功能

### 1. 智能对话练习
- **API 端点**: `/api/chat` (POST)
- **主要特性**:
  - 支持多种语言偏好 (纯英语/纯中文/双语)
  - 实时语法错误检测和纠正
  - 会话历史持久化
  - 语法纠正详细分析 (包含错误类型、修正建议、解释)

### 2. 单词查询系统
- **API 端点**: `/api/word-query` (POST)
- **功能**:
  - 划词查询 (支持多个单词同时查询)
  - 句子解析和语法分析
  - 词汇释义、音标、例句
  - 上下文相关的翻译

### 3. 语法学习模块
- **前端组件**: `GrammarLearningModule.jsx`, `GrammarReferenceLibrary.jsx`
- **数据源**: `src/data/grammarData.js`
- **特性**:
  - 分层次的语法知识点 (初级/中级/高级)
  - 交互式练习题
  - 常见错误分析

## 部署配置

### Vercel 部署架构
- **构建配置**: `vercel.json` 定义了静态文件和 API 路由
- **前端**: Vite 构建后部署为静态文件
- **后端**: Python Flask 作为 serverless functions

### 关键环境变量
```bash
DATABASE_URL=postgresql://...     # Supabase 数据库连接
SECRET_KEY=random_string         # Flask 会话密钥
```

### 数据库设计
```sql
-- 核心表结构
User (用户表)
├── id, username, email

Conversation (会话表)  
├── id, user_id, title, created_at
└── messages (一对多关系)

Message (消息表)
├── id, conversation_id, role, content
├── corrections (JSONB) -- 语法纠正数据
└── created_at
```

## 开发工作流

### 本地开发启动
```bash
# 前端开发服务器
npm run dev

# 后端开发服务器  
python main.py
```

### 构建和部署
```bash
# 构建前端
npm run build

# 部署到 Vercel
npm run deploy
# 或
vercel --prod
```

## 特殊实现细节

### 网络连接修复
- `src/utils/network_fix.py`: 处理 IPv6/IPv4 兼容性问题
- 自动将 Supabase 连接从直连端口 5432 切换到连接池端口 6543

### AI API 集成
- 支持 OpenAI 兼容的 API 端点
- 智能重试机制 (处理 429 限流错误)
- 结构化的语法分析 prompt engineering

### 前端状态管理
- 使用自定义 hooks 管理复杂状态
- React Context 避免 prop drilling
- 本地存储用户配置 (API 密钥、模型选择等)

## 重要文件说明

- `DEPLOYMENT.md`: 详细的 Vercel + Supabase 部署指南
- `DATABASE_MIGRATION_GUIDE.md`: 数据库结构变更和迁移说明
- `supabase_init.sql`: 完整的数据库初始化脚本
- `vercel.json`: Vercel 平台的路由和构建配置

## 开发注意事项

### API 密钥安全
- 所有 API 密钥通过前端配置，不存储在后端
- 生产环境必须设置 `SECRET_KEY` 环境变量

### 数据库连接管理
- 生产环境使用 PostgreSQL 连接池
- 开发环境使用本地 SQLite
- 自动创建默认用户 (ID: 1)

### 错误处理
- 全局异常处理器捕获未处理错误
- API 响应格式统一 (`success`, `error`, `data` 字段)
- 前端显示用户友好的错误信息

这个项目展现了现代全栈 Web 应用的最佳实践，特别是在 AI 集成、部署配置和用户体验优化方面。