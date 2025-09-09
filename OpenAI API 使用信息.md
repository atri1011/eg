# OpenAI API 使用信息

## 基本调用格式

### 消息格式
```python
messages = [
    {"role": "system", "content": "系统提示"},
    {"role": "user", "content": "用户输入"}
]
```

### API调用（新版本）
```python
import openai

client = openai.OpenAI(api_key="your-api-key", base_url="api-base-url")

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    temperature=0.7,
    max_tokens=1000
)

content = response.choices[0].message.content
```

### 使用requests直接调用
```python
import requests

url = f"{api_base}/chat/completions"
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

payload = {
    'model': model,
    'messages': messages,
    'temperature': temperature,
    'max_tokens': max_tokens
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
content = result['choices'][0]['message']['content']
```

## 常用模型
- gpt-3.5-turbo
- gpt-4
- gpt-4-turbo
- gpt-4o
- gpt-4o-mini

## 参数说明
- temperature: 控制创造性 (0-2)
- max_tokens: 最大生成token数
- presence_penalty: 存在惩罚 (-2 to 2)
- frequency_penalty: 频率惩罚 (-2 to 2)

