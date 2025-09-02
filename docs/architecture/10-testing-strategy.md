# 10. 测试策略 (Testing Strategy)
根据PRD的测试需求，MVP阶段将专注于**单元测试**。

*   **前端**:
    *   使用Jest和React Testing Library (RTL)对关键UI组件（如API设置表单）进行测试。
    *   测试将专注于组件的渲染和用户交互，并模拟API调用。
*   **后端**:
    *   使用Jest对核心业务逻辑（如提示词工程、加密/解密逻辑）进行单元测试。
    *   测试将模拟数据库交互和外部API调用，以隔离测试单元。
*   **测试组织**:
    *   测试文件将与源文件并置（例如 `component.tsx` 和 `component.test.tsx`）。