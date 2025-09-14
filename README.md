# AI English Learning Platform

这是一个全栈 Web 应用，旨在为英语学习者提供一个通过与 AI 自由对话来练习和提高英语水平的平台。它集成了 OpenAI API，可以提供即时的语法纠正、翻译建议和智能对话，让语言学习过程更具互动性和趣味性。

## 功能特性

- **AI 对话练习**: 与先进的 AI 模型进行实时对话，练习口语和书面语。
- **即时语法纠正**: 在对话中获得实时的语法错误分析和修改建议。
- **单词查询与学习**: 随时查询不认识的单词，并将其加入学习列表。
- **对话历史记录**: 保存并回顾之前的对话，跟踪学习进度。
- **可定制的学习设置**: 根据个人需求调整 AI 的难度和学习模式。

## 技术栈

- **前端**:
  - **框架**: React.js
  - **构建工具**: Vite
  - **UI库**: Tailwind CSS, Radix UI, lucide-react
  - **测试**: Vitest, React Testing Library

- **后端**:
  - **框架**: Flask
  - **ORM**: Flask-SQLAlchemy
  - **Web服务器 (本地)**: Gunicorn
  - **认证**: PyJWT

- **数据库**:
  - **数据库**: PostgreSQL
  - **托管服务**: Supabase

- **部署**:
  - **平台**: Vercel (前端 + Serverless 后端)

- **AI服务**: OpenAI

## 项目结构

```
/
├── api/                  # 后端 Flask API (Vercel Serverless Functions)
├── src/                  # 前端 React 应用源代码
│   ├── components/       # React 组件
│   ├── hooks/            # 自定义 React Hooks
│   └── ...
├── public/               # 静态资源
├── .env.example          # 环境变量示例文件
├── main.py               # 本地开发 Flask 应用入口
├── package.json          # 前端依赖和脚本
├── requirements.txt      # 后端 Python 依赖
├── vercel.json           # Vercel 部署配置
└── vite.config.js        # Vite 配置文件
```

## 环境设置指南

您可以选择在本地环境中运行此项目，或将其部署到 Vercel。

### 1. 准备工作

在开始之前，请确保您已准备好以下账户和 API 密钥：

- **Supabase 账户**: 用于创建 PostgreSQL 数据库。
- **OpenAI API 密钥**: 用于驱动 AI 对话功能。

### 2. 本地部署

#### 步骤 1: 克隆项目

```bash
git clone <repository-url>
cd <project-directory>
```

#### 步骤 2: 设置环境变量

复制环境变量示例文件，并根据您的配置进行修改。

```bash
cp .env.example .env
```

打开 `.env` 文件并填入以下信息：

- `DATABASE_URL`: 您的 Supabase 数据库连接字符串。
  - *获取方式: Supabase 项目 > Settings > Database > Connection string > URI*
- `OPENAI_API_KEY`: 您的 OpenAI API 密钥。
- `SECRET_KEY`: 用于 Flask 应用的 JWT 签名密钥。您可以使用以下命令生成一个安全的密钥：
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

#### 步骤 3: 初始化数据库

连接到您的 Supabase 数据库，并执行 `supabase_init.sql` 脚本来创建所需的表和结构。

- *操作方式: Supabase 项目 > SQL Editor > New query*

#### 步骤 4: 安装依赖

- **前端**:
  ```bash
  npm install
  ```
- **后端** (建议在 Python 虚拟环境 中进行):
  ```bash
  pip install -r requirements.txt
  ```

#### 步骤 5: 启动开发服务器

您需要打开两个终端来分别启动前端和后端服务。

- **终端 1: 启动前端 (Vite)**
  ```bash
  npm run dev
  ```
  前端应用将在 `http://localhost:5173` (或 Vite 指定的其他端口) 上运行。

- **终端 2: 启动后端 (Flask)**
  ```bash
  python main.py
  ```
  后端 API 将在 `http://127.0.0.1:5000` 上运行。

### 3. Vercel 部署

本项目已针对 Vercel 进行了优化配置，可以轻松实现一键部署。

#### 步骤 1: Fork 项目

将此项目 Fork 到您自己的 GitHub/GitLab/Bitbucket 账户。

#### 步骤 2: 在 Vercel 上创建新项目

1.  登录 Vercel 并选择 "Add New... > Project"。
2.  从您的 Git 提供商导入刚刚 Fork 的仓库。
3.  Vercel 将会自动检测到项目是基于 Vite 的，无需修改构建设置。

#### 步骤 3: 配置环境变量

在 Vercel 项目的设置页面 (Settings > Environment Variables) 中，添加与 `.env` 文件中相同的环境变量：

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SECRET_KEY`

#### 步骤 4: 部署

完成环境变量配置后，触发一次新的部署 (Deployments > Trigger Redeploy)。Vercel 将会构建前端应用，并部署 `api/index.py` 作为 Serverless 函数。

## 可用脚本

- `npm run dev`: 启动前端 Vite 开发服务器。
- `npm run build`: 构建用于生产环境的前端应用。
- `npm run lint`: 使用 ESLint 检查代码。
- `npm test`: 运行单元测试和组件测试。
- `npm run test:coverage`: 生成测试覆盖率报告。
