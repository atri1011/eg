# 在线部署迁移指南

## 📋 部署前检查清单

### 1. Supabase数据库迁移
✅ **必须执行** - 运行SQL迁移脚本为conversation表添加模式支持

#### 执行步骤：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目 → SQL Editor
3. 复制并执行 `supabase_conversation_modes_migration.sql` 中的SQL代码
4. 确认执行成功，检查字段是否正确添加

#### 迁移内容：
- 添加 `mode` 字段 (VARCHAR(50), 默认 'free_chat')  
- 添加 `mode_config` 字段 (JSONB类型)
- 为现有会话设置默认模式
- 添加性能优化索引

### 2. 前端代码部署
✅ **自动处理** - Vercel会自动检测代码变更并重新部署

#### 新增文件确认：
- `src/components/chat/ModeSelector.jsx`
- `src/components/chat/ModeIndicator.jsx` 
- `src/components/chat/ModeGuidancePanel.jsx`
- 更新的 `src/components/chat/ChatPage.jsx`
- 更新的 `src/components/chat/ChatInput.jsx`

### 3. 后端代码部署
✅ **自动处理** - Vercel Functions会自动更新

#### 核心更新确认：
- 更新的 `src/config/prompts.py` (6种模式支持)
- 更新的 `src/services/chat_service.py` (模式处理逻辑)
- 更新的 `src/services/conversation_service.py` (模式参数支持)
- 更新的 `src/api/chat.py` (API接口扩展)
- 更新的 `src/models/conversation.py` (数据模型扩展)

## 🚀 部署步骤

### 步骤1: 数据库迁移
```sql
-- 在Supabase SQL Editor中执行
-- 复制 supabase_conversation_modes_migration.sql 的内容并执行
```

### 步骤2: 代码推送
```bash
git add .
git commit -m "添加6种对话模式功能支持"
git push origin main
```

### 步骤3: 验证部署
1. 等待Vercel部署完成
2. 访问生产环境URL
3. 测试模式选择器功能
4. 验证不同模式的AI回复风格

## 🔍 部署后验证

### 功能测试清单：
- [ ] 模式选择器正常显示和切换
- [ ] 6种模式都有对应的图标和描述
- [ ] 模式指导面板可以展开/收起
- [ ] 不同模式的输入提示正确显示
- [ ] AI回复符合所选模式的风格
- [ ] 会话历史正确保存模式信息
- [ ] 移动端界面正常工作

### 潜在问题排查：
1. **模式选择器不显示** → 检查Supabase数据库迁移是否成功
2. **AI回复风格未改变** → 检查prompts.py是否正确部署
3. **模式切换失败** → 检查API接口是否正确传递模式参数
4. **数据库错误** → 确认mode和mode_config字段已添加

## 📝 回滚计划

如果部署出现问题，可以：

1. **前端回滚**: 
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **数据库回滚** (谨慎操作):
   ```sql
   -- 移除新添加的字段 (会丢失模式数据)
   ALTER TABLE conversation DROP COLUMN mode;
   ALTER TABLE conversation DROP COLUMN mode_config;
   ```

## ⚠️ 注意事项

- 数据库迁移是**不可逆**的，执行前建议备份
- 现有会话会自动设置为"自由对话"模式
- 新功能向后兼容，不会影响现有用户体验
- 建议在低峰时段执行迁移以减少影响

## 🎯 预期结果

部署成功后，用户将能够：
- 在6种不同的学习模式间自由切换
- 获得模式特定的AI指导和反馈
- 享受更个性化的英语学习体验
- 使用模式指导获得学习建议

每个对话会话都会记住选择的模式，提供一致的学习体验。