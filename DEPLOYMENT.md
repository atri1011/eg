# Vercel + Supabase 部署指南

## 🚀 快速部署步骤

### 1. 准备Supabase数据库

1. **创建Supabase项目**
   - 访问 [https://supabase.com](https://supabase.com)
   - 创建新项目，记录项目密码

2. **初始化数据库**
   - 在Supabase项目的SQL编辑器中运行 `supabase_init.sql` 文件内容
   - 这将创建所需的用户、对话和消息表

3. **获取数据库连接字符串**
   - 项目设置 → Database → Connection string → URI
   - 复制连接字符串（类似：`postgres://postgres.xxxx:[PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres`）

### 2. 配置Vercel环境变量

#### 方式1：Vercel面板配置
1. 在Vercel项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgres://postgres.xxxx:...` | Supabase连接字符串 |
| `OPENAI_API_KEY` | `sk-xxxxx...` | OpenAI API密钥 |
| `SECRET_KEY` | `随机字符串` | Flask会话密钥 |

#### 方式2：命令行配置
```bash
# 设置数据库连接
vercel env add DATABASE_URL production

# 设置OpenAI API密钥  
vercel env add OPENAI_API_KEY production

# 设置Flask密钥
vercel env add SECRET_KEY production
```

**重要提示：**
- 每个环境变量都需要指定环境（production/preview/development）
- 环境变量名区分大小写，必须完全匹配
- 不要在 `vercel.json` 中预定义环境变量引用

### 3. 生成Flask密钥

运行以下命令生成安全的密钥：
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. 部署到Vercel

#### 首次部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel
```

#### 生产部署
```bash
# 部署到生产环境
vercel --prod
# 或
npm run deploy
```

## 📁 项目结构说明

```
├── api/
│   └── index.py          # Python Flask API入口
├── src/                  # React前端源码
├── dist/                 # Vite构建输出
├── supabase_init.sql     # 数据库初始化脚本
├── vercel.json           # Vercel配置文件
├── package.json          # Node.js依赖和脚本
└── requirements.txt      # Python依赖
```

## ⚠️ 重要注意事项

### 环境变量安全
- **永远不要**将真实的API密钥提交到代码仓库
- 在`.env`文件中设置本地开发环境变量
- 在Vercel面板中设置生产环境变量

### 数据库连接
- 确保使用**连接池**端口（6543）而非直连端口（5432）
- 在高并发情况下，连接池提供更好的性能

### API限制
- OpenAI API有使用限制，请设置合理的速率控制
- 建议在生产环境中实现用户认证和使用限额

## 🐛 常见问题排查

### 1. 数据库连接失败
- 检查`DATABASE_URL`是否正确设置
- 确认Supabase项目状态正常
- 验证数据库初始化脚本是否执行成功

### 2. API请求失败
- 检查`OPENAI_API_KEY`是否有效
- 确认API密钥有足够的使用额度
- 查看Vercel函数日志获取详细错误信息

### 3. 静态资源404
- 确认前端构建成功：`npm run build`
- 检查`vercel.json`中的路由配置
- 验证`dist`目录包含构建后的文件

## 📊 监控和维护

### 日志查看
```bash
# 查看Vercel函数日志
vercel logs

# 实时监控
vercel logs --follow
```

### 性能监控
- 在Vercel面板查看函数执行时间
- 监控Supabase数据库连接数
- 使用Vercel Analytics追踪页面性能

## 🔄 更新和重部署

```bash
# 代码更新后重新部署
git add .
git commit -m "Update features"
git push origin main

# Vercel会自动检测并重新部署
```

部署成功后，您的应用将通过Vercel提供的域名访问，也可以配置自定义域名。