# 11. 编码标准 (Coding Standards)
*   **代码风格**:
    *   使用Prettier进行自动化代码格式化，确保代码风格一致。
*   **代码质量**:
    *   使用ESLint进行静态代码分析，启用推荐的TypeScript和React规则。
*   **类型共享**:
    *   所有在前端和后端之间共享的数据结构，其TypeScript类型**必须**在 `packages/shared-types` 中定义。
*   **环境变量**:
    *   严禁在代码中直接使用 `process.env`。应通过一个集中的配置模块来访问环境变量，以提供类型安全和默认值。