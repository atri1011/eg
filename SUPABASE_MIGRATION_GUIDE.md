# Supabase数据库迁移指南

## 需要执行的迁移

为了支持消息编辑和删除功能，您需要在Supabase数据库中执行以下迁移脚本。

### 必需的迁移

#### 1. 主要迁移脚本（必须执行）
**文件：** `supabase_message_edit_migration.sql`

**功能：**
- 为`message`表添加`updated_at`字段
- 为`message`表添加`is_deleted`字段  
- 创建自动更新`updated_at`的触发器
- 创建必要的索引以提高查询性能

**执行方式：**
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 `SQL Editor`
4. 复制 `supabase_message_edit_migration.sql` 的全部内容
5. 粘贴到SQL编辑器中
6. 点击 `Run` 执行

### 可选的优化脚本

#### 2. 查询优化脚本（建议执行）
**文件：** `supabase_query_optimization.sql`

**功能：**
- 创建便于查询的视图和函数
- 添加性能优化索引
- 提供数据库级别的软删除支持

**执行方式：**
同上述步骤，在SQL Editor中执行此脚本

## 迁移后验证

执行迁移后，您可以运行以下查询来验证迁移是否成功：

```sql
-- 检查新字段是否存在
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'message' 
AND column_name IN ('updated_at', 'is_deleted')
ORDER BY column_name;

-- 检查触发器是否创建
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'message'
AND trigger_name = 'update_message_updated_at';

-- 检查索引是否创建
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'message'
AND indexname LIKE 'idx_message_%';
```

## 预期结果

执行成功后，您应该看到：

1. ✅ `message`表包含`updated_at`和`is_deleted`字段
2. ✅ 自动更新`updated_at`的触发器已创建
3. ✅ 性能优化索引已创建
4. ✅ 现有数据的`updated_at`字段已填充
5. ✅ 所有现有消息的`is_deleted`字段默认为`false`

## 回滚计划（如需要）

如果迁移出现问题，您可以执行以下SQL来回滚更改：

```sql
-- 移除添加的字段（谨慎使用，会丢失数据）
ALTER TABLE message DROP COLUMN IF EXISTS updated_at;
ALTER TABLE message DROP COLUMN IF EXISTS is_deleted;

-- 移除触发器
DROP TRIGGER IF EXISTS update_message_updated_at ON message;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 移除索引
DROP INDEX IF EXISTS idx_message_updated_at;
DROP INDEX IF EXISTS idx_message_is_deleted;
DROP INDEX IF EXISTS idx_message_conversation_not_deleted;
```

## 注意事项

1. **备份数据**：执行迁移前建议备份数据库
2. **生产环境**：如果是生产环境，建议先在测试环境验证
3. **应用重启**：迁移完成后需要重启应用以确保连接使用新的数据库结构
4. **监控性能**：迁移后监控查询性能，新索引应该提高查询速度

## 支持的功能

迁移完成后，您的应用将支持：

- ✅ 编辑用户消息内容
- ✅ 删除用户消息（软删除）
- ✅ 编辑后自动重新生成AI回复
- ✅ 消息编辑历史追踪
- ✅ 高性能的消息查询
- ✅ 数据完整性和权限控制

执行这些迁移后，您的Supabase数据库就完全支持新的消息编辑和删除功能了！