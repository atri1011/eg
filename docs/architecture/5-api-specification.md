# 5. API 规范 (API Specification)
所有API都将作为Next.js的API Routes实现，部署为Vercel Serverless Functions。

```yaml
openapi: 3.0.0
info:
  title: AI场景化例句背单词网站 API
  version: 1.0.0
servers:
  - url: /api
    description: 本地开发/生产环境

paths:
  /user/config:
    get:
      summary: 获取用户的API配置
      security:
        - cookieAuth: []
      responses:
        '200':
          description: 成功获取配置
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserApiConfig'
        '401':
          description: 未授权
    post:
      summary: 创建或更新用户的API配置
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                api_url: { type: string }
                api_key: { type: string }
                model_name: { type: string }
      responses:
        '200':
          description: 配置已保存
        '401':
          description: 未授权
        '400':
          description: 请求体无效

  /user/profile:
    post:
      summary: 更新用户的画像
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_persona: { type: string, enum: ['备考学生', '职场人士'] }
      responses:
        '200':
          description: 画像已更新
        '401':
          description: 未授权

  /generate-sentence:
    post:
      summary: 生成场景化例句
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                word: { type: string }
      responses:
        '200':
          description: 成功生成例句
          content:
            application/json:
              schema:
                type: object
                properties:
                  sentence: { type: string }
        '401':
          description: 未授权
        '500':
          description: 服务器内部错误（例如，代理请求失败）

  /feedback:
    post:
      summary: 记录用户对例句的反馈
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SentenceFeedback'
      responses:
        '201':
          description: 反馈已记录
        '401':
          description: 未授权

components:
  schemas:
    UserApiConfig:
      type: object
      properties:
        user_id: { type: string, format: uuid }
        api_url: { type: string }
        model_name: { type: string }
    SentenceFeedback:
      type: object
      properties:
        word: { type: string }
        sentence: { type: string }
        feedback: { type: string, enum: ['like', 'dislike'] }
  securitySchemes:
    cookieAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT