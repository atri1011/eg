-- 数据库迁移：为 message 表添加 optimization 字段
-- 执行日期：2025-09-15
-- 目的：支持四级英语优化功能

-- 添加 optimization 字段到 message 表
ALTER TABLE message 
ADD COLUMN optimization JSON;

-- 为新字段添加注释
COMMENT ON COLUMN message.optimization IS '用户输入的四级英语优化结果，包含原文和优化后的句子';

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'message' 
  AND column_name = 'optimization';