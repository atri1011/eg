# AI英语学习网站设计文档

## 项目概述
创建一个基于AI的英语学习网站，用户可以输入英语句子，AI会进行中英双语对话并纠正语法错误。

## 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Flask + Python
- **AI服务**: OpenAI兼容接口
- **部署**: Manus平台

## 功能模块

### 1. 主对话界面
- 用户输入框：支持输入英语句子
- 对话历史显示：显示用户输入和AI回复
- 语法纠错提示：高亮显示错误并提供修正建议
- 清空对话按钮

### 2. 设置配置界面
- API配置：
  - API Base URL
  - API Key
  - 模型选择
- 对话设置：
  - 语言偏好（中文/英文/双语）
  - 纠错严格程度
- 保存/重置配置

### 3. 用户体验功能
- 响应式设计（支持手机和电脑）
- 加载状态提示
- 错误处理和提示
- 对话历史本地存储

## API接口设计

### 后端API路由
```
POST /api/chat - 处理对话请求
POST /api/grammar-check - 语法检查
GET /api/config - 获取配置
POST /api/config - 保存配置
```

### 数据结构
```json
// 对话请求
{
  "message": "用户输入的句子",
  "config": {
    "api_base": "API地址",
    "api_key": "API密钥",
    "model": "模型名称",
    "language_preference": "双语模式"
  }
}

// 对话响应
{
  "response": "AI回复内容",
  "grammar_corrections": [
    {
      "original": "错误文本",
      "corrected": "修正文本",
      "explanation": "错误说明"
    }
  ],
  "success": true
}
```

## 用户界面设计

### 主页面布局
- 顶部：网站标题和设置按钮
- 中间：对话历史显示区域
- 底部：输入框和发送按钮

### 设计风格
- 现代简洁的设计风格
- 蓝色主题色调
- 卡片式布局
- 平滑的动画过渡效果

## 项目目录结构
```
ai-english-learning/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义hooks
│   │   ├── utils/          # 工具函数
│   │   └── types/          # TypeScript类型
│   └── public/
└── backend/                 # Flask后端
    ├── app.py              # 主应用
    ├── routes/             # 路由
    ├── services/           # 业务逻辑
    └── utils/              # 工具函数
```

