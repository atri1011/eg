---
name: "AI English Learning"
description: "一个AI驱动的英语学习平台，通过与AI对话练习来提高用户的英语水平，提供即时语法纠正和翻译功能。"
category: "Web Application"
author: "Kilo Code"
tags: ["React", "Vite", "Tailwind CSS", "Flask", "SQLAlchemy", "PostgreSQL", "OpenAI", "Supabase"]
lastUpdated: "2025-09-14"
---

# AI English Learning

## 项目概述

本项目是一个全栈 Web 应用，旨在为英语学习者提供一个通过与 AI 自由对话来练习和提高英语水平的平台。它集成了 OpenAI API，可以提供即时的语法纠正、翻译建议和智能对话，让语言学习过程更具互动性和趣味性。

## 技术栈

- **前端**:
  - **框架**: React.js
  - **构建工具**: Vite
  - **UI库**: Tailwind CSS, Radix UI, lucide-react
  - **测试**: Vitest, React Testing Library

- **后端**:
  - **框架**: Flask
  - **ORM**: Flask-SQLAlchemy
  - **Web服务器**: Gunicorn
  - **认证**: PyJWT

- **数据库**:
  - **数据库**: PostgreSQL
  - **部署/托管**: Supabase (推断)

- **部署**:
  - **平台**: Vercel (从 `vercel.json` 和 `package.json` 推断)

- **其他工具**:
  - **AI服务**: OpenAI

## 项目结构

```
ai-english-learning/
├── src/                  # 前端和后端源代码
│   ├── api/              # 后端 Flask API 蓝图
│   ├── components/       # 前端 React 组件
│   ├── hooks/            # 前端 React Hooks
│   ├── models/           # 后端 SQLAlchemy 模型
│   └── ...
├── database/             # 数据库迁移和初始化脚本
├── main.py               # 后端 Flask 应用入口
├── package.json          # 前端依赖和脚本
├── requirements.txt      # 后端 Python 依赖
└── vite.config.js        # 前端 Vite 配置文件
```

## 开发指南

### 代码风格

- **前端**: 遵循标准的 React 和 JSX 编码规范，使用 ESLint 进行代码检查。
- **后端**: 遵循 PEP 8 Python 编码规范。

### 命名约定

- **前端**:
  - **组件**: PascalCase (e.g., `ChatPage.jsx`)
  - **Hooks**: camelCase with `use` prefix (e.g., `useAuth.jsx`)
- **后端**:
  - **文件**: snake_case (e.g., `chat_service.py`)
  - **变量/函数**: snake_case

### Git 工作流

项目 `.gitignore` 文件已配置，排除了 `node_modules`、`.env` 文件和 Python 虚拟环境等。建议遵循标准的 Git Flow 或 GitHub Flow 进行协作开发。

## 环境设置

### 开发要求

- Node.js >= 18.0.0
- Python 3.x
- PostgreSQL 数据库

### 安装步骤

```bash
# 1. 克隆项目
git clone [repository-url]
cd ai-english-learning

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖
pip install -r requirements.txt

# 4. 设置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接、OpenAI API Key 等信息

# 5. 初始化数据库
python init_db.py

# 6. 启动开发服务器
# 终端1: 启动前端 (Vite)
npm run dev

# 终端2: 启动后端 (Flask)
python main.py
```

## 核心功能实现

### 用户认证

- **前端**: `src/hooks/useAuth.jsx` 封装了用户认证逻辑，`src/components/AuthForm.jsx` 提供了登录和注册的 UI。
- **后端**: `src/api/auth.py` 实现了基于 JWT 的认证路由，包括 `/register` 和 `/login`。

### AI 聊天

- **前端**: `src/components/ChatPage.jsx` 是核心聊天界面，通过 `src/hooks/useChat.js` 与后端 API 进行交互。
- **后端**: `src/api/chat.py` 提供了 `/chat` API 端点，调用 `src/services/chat_service.py` 处理与 OpenAI API 的通信。

## 测试策略

### 前端单元/组件测试

- **框架**: Vitest 和 React Testing Library
- **运行测试**:
  ```bash
  npm test
  ```
- **测试覆盖率**:
  ```bash
  npm run test:coverage
  ```

## 部署指南

### 构建过程

```bash
# 构建前端静态文件
npm run build
```

### 部署步骤

该项目已配置为通过 Vercel 进行部署。将代码推送到链接到 Vercel 项目的 Git 仓库即可自动触发部署。Vercel 会自动检测到 Vite 前端和 Python 后端。

### 环境变量

需要在 Vercel 项目设置中配置以下环境变量：

```env
DATABASE_URL=
SECRET_KEY=
OPENAI_API_KEY=
```
