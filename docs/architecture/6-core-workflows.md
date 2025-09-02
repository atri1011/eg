# 6. 核心工作流 (Core Workflows)
## 6.1 **用户请求AI例句**
```sequenceDiagram
    participant FE as 前端 (Next.js)
    participant BE as 后端 (/api/generate-sentence)
    participant DB as Supabase DB
    participant ExtAI as 外部AI API

    FE->>+BE: POST /api/generate-sentence (携带单词, Cookie认证)
    BE->>BE: 验证用户身份
    BE->>+DB: 获取用户的API配置 (api_url, encrypted_api_key)
    DB-->>-BE: 返回API配置
    BE->>BE: 解密API密钥 (仅在内存中)
    BE->>BE: 构建专业的Prompt (含单词, 用户画像等)
    BE->>+ExtAI: POST请求 (携带Prompt和解密后的密钥)
    ExtAI-->>-BE: 返回生成的例句
    BE->>BE: 解析响应
    BE-->>-FE: 返回例句 (200 OK)
```
## 6.2 外部AI服务接口示例
我们的后端代理需要调用的外部AI服务必须与OpenAI的 /v1/chat/completions 接口兼容。以下是一个具体的请求和响应示例，用于指导开发。

```
请求示例 (Request Example)：
curl https://用户提供的API地址/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 用户提供的API密钥" \
  -d '{
    "model": "用户指定的模型名称",
    "messages": [
      {
        "role": "system",
        "content": "你是一个有帮助的英语学习助手，专门为用户生成符合特定场景的例句。"
      },
      {
        "role": "user",
        "content": "请为单词 '\''ubiquitous'\'' 创建一个符合 '\''职场人士'\'' 场景的例句。"
      }
    ]
  }'
响应示例：
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1741569952,
  "model": "gpt-4.1-...",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "In today'\''s remote-first work culture, Slack notifications have become a ubiquitous part of the corporate environment."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 25,
    "total_tokens": 75
  }
}